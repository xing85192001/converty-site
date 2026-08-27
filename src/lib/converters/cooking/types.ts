// src/lib/converters/cooking/types.ts

// Volume units - metric primary
export type VolumeUnit = "ml" | "l" | "cup" | "tbsp" | "tsp" | "fl-oz";

// Weight units - metric primary
export type WeightUnit = "g" | "kg" | "oz" | "lb";

// Combined cooking unit type
export type CookingUnit = VolumeUnit | WeightUnit;

// Ingredient type for scaling
export type IngredientType = "standard" | "salt" | "spice" | "leavening" | "liquid" | "extract";

// Ingredient with density info
export interface IngredientDensity {
  id: string;
  name: string;
  density: number; // g/ml
  category: "flour" | "sugar" | "liquid" | "dairy" | "fat" | "other";
}

// Common fractions for display
const COMMON_FRACTIONS = [
  { decimal: 0, display: "0" },
  { decimal: 0.125, display: "1/8" },
  { decimal: 0.25, display: "1/4" },
  { decimal: 0.333, display: "1/3" },
  { decimal: 0.375, display: "3/8" },
  { decimal: 0.5, display: "1/2" },
  { decimal: 0.625, display: "5/8" },
  { decimal: 0.667, display: "2/3" },
  { decimal: 0.75, display: "3/4" },
  { decimal: 0.875, display: "7/8" },
  { decimal: 1, display: "1" },
];

/**
 * Format decimal amount as cooking fraction (nearest 1/8th)
 * Examples: 0.25 -> "1/4", 2.5 -> "2 1/2", 0.333 -> "1/3"
 */
export function formatAsFraction(decimal: number): string {
  if (decimal <= 0) return "0";

  const whole = Math.floor(decimal);
  const fraction = decimal - whole;

  // Find nearest fraction
  const nearest = COMMON_FRACTIONS.reduce((prev, curr) =>
    Math.abs(curr.decimal - fraction) < Math.abs(prev.decimal - fraction) ? curr : prev
  );

  // Handle very small amounts (< 1/16) - round up to 1/8
  if (decimal > 0 && decimal < 0.0625) return "1/8";

  if (whole === 0) {
    return nearest.display === "0" ? "0" : nearest.display;
  }
  if (nearest.decimal === 0 || nearest.display === "1") {
    return (whole + (nearest.display === "1" ? 1 : 0)).toString();
  }
  return `${whole} ${nearest.display}`;
}

/**
 * Unit display names for UI
 */
export const UNIT_LABELS: Record<CookingUnit, string> = {
  // Volume - metric
  ml: "ml",
  l: "L",
  // Volume - imperial
  cup: "cup",
  tbsp: "tbsp",
  tsp: "tsp",
  "fl-oz": "fl oz",
  // Weight - metric
  g: "g",
  kg: "kg",
  // Weight - imperial
  oz: "oz",
  lb: "lb",
};

/**
 * Check if unit is a volume unit
 */
export function isVolumeUnit(unit: CookingUnit): unit is VolumeUnit {
  return ["ml", "l", "cup", "tbsp", "tsp", "fl-oz"].includes(unit);
}

/**
 * Check if unit is a weight unit
 */
export function isWeightUnit(unit: CookingUnit): unit is WeightUnit {
  return ["g", "kg", "oz", "lb"].includes(unit);
}
