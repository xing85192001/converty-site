import materialsData from "@/data/engineering/materials.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import type { Material } from "./types";

/**
 * Input for stress-strain calculations
 * Units documented for each property
 */
export interface StressStrainInput {
  /** Calculation mode */
  mode: "stress" | "strain" | "youngs-modulus";
  /** Applied force in kN */
  force: number;
  /** Cross-sectional area in mm² */
  area: number;
  /** Original length in mm */
  originalLength: number;
  /** Change in length in mm */
  changeInLength: number;
  /** Material ID for property lookup (optional) */
  materialId: string;
  /** Custom Young's modulus in GPa (used if no material selected) */
  customYoungsModulus: number;
  /** Custom yield strength in MPa (used if no material selected) */
  customYieldStrength: number;
}

/**
 * Result of stress-strain calculations
 * All units documented
 */
export interface StressStrainResult {
  /** Engineering stress in MPa */
  stress: number;
  /** Engineering strain (dimensionless) */
  strain: number;
  /** Young's modulus in GPa */
  youngsModulus: number;
  /** Safety factor (yield strength / stress), null if no yield strength available */
  safetyFactor: number | null;
  /** Whether stress exceeds yield strength */
  exceedsYield: boolean;
  /** Material name (if selected) */
  materialName: string | null;
  /** Yield strength used in MPa */
  yieldStrength: number | null;
  /** Step-by-step calculation breakdown */
  steps: CalcStep[];
  /** Stress in additional units for display */
  stressUnits: {
    mpa: number;
    gpa: number;
    psi: number;
    ksi: number;
  };
}

/**
 * Calculate stress, strain, and Young's modulus
 *
 * Formula references:
 * - Stress: σ = F/A (Beer & Johnston, Mechanics of Materials)
 * - Strain: ε = ΔL/L (dimensionless)
 * - Young's Modulus: E = σ/ε
 * - Safety Factor: SF = σ_yield / σ
 *
 * Unit conversions:
 * - Force: kN → N (multiply by 1000)
 * - Stress: N/mm² = MPa
 * - E: GPa → MPa (multiply by 1000)
 */
export function calculateStressStrain(
  input: StressStrainInput
): CalculationResult<StressStrainResult> {
  const {
    mode,
    force,
    area,
    originalLength,
    changeInLength,
    materialId,
    customYoungsModulus,
    customYieldStrength,
  } = input;

  // Validation
  if (area <= 0 || originalLength <= 0) {
    return { ok: false, error: "Area and original length must be positive", code: "INVALID_INPUT" };
  }
  if (force < 0) {
    return { ok: false, error: "Force must be non-negative", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];

  // Get material properties if material selected
  let material: Material | undefined;
  let youngsModulus = customYoungsModulus;
  let yieldStrength = customYieldStrength;
  let materialName: string | null = null;

  if (materialId) {
    material = getMaterialById(materialId);
    if (material) {
      youngsModulus = material.youngsModulus;
      yieldStrength = material.yieldStrength;
      materialName = material.name;
      steps.push({
        key: "materialInfo",
        params: {
          name: material.name,
          youngsModulus: material.youngsModulus,
          yieldStrength: material.yieldStrength,
        },
      });
    }
  }

  let stress: number;
  let strain: number;

  // Calculate based on mode
  if (mode === "stress") {
    // Convert force from kN to N
    const forceN = force * 1000;

    // Calculate stress: σ = F/A (result in MPa since N/mm² = MPa)
    stress = forceN / area;

    steps.push({ key: "stressModeForceConvertTitle" });
    steps.push({ key: "stressModeForceConvert", params: { force, forceN } });
    steps.push({ key: "stressModeCalcTitle" });
    steps.push({
      key: "stressModeCalc",
      params: { forceN, area, stress: stress.toFixed(2) },
    });

    // Calculate strain if E is available
    if (youngsModulus > 0) {
      // E is in GPa, stress is in MPa
      // ε = σ / E = σ(MPa) / (E(GPa) × 1000)
      strain = stress / (youngsModulus * 1000);
      steps.push({ key: "stressModeStrainTitle" });
      steps.push({
        key: "stressModeStrainCalc",
        params: {
          stress: stress.toFixed(2),
          youngsModulus,
          strain: strain.toExponential(4),
        },
      });
    } else {
      strain = 0;
    }
  } else if (mode === "strain") {
    // Calculate strain: ε = ΔL / L
    strain = changeInLength / originalLength;

    steps.push({ key: "strainModeStep1Title" });
    steps.push({
      key: "strainModeCalc",
      params: {
        changeInLength,
        originalLength,
        strain: strain.toExponential(4),
      },
    });

    // Calculate stress if E is available
    if (youngsModulus > 0) {
      // σ = ε × E (E in GPa, result in MPa)
      stress = strain * youngsModulus * 1000;
      steps.push({ key: "strainModeStressTitle" });
      steps.push({
        key: "strainModeStressCalc",
        params: {
          strain: strain.toExponential(4),
          youngsModulus,
          stress: stress.toFixed(2),
        },
      });
    } else {
      stress = 0;
    }
  } else {
    // mode === "youngs-modulus"
    // Need both stress and strain

    // Calculate stress
    const forceN = force * 1000;
    stress = forceN / area;

    steps.push({ key: "ymModeStressTitle" });
    steps.push({ key: "ymModeForceConvert", params: { force, forceN } });
    steps.push({
      key: "ymModeStressCalc",
      params: { forceN, area, stress: stress.toFixed(2) },
    });

    // Calculate strain
    strain = changeInLength / originalLength;

    steps.push({ key: "ymModeStrainTitle" });
    steps.push({
      key: "ymModeStrainCalc",
      params: {
        changeInLength,
        originalLength,
        strain: strain.toExponential(4),
      },
    });

    // Calculate Young's modulus: E = σ / ε
    if (strain === 0) {
      return {
        ok: false,
        error: "Strain cannot be zero when calculating Young's modulus",
        code: "INVALID_INPUT",
      };
    }
    youngsModulus = stress / (strain * 1000); // Convert MPa to GPa

    steps.push({ key: "ymModeModulusTitle" });
    steps.push({
      key: "ymModeModulusCalc",
      params: {
        stress: stress.toFixed(2),
        strain: strain.toExponential(4),
        youngsModulus: youngsModulus.toFixed(2),
      },
    });
  }

  // Calculate safety factor
  let safetyFactor: number | null = null;
  let exceedsYield = false;

  if (yieldStrength > 0 && stress > 0) {
    safetyFactor = yieldStrength / stress;
    exceedsYield = stress > yieldStrength;

    steps.push({ key: "safetyFactorTitle" });
    steps.push({
      key: "safetyFactorCalc",
      params: {
        yieldStrength,
        stress: stress.toFixed(2),
        safetyFactor: safetyFactor.toFixed(2),
      },
    });

    if (exceedsYield) {
      steps.push({
        key: "yieldWarning",
        params: { stress: stress.toFixed(2), yieldStrength },
      });
    }
  }

  // Unit conversions for stress
  const stressUnits = {
    mpa: stress,
    gpa: stress / 1000,
    psi: stress * 145.038, // 1 MPa = 145.038 psi
    ksi: (stress * 145.038) / 1000, // ksi = psi / 1000
  };

  return {
    ok: true,
    value: {
      stress,
      strain,
      youngsModulus,
      safetyFactor,
      exceedsYield,
      materialName,
      yieldStrength: yieldStrength > 0 ? yieldStrength : null,
      steps,
      stressUnits,
    },
  };
}

/**
 * Get all available materials
 */
export function getMaterials(): Material[] {
  return materialsData as Material[];
}

/**
 * Get material by ID
 */
export function getMaterialById(id: string): Material | undefined {
  return getMaterials().find((m) => m.id === id);
}
