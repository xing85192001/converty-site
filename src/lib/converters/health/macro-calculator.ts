import type { CalculationResult } from "@/types";

export interface MacroInput {
  calories: number;
  goal: "maintenance" | "cutting" | "bulking" | "keto" | "highProtein";
  customProtein?: number; // percentage
  customCarbs?: number; // percentage
  customFat?: number; // percentage
}

export interface MacroResult {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  proteinCalories: number;
  carbsCalories: number;
  fatCalories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  mealsBreakdown: Array<{
    meals: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export function calculateMacros(input: MacroInput): CalculationResult<MacroResult> {
  const { calories, goal, customProtein, customCarbs, customFat } = input;

  if (calories <= 0) {
    return { ok: false, error: "Calories must be positive", code: "INVALID_INPUT" };
  }

  let proteinPercent: number;
  let carbsPercent: number;
  let fatPercent: number;

  // Macro ratios based on goal
  switch (goal) {
    case "maintenance":
      proteinPercent = 30;
      carbsPercent = 40;
      fatPercent = 30;
      break;
    case "cutting":
      proteinPercent = 40;
      carbsPercent = 30;
      fatPercent = 30;
      break;
    case "bulking":
      proteinPercent = 25;
      carbsPercent = 50;
      fatPercent = 25;
      break;
    case "keto":
      proteinPercent = 25;
      carbsPercent = 5;
      fatPercent = 70;
      break;
    case "highProtein":
      proteinPercent = 45;
      carbsPercent = 35;
      fatPercent = 20;
      break;
    default:
      // Custom ratios
      proteinPercent = customProtein || 30;
      carbsPercent = customCarbs || 40;
      fatPercent = customFat || 30;
  }

  // Calculate calories from each macro
  const proteinCalories = (calories * proteinPercent) / 100;
  const carbsCalories = (calories * carbsPercent) / 100;
  const fatCalories = (calories * fatPercent) / 100;

  // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  const proteinGrams = proteinCalories / 4;
  const carbsGrams = carbsCalories / 4;
  const fatGrams = fatCalories / 9;

  // Meals breakdown for 3, 4, 5, 6 meals
  const mealsBreakdown = [3, 4, 5, 6].map((meals) => ({
    meals,
    protein: proteinGrams / meals,
    carbs: carbsGrams / meals,
    fat: fatGrams / meals,
  }));

  return {
    ok: true,
    value: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      proteinCalories,
      carbsCalories,
      fatCalories,
      proteinPercent,
      carbsPercent,
      fatPercent,
      mealsBreakdown,
    },
  };
}
