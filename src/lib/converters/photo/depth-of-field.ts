import type { CalculationResult } from "@/types";

export interface DepthOfFieldResult {
  nearLimit: number; // meters
  farLimit: number; // meters
  totalDoF: number; // meters
  hyperfocalDistance: number; // meters
  circleOfConfusion: number; // mm
  inFrontOfSubject: number; // meters
  behindSubject: number; // meters
}

// Circle of confusion for different sensor sizes (in mm)
const COC = {
  fullFrame: 0.03,
  apsC: 0.02,
  microFourThirds: 0.015,
  oneInch: 0.011,
};

export function calculateDepthOfField(
  aperture: number, // f-number
  focalLength: number, // mm
  distance: number, // meters
  cropFactor: number = 1
): CalculationResult<DepthOfFieldResult> {
  if (aperture <= 0 || focalLength <= 0 || distance <= 0 || cropFactor <= 0) {
    return {
      ok: false,
      error: "Aperture, focal length, distance, and crop factor must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Adjust circle of confusion for crop factor
  const coc = COC.fullFrame / cropFactor;

  // Convert distance to mm for calculations
  const distanceMm = distance * 1000;

  // Hyperfocal distance: H = f² / (N × c) + f
  const hyperfocalMm = (focalLength * focalLength) / (aperture * coc) + focalLength;
  const hyperfocalDistance = hyperfocalMm / 1000;

  // Near limit: Dn = (H × s) / (H + (s - f))
  const nearLimitMm = (hyperfocalMm * distanceMm) / (hyperfocalMm + (distanceMm - focalLength));
  const nearLimit = Math.max(0, nearLimitMm / 1000);

  // Far limit: Df = (H × s) / (H - (s - f))
  let farLimit: number;
  const denominator = hyperfocalMm - (distanceMm - focalLength);
  if (denominator <= 0) {
    farLimit = Infinity;
  } else {
    const farLimitMm = (hyperfocalMm * distanceMm) / denominator;
    farLimit = farLimitMm / 1000;
  }

  // Total depth of field
  const totalDoF = farLimit === Infinity ? Infinity : farLimit - nearLimit;

  // Distance in front and behind subject
  const inFrontOfSubject = distance - nearLimit;
  const behindSubject = farLimit === Infinity ? Infinity : farLimit - distance;

  return {
    ok: true,
    value: {
      nearLimit: Math.round(nearLimit * 1000) / 1000,
      farLimit: farLimit === Infinity ? Infinity : Math.round(farLimit * 1000) / 1000,
      totalDoF: totalDoF === Infinity ? Infinity : Math.round(totalDoF * 1000) / 1000,
      hyperfocalDistance: Math.round(hyperfocalDistance * 100) / 100,
      circleOfConfusion: Math.round(coc * 1000) / 1000,
      inFrontOfSubject: Math.round(inFrontOfSubject * 1000) / 1000,
      behindSubject:
        behindSubject === Infinity ? Infinity : Math.round(behindSubject * 1000) / 1000,
    },
  };
}

export const COMMON_APERTURES = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
