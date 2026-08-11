import beamSectionsData from "@/data/engineering/beam-sections.json";
import materialsData from "@/data/engineering/materials.json";
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
  steps: string[];
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

  const steps: string[] = [];

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
      steps.push(`Material: ${material.name} (E = ${E_GPa} GPa, Fy = ${Fy_MPa} MPa)`);
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
      steps.push(
        `Section: ${section.name} (A = ${section.area} in² = ${A_mm2.toFixed(0)} mm², I${axis} = ${
          axis === "x" ? section.momentOfInertiaX : section.momentOfInertiaY
        } in⁴ = ${I_mm4.toExponential(3)} mm⁴)`
      );
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
  steps.push(`End condition: ${endCondition} → K = ${K}`);

  // Effective length
  const L_mm = length * 1000;
  const KL_mm = K * L_mm;
  const effectiveLength = K * length;
  steps.push(
    `Effective length: KL = ${K} × ${length} m = ${effectiveLength.toFixed(2)} m = ${KL_mm.toFixed(0)} mm`
  );

  // Radius of gyration
  const r_mm = Math.sqrt(I_mm4 / A_mm2);
  steps.push(
    `Radius of gyration: r = √(I/A) = √(${I_mm4.toExponential(3)} / ${A_mm2.toFixed(0)}) = ${r_mm.toFixed(2)} mm`
  );

  // Slenderness ratio
  const slendernessRatio = KL_mm / r_mm;
  steps.push(
    `Slenderness ratio: KL/r = ${KL_mm.toFixed(0)} / ${r_mm.toFixed(2)} = ${slendernessRatio.toFixed(1)}`
  );

  // Unit conversion for calculations
  const E_MPa = E_GPa * 1000;

  // Euler critical stress
  const Fe_MPa = (Math.PI * Math.PI * E_MPa) / (slendernessRatio * slendernessRatio);
  steps.push(
    `Euler stress: Fe = π²E/(KL/r)² = π² × ${E_MPa} / ${slendernessRatio.toFixed(1)}² = ${Fe_MPa.toFixed(2)} MPa`
  );

  // Critical slenderness ratio (elastic/inelastic boundary)
  // λc where Fe = Fy/2, i.e., λc = π√(2E/Fy) per AISC transition
  const criticalSlenderness = Math.PI * Math.sqrt((2 * E_MPa) / Fy_MPa);
  steps.push(
    `Critical slenderness: λc = π√(2E/Fy) = π√(2 × ${E_MPa} / ${Fy_MPa}) = ${criticalSlenderness.toFixed(1)}`
  );

  // Determine buckling mode and AISC allowable stress
  let Fcr_MPa: number;
  let bucklingMode: "elastic" | "inelastic";

  if (slendernessRatio > criticalSlenderness) {
    // Elastic buckling (AISC E3-3)
    bucklingMode = "elastic";
    Fcr_MPa = 0.877 * Fe_MPa;
    steps.push(
      `Buckling mode: ELASTIC (KL/r = ${slendernessRatio.toFixed(1)} > λc = ${criticalSlenderness.toFixed(1)})`
    );
    steps.push(
      `AISC critical stress: Fcr = 0.877 × Fe = 0.877 × ${Fe_MPa.toFixed(2)} = ${Fcr_MPa.toFixed(2)} MPa`
    );
  } else {
    // Inelastic buckling (AISC E3-2)
    bucklingMode = "inelastic";
    Fcr_MPa = 0.658 ** (Fy_MPa / Fe_MPa) * Fy_MPa;
    steps.push(
      `Buckling mode: INELASTIC (KL/r = ${slendernessRatio.toFixed(1)} ≤ λc = ${criticalSlenderness.toFixed(1)})`
    );
    steps.push(
      `AISC critical stress: Fcr = 0.658^(Fy/Fe) × Fy = 0.658^(${Fy_MPa}/${Fe_MPa.toFixed(2)}) × ${Fy_MPa} = ${Fcr_MPa.toFixed(2)} MPa`
    );
  }

  // Euler critical load: Pcr = π²EI / (KL)²
  const Pcr_N = (Math.PI * Math.PI * E_MPa * I_mm4) / (KL_mm * KL_mm);
  const Pcr_kN = Pcr_N / 1000;
  steps.push(
    `Euler critical load: Pcr = π²EI/(KL)² = π² × ${E_MPa} × ${I_mm4.toExponential(3)} / ${KL_mm.toFixed(0)}² = ${Pcr_kN.toFixed(1)} kN`
  );

  // AISC allowable load (with φ = 0.9 for LRFD)
  const allowableLoad_N = Fcr_MPa * A_mm2;
  const allowableLoad_kN = allowableLoad_N / 1000;
  steps.push(
    `AISC nominal strength: Pn = Fcr × A = ${Fcr_MPa.toFixed(2)} × ${A_mm2.toFixed(0)} = ${allowableLoad_kN.toFixed(1)} kN`
  );

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
