import type { CalculationResult } from "@/types";

export interface CarbInput {
  calories: number;
  goal: "weightLoss" | "maintenance" | "muscleGain" | "keto" | "lowCarb" | "athlete";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
}

export type ComplexCarbFoodKey =
  | "oats"
  | "brownRice"
  | "quinoa"
  | "sweetPotatoes"
  | "wholeGrainBread"
  | "beansAndLentils"
  | "vegetables"
  | "wholeWheatPasta";

export type SimpleCarbFoodKey = "fruits" | "honeyModeration" | "milk" | "sportsDrinks";

export type AvoidCarbFoodKey =
  | "whiteBread"
  | "sugaryCereals"
  | "candyAndSweets"
  | "sodaAndSugaryDrinks"
  | "pastriesAndBakedGoods"
  | "whiteRiceLimit";

export interface CarbResult {
  dailyCarbGrams: number;
  dailyCarbCalories: number;
  carbPercent: number;
  fiberMin: number;
  sugarMax: number;
  netCarbs: number;
  timing: {
    preworkout: number;
    postworkout: number;
    other: number;
  };
  carbTypes: {
    complex: { grams: number; percent: number };
    simple: { grams: number; percent: number };
    fiber: { grams: number; percent: number };
  };
  foodSourceKeys: {
    complex: ComplexCarbFoodKey[];
    simple: SimpleCarbFoodKey[];
    avoid: AvoidCarbFoodKey[];
  };
}

export function calculateCarbs(input: CarbInput): CalculationResult<CarbResult> {
  const { calories, goal, activityLevel } = input;

  if (calories <= 0) {
    return { ok: false, error: "Calories must be positive", code: "INVALID_INPUT" };
  }

  // Base carb percentage based on goal
  let carbPercent: number;
  switch (goal) {
    case "weightLoss":
      carbPercent = 30;
      break;
    case "maintenance":
      carbPercent = 45;
      break;
    case "muscleGain":
      carbPercent = 50;
      break;
    case "keto":
      carbPercent = 5;
      break;
    case "lowCarb":
      carbPercent = 20;
      break;
    case "athlete":
      carbPercent = 55;
      break;
    default:
      carbPercent = 45;
  }

  // Adjust for activity level
  let activityAdjustment = 0;
  switch (activityLevel) {
    case "sedentary":
      activityAdjustment = -5;
      break;
    case "light":
      activityAdjustment = 0;
      break;
    case "moderate":
      activityAdjustment = 5;
      break;
    case "active":
      activityAdjustment = 10;
      break;
    case "athlete":
      activityAdjustment = 15;
      break;
  }

  const adjustedCarbPercent = Math.min(65, Math.max(5, carbPercent + activityAdjustment));
  const dailyCarbCalories = (calories * adjustedCarbPercent) / 100;
  const dailyCarbGrams = dailyCarbCalories / 4; // 4 calories per gram

  // Fiber recommendation (14g per 1000 calories or 25-38g total)
  const fiberMin = Math.max(25, (calories / 1000) * 14);

  // Sugar max (less than 10% of calories, or 25-36g)
  const sugarMax = Math.min(36, (calories * 0.1) / 4);

  // Net carbs (total - fiber)
  const netCarbs = dailyCarbGrams - fiberMin;

  // Carb timing for active individuals
  const timing = {
    preworkout:
      activityLevel === "athlete" || activityLevel === "active"
        ? dailyCarbGrams * 0.25
        : dailyCarbGrams * 0.15,
    postworkout:
      activityLevel === "athlete" || activityLevel === "active"
        ? dailyCarbGrams * 0.35
        : dailyCarbGrams * 0.2,
    other:
      dailyCarbGrams * (activityLevel === "athlete" || activityLevel === "active" ? 0.4 : 0.65),
  };

  // Carb type breakdown
  const carbTypes = {
    complex: {
      grams: dailyCarbGrams * 0.65,
      percent: 65,
    },
    simple: {
      grams: dailyCarbGrams * 0.2,
      percent: 20,
    },
    fiber: {
      grams: fiberMin,
      percent: 15,
    },
  };

  const foodSourceKeys: CarbResult["foodSourceKeys"] = {
    complex: [
      "oats",
      "brownRice",
      "quinoa",
      "sweetPotatoes",
      "wholeGrainBread",
      "beansAndLentils",
      "vegetables",
      "wholeWheatPasta",
    ],
    simple: ["fruits", "honeyModeration", "milk", "sportsDrinks"],
    avoid: [
      "whiteBread",
      "sugaryCereals",
      "candyAndSweets",
      "sodaAndSugaryDrinks",
      "pastriesAndBakedGoods",
      "whiteRiceLimit",
    ],
  };

  return {
    ok: true,
    value: {
      dailyCarbGrams,
      dailyCarbCalories,
      carbPercent: adjustedCarbPercent,
      fiberMin,
      sugarMax,
      netCarbs,
      timing,
      carbTypes,
      foodSourceKeys,
    },
  };
}
