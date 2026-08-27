import beamSectionsData from "@/data/engineering/beam-sections.json";
import materialsData from "@/data/engineering/materials.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import type { BeamSection, Material } from "./types";

/**
 * End condition factors (K values)
 * Per AISC Steel Construction Manual, Table C-A-7.1
 */
export type EndCondition = "fixed-fixed" | "fixed-pinned" | "pinned-pinned" | "fixed-free";

export const END_CONDITION_K: Record<EndCondition, number> = {
  "fixed-fixed": 0.5,
  "fixed-pinned": 0.7,
  "pinned-pinned": 1.0,
  "fixed-free": 2.0,
};

/**
 * Input for column buckling calculations
 */
export interface ColumnBucklingInput {
  /** Material ID from materials database */
  materialId: string;
  /** Beam section ID from sections database */
  sectionId: string;
  /** Column effective length in meters */
  length: number;
  /** End condition determining K factor */
  endCondition: EndCondition;
  /** Buckling axis: strong (X) or weak (Y) */
  axis: "x" | "y";
  /** Custom area in mm² (used if no section selected) */
  customArea: number;
  /** Custom moment of inertia in mm⁴ (used if no section selected) */
  customMomentOfInertia: number;
  /** Custom Young's modulus in GPa (used if no material selected) */
  customYoungsModulus: number;
  /** Custom yield strength in MPa (used if no material selected) */
  customYieldStrength: number;
}

/**
 * Result of column buckling calculations
 */
export interface ColumnBucklingResult {
  /** Euler critical load in kN */
  eulerLoad: number;
  /** Effective length KL in m */
  effectiveLength: number;
  /** K factor used */
  kFactor: number;
  /** Slenderness ratio KL/r */
  slendernessRatio: number;
  /** Radius of gyration r in mm */
  radiusOfGyration: number;
  /** Critical slenderness ratio (Euler/inelastic transition) */
  criticalSlenderness: number;
  /** Whether column is in elastic or inelastic buckling range */
  bucklingMode: "elastic" | "inelastic";
  /** AISC allowable stress in MPa (if applicable) */
  allowableStress: number;
  /** AISC allowable load in kN */
  allowableLoad: number;
  /** Euler critical stress in MPa */
  eulerStress: number;
  /** Material name (if selected) */
  materialName: string | null;
  /** Section name (if selected) */
  sectionName: string | null;
  /** Step-by-step calculation breakdown */
  steps: CalcStep[];
  /** Load in additional units */
  loadUnits: {
    kN: number;
    lbf: number;
    kips: number;
  };
}

/**
 * Calculate column buckling using Euler's formula and AISC provisions
 *
 * Formula references:
 * - Euler critical load: Pcr = π²EI / (KL)²
 * - Slenderness ratio: λ = KL/r, where r = √(I/A)
 * - Critical slenderness: λc = π√(2E/Fy) (Euler/inelastic boundary)
 * - AISC E3: Elastic (λ > λc): Fcr = 0.877 × Fe
 * - AISC E3: Inelastic (λ ≤ λc): Fcr = (0.658^(Fy/Fe)) × Fy
 *
 * Unit conversions:
 * - Beam sections: inches → mm (× 25.4), in² → mm² (× 645.16), in⁴ → mm⁴ (× 416231.426)
 * - E: GPa → MPa (× 1000)
 * - Length: m → mm (× 1000)
 * - Force: N → kN (÷ 1000)
 */
export function calculateColumnBuckling(
  input: ColumnBucklingInput
): CalculationResult<ColumnBucklingResult> {
  const {
    materialId,
    sectionId,
    length,
    endCondition,
    axis,
    customArea,
    customMomentOfInertia,
    customYoungsModulus,
    customYieldStrength,
  } = input;

  // Validation
  if (length <= 0) {
    return { ok: false, error: "Length must be positive", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];

  // Get material properties
  let E_GPa = customYoungsModulus;
  let Fy_MPa = customYieldStrength;
  let materialName: string | null = null;

  if (materialId) {
    const material = getColumnMaterialById(materialId);
    if (material) {
      E_GPa = material.youngsModulus;
      Fy_MPa = material.yieldStrength;
      materialName = material.name;
      steps.push({
        key: "materialInfo",
        params: { name: material.name, E_GPa, Fy_MPa },
      });
    }
  }

  if (E_GPa <= 0 || Fy_MPa <= 0) {
    return {
      ok: false,
      error: "Young's modulus and yield strength must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Get section properties - convert from imperial (in, in², in⁴) to metric (mm, mm², mm⁴)
  const IN2_TO_MM2 = 645.16;
  const IN4_TO_MM4 = 416231.426;

  let A_mm2 = customArea;
  let I_mm4 = customMomentOfInertia;
  let sectionName: string | null = null;

  if (sectionId) {
    const section = getColumnSectionById(sectionId);
    if (section) {
      A_mm2 = section.area * IN2_TO_MM2;
      I_mm4 =
        axis === "x"
          ? section.momentOfInertiaX * IN4_TO_MM4
          : section.momentOfInertiaY * IN4_TO_MM4;
      sectionName = section.name;
      steps.push({
        key: "sectionInfo",
        params: {
          name: section.name,
          area_in2: section.area,
          A_mm2: A_mm2.toFixed(0),
          axis,
          I_in4: axis === "x" ? section.momentOfInertiaX : section.momentOfInertiaY,
          I_mm4: I_mm4.toExponential(3),
        },
      });
    }
  }

  if (A_mm2 <= 0 || I_mm4 <= 0) {
    return {
      ok: false,
      error: "Cross-sectional area and moment of inertia must be positive",
      code: "INVALID_INPUT",
    };
  }

  // K factor
  const K = END_CONDITION_K[endCondition];
  steps.push({
    key: "endCondition",
    params: { endCondition, K },
  });

  // Effective length
  const L_mm = length * 1000;
  const KL_mm = K * L_mm;
  const effectiveLength = K * length;
  steps.push({
    key: "effectiveLength",
    params: {
      K,
      length,
      effectiveLength: effectiveLength.toFixed(2),
      KL_mm: KL_mm.toFixed(0),
    },
  });

  // Radius of gyration
  const r_mm = Math.sqrt(I_mm4 / A_mm2);
  steps.push({
    key: "radiusOfGyration",
    params: {
      I_mm4: I_mm4.toExponential(3),
      A_mm2: A_mm2.toFixed(0),
      r_mm: r_mm.toFixed(2),
    },
  });

  // Slenderness ratio
  const slendernessRatio = KL_mm / r_mm;
  steps.push({
    key: "slendernessRatio",
    params: {
      KL_mm: KL_mm.toFixed(0),
      r_mm: r_mm.toFixed(2),
      value: slendernessRatio.toFixed(1),
    },
  });

  // Unit conversion for calculations
  const E_MPa = E_GPa * 1000;

  // Euler critical stress
  const Fe_MPa = (Math.PI * Math.PI * E_MPa) / (slendernessRatio * slendernessRatio);
  steps.push({
    key: "eulerStress",
    params: {
      E_MPa,
      slenderness: slendernessRatio.toFixed(1),
      Fe_MPa: Fe_MPa.toFixed(2),
    },
  });

  // Critical slenderness ratio (elastic/inelastic boundary)
  // λc where Fe = Fy/2, i.e., λc = π√(2E/Fy) per AISC transition
  const criticalSlenderness = Math.PI * Math.sqrt((2 * E_MPa) / Fy_MPa);
  steps.push({
    key: "criticalSlenderness",
    params: {
      E_MPa,
      Fy_MPa,
      value: criticalSlenderness.toFixed(1),
    },
  });

  // Determine buckling mode and AISC allowable stress
  let Fcr_MPa: number;
  let bucklingMode: "elastic" | "inelastic";

  if (slendernessRatio > criticalSlenderness) {
    // Elastic buckling (AISC E3-3)
    bucklingMode = "elastic";
    Fcr_MPa = 0.877 * Fe_MPa;
    steps.push({
      key: "bucklingModeElastic",
      params: {
        slenderness: slendernessRatio.toFixed(1),
        criticalSlenderness: criticalSlenderness.toFixed(1),
      },
    });
    steps.push({
      key: "aiscCriticalStressElastic",
      params: {
        Fe_MPa: Fe_MPa.toFixed(2),
        Fcr_MPa: Fcr_MPa.toFixed(2),
      },
    });
  } else {
    // Inelastic buckling (AISC E3-2)
    bucklingMode = "inelastic";
    Fcr_MPa = 0.658 ** (Fy_MPa / Fe_MPa) * Fy_MPa;
    steps.push({
      key: "bucklingModeInelastic",
      params: {
        slenderness: slendernessRatio.toFixed(1),
        criticalSlenderness: criticalSlenderness.toFixed(1),
      },
    });
    steps.push({
      key: "aiscCriticalStressInelastic",
      params: {
        Fy_MPa,
        Fe_MPa: Fe_MPa.toFixed(2),
        Fcr_MPa: Fcr_MPa.toFixed(2),
      },
    });
  }

  // Euler critical load: Pcr = π²EI / (KL)²
  const Pcr_N = (Math.PI * Math.PI * E_MPa * I_mm4) / (KL_mm * KL_mm);
  const Pcr_kN = Pcr_N / 1000;
  steps.push({
    key: "eulerCriticalLoad",
    params: {
      E_MPa,
      I_mm4: I_mm4.toExponential(3),
      KL_mm: KL_mm.toFixed(0),
      Pcr_kN: Pcr_kN.toFixed(1),
    },
  });

  // AISC allowable load (with φ = 0.9 for LRFD)
  const allowableLoad_N = Fcr_MPa * A_mm2;
  const allowableLoad_kN = allowableLoad_N / 1000;
  steps.push({
    key: "aiscNominalStrength",
    params: {
      Fcr_MPa: Fcr_MPa.toFixed(2),
      A_mm2: A_mm2.toFixed(0),
      allowableLoad_kN: allowableLoad_kN.toFixed(1),
    },
  });

  // Unit conversions
  const loadUnits = {
    kN: Pcr_kN,
    lbf: Pcr_kN * 224.809, // 1 kN = 224.809 lbf
    kips: (Pcr_kN * 224.809) / 1000,
  };

  return {
    ok: true,
    value: {
      eulerLoad: Pcr_kN,
      effectiveLength,
      kFactor: K,
      slendernessRatio,
      radiusOfGyration: r_mm,
      criticalSlenderness,
      bucklingMode,
      allowableStress: Fcr_MPa,
      allowableLoad: allowableLoad_kN,
      eulerStress: Fe_MPa,
      materialName,
      sectionName,
      steps,
      loadUnits,
    },
  };
}

/**
 * Get all available materials for column buckling
 */
export function getColumnMaterials(): Material[] {
  return materialsData as Material[];
}

/**
 * Get material by ID (module-private to avoid barrel conflict)
 */
function getColumnMaterialById(id: string): Material | undefined {
  return getColumnMaterials().find((m) => m.id === id);
}

/**
 * Get all available beam sections for column buckling
 */
export function getColumnBeamSections(): BeamSection[] {
  return beamSectionsData as BeamSection[];
}

/**
 * Get beam section by ID (module-private to avoid barrel conflict)
 */
function getColumnSectionById(id: string): BeamSection | undefined {
  return getColumnBeamSections().find((s) => s.id === id);
}
