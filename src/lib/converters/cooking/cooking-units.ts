// src/lib/converters/cooking/cooking-units.ts

import { getIngredientDensity, INGREDIENT_DENSITIES } from "@/lib/data/cooking-densities";
import type { CalculationResult } from "@/types";
import {
  type CookingUnit,
  formatAsFraction,
  isVolumeUnit,
  UNIT_LABELS,
  type VolumeUnit,
  type WeightUnit,
} from "./types";

export interface CookingUnitInput {
  amount: number;
  fromUnit: CookingUnit;
  toUnit: CookingUnit;
  ingredientId?: string; // Required for volume<->weight conversions
}

export interface CookingUnitResult {
  originalAmount: number;
  originalUnit: CookingUnit;
  convertedAmount: number;
  convertedAmountFractional: string;
  convertedUnit: CookingUnit;
  formula: string;
  requiresIngredient: boolean;
  ingredientName?: string;
  steps: string[];
}

// Volume conversion to ml (base unit)
const VOLUME_TO_ML: Record<VolumeUnit, number> = {
  ml: 1,
  l: 1000,
  cup: 240, // US cup
  tbsp: 15, // US tablespoon
  tsp: 5, // US teaspoon
  "fl-oz": 29.5735, // US fluid ounce
};

// Weight conversion to grams (base unit)
const WEIGHT_TO_G: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495, // ounce
  lb: 453.592, // pound
};

/**
 * Convert volume unit to ml
 */
function convertToMl(amount: number, unit: VolumeUnit): number {
  return amount * VOLUME_TO_ML[unit];
}

/**
 * Convert ml to target volume unit
 */
function convertFromMl(ml: number, unit: VolumeUnit): number {
  return ml / VOLUME_TO_ML[unit];
}

/**
 * Convert weight unit to grams
 */
function convertToGrams(amount: number, unit: WeightUnit): number {
  return amount * WEIGHT_TO_G[unit];
}

/**
 * Convert grams to target weight unit
 */
function convertFromGrams(grams: number, unit: WeightUnit): number {
  return grams / WEIGHT_TO_G[unit];
}

/**
 * Main conversion function with density-aware volume/weight support
 */
export function convertCookingUnit(input: CookingUnitInput): CalculationResult<CookingUnitResult> {
  const { amount, fromUnit, toUnit, ingredientId } = input;
  const steps: string[] = [];

  // Handle zero/negative amounts
  if (amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero", code: "INVALID_INPUT" };
  }

  const fromIsVolume = isVolumeUnit(fromUnit);
  const toIsVolume = isVolumeUnit(toUnit);

  let convertedAmount: number;
  let formula: string;
  let requiresIngredient = false;
  let ingredientName: string | undefined;

  // Same type conversion (volume to volume or weight to weight)
  if (fromIsVolume && toIsVolume) {
    // Volume to volume
    const ml = convertToMl(amount, fromUnit as VolumeUnit);
    steps.push(`Convert ${amount} ${UNIT_LABELS[fromUnit]} to ml: ${ml.toFixed(2)} ml`);

    convertedAmount = convertFromMl(ml, toUnit as VolumeUnit);
    steps.push(
      `Convert ${ml.toFixed(2)} ml to ${UNIT_LABELS[toUnit]}: ${convertedAmount.toFixed(4)}`
    );

    formula = `${amount} ${UNIT_LABELS[fromUnit]} = ${convertedAmount.toFixed(4)} ${UNIT_LABELS[toUnit]}`;
  } else if (!fromIsVolume && !toIsVolume) {
    // Weight to weight
    const grams = convertToGrams(amount, fromUnit as WeightUnit);
    steps.push(`Convert ${amount} ${UNIT_LABELS[fromUnit]} to g: ${grams.toFixed(2)} g`);

    convertedAmount = convertFromGrams(grams, toUnit as WeightUnit);
    steps.push(
      `Convert ${grams.toFixed(2)} g to ${UNIT_LABELS[toUnit]}: ${convertedAmount.toFixed(4)}`
    );

    formula = `${amount} ${UNIT_LABELS[fromUnit]} = ${convertedAmount.toFixed(4)} ${UNIT_LABELS[toUnit]}`;
  } else {
    // Cross-type conversion (volume <-> weight) - requires ingredient
    requiresIngredient = true;

    if (!ingredientId) {
      return {
        ok: false,
        error:
          "Volume to weight conversion requires selecting an ingredient due to different densities",
        code: "INVALID_INPUT",
      };
    }

    const ingredient = getIngredientDensity(ingredientId);
    if (!ingredient) {
      return {
        ok: false,
        error: `Ingredient "${ingredientId}" not found in density table`,
        code: "INVALID_INPUT",
      };
    }

    ingredientName = ingredient.name;
    const density = ingredient.density;

    if (fromIsVolume) {
      // Volume to weight
      const ml = convertToMl(amount, fromUnit as VolumeUnit);
      steps.push(`Convert ${amount} ${UNIT_LABELS[fromUnit]} to ml: ${ml.toFixed(2)} ml`);

      const grams = ml * density;
      steps.push(
        `Apply density for ${ingredient.name} (${density} g/ml): ${ml.toFixed(2)} ml × ${density} = ${grams.toFixed(2)} g`
      );

      convertedAmount = convertFromGrams(grams, toUnit as WeightUnit);
      steps.push(
        `Convert ${grams.toFixed(2)} g to ${UNIT_LABELS[toUnit]}: ${convertedAmount.toFixed(4)}`
      );

      formula = `${amount} ${UNIT_LABELS[fromUnit]} ${ingredient.name} = ${convertedAmount.toFixed(2)} ${UNIT_LABELS[toUnit]}`;
    } else {
      // Weight to volume
      const grams = convertToGrams(amount, fromUnit as WeightUnit);
      steps.push(`Convert ${amount} ${UNIT_LABELS[fromUnit]} to g: ${grams.toFixed(2)} g`);

      const ml = grams / density;
      steps.push(
        `Apply density for ${ingredient.name} (${density} g/ml): ${grams.toFixed(2)} g ÷ ${density} = ${ml.toFixed(2)} ml`
      );

      convertedAmount = convertFromMl(ml, toUnit as VolumeUnit);
      steps.push(
        `Convert ${ml.toFixed(2)} ml to ${UNIT_LABELS[toUnit]}: ${convertedAmount.toFixed(4)}`
      );

      formula = `${amount} ${UNIT_LABELS[fromUnit]} ${ingredient.name} = ${convertedAmount.toFixed(2)} ${UNIT_LABELS[toUnit]}`;
    }
  }

  return {
    ok: true,
    value: {
      originalAmount: amount,
      originalUnit: fromUnit,
      convertedAmount,
      convertedAmountFractional: formatAsFraction(convertedAmount),
      convertedUnit: toUnit,
      formula,
      requiresIngredient,
      ingredientName,
      steps,
    },
  };
}

/**
 * Get all available volume units (metric first)
 */
export function getVolumeUnits(): VolumeUnit[] {
  return ["ml", "l", "cup", "tbsp", "tsp", "fl-oz"];
}

/**
 * Get all available weight units (metric first)
 */
export function getWeightUnits(): WeightUnit[] {
  return ["g", "kg", "oz", "lb"];
}

/**
 * Get all cooking units (metric first for each type)
 */
export function getAllCookingUnits(): CookingUnit[] {
  return [...getVolumeUnits(), ...getWeightUnits()];
}

/**
 * Re-export ingredient densities for UI
 */
export { INGREDIENT_DENSITIES };
