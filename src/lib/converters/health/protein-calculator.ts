import type { CalculationResult } from "@/types";

export interface ProteinInput {
  weight: number; // kg
  goal: "sedentary" | "maintenance" | "muscleGain" | "fatLoss" | "athlete" | "endurance";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  age?: number;
  gender?: "male" | "female";
}

export type ProteinFoodKey =
  | "chickenBreast"
  | "eggs"
  | "greekYogurt"
  | "salmon"
  | "leanBeef"
  | "tofu"
  | "lentils"
  | "wheyProtein"
  | "cottageCheese"
  | "tuna";

export interface ProteinResult {
  dailyProteinMin: number; // grams
  dailyProteinMax: number; // grams
  dailyProteinOptimal: number; // grams
  proteinPerKg: { min: number; max: number };
  perMeal: { meals3: number; meals4: number; meals5: number; meals6: number };
  percentOfCalories: number; // assuming 2000 cal diet
  foodSources: Array<{
    foodKey: ProteinFoodKey;
    protein: number; // grams per serving
    servingsNeeded: number;
  }>;
}

export function calculateProtein(input: ProteinInput): CalculationResult<ProteinResult> {
  const { weight, goal, activityLevel, age } = input;

  if (weight <= 0) {
    return { ok: false, error: "Weight must be positive", code: "INVALID_INPUT" };
  }

  // Protein requirements based on goal (grams per kg body weight)
  const proteinRanges: Record<string, { min: number; max: number }> = {
    sedentary: { min: 0.8, max: 1.0 },
    maintenance: { min: 1.0, max: 1.2 },
    muscleGain: { min: 1.6, max: 2.2 },
    fatLoss: { min: 1.6, max: 2.4 },
    athlete: { min: 1.4, max: 2.0 },
    endurance: { min: 1.2, max: 1.6 },
  };

  const baseRange = proteinRanges[goal];

  // Adjust for activity level
  let activityMultiplier = 1.0;
  switch (activityLevel) {
    case "sedentary":
      activityMultiplier = 0.9;
      break;
    case "light":
      activityMultiplier = 0.95;
      break;
    case "moderate":
      activityMultiplier = 1.0;
      break;
    case "active":
      activityMultiplier = 1.05;
      break;
    case "veryActive":
      activityMultiplier = 1.1;
      break;
  }

  // Age adjustment (older adults need more protein)
  let ageMultiplier = 1.0;
  if (age && age > 65) {
    ageMultiplier = 1.1;
  }

  const adjustedMin = baseRange.min * activityMultiplier * ageMultiplier;
  const adjustedMax = baseRange.max * activityMultiplier * ageMultiplier;
  const optimal = (adjustedMin + adjustedMax) / 2;

  const dailyProteinMin = weight * adjustedMin;
  const dailyProteinMax = weight * adjustedMax;
  const dailyProteinOptimal = weight * optimal;

  // Per meal distribution
  const perMeal = {
    meals3: dailyProteinOptimal / 3,
    meals4: dailyProteinOptimal / 4,
    meals5: dailyProteinOptimal / 5,
    meals6: dailyProteinOptimal / 6,
  };

  // Percent of 2000 calorie diet (protein = 4 cal/g)
  const proteinCalories = dailyProteinOptimal * 4;
  const percentOfCalories = (proteinCalories / 2000) * 100;

  // Common food sources
  const foodSourcesBase: Array<{ foodKey: ProteinFoodKey; protein: number }> = [
    { foodKey: "chickenBreast", protein: 31 },
    { foodKey: "eggs", protein: 6 },
    { foodKey: "greekYogurt", protein: 17 },
    { foodKey: "salmon", protein: 25 },
    { foodKey: "leanBeef", protein: 26 },
    { foodKey: "tofu", protein: 8 },
    { foodKey: "lentils", protein: 9 },
    { foodKey: "wheyProtein", protein: 25 },
    { foodKey: "cottageCheese", protein: 11 },
    { foodKey: "tuna", protein: 30 },
  ];

  const foodSources = foodSourcesBase.map((source) => ({
    ...source,
    servingsNeeded: Math.ceil(dailyProteinOptimal / source.protein),
  }));

  return {
    ok: true,
    value: {
      dailyProteinMin,
      dailyProteinMax,
      dailyProteinOptimal,
      proteinPerKg: { min: adjustedMin, max: adjustedMax },
      perMeal,
      percentOfCalories,
      foodSources,
    },
  };
}
