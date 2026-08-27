import type { CalculationResult } from "@/types";

export interface CalorieInput {
  gender: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  targetWeight: number; // kg
  weeksToGoal: number;
}

export interface CalorieResult {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  dailyDeficit: number;
  weeklyWeightChange: number;
  isSafe: boolean;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  projectedDate: string;
}

export function calculateCalories(input: CalorieInput): CalculationResult<CalorieResult> {
  const { gender, age, weight, height, activityLevel, targetWeight, weeksToGoal } = input;

  if (age <= 0 || weight <= 0 || height <= 0 || weeksToGoal <= 0) {
    return {
      ok: false,
      error: "Age, weight, height, and weeks to goal must be positive",
      code: "INVALID_INPUT",
    };
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
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const maintenanceCalories = bmr * activityMultipliers[activityLevel];

  // Calculate required deficit/surplus
  const weightChange = targetWeight - weight;
  const caloriesPerKg = 7700; // Approximately 7700 calories per kg of body fat
  const totalCalorieChange = weightChange * caloriesPerKg;
  const dailyCalorieChange = totalCalorieChange / (weeksToGoal * 7);

  const targetCalories = maintenanceCalories + dailyCalorieChange;
  const dailyDeficit = maintenanceCalories - targetCalories;
  const weeklyWeightChange = (dailyCalorieChange * 7) / caloriesPerKg;

  // Check if the plan is safe (not below 1200 for women, 1500 for men)
  const minimumCalories = gender === "female" ? 1200 : 1500;
  const isSafe = targetCalories >= minimumCalories && Math.abs(weeklyWeightChange) <= 1;

  // Calculate macros (balanced approach)
  const proteinGrams = Math.max(targetWeight, weight) * 2; // 2g per kg
  const proteinCalories = proteinGrams * 4;
  const fatCalories = targetCalories * 0.25;
  const fatGrams = fatCalories / 9;
  const carbsCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = carbsCalories / 4;

  // Calculate projected date
  const today = new Date();
  const projectedDate = new Date(today.getTime() + weeksToGoal * 7 * 24 * 60 * 60 * 1000);

  return {
    ok: true,
    value: {
      bmr,
      maintenanceCalories,
      targetCalories,
      dailyDeficit,
      weeklyWeightChange,
      isSafe,
      proteinGrams,
      carbsGrams,
      fatGrams,
      projectedDate: projectedDate.toLocaleDateString(),
    },
  };
}
