import materialsData from "@/data/engineering/materials.json";
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
  steps: string[];
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

  const steps: string[] = [];

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
      steps.push(
        `Material: ${material.name} (E = ${material.youngsModulus} GPa, σ_y = ${material.yieldStrength} MPa)`
      );
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

    steps.push(`Step 1: Convert force to N`);
    steps.push(`F = ${force} kN × 1000 = ${forceN} N`);
    steps.push(`Step 2: Calculate stress`);
    steps.push(`σ = F / A = ${forceN} N / ${area} mm² = ${stress.toFixed(2)} MPa`);

    // Calculate strain if E is available
    if (youngsModulus > 0) {
      // E is in GPa, stress is in MPa
      // ε = σ / E = σ(MPa) / (E(GPa) × 1000)
      strain = stress / (youngsModulus * 1000);
      steps.push(`Step 3: Calculate strain`);
      steps.push(
        `ε = σ / E = ${stress.toFixed(2)} MPa / (${youngsModulus} GPa × 1000) = ${strain.toExponential(4)}`
      );
    } else {
      strain = 0;
    }
  } else if (mode === "strain") {
    // Calculate strain: ε = ΔL / L
    strain = changeInLength / originalLength;

    steps.push(`Step 1: Calculate strain`);
    steps.push(
      `ε = ΔL / L = ${changeInLength} mm / ${originalLength} mm = ${strain.toExponential(4)}`
    );

    // Calculate stress if E is available
    if (youngsModulus > 0) {
      // σ = ε × E (E in GPa, result in MPa)
      stress = strain * youngsModulus * 1000;
      steps.push(`Step 2: Calculate stress`);
      steps.push(
        `σ = ε × E = ${strain.toExponential(4)} × ${youngsModulus} GPa × 1000 = ${stress.toFixed(2)} MPa`
      );
    } else {
      stress = 0;
    }
  } else {
    // mode === "youngs-modulus"
    // Need both stress and strain

    // Calculate stress
    const forceN = force * 1000;
    stress = forceN / area;

    steps.push(`Step 1: Calculate stress`);
    steps.push(`F = ${force} kN × 1000 = ${forceN} N`);
    steps.push(`σ = F / A = ${forceN} N / ${area} mm² = ${stress.toFixed(2)} MPa`);

    // Calculate strain
    strain = changeInLength / originalLength;

    steps.push(`Step 2: Calculate strain`);
    steps.push(
      `ε = ΔL / L = ${changeInLength} mm / ${originalLength} mm = ${strain.toExponential(4)}`
    );

    // Calculate Young's modulus: E = σ / ε
    if (strain === 0) {
      return {
        ok: false,
        error: "Strain cannot be zero when calculating Young's modulus",
        code: "INVALID_INPUT",
      };
    }
    youngsModulus = stress / (strain * 1000); // Convert MPa to GPa

    steps.push(`Step 3: Calculate Young's modulus`);
    steps.push(
      `E = σ / ε = ${stress.toFixed(2)} MPa / ${strain.toExponential(4)} = ${youngsModulus.toFixed(2)} GPa`
    );
  }

  // Calculate safety factor
  let safetyFactor: number | null = null;
  let exceedsYield = false;

  if (yieldStrength > 0 && stress > 0) {
    safetyFactor = yieldStrength / stress;
    exceedsYield = stress > yieldStrength;

    steps.push(`Step ${steps.length / 2 + 2}: Safety factor`);
    steps.push(
      `SF = σ_y / σ = ${yieldStrength} MPa / ${stress.toFixed(2)} MPa = ${safetyFactor.toFixed(2)}`
    );

    if (exceedsYield) {
      steps.push(
        `⚠️ WARNING: Stress (${stress.toFixed(2)} MPa) exceeds yield strength (${yieldStrength} MPa)`
      );
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
