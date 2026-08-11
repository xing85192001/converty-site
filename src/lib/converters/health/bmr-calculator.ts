import type { CalculationResult } from "@/types";

export interface BmrInput {
  gender: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
}

export interface BmrResult {
  harrisBenedict: number;
  mifflinStJeor: number;
  katchMcArdle?: number;
  average: number;
  sedentary: number;
  lightActivity: number;
  moderateActivity: number;
  veryActive: number;
  extraActive: number;
}

export function calculateBmr(input: BmrInput): CalculationResult<BmrResult> {
  const { gender, age, weight, height } = input;

  if (age <= 0 || weight <= 0 || height <= 0) {
    return { ok: false, error: "Age, weight, and height must be positive", code: "INVALID_INPUT" };
  }

  let harrisBenedict: number;
  let mifflinStJeor: number;

  if (gender === "male") {
    // Harris-Benedict (1919): BMR = 88.362 + (13.397 × W) + (4.799 × H) - (5.677 × A)
    harrisBenedict = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;

    // Mifflin-St Jeor (1990): BMR = (10 × W) + (6.25 × H) - (5 × A) + 5
    mifflinStJeor = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Harris-Benedict (1919): BMR = 447.593 + (9.247 × W) + (3.098 × H) - (4.330 × A)
    harrisBenedict = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    // Mifflin-St Jeor (1990): BMR = (10 × W) + (6.25 × H) - (5 × A) - 161
    mifflinStJeor = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const average = (harrisBenedict + mifflinStJeor) / 2;

  // Calculate TDEE based on activity levels
  return {
    ok: true,
    value: {
      harrisBenedict,
      mifflinStJeor,
      average,
      sedentary: average * 1.2,
      lightActivity: average * 1.375,
      moderateActivity: average * 1.55,
      veryActive: average * 1.725,
      extraActive: average * 1.9,
    },
  };
}
