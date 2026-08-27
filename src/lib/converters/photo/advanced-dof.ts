/**
 * Advanced Depth of Field Calculator
 *
 * Uses adjustable Circle of Confusion based on print size, viewing distance,
 * and visual acuity for more accurate DoF calculations.
 */

import type { CalculationResult } from "@/types";
import { calculateCoC } from "./circle-of-confusion";

export interface AdvancedDoFInput {
  aperture: number; // f-number
  focalLength: number; // mm
  subjectDistance: number; // meters
  sensorWidth: number; // mm
  sensorHeight: number; // mm
  printWidth: number; // mm
  viewingDistance: number; // mm
  visualAcuity: number; // cycles per degree
}

export interface AdvancedDoFResult {
  nearLimit: number; // meters
  farLimit: number; // meters or Infinity
  totalDoF: number; // meters
  inFrontOfSubject: number; // meters
  behindSubject: number; // meters or Infinity
  hyperfocalDistance: number; // meters
  adjustedCoC: number; // mm
  standardCoC: number; // mm
  comparison: {
    standardNear: number;
    standardFar: number;
    standardDoF: number;
    differenceFront: number;
    differenceBack: number;
  };
}

/**
 * Calculate depth of field using standard CoC formula
 */
function calculateDoFWithCoC(
  aperture: number,
  focalLength: number,
  subjectDistance: number,
  coc: number
): {
  near: number;
  far: number;
  hyperfocal: number;
} {
  // Convert focal length to meters for consistency
  const f = focalLength / 1000;
  // Subject distance in meters
  const s = subjectDistance;
  // CoC in meters
  const c = coc / 1000;
  // Aperture (f-number)
  const N = aperture;

  // Hyperfocal distance: H = f²/(N×c) + f ≈ f²/(N×c) for practical purposes
  const hyperfocal = (f * f) / (N * c) + f;

  // Near limit: Dn = (H × s) / (H + (s - f))
  const near = (hyperfocal * s) / (hyperfocal + (s - f));

  // Far limit: Df = (H × s) / (H - (s - f))
  // If s >= H, far limit is infinity
  let far: number;
  if (s >= hyperfocal) {
    far = Infinity;
  } else {
    far = (hyperfocal * s) / (hyperfocal - (s - f));
  }

  return { near, far, hyperfocal };
}

/**
 * Calculate advanced depth of field with adjustable CoC
 */
export function calculateAdvancedDoF(
  input: AdvancedDoFInput
): CalculationResult<AdvancedDoFResult> {
  const {
    aperture,
    focalLength,
    subjectDistance,
    sensorWidth,
    sensorHeight,
    printWidth,
    viewingDistance,
    visualAcuity,
  } = input;

  // Validate inputs
  if (
    aperture <= 0 ||
    focalLength <= 0 ||
    subjectDistance <= 0 ||
    sensorWidth <= 0 ||
    printWidth <= 0 ||
    viewingDistance <= 0 ||
    visualAcuity <= 0
  ) {
    return {
      ok: false,
      error: "All input values must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Calculate adjusted CoC based on viewing conditions
  const cocResult = calculateCoC({
    sensorWidth,
    printWidth,
    viewingDistance,
    visualAcuity,
  });

  if (!cocResult.ok) {
    return { ok: false, error: cocResult.error, code: cocResult.code };
  }

  const adjustedCoC = cocResult.value.coc;

  // Calculate standard CoC (diagonal / 1500)
  const diagonal = Math.sqrt(sensorWidth * sensorWidth + sensorHeight * sensorHeight);
  const standardCoC = diagonal / 1500;

  // Calculate DoF with adjusted CoC
  const adjusted = calculateDoFWithCoC(aperture, focalLength, subjectDistance, adjustedCoC);

  // Calculate DoF with standard CoC for comparison
  const standard = calculateDoFWithCoC(aperture, focalLength, subjectDistance, standardCoC);

  // Calculate total DoF
  const totalDoF = adjusted.far === Infinity ? Infinity : adjusted.far - adjusted.near;
  const standardDoF = standard.far === Infinity ? Infinity : standard.far - standard.near;

  // In front of and behind subject
  const inFront = subjectDistance - adjusted.near;
  const behind = adjusted.far === Infinity ? Infinity : adjusted.far - subjectDistance;

  return {
    ok: true,
    value: {
      nearLimit: Math.round(adjusted.near * 1000) / 1000,
      farLimit: adjusted.far === Infinity ? Infinity : Math.round(adjusted.far * 1000) / 1000,
      totalDoF: totalDoF === Infinity ? Infinity : Math.round(totalDoF * 1000) / 1000,
      inFrontOfSubject: Math.round(inFront * 1000) / 1000,
      behindSubject: behind === Infinity ? Infinity : Math.round(behind * 1000) / 1000,
      hyperfocalDistance: Math.round(adjusted.hyperfocal * 100) / 100,
      adjustedCoC: Math.round(adjustedCoC * 10000) / 10000,
      standardCoC: Math.round(standardCoC * 10000) / 10000,
      comparison: {
        standardNear: Math.round(standard.near * 1000) / 1000,
        standardFar: standard.far === Infinity ? Infinity : Math.round(standard.far * 1000) / 1000,
        standardDoF: standardDoF === Infinity ? Infinity : Math.round(standardDoF * 1000) / 1000,
        differenceFront: Math.round((standard.near - adjusted.near) * 1000) / 1000,
        differenceBack:
          standard.far === Infinity || adjusted.far === Infinity
            ? 0
            : Math.round((adjusted.far - standard.far) * 1000) / 1000,
      },
    },
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters === Infinity) return "∞";
  if (meters < 1) {
    return `${Math.round(meters * 100)} cm`;
  }
  if (meters < 10) {
    return `${meters.toFixed(2)} m`;
  }
  return `${meters.toFixed(1)} m`;
}

/**
 * Common subject distances
 */
export const COMMON_DISTANCES = [
  { label: "0.5m (Portrait close-up)", value: 0.5 },
  { label: "1m (Full body)", value: 1 },
  { label: "2m (Environmental portrait)", value: 2 },
  { label: "3m (Small group)", value: 3 },
  { label: "5m (Group photo)", value: 5 },
  { label: "10m (Landscape element)", value: 10 },
  { label: "25m (Far subject)", value: 25 },
  { label: "50m (Distant)", value: 50 },
];
