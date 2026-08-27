/**
 * Focal Length Equivalent Calculator
 * Match field of view and depth of field between different sensor sizes
 */

export interface FocalEquivalentInput {
  // Source camera settings
  sourceFocalLength: number; // mm
  sourceAperture: number; // f-stop
  sourceDistance: number; // meters
  sourceCropFactor: number;
  // Target camera
  targetCropFactor: number;
}

export interface FocalEquivalentResult {
  // Source camera info
  sourceEffectiveFocalLength: number; // 35mm equivalent
  sourceFieldOfView: number; // degrees (diagonal)
  // Target camera equivalents
  targetFocalLength: number; // to match FOV
  targetAperture: number; // to match DOF
  targetEffectiveFocalLength: number; // 35mm equivalent
  targetFieldOfView: number; // should match source
  // Depth of field comparison
  dofMultiplier: number;
  explanation: string;
}

// Common sensor crop factors
export const SENSOR_CROP_FACTORS = [
  { name: "Full Frame (35mm)", value: 1 },
  { name: "APS-H (Canon 1D)", value: 1.3 },
  { name: "APS-C (Nikon/Sony/Fuji)", value: 1.5 },
  { name: "APS-C (Canon)", value: 1.6 },
  { name: "Micro Four Thirds", value: 2 },
  { name: "1 inch", value: 2.7 },
  { name: "1/1.7 inch", value: 4.5 },
  { name: "Medium Format (Fuji GFX)", value: 0.79 },
  { name: "Medium Format (Hasselblad X)", value: 0.79 },
  { name: "Medium Format (Phase One)", value: 0.65 },
];

/**
 * Calculate equivalent focal length and aperture between sensor sizes
 */
export function calculateFocalEquivalent(input: FocalEquivalentInput): FocalEquivalentResult {
  const { sourceFocalLength, sourceAperture, sourceCropFactor, targetCropFactor } = input;

  // Calculate 35mm equivalent focal length for source
  const sourceEffectiveFocalLength = sourceFocalLength * sourceCropFactor;

  // Calculate field of view (diagonal) for source
  // FOV = 2 × arctan(d / 2f) where d = diagonal of sensor
  // For 35mm: diagonal = 43.27mm
  const fullFrameDiagonal = 43.27;
  const sourceDiagonal = fullFrameDiagonal / sourceCropFactor;
  const sourceFieldOfView =
    2 * Math.atan(sourceDiagonal / (2 * sourceFocalLength)) * (180 / Math.PI);

  // Calculate target focal length to match FOV
  const targetDiagonal = fullFrameDiagonal / targetCropFactor;
  // To get same FOV: target_focal = target_diagonal / (2 * tan(FOV/2))
  const targetFocalLength =
    targetDiagonal / (2 * Math.tan((sourceFieldOfView * Math.PI) / 180 / 2));

  // Calculate target aperture to match DOF
  // DOF is proportional to crop factor, so aperture must compensate
  const dofMultiplier = targetCropFactor / sourceCropFactor;
  const targetAperture = sourceAperture * dofMultiplier;

  // Calculate 35mm equivalent for target
  const targetEffectiveFocalLength = targetFocalLength * targetCropFactor;

  // Verify FOV match
  const targetFieldOfView =
    2 * Math.atan(targetDiagonal / (2 * targetFocalLength)) * (180 / Math.PI);

  let explanation = "";
  if (targetCropFactor > sourceCropFactor) {
    explanation = `Moving to a smaller sensor: Use shorter focal length and wider aperture to match.`;
  } else if (targetCropFactor < sourceCropFactor) {
    explanation = `Moving to a larger sensor: Use longer focal length and narrower aperture to match.`;
  } else {
    explanation = `Same sensor size: Settings remain identical.`;
  }

  return {
    sourceEffectiveFocalLength: Math.round(sourceEffectiveFocalLength * 10) / 10,
    sourceFieldOfView: Math.round(sourceFieldOfView * 10) / 10,
    targetFocalLength: Math.round(targetFocalLength * 10) / 10,
    targetAperture: Math.round(targetAperture * 10) / 10,
    targetEffectiveFocalLength: Math.round(targetEffectiveFocalLength * 10) / 10,
    targetFieldOfView: Math.round(targetFieldOfView * 10) / 10,
    dofMultiplier: Math.round(dofMultiplier * 100) / 100,
    explanation,
  };
}

// Common lens focal lengths for equivalence calculations
export const FOCAL_EQUIV_FOCAL_LENGTHS = [
  14, 16, 20, 24, 28, 35, 50, 85, 100, 135, 200, 300, 400, 600,
];

// Common apertures for equivalence calculations
export const FOCAL_EQUIV_APERTURES = [1.2, 1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

export const FOCAL_EQUIVALENT_INFO = {
  purpose: "Match the look of a photo between different camera systems",
  fieldOfView: "Focal length multiplied by crop factor gives 35mm equivalent FOV",
  depthOfField: "Aperture multiplied by crop factor gives equivalent DOF",
  exposure: "Exposure (brightness) remains the same regardless of sensor size",
  examples: [
    { source: "50mm f/1.8 on Full Frame", target: "33mm f/1.2 on APS-C" },
    { source: "35mm f/2.8 on APS-C", target: "52.5mm f/4 on Full Frame" },
    { source: "25mm f/1.4 on MFT", target: "50mm f/2.8 on Full Frame" },
  ],
};
