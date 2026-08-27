/**
 * Spot Stars Calculator (NPF Rule)
 * Calculate maximum exposure time to prevent star trailing
 * for Milky Way and astrophotography
 */

export interface SpotStarsInput {
  focalLength: number; // mm
  aperture: number; // f-stop
  sensorWidth: number; // mm
  megapixels: number;
  declination: number; // degrees (-90 to 90, 0 = celestial equator)
  accuracy: "default" | "accurate";
}

export interface SpotStarsResult {
  npfRule: number; // NPF rule result in seconds
  rule500: number; // Classic 500 rule
  rule400: number; // Conservative 400 rule
  recommended: number; // Recommended value
  description: string;
}

// Common sensor sizes with width in mm
export const SENSOR_SIZES = [
  { name: "Full Frame (35mm)", width: 36, height: 24, cropFactor: 1 },
  { name: "APS-C (Canon)", width: 22.3, height: 14.9, cropFactor: 1.6 },
  { name: "APS-C (Nikon/Sony)", width: 23.5, height: 15.6, cropFactor: 1.5 },
  { name: "Micro Four Thirds", width: 17.3, height: 13, cropFactor: 2 },
  { name: "1 inch", width: 13.2, height: 8.8, cropFactor: 2.7 },
  { name: "Medium Format (Fuji GFX)", width: 43.8, height: 32.9, cropFactor: 0.79 },
  { name: "Medium Format (Hasselblad)", width: 53.4, height: 40, cropFactor: 0.65 },
];

// Common camera presets
export const CAMERA_PRESETS = [
  { name: "Sony A7 IV", sensorWidth: 35.7, megapixels: 33 },
  { name: "Sony A7R V", sensorWidth: 35.7, megapixels: 61 },
  { name: "Canon R5", sensorWidth: 36, megapixels: 45 },
  { name: "Canon R6 II", sensorWidth: 36, megapixels: 24.2 },
  { name: "Nikon Z8", sensorWidth: 35.9, megapixels: 45.7 },
  { name: "Nikon Z6 III", sensorWidth: 35.9, megapixels: 24.5 },
  { name: "Fuji X-T5", sensorWidth: 23.5, megapixels: 40.2 },
  { name: "Fuji GFX 100S", sensorWidth: 43.8, megapixels: 102 },
];

/**
 * Calculate maximum exposure time using the NPF Rule
 * NPF = (35 × A + 30 × P) ÷ (F × cos(δ))
 * Where:
 * - A = aperture (f-number)
 * - P = pixel pitch in microns
 * - F = focal length in mm
 * - δ = declination in degrees
 */
export function calculateSpotStars(input: SpotStarsInput): SpotStarsResult {
  const { focalLength, aperture, sensorWidth, megapixels, declination, accuracy } = input;

  // Calculate pixel pitch in microns
  // Assuming 3:2 aspect ratio for sensor
  const _sensorHeight = sensorWidth * (2 / 3);
  const pixelsWidth = Math.sqrt(megapixels * 1000000 * (3 / 2));
  const pixelPitch = (sensorWidth / pixelsWidth) * 1000; // Convert to microns

  // Declination factor (cos of declination)
  // At equator (0°), factor is 1 (fastest movement)
  // At poles (±90°), factor approaches 0 (slowest movement)
  const declinationRad = (Math.abs(declination) * Math.PI) / 180;
  const declinationFactor = Math.cos(declinationRad);

  // NPF Rule calculation
  // Accuracy modifier: default = 1.0, accurate = 0.5 (for large prints)
  const accuracyMultiplier = accuracy === "accurate" ? 0.5 : 1.0;

  const npfNumerator = (35 * aperture + 30 * pixelPitch) * accuracyMultiplier;
  const npfDenominator = focalLength * (declinationFactor || 0.01); // Prevent division by zero
  const npfRule = npfNumerator / npfDenominator;

  // Classic 500 Rule (simplified)
  const cropFactor = 36 / sensorWidth;
  const rule500 = 500 / (focalLength * cropFactor);

  // Conservative 400 Rule
  const rule400 = 400 / (focalLength * cropFactor);

  // Recommended value (NPF is most accurate for modern high-res sensors)
  const recommended = Math.min(npfRule, 30); // Cap at 30 seconds

  let description = "";
  if (recommended < 5) {
    description = "Very short exposure - consider using a wider lens or star tracker";
  } else if (recommended < 10) {
    description = "Short exposure - increase ISO accordingly";
  } else if (recommended < 20) {
    description = "Good exposure time for Milky Way photography";
  } else {
    description = "Generous exposure time - excellent for wide-angle shots";
  }

  return {
    npfRule: Math.round(npfRule * 10) / 10,
    rule500: Math.round(rule500 * 10) / 10,
    rule400: Math.round(rule400 * 10) / 10,
    recommended: Math.round(recommended * 10) / 10,
    description,
  };
}

export const SPOT_STARS_INFO = {
  npfRule: "NPF Rule accounts for aperture, pixel pitch, and focal length for accurate results",
  rule500: "500 Rule: Simple formula (500 ÷ focal length) - works for full frame only",
  rule400: "400 Rule: More conservative version of 500 rule for sharper stars",
  declination: "Declination 0° = celestial equator (fastest star movement). Use if unsure.",
  accuracy: {
    default: "Default: Suitable for web and standard prints",
    accurate: "Accurate: For large format prints (halves exposure time)",
  },
  tips: [
    "Use the NPF result for modern high-resolution cameras",
    "Start with calculated time, check results, adjust as needed",
    "Higher ISO reduces need for longer exposures",
    "Consider using a star tracker for longer exposures",
  ],
};
