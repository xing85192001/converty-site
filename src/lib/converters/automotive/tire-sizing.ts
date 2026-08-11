// src/lib/converters/automotive/tire-sizing.ts

import tireLoadIndexData from "@/lib/data/tire-load-index.json";
import tireSpeedRatingsData from "@/lib/data/tire-speed-ratings.json";
import type { CalculationResult } from "@/types";

/**
 * Tire construction type
 */
export type TireConstruction = "R" | "D" | "B";

/**
 * Parsed tire size components from notation
 */
export interface TireSizeComponents {
  width: number; // mm (e.g., 205)
  aspectRatio: number; // percentage (e.g., 55)
  construction: TireConstruction; // R = Radial, D = Diagonal, B = Belted
  rimDiameter: number; // inches (e.g., 16)
  loadIndex?: number; // optional (e.g., 91)
  speedRating?: string; // optional (e.g., "V")
  notation: string; // original notation string
}

/**
 * Calculated tire dimensions
 */
export interface TireDimensionsResult {
  // Input components
  components: TireSizeComponents;

  // Calculated dimensions
  sidewallHeight: number; // mm
  overallDiameter: number; // mm
  circumference: number; // mm
  revolutionsPerKm: number;

  // Formatted dimensions
  sidewallHeightCm: number;
  overallDiameterCm: number;
  circumferenceCm: number;

  // Load and speed ratings (if available)
  maxLoad?: number; // kg per tire
  maxSpeed?: number; // km/h
  loadDescription?: string;
  speedDescription?: string;

  // Calculation steps
  steps: string[];
}

/**
 * Tire size comparison result
 */
export interface TireComparisonResult {
  tire1: TireDimensionsResult;
  tire2: TireDimensionsResult;

  // Comparison metrics
  diameterDifferenceMm: number;
  diameterDifferencePercent: number;
  circumferenceDifferenceMm: number;
  circumferenceDifferencePercent: number;

  // Speedometer impact
  speedometerErrorPercent: number;
  actualSpeedAt100: number; // When speedometer shows 100 km/h

  // Revolutions difference
  revolutionsDifferencePerKm: number;

  // Recommendations
  withinTolerance: boolean; // ±3% diameter
  warning?: string;

  steps: string[];
}

// Load data
const loadIndexTable: Record<string, number> = tireLoadIndexData.loadIndex;
const speedRatingsTable: Record<string, number> = tireSpeedRatingsData.speedRatings;
const speedDescriptions: Record<string, string> = tireSpeedRatingsData.descriptions;

/**
 * Parse tire notation string into components
 * Supports: "205/55R16", "205/55R16 91V", "225/45ZR17 94W"
 */
export function parseTireNotation(notation: string): TireSizeComponents | null {
  const cleanNotation = notation.trim().toUpperCase();

  // Match patterns:
  // Basic: 205/55R16
  // With ratings: 205/55R16 91V
  // ZR format: 225/45ZR17 94W
  const regex = /^(\d{3})\/(\d{2})(ZR|R|D|B)(\d{2})(?:\s+(\d{2,3})([A-Z]))?$/i;
  const match = cleanNotation.match(regex);

  if (!match) {
    return null;
  }

  const construction = match[3].replace("Z", "") as TireConstruction;

  return {
    width: parseInt(match[1], 10),
    aspectRatio: parseInt(match[2], 10),
    construction,
    rimDiameter: parseInt(match[4], 10),
    loadIndex: match[5] ? parseInt(match[5], 10) : undefined,
    speedRating: match[6]?.toUpperCase(),
    notation: cleanNotation,
  };
}

/**
 * Calculate tire dimensions from components
 */
export function calculateTireDimensions(
  input: TireSizeComponents | string
): CalculationResult<TireDimensionsResult> {
  // Parse if string
  const components = typeof input === "string" ? parseTireNotation(input) : input;

  if (!components) {
    return { ok: false, error: "Invalid tire notation", code: "INVALID_INPUT" };
  }

  const { width, aspectRatio, rimDiameter, loadIndex, speedRating } = components;

  // Validate inputs
  if (width <= 0 || aspectRatio <= 0 || rimDiameter <= 0) {
    return { ok: false, error: "Tire dimensions must be greater than zero", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  // Calculate sidewall height
  const sidewallHeight = width * (aspectRatio / 100);
  steps.push(
    `Sidewall height = ${width}mm × (${aspectRatio}/100) = ${sidewallHeight.toFixed(2)}mm`
  );

  // Calculate wheel diameter in mm (rim is in inches)
  const rimDiameterMm = rimDiameter * 25.4;
  steps.push(`Rim diameter = ${rimDiameter}" × 25.4 = ${rimDiameterMm.toFixed(1)}mm`);

  // Calculate overall tire diameter
  const overallDiameter = rimDiameterMm + 2 * sidewallHeight;
  steps.push(
    `Overall diameter = ${rimDiameterMm.toFixed(1)}mm + (2 × ${sidewallHeight.toFixed(2)}mm) = ${overallDiameter.toFixed(1)}mm`
  );

  // Calculate circumference
  const circumference = Math.PI * overallDiameter;
  steps.push(`Circumference = π × ${overallDiameter.toFixed(1)}mm = ${circumference.toFixed(1)}mm`);

  // Calculate revolutions per km
  const revolutionsPerKm = 1000000 / circumference;
  steps.push(
    `Revolutions/km = 1,000,000 / ${circumference.toFixed(1)} = ${revolutionsPerKm.toFixed(1)}`
  );

  // Build result
  const result: TireDimensionsResult = {
    components,
    sidewallHeight,
    overallDiameter,
    circumference,
    revolutionsPerKm,
    sidewallHeightCm: sidewallHeight / 10,
    overallDiameterCm: overallDiameter / 10,
    circumferenceCm: circumference / 10,
    steps,
  };

  // Lookup load index
  if (loadIndex !== undefined) {
    const loadValue = loadIndexTable[loadIndex.toString()];
    if (loadValue) {
      result.maxLoad = loadValue;
      result.loadDescription = `${loadValue} kg per tire (${loadValue * 4} kg total for 4 tires)`;
      steps.push(`Load index ${loadIndex} = ${loadValue} kg per tire`);
    }
  }

  // Lookup speed rating
  if (speedRating) {
    const speedValue = speedRatingsTable[speedRating];
    if (speedValue) {
      result.maxSpeed = speedValue;
      result.speedDescription = speedDescriptions[speedRating] || `${speedValue} km/h`;
      steps.push(`Speed rating ${speedRating} = ${speedValue} km/h (${result.speedDescription})`);
    }
  }

  return { ok: true, value: result };
}

/**
 * Compare two tire sizes and calculate differences
 */
export function compareTireSizes(
  tire1Input: TireSizeComponents | string,
  tire2Input: TireSizeComponents | string
): CalculationResult<TireComparisonResult> {
  const tire1Result = calculateTireDimensions(tire1Input);
  const tire2Result = calculateTireDimensions(tire2Input);

  if (!tire1Result.ok) {
    return { ok: false, error: `Tire 1: ${tire1Result.error}`, code: "INVALID_INPUT" };
  }
  if (!tire2Result.ok) {
    return { ok: false, error: `Tire 2: ${tire2Result.error}`, code: "INVALID_INPUT" };
  }

  const tire1 = tire1Result.value;
  const tire2 = tire2Result.value;

  const steps: string[] = [];

  // Calculate diameter difference
  const diameterDifferenceMm = tire2.overallDiameter - tire1.overallDiameter;
  const diameterDifferencePercent = (diameterDifferenceMm / tire1.overallDiameter) * 100;

  steps.push(
    `Diameter difference = ${tire2.overallDiameter.toFixed(1)}mm - ${tire1.overallDiameter.toFixed(1)}mm = ${diameterDifferenceMm.toFixed(1)}mm`
  );
  steps.push(
    `Diameter difference % = (${diameterDifferenceMm.toFixed(1)} / ${tire1.overallDiameter.toFixed(1)}) × 100 = ${diameterDifferencePercent.toFixed(2)}%`
  );

  // Calculate circumference difference
  const circumferenceDifferenceMm = tire2.circumference - tire1.circumference;
  const circumferenceDifferencePercent = (circumferenceDifferenceMm / tire1.circumference) * 100;

  steps.push(`Circumference difference = ${circumferenceDifferencePercent.toFixed(2)}%`);

  // Calculate speedometer error
  // If tire2 is larger, actual speed is higher than displayed
  const speedometerErrorPercent = diameterDifferencePercent;
  const actualSpeedAt100 = 100 * (1 + diameterDifferencePercent / 100);

  steps.push(`Speedometer error = ${speedometerErrorPercent.toFixed(2)}%`);
  steps.push(`When speedometer shows 100 km/h, actual speed = ${actualSpeedAt100.toFixed(1)} km/h`);

  // Revolutions difference
  const revolutionsDifferencePerKm = tire2.revolutionsPerKm - tire1.revolutionsPerKm;

  // Check tolerance (±3% is generally acceptable)
  const withinTolerance = Math.abs(diameterDifferencePercent) <= 3;
  let warning: string | undefined;

  if (Math.abs(diameterDifferencePercent) > 5) {
    warning =
      "Diameter difference exceeds 5% - may affect speedometer, ABS, and traction control significantly";
    steps.push(`WARNING: ${warning}`);
  } else if (Math.abs(diameterDifferencePercent) > 3) {
    warning = "Diameter difference exceeds 3% - may affect speedometer accuracy";
    steps.push(`WARNING: ${warning}`);
  }

  return {
    ok: true,
    value: {
      tire1,
      tire2,
      diameterDifferenceMm,
      diameterDifferencePercent,
      circumferenceDifferenceMm,
      circumferenceDifferencePercent,
      speedometerErrorPercent,
      actualSpeedAt100,
      revolutionsDifferencePerKm,
      withinTolerance,
      warning,
      steps,
    },
  };
}

/**
 * Format tire notation for display
 */
export function formatTireNotation(components: TireSizeComponents): string {
  let notation = `${components.width}/${components.aspectRatio}${components.construction}${components.rimDiameter}`;

  if (components.loadIndex !== undefined && components.speedRating) {
    notation += ` ${components.loadIndex}${components.speedRating}`;
  }

  return notation;
}

/**
 * Get common tire sizes for suggestions
 */
export function getCommonTireSizes(): string[] {
  return [
    "175/65R14",
    "185/65R15",
    "195/65R15",
    "205/55R16",
    "205/60R16",
    "215/55R17",
    "225/45R17",
    "225/40R18",
    "225/45R18",
    "235/40R19",
    "245/40R19",
    "255/35R19",
  ];
}
