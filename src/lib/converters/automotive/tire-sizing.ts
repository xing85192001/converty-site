// src/lib/converters/automotive/tire-sizing.ts

import tireLoadIndexData from "@/lib/data/tire-load-index.json";
import tireSpeedRatingsData from "@/lib/data/tire-speed-ratings.json";
import type { CalculationResult } from "@/types";

/**
 * Tagged calculation step — the actual localized string is rendered on the client
 * using next-intl with `calculator.automotive.tireSizing.steps.{type}` template.
 *
 * Keeping raw variables here (instead of hard-coded English) lets each locale
 * format numbers, units and sentence structure properly.
 */
export type TireStep =
  | { type: "sidewallHeight"; width: number; aspectRatio: number; result: number }
  | { type: "rimDiameter"; rimDiameter: number; result: number }
  | { type: "overallDiameter"; rimMm: number; sidewall: number; result: number }
  | { type: "circumference"; diameter: number; result: number }
  | { type: "revolutionsPerKm"; circumference: number; result: number }
  | { type: "loadIndex"; loadIndex: number; loadValue: number }
  | { type: "speedRating"; rating: string; speedValue: number; desc: string }
  | { type: "diameterDiffMm"; tire2: number; tire1: number; result: number }
  | { type: "diameterDiffPct"; diffMm: number; tire1: number; result: number }
  | { type: "circumferenceDiffPct"; result: number }
  | { type: "speedometerError"; result: number }
  | { type: "actualSpeed"; result: number }
  | { type: "revolutionsDiffPerKm"; tire2: number; tire1: number; result: number }
  | { type: "warning"; message: string };

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

  // Calculation steps (tagged for i18n)
  steps: TireStep[];
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

  steps: TireStep[];
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

  const steps: TireStep[] = [];

  // Calculate sidewall height
  const sidewallHeight = width * (aspectRatio / 100);
  steps.push({ type: "sidewallHeight", width, aspectRatio, result: sidewallHeight });

  // Calculate wheel diameter in mm (rim is in inches)
  const rimDiameterMm = rimDiameter * 25.4;
  steps.push({ type: "rimDiameter", rimDiameter, result: rimDiameterMm });

  // Calculate overall tire diameter
  const overallDiameter = rimDiameterMm + 2 * sidewallHeight;
  steps.push({
    type: "overallDiameter",
    rimMm: rimDiameterMm,
    sidewall: sidewallHeight,
    result: overallDiameter,
  });

  // Calculate circumference
  const circumference = Math.PI * overallDiameter;
  steps.push({ type: "circumference", diameter: overallDiameter, result: circumference });

  // Calculate revolutions per km
  const revolutionsPerKm = 1000000 / circumference;
  steps.push({ type: "revolutionsPerKm", circumference, result: revolutionsPerKm });

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
      steps.push({ type: "loadIndex", loadIndex, loadValue });
    }
  }

  // Lookup speed rating
  if (speedRating) {
    const speedValue = speedRatingsTable[speedRating];
    if (speedValue) {
      result.maxSpeed = speedValue;
      result.speedDescription = speedDescriptions[speedRating] || `${speedValue} km/h`;
      steps.push({
        type: "speedRating",
        rating: speedRating,
        speedValue,
        desc: result.speedDescription,
      });
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

  const steps: TireStep[] = [];

  // Calculate diameter difference
  const diameterDifferenceMm = tire2.overallDiameter - tire1.overallDiameter;
  const diameterDifferencePercent = (diameterDifferenceMm / tire1.overallDiameter) * 100;

  steps.push({
    type: "diameterDiffMm",
    tire2: tire2.overallDiameter,
    tire1: tire1.overallDiameter,
    result: diameterDifferenceMm,
  });
  steps.push({
    type: "diameterDiffPct",
    diffMm: diameterDifferenceMm,
    tire1: tire1.overallDiameter,
    result: diameterDifferencePercent,
  });

  // Calculate circumference difference
  const circumferenceDifferenceMm = tire2.circumference - tire1.circumference;
  const circumferenceDifferencePercent = (circumferenceDifferenceMm / tire1.circumference) * 100;

  steps.push({ type: "circumferenceDiffPct", result: circumferenceDifferencePercent });

  // Calculate speedometer error
  // If tire2 is larger, actual speed is higher than displayed
  const speedometerErrorPercent = diameterDifferencePercent;
  const actualSpeedAt100 = 100 * (1 + diameterDifferencePercent / 100);

  steps.push({ type: "speedometerError", result: speedometerErrorPercent });
  steps.push({ type: "actualSpeed", result: actualSpeedAt100 });

  // Revolutions difference
  const revolutionsDifferencePerKm = tire2.revolutionsPerKm - tire1.revolutionsPerKm;

  steps.push({
    type: "revolutionsDiffPerKm",
    tire2: tire2.revolutionsPerKm,
    tire1: tire1.revolutionsPerKm,
    result: revolutionsDifferencePerKm,
  });

  // Check tolerance (±3% is generally acceptable)
  const withinTolerance = Math.abs(diameterDifferencePercent) <= 3;
  let warning: string | undefined;

  if (Math.abs(diameterDifferencePercent) > 5) {
    warning =
      "Diameter difference exceeds 5% - may affect speedometer, ABS, and traction control significantly";
    steps.push({ type: "warning", message: warning });
  } else if (Math.abs(diameterDifferencePercent) > 3) {
    warning = "Diameter difference exceeds 3% - may affect speedometer accuracy";
    steps.push({ type: "warning", message: warning });
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
