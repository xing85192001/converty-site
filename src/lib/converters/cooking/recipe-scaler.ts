// src/lib/converters/cooking/recipe-scaler.ts

import type { CalculationResult } from "@/types";
import { formatAsFraction, type IngredientType } from "./types";

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  type: IngredientType;
}

export interface RecipeScaleInput {
  recipeName: string;
  originalServings: number;
  desiredServings: number;
  ingredients: RecipeIngredient[];
}

export interface ScaledIngredient {
  id: string;
  name: string;
  originalAmount: number;
  originalAmountDisplay: string;
  scaledAmount: number;
  scaledAmountDisplay: string;
  scaledAmountFractional: string;
  unit: string;
  type: IngredientType;
  scaleFactor: number;
  adjustedFactor: number;
  wasAdjusted: boolean;
}

export interface RecipeScaleResult {
  recipeName: string;
  originalServings: number;
  desiredServings: number;
  baseFactor: number;
  scaledIngredients: ScaledIngredient[];
  notes: string[];
  steps: string[];
}

/**
 * Non-linear scaling rules for different ingredient types
 * Based on culinary research and professional baking standards
 *
 * Why non-linear?
 * - Salt: Taste perception doesn't scale linearly; doubling recipe doesn't need double salt
 * - Spices: Volatile compounds concentrate; over-scaling produces overwhelming flavor
 * - Leavening: Chemical reaction efficiency changes; over-leavening causes collapse
 * - Liquids: Evaporation rate doesn't change with quantity; large batches need less
 * - Extracts: Concentrated flavors; small amounts go a long way
 */
export const SCALING_RULES: Record<IngredientType, (factor: number) => number> = {
  standard: (factor) => factor,
  salt: (factor) => {
    // Scale down: 67% rate, Scale up: 75% rate
    if (factor < 1) {
      return factor * 0.67 + 0.33; // Minimum 33% of original
    }
    return 1 + (factor - 1) * 0.75;
  },
  spice: (factor) => {
    // Scale at 75% rate both directions
    if (factor < 1) {
      return factor * 0.75 + 0.25; // Minimum 25% of original
    }
    return 1 + (factor - 1) * 0.75;
  },
  leavening: (factor) => {
    // Scale at 87.5% rate (very sensitive)
    if (factor < 1) {
      return factor * 0.875 + 0.125; // Minimum 12.5% of original
    }
    return 1 + (factor - 1) * 0.875;
  },
  liquid: (factor) => {
    // Scale down: 70% rate (less evaporation), Scale up: 100% (normal)
    if (factor < 1) {
      return factor * 0.7 + 0.3;
    }
    return factor; // Liquids scale normally when increasing
  },
  extract: (factor) => {
    // Scale at 75% rate (concentrated flavors)
    if (factor < 1) {
      return factor * 0.75 + 0.25;
    }
    return 1 + (factor - 1) * 0.75;
  },
};

/**
 * Human-readable descriptions for ingredient types
 */
export const INGREDIENT_TYPE_LABELS: Record<IngredientType, string> = {
  standard: "Standard (linear scaling)",
  salt: "Salt (67-75% scaling)",
  spice: "Spice/Herb (75% scaling)",
  leavening: "Leavening (87.5% scaling)",
  liquid: "Liquid (adjusted for evaporation)",
  extract: "Extract/Flavor (75% scaling)",
};

/**
 * Format amount for display with appropriate precision
 */
function formatAmount(amount: number): string {
  if (amount === 0) return "0";
  if (amount < 0.01) return amount.toExponential(2);
  if (amount < 1) return amount.toFixed(3).replace(/\.?0+$/, "");
  if (amount < 10) return amount.toFixed(2).replace(/\.?0+$/, "");
  if (amount < 100) return amount.toFixed(1).replace(/\.?0+$/, "");
  return Math.round(amount).toString();
}

/**
 * Main recipe scaling function
 */
export function scaleRecipe(input: RecipeScaleInput): CalculationResult<RecipeScaleResult> {
  const { recipeName, originalServings, desiredServings, ingredients } = input;
  const steps: string[] = [];
  const notes: Set<string> = new Set();

  if (originalServings <= 0 || desiredServings <= 0) {
    return { ok: false, error: "Servings must be greater than zero", code: "INVALID_INPUT" };
  }

  const baseFactor = desiredServings / originalServings;
  steps.push(
    `Base scaling factor: ${desiredServings} ÷ ${originalServings} = ${baseFactor.toFixed(3)}`
  );

  if (ingredients.length === 0) {
    return {
      ok: true,
      value: {
        recipeName,
        originalServings,
        desiredServings,
        baseFactor,
        scaledIngredients: [],
        notes: [],
        steps: ["No ingredients to scale"],
      },
    };
  }

  const scaledIngredients: ScaledIngredient[] = ingredients.map((ing) => {
    const scalingRule = SCALING_RULES[ing.type];
    const adjustedFactor = scalingRule(baseFactor);
    const scaledAmount = ing.amount * adjustedFactor;
    const wasAdjusted = adjustedFactor !== baseFactor;

    // Add note for non-linear scaling
    if (wasAdjusted) {
      switch (ing.type) {
        case "salt":
          notes.add("Salt scaled at 67-75% rate to prevent over-seasoning");
          break;
        case "spice":
          notes.add("Spices/herbs scaled at 75% rate to prevent overpowering flavors");
          break;
        case "leavening":
          notes.add("Leavening agents scaled at 87.5% rate to prevent texture issues");
          break;
        case "liquid":
          if (baseFactor < 1) {
            notes.add("Liquids adjusted for evaporation rate when scaling down");
          }
          break;
        case "extract":
          notes.add("Extracts/flavorings scaled at 75% rate due to concentration");
          break;
      }
    }

    steps.push(
      `${ing.name}: ${ing.amount} ${ing.unit} × ${adjustedFactor.toFixed(3)} = ${scaledAmount.toFixed(3)} ${ing.unit}` +
        (wasAdjusted ? ` (adjusted for ${ing.type})` : "")
    );

    return {
      id: ing.id,
      name: ing.name,
      originalAmount: ing.amount,
      originalAmountDisplay: `${formatAmount(ing.amount)} ${ing.unit}`,
      scaledAmount,
      scaledAmountDisplay: `${formatAmount(scaledAmount)} ${ing.unit}`,
      scaledAmountFractional: `${formatAsFraction(scaledAmount)} ${ing.unit}`,
      unit: ing.unit,
      type: ing.type,
      scaleFactor: baseFactor,
      adjustedFactor,
      wasAdjusted,
    };
  });

  return {
    ok: true,
    value: {
      recipeName,
      originalServings,
      desiredServings,
      baseFactor,
      scaledIngredients,
      notes: Array.from(notes),
      steps,
    },
  };
}

/**
 * Common cooking units for the UI dropdown
 */
export const COMMON_UNITS = [
  // Volume - metric first
  "ml",
  "L",
  // Volume - imperial
  "cup",
  "tbsp",
  "tsp",
  "fl oz",
  // Weight - metric first
  "g",
  "kg",
  // Weight - imperial
  "oz",
  "lb",
  // Count
  "piece",
  "whole",
  // Other
  "pinch",
  "dash",
  "to taste",
];
