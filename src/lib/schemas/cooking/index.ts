import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents a positive number */
const posNumStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${label} must be positive`,
    });

/** Validate a string represents a positive integer */
const posIntStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: `${label} must be a positive whole number`,
    });

// ─── Cooking Units Calculator ──────────────────────────────────────────────────
// Note: Uses useState directly
export const CookingUnitsFormSchema = z.object({
  value: posNumStr("Value"),
  fromUnit: z.string().min(1, "From unit is required"),
  toUnit: z.string().min(1, "To unit is required"),
});

// ─── Food Cost Calculator ──────────────────────────────────────────────────────
// Note: Uses useState directly
export const FoodCostFormSchema = z.object({
  ingredientCost: posNumStr("Ingredient cost").refine((v) => Number(v) <= 100000, {
    message: "Ingredient cost exceeds maximum (100000)",
  }),
  servings: posIntStr("Servings").refine((v) => Number(v) <= 10000, {
    message: "Servings exceeds maximum (10000)",
  }),
  desiredFoodCostPercent: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Food cost percent must be a number",
    })
    .refine((v) => Number(v) > 0 && Number(v) <= 100, {
      message: "Food cost percent must be between 0 and 100",
    }),
});

// ─── Nutrition Calculator ──────────────────────────────────────────────────────
// Note: Uses useState directly
export const NutritionFormSchema = z.object({
  servingSize: posNumStr("Serving size").refine((v) => Number(v) <= 10000, {
    message: "Serving size exceeds maximum (10000 g)",
  }),
  calories: posNumStr("Calories").refine((v) => Number(v) <= 100000, {
    message: "Calories exceeds maximum (100000 kcal)",
  }),
  protein: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Protein must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Protein must be non-negative",
    }),
  carbs: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Carbs must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Carbs must be non-negative",
    }),
  fat: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Fat must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Fat must be non-negative",
    }),
});

// ─── Recipe Scaler Calculator ──────────────────────────────────────────────────
// Note: Uses useState directly
export const RecipeScalerFormSchema = z.object({
  originalServings: posIntStr("Original servings").refine((v) => Number(v) <= 10000, {
    message: "Original servings exceeds maximum (10000)",
  }),
  desiredServings: posIntStr("Desired servings").refine((v) => Number(v) <= 10000, {
    message: "Desired servings exceeds maximum (10000)",
  }),
});
