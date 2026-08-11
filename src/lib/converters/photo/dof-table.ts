/**
 * Depth of Field Table Generator
 *
 * Generates an interactive table showing how DoF changes across different
 * apertures and subject distances for a given focal length and sensor.
 */

export interface DoFTableEntry {
  aperture: number;
  distance: number; // meters
  nearLimit: number; // meters
  farLimit: number; // meters or Infinity
  totalDoF: number; // meters or Infinity
  hyperfocal: number; // meters
}

export interface DoFTableConfig {
  focalLength: number; // mm
  coc: number; // mm (circle of confusion)
  apertures: number[];
  distances: number[]; // meters
}

/**
 * Calculate DoF for a single aperture/distance combination
 */
function calculateSingleDoF(
  aperture: number,
  focalLength: number, // mm
  distance: number, // meters
  coc: number // mm
): DoFTableEntry {
  // Convert to consistent units (meters)
  const f = focalLength / 1000; // mm to meters
  const c = coc / 1000; // mm to meters
  const s = distance;
  const N = aperture;

  // Hyperfocal distance: H = f² / (N × c) + f
  const hyperfocal = (f * f) / (N * c) + f;

  // Near limit: Dn = (H × s) / (H + (s - f))
  const nearLimit = (hyperfocal * s) / (hyperfocal + (s - f));

  // Far limit: Df = (H × s) / (H - (s - f))
  let farLimit: number;
  if (s >= hyperfocal) {
    farLimit = Infinity;
  } else {
    farLimit = (hyperfocal * s) / (hyperfocal - (s - f));
  }

  // Total DoF
  const totalDoF = farLimit === Infinity ? Infinity : farLimit - nearLimit;

  return {
    aperture,
    distance,
    nearLimit: Math.round(nearLimit * 1000) / 1000,
    farLimit: farLimit === Infinity ? Infinity : Math.round(farLimit * 1000) / 1000,
    totalDoF: totalDoF === Infinity ? Infinity : Math.round(totalDoF * 1000) / 1000,
    hyperfocal: Math.round(hyperfocal * 100) / 100,
  };
}

/**
 * Generate a complete DoF table
 */
export function generateDoFTable(config: DoFTableConfig): DoFTableEntry[][] {
  const { focalLength, coc, apertures, distances } = config;

  return apertures.map((aperture) =>
    distances.map((distance) => calculateSingleDoF(aperture, focalLength, distance, coc))
  );
}

/**
 * Generate hyperfocal distance matrix (aperture vs focal length)
 */
export function generateHyperfocalMatrix(
  focalLengths: number[],
  apertures: number[],
  coc: number
): { focalLength: number; aperture: number; hyperfocal: number }[] {
  const results: { focalLength: number; aperture: number; hyperfocal: number }[] = [];

  for (const fl of focalLengths) {
    for (const ap of apertures) {
      const f = fl / 1000; // mm to meters
      const c = coc / 1000; // mm to meters
      const hyperfocal = (f * f) / (ap * c) + f;
      results.push({
        focalLength: fl,
        aperture: ap,
        hyperfocal: Math.round(hyperfocal * 100) / 100,
      });
    }
  }

  return results;
}

/**
 * Format distance for table display
 */
export function formatTableDistance(meters: number): string {
  if (meters === Infinity) return "∞";
  if (meters < 1) {
    const cm = Math.round(meters * 100);
    return `${cm}cm`;
  }
  if (meters < 10) {
    return `${meters.toFixed(2)}m`;
  }
  return `${meters.toFixed(1)}m`;
}

/**
 * Default apertures for table
 */
export const TABLE_APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

/**
 * Default distances for table (meters)
 */
export const TABLE_DISTANCES = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

/**
 * Common focal lengths for dropdown
 */
export const TABLE_FOCAL_LENGTHS = [14, 24, 35, 50, 85, 100, 135, 200, 300, 400];

/**
 * Sensor presets with CoC values
 */
export const TABLE_SENSORS = [
  { name: "Full Frame (35mm)", coc: 0.03 },
  { name: "APS-C (Canon)", coc: 0.018 },
  { name: "APS-C (Nikon/Sony)", coc: 0.019 },
  { name: "Micro Four Thirds", coc: 0.015 },
  { name: "1 inch", coc: 0.011 },
];
