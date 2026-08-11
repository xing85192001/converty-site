/**
 * Hyperfocal Distance Calculator
 * Calculate the distance to focus at for maximum depth of field
 */

export interface HyperfocalInput {
  focalLength: number; // mm
  aperture: number; // f-stop
  circleOfConfusion: number; // mm (based on sensor size)
}

export interface HyperfocalResult {
  hyperfocalDistance: number; // meters
  hyperfocalDistanceFeet: number;
  nearLimit: number; // meters (half of hyperfocal)
  farLimit: string; // infinity
  depthOfField: string;
  description: string;
}

// Circle of Confusion values by sensor size (in mm)
export const CIRCLE_OF_CONFUSION = [
  { name: "Full Frame (35mm)", coc: 0.03 },
  { name: "APS-H (Canon 1D)", coc: 0.023 },
  { name: "APS-C (Canon)", coc: 0.019 },
  { name: "APS-C (Nikon/Sony)", coc: 0.02 },
  { name: "Micro Four Thirds", coc: 0.015 },
  { name: "1 inch", coc: 0.011 },
  { name: "Medium Format 645", coc: 0.043 },
  { name: "Medium Format 6x6", coc: 0.05 },
];

/**
 * Calculate hyperfocal distance
 * H = (f² / (N × c)) + f
 * Where:
 * - f = focal length in mm
 * - N = f-number (aperture)
 * - c = circle of confusion in mm
 */
export function calculateHyperfocal(input: HyperfocalInput): HyperfocalResult {
  const { focalLength, aperture, circleOfConfusion } = input;

  // Calculate hyperfocal distance in mm, then convert to meters
  const hyperfocalMM = focalLength ** 2 / (aperture * circleOfConfusion) + focalLength;
  const hyperfocalDistance = hyperfocalMM / 1000; // Convert to meters
  const hyperfocalDistanceFeet = hyperfocalDistance * 3.28084;

  // Near limit is half the hyperfocal distance
  const nearLimit = hyperfocalDistance / 2;

  let description = "";
  if (hyperfocalDistance < 1) {
    description = "Very close hyperfocal - use for macro with maximum DOF";
  } else if (hyperfocalDistance < 3) {
    description = "Close hyperfocal - good for wide-angle landscapes";
  } else if (hyperfocalDistance < 10) {
    description = "Moderate hyperfocal - typical for landscape photography";
  } else if (hyperfocalDistance < 30) {
    description = "Distant hyperfocal - consider stopping down more";
  } else {
    description = "Very distant hyperfocal - may need wider lens or smaller aperture";
  }

  return {
    hyperfocalDistance: Math.round(hyperfocalDistance * 100) / 100,
    hyperfocalDistanceFeet: Math.round(hyperfocalDistanceFeet * 10) / 10,
    nearLimit: Math.round(nearLimit * 100) / 100,
    farLimit: "Infinity",
    depthOfField: `${Math.round(nearLimit * 100) / 100}m to Infinity`,
    description,
  };
}

/**
 * Generate hyperfocal table for a given focal length and sensor
 */
export function generateHyperfocalTable(
  focalLength: number,
  circleOfConfusion: number
): Array<{ aperture: number; hyperfocal: number; nearLimit: number }> {
  const apertures = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

  return apertures.map((aperture) => {
    const result = calculateHyperfocal({ focalLength, aperture, circleOfConfusion });
    return {
      aperture,
      hyperfocal: result.hyperfocalDistance,
      nearLimit: result.nearLimit,
    };
  });
}

// Common focal lengths for quick reference
export const FOCAL_LENGTHS = [14, 16, 20, 24, 28, 35, 50, 85, 100, 135, 200];

// Common apertures
export const APERTURES = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

export const HYPERFOCAL_INFO = {
  definition:
    "The closest distance at which a lens can be focused while keeping objects at infinity acceptably sharp",
  usage: [
    "Focus at hyperfocal distance for maximum depth of field",
    "Everything from half the hyperfocal distance to infinity will be sharp",
    "Essential for landscape photography",
  ],
  tips: [
    "Use live view magnification to focus precisely at hyperfocal",
    "Mark hyperfocal distances on your lens for quick reference",
    "Smaller apertures (larger f-numbers) give shorter hyperfocal distances",
    "Wider lenses have closer hyperfocal distances",
  ],
  commonMistakes: [
    "Focusing at infinity instead of hyperfocal loses foreground sharpness",
    "Not accounting for crop factor when using CoC values",
    "Forgetting that diffraction limits sharpness at very small apertures",
  ],
};
