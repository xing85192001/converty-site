/**
 * Macro Depth of Field Calculator
 *
 * For macro and close-up photography, the standard DoF formulas become inaccurate
 * because magnification ratio is significant. This calculator uses the magnification-based
 * formula for more accurate results.
 *
 * Macro DoF formula: DoF = 2 × N × c × (m + 1) / m²
 * where N = f-number, c = CoC, m = magnification
 */

import type { CalculationResult } from "@/types";

export interface MacroDoFInput {
  aperture: number; // f-number
  magnification: number; // e.g., 1:1 = 1, 2:1 = 2, 1:2 = 0.5
  coc: number; // mm (circle of confusion)
  pupilRatio?: number; // pupil magnification ratio (for asymmetric lenses)
}

export interface MacroDoFResult {
  totalDoF: number; // mm
  inFront: number; // mm (in front of focal plane)
  behind: number; // mm (behind focal plane)
  effectiveAperture: number; // effective f-number at this magnification
  workingDistance: number | null; // approximate working distance in mm (if focal length provided)
  notes: string[];
}

/**
 * Calculate macro depth of field
 *
 * For symmetric lenses (pupil ratio = 1):
 * DoF = 2 × N × c × (m + 1) / m²
 * Front DoF = Back DoF = DoF / 2
 *
 * For asymmetric lenses (pupil ratio ≠ 1):
 * Front DoF = N × c × (m + 1) / (m² × P)
 * Back DoF = N × c × (m + 1) × P / m²
 * where P = pupil ratio
 */
export function calculateMacroDoF(input: MacroDoFInput): CalculationResult<MacroDoFResult> {
  const { aperture, magnification, coc, pupilRatio = 1 } = input;

  if (aperture <= 0 || magnification <= 0 || coc <= 0 || pupilRatio <= 0) {
    return {
      ok: false,
      error: "Aperture, magnification, circle of confusion, and pupil ratio must be positive",
      code: "INVALID_INPUT",
    };
  }

  const N = aperture;
  const m = magnification;
  const c = coc;
  const P = pupilRatio;

  // Calculate effective aperture (accounts for magnification)
  // N_effective = N × (1 + m/P)
  const effectiveAperture = N * (1 + m / P);

  // Calculate front and back DoF
  // For symmetric lenses (P = 1): front = back = N × c × (m + 1) / m²
  const frontDoF = (N * c * (m + 1)) / (m * m * P);
  const backDoF = (N * c * (m + 1) * P) / (m * m);
  const totalDoF = frontDoF + backDoF;

  // Generate notes
  const notes: string[] = [];

  if (m >= 1) {
    notes.push("At life-size (1:1) or greater magnification, DoF is extremely shallow.");
  }
  if (effectiveAperture > 22) {
    notes.push(
      `Effective aperture is f/${effectiveAperture.toFixed(1)} - diffraction will significantly impact sharpness.`
    );
  } else if (effectiveAperture > 16) {
    notes.push(
      `Effective aperture is f/${effectiveAperture.toFixed(1)} - diffraction may start affecting sharpness.`
    );
  }
  if (totalDoF < 1) {
    notes.push("DoF is less than 1mm. Consider focus stacking for greater depth.");
  }
  if (pupilRatio !== 1) {
    notes.push(`Asymmetric lens (P=${pupilRatio}): front/back DoF distribution is unequal.`);
  }

  return {
    ok: true,
    value: {
      totalDoF: Math.round(totalDoF * 1000) / 1000,
      inFront: Math.round(frontDoF * 1000) / 1000,
      behind: Math.round(backDoF * 1000) / 1000,
      effectiveAperture: Math.round(effectiveAperture * 10) / 10,
      workingDistance: null, // Would need focal length to calculate
      notes,
    },
  };
}

/**
 * Calculate macro DoF with focal length for working distance
 */
export function calculateMacroDoFWithFocalLength(
  aperture: number,
  magnification: number,
  coc: number,
  focalLength: number,
  pupilRatio: number = 1
): CalculationResult<MacroDoFResult> {
  const result = calculateMacroDoF({ aperture, magnification, coc, pupilRatio });
  if (!result.ok) return result;

  // Working distance ≈ focal length × (1 + 1/m)
  const workingDistance = focalLength * (1 + 1 / magnification);

  return {
    ok: true,
    value: {
      ...result.value,
      workingDistance: Math.round(workingDistance),
    },
  };
}

/**
 * Calculate number of focus stack shots needed
 */
export function calculateFocusStackShots(
  totalDepthNeeded: number, // mm
  aperture: number,
  magnification: number,
  coc: number,
  overlap: number = 0.3 // 30% overlap between shots
): number {
  const dof = calculateMacroDoF({ aperture, magnification, coc });
  if (!dof.ok || dof.value.totalDoF <= 0) return 1;

  // Effective step size with overlap
  const stepSize = dof.value.totalDoF * (1 - overlap);
  const shots = Math.ceil(totalDepthNeeded / stepSize);

  return Math.max(1, shots);
}

/**
 * Common magnification ratios
 */
export const COMMON_MAGNIFICATIONS = [
  { label: "1:10 (0.1×)", value: 0.1, description: "Close-up, typical minimum focus" },
  { label: "1:4 (0.25×)", value: 0.25, description: "Close-up portrait" },
  { label: "1:2 (0.5×)", value: 0.5, description: "Half life-size" },
  { label: "1:1 (1×)", value: 1, description: "Life-size (true macro)" },
  { label: "2:1 (2×)", value: 2, description: "Twice life-size" },
  { label: "3:1 (3×)", value: 3, description: "Three times life-size" },
  { label: "4:1 (4×)", value: 4, description: "Four times life-size" },
  { label: "5:1 (5×)", value: 5, description: "Five times life-size (microscopy)" },
];

/**
 * Common CoC values for macro (same as regular sensors)
 */
export const MACRO_SENSOR_COC = [
  { name: "Full Frame", coc: 0.03 },
  { name: "APS-C", coc: 0.02 },
  { name: "Micro 4/3", coc: 0.015 },
  { name: "1 inch", coc: 0.011 },
];
