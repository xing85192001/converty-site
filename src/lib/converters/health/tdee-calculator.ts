import type { CalculationResult } from "@/types";

export interface TdeeInput {
  gender: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "maintain" | "gain";
}

export interface TdeeResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  weeklyChange: number;
  activityMultiplier: number;
}

export function calculateTdee(input: TdeeInput): CalculationResult<TdeeResult> {
  const { gender, age, weight, height, activityLevel, goal } = input;

  if (age <= 0 || weight <= 0 || height <= 0) {
    return { ok: false, error: "Age, weight, and height must be positive", code: "INVALID_INPUT" };
  }

  // Calculate BMR using Mifflin-St Jeor
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9, // Very hard exercise & physical job
  };

  const activityMultiplier = activityMultipliers[activityLevel];
  const tdee = bmr * activityMultiplier;

  // Adjust for goal
  let targetCalories: number;
  let weeklyChange: number;

  if (goal === "lose") {
    targetCalories = tdee - 500; // 500 calorie deficit = ~0.5kg/week loss
    weeklyChange = -0.5;
  } else if (goal === "gain") {
    targetCalories = tdee + 500; // 500 calorie surplus = ~0.5kg/week gain
    weeklyChange = 0.5;
  } else {
    targetCalories = tdee;
    weeklyChange = 0;
  }

  // Macronutrient breakdown (balanced approach)
  // Protein: 2g per kg body weight
  // Fat: 25% of calories
  // Carbs: remainder
  const proteinGrams = weight * 2;
  const proteinCalories = proteinGrams * 4;
  const fatCalories = targetCalories * 0.25;
  const fatGrams = fatCalories / 9;
  const carbsCalories = targetCalories - proteinCalories - fatCalories;
  const carbsGrams = carbsCalories / 4;

  return {
    ok: true,
    value: {
      bmr,
      tdee,
      targetCalories,
      proteinGrams,
      carbsGrams: Math.max(0, carbsGrams),
      fatGrams,
      weeklyChange,
      activityMultiplier,
    },
  };
}
