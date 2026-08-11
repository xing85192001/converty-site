/**
 * ND Filter Exposure Calculator
 * Calculate exposure time with neutral density filters
 */

export interface NDFilterInput {
  baseShutterSpeed: number; // seconds (without filter)
  filterStops: number; // ND filter strength in stops
}

export interface NDFilterResult {
  newShutterSpeed: number; // seconds
  newShutterSpeedFormatted: string;
  filterFactor: number; // light reduction factor (e.g., ND8 = 8x)
  lightReductionPercent: number;
  description: string;
}

// Common ND filter designations and their stop values
export const ND_FILTERS = [
  { name: "ND2 (0.3)", stops: 1, factor: 2 },
  { name: "ND4 (0.6)", stops: 2, factor: 4 },
  { name: "ND8 (0.9)", stops: 3, factor: 8 },
  { name: "ND16 (1.2)", stops: 4, factor: 16 },
  { name: "ND32 (1.5)", stops: 5, factor: 32 },
  { name: "ND64 (1.8)", stops: 6, factor: 64 },
  { name: "ND128 (2.1)", stops: 7, factor: 128 },
  { name: "ND256 (2.4)", stops: 8, factor: 256 },
  { name: "ND400 (2.6)", stops: 8.65, factor: 400 },
  { name: "ND500 (2.7)", stops: 9, factor: 500 },
  { name: "ND1000 (3.0)", stops: 10, factor: 1000 },
  { name: "ND2000 (3.3)", stops: 11, factor: 2000 },
  { name: "ND4000 (3.6)", stops: 12, factor: 4000 },
  { name: "ND8000 (3.9)", stops: 13, factor: 8000 },
  { name: "ND32000 (4.5)", stops: 15, factor: 32000 },
  { name: "ND100000 (5.0)", stops: 16.6, factor: 100000 },
];

// Common base shutter speeds
export const BASE_SHUTTER_SPEEDS = [
  { name: "1/8000s", value: 1 / 8000 },
  { name: "1/4000s", value: 1 / 4000 },
  { name: "1/2000s", value: 1 / 2000 },
  { name: "1/1000s", value: 1 / 1000 },
  { name: "1/500s", value: 1 / 500 },
  { name: "1/250s", value: 1 / 250 },
  { name: "1/125s", value: 1 / 125 },
  { name: "1/60s", value: 1 / 60 },
  { name: "1/30s", value: 1 / 30 },
  { name: "1/15s", value: 1 / 15 },
  { name: "1/8s", value: 1 / 8 },
  { name: "1/4s", value: 1 / 4 },
  { name: "1/2s", value: 1 / 2 },
  { name: "1s", value: 1 },
  { name: "2s", value: 2 },
  { name: "4s", value: 4 },
  { name: "8s", value: 8 },
  { name: "15s", value: 15 },
  { name: "30s", value: 30 },
];

/**
 * Calculate new shutter speed with ND filter
 * New speed = Base speed × 2^stops
 */
export function calculateNDFilter(input: NDFilterInput): NDFilterResult {
  const { baseShutterSpeed, filterStops } = input;

  const filterFactor = 2 ** filterStops;
  const newShutterSpeed = baseShutterSpeed * filterFactor;
  const lightReductionPercent = ((filterFactor - 1) / filterFactor) * 100;

  let description = "";
  if (newShutterSpeed < 1) {
    description = "Quick exposure - handheld possible";
  } else if (newShutterSpeed < 10) {
    description = "Moderate exposure - tripod recommended";
  } else if (newShutterSpeed < 60) {
    description = "Long exposure - tripod required, expect motion blur";
  } else if (newShutterSpeed < 300) {
    description = "Very long exposure - use remote/timer, consider bulb mode";
  } else {
    description = "Extended exposure - bulb mode required, check battery life";
  }

  return {
    newShutterSpeed,
    newShutterSpeedFormatted: formatShutterSpeed(newShutterSpeed),
    filterFactor,
    lightReductionPercent: Math.round(lightReductionPercent * 100) / 100,
    description,
  };
}

function formatShutterSpeed(seconds: number): string {
  if (seconds < 1) {
    const denominator = Math.round(1 / seconds);
    return `1/${denominator}s`;
  } else if (seconds < 60) {
    return `${Math.round(seconds * 10) / 10}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Calculate filter stops needed for target shutter speed
 */
export function calculateRequiredStops(
  baseShutterSpeed: number,
  targetShutterSpeed: number
): number {
  return Math.log2(targetShutterSpeed / baseShutterSpeed);
}

/**
 * Stack multiple ND filters
 */
export function stackFilters(stops: number[]): number {
  return stops.reduce((total, s) => total + s, 0);
}

export const ND_FILTER_INFO = {
  purpose: [
    "Create motion blur in water, clouds, or crowds",
    "Use wider apertures in bright light",
    "Extend exposure times for creative effects",
    "Reduce light without affecting color (neutral)",
  ],
  naming: {
    ndNumber: "ND + factor (ND1000 = 1000x reduction = 10 stops)",
    opticalDensity: "0.3 per stop (ND 3.0 = 10 stops)",
    stops: "Direct stop count (10-stop filter)",
  },
  tips: [
    "Focus and compose before attaching strong ND filters",
    "Use live view for very dark filters",
    "Consider reciprocity failure with very long exposures on film",
    "Variable ND filters offer flexibility but may cause X-pattern vignetting",
    "Stack filters by adding stops together",
  ],
  commonUses: [
    { effect: "Silky water", shutter: "1-5 seconds" },
    { effect: "Smooth water", shutter: "10-30 seconds" },
    { effect: "Glass-like water", shutter: "1-5 minutes" },
    { effect: "Moving clouds", shutter: "30 seconds - 2 minutes" },
    { effect: "Ghost people/cars", shutter: "30 seconds - 2 minutes" },
    { effect: "Empty streets", shutter: "5+ minutes" },
  ],
};
