import type { CalculationResult } from "@/types";

/**
 * Circle of Confusion (CoC) Calculator
 *
 * The Circle of Confusion is the largest blur spot that will still appear sharp
 * to the human eye. It depends on:
 * - Sensor size
 * - Print size
 * - Viewing distance
 * - Viewer's visual acuity
 */

export interface CoCInput {
  sensorWidth: number; // mm
  printWidth: number; // mm (final print size)
  viewingDistance: number; // mm
  visualAcuity: number; // cycles per degree (typically 30 for normal vision)
}

export interface CoCResult {
  coc: number; // mm (on sensor)
  cocMicrons: number; // micrometers
  standardCoc: number; // standard CoC for this sensor
  explanation: string;
  enlargementFactor: number;
  printResolution: number; // lp/mm on print needed
  sensorResolutionRequired: number; // megapixels needed
}

/**
 * Standard Circle of Confusion values for common sensor sizes
 * Based on traditional formula: CoC = sensor diagonal / 1500
 */
export const SENSOR_COC = [
  { name: "Full Frame (35mm)", width: 36, height: 24, coc: 0.03 },
  { name: "APS-H (Canon)", width: 28.7, height: 19, coc: 0.023 },
  { name: "APS-C (Canon)", width: 22.3, height: 14.9, coc: 0.018 },
  { name: "APS-C (Nikon/Sony/Fuji)", width: 23.5, height: 15.6, coc: 0.019 },
  { name: "Micro Four Thirds", width: 17.3, height: 13, coc: 0.015 },
  { name: "1 inch", width: 13.2, height: 8.8, coc: 0.011 },
  { name: '1/1.7"', width: 7.6, height: 5.7, coc: 0.006 },
  { name: '1/2.3"', width: 6.17, height: 4.55, coc: 0.005 },
  { name: "Medium Format (Fuji GFX)", width: 43.8, height: 32.9, coc: 0.036 },
  { name: "Medium Format (Hasselblad)", width: 53.4, height: 40, coc: 0.043 },
];

/**
 * Common viewing distances
 */
export const VIEWING_DISTANCES = [
  { label: "Close examination (20cm)", value: 200 },
  { label: "Reading distance (30cm)", value: 300 },
  { label: "Comfortable viewing (45cm)", value: 450 },
  { label: "Desktop distance (60cm)", value: 600 },
  { label: "Wall print (1m)", value: 1000 },
  { label: "Large print (2m)", value: 2000 },
  { label: "Billboard (5m)", value: 5000 },
];

/**
 * Common print sizes in mm
 */
export const PRINT_SIZES = [
  { label: '4×6" (10×15cm)', width: 152, height: 102 },
  { label: '5×7" (13×18cm)', width: 178, height: 127 },
  { label: '8×10" (20×25cm)', width: 254, height: 203 },
  { label: '11×14" (28×35cm)', width: 356, height: 279 },
  { label: '16×20" (40×50cm)', width: 508, height: 406 },
  { label: '20×30" (50×76cm)', width: 762, height: 508 },
  { label: '24×36" (60×90cm)', width: 914, height: 610 },
];

/**
 * Calculate Circle of Confusion based on print viewing conditions
 *
 * Formula: CoC = viewing_distance / (enlargement × visual_acuity_constant)
 *
 * where visual_acuity_constant = viewing_distance / minimum_resolvable_distance
 *
 * For 30 cycles/degree visual acuity, minimum resolvable distance ≈ 0.2mm at 250mm
 */
export function calculateCoC(input: CoCInput): CalculationResult<CoCResult> {
  const { sensorWidth, printWidth, viewingDistance, visualAcuity } = input;

  if (sensorWidth <= 0 || printWidth <= 0 || viewingDistance <= 0 || visualAcuity <= 0) {
    return {
      ok: false,
      error: "Sensor dimensions, print width, viewing distance, and visual acuity must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Enlargement factor (how much the sensor image is enlarged for print)
  const enlargementFactor = printWidth / sensorWidth;

  // Visual acuity: cycles/degree
  // 1 degree at viewing distance = viewing_distance × tan(1°) ≈ viewing_distance × 0.01745
  // But for small angles, we use: arc length = viewing_distance × (π/180) = viewing_distance / 57.3
  const arcPerDegree = viewingDistance / 57.3; // mm per degree at viewing distance

  // Minimum resolvable detail on print (in mm)
  // At 30 cycles/degree, we can resolve 60 line pairs per degree
  // Each cycle needs 2 pixels, so minimum detail = arc per degree / (2 × cycles)
  const minDetailOnPrint = arcPerDegree / (2 * visualAcuity);

  // Circle of Confusion on sensor
  const coc = minDetailOnPrint / enlargementFactor;

  // Standard CoC for this sensor size (diagonal / 1500)
  const standardCoc = Math.sqrt(sensorWidth * sensorWidth + ((sensorWidth * 2) / 3) ** 2) / 1500;

  // Print resolution required (line pairs per mm)
  const printResolution = 1 / minDetailOnPrint;

  // Sensor resolution required (line pairs per mm on sensor, then convert to MP)
  const sensorResolution = printResolution * enlargementFactor;
  // For Nyquist: 2 pixels per line pair
  const pixelsPerMm = sensorResolution * 2;
  // Assuming 3:2 aspect ratio
  const sensorHeight = (sensorWidth * 2) / 3;
  const megapixels = (pixelsPerMm * sensorWidth * pixelsPerMm * sensorHeight) / 1000000;

  // Generate explanation
  let explanation = "";
  if (coc > standardCoc * 1.5) {
    explanation =
      "Viewing conditions are relaxed. Standard CoC is sufficient for this print/distance.";
  } else if (coc < standardCoc * 0.5) {
    explanation =
      "Demanding conditions require sharper images. Consider higher resolution sensor or smaller prints.";
  } else {
    explanation = "Viewing conditions are typical. Standard CoC values should work well.";
  }

  return {
    ok: true,
    value: {
      coc: Math.round(coc * 10000) / 10000, // 4 decimal places
      cocMicrons: Math.round(coc * 1000 * 10) / 10, // micrometers with 1 decimal
      standardCoc: Math.round(standardCoc * 10000) / 10000,
      explanation,
      enlargementFactor: Math.round(enlargementFactor * 10) / 10,
      printResolution: Math.round(printResolution * 10) / 10,
      sensorResolutionRequired: Math.round(megapixels * 10) / 10,
    },
  };
}

/**
 * Calculate standard CoC from sensor diagonal
 * Traditional formula: CoC = diagonal / 1500
 */
export function calculateStandardCoC(sensorWidth: number, sensorHeight: number): number {
  const diagonal = Math.sqrt(sensorWidth * sensorWidth + sensorHeight * sensorHeight);
  return diagonal / 1500;
}

/**
 * Get CoC for a specific sensor by name
 */
export function getCoCForSensor(sensorName: string): number | null {
  const sensor = SENSOR_COC.find((s) => s.name.toLowerCase().includes(sensorName.toLowerCase()));
  return sensor ? sensor.coc : null;
}

/**
 * Visual acuity presets
 */
export const VISUAL_ACUITY_PRESETS = [
  {
    label: "Below average (20 cycles/°)",
    value: 20,
    description: "Aging eyes or less critical viewing",
  },
  {
    label: "Average (30 cycles/°)",
    value: 30,
    description: "Standard assumption for most calculations",
  },
  { label: "Excellent (40 cycles/°)", value: 40, description: "Young eyes with perfect vision" },
  { label: "Critical (50 cycles/°)", value: 50, description: "Professional evaluation conditions" },
];
