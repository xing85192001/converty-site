import type { CalculationResult } from "@/types";

export interface BodyFatInput {
  gender: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
  neck: number; // cm
  waist: number; // cm
  hip?: number; // cm (required for females)
}

export interface BodyFatResult {
  bodyFatPercent: number;
  fatMass: number;
  leanMass: number;
  category: string;
  bmi: number;
  idealBodyFatMin: number;
  idealBodyFatMax: number;
}

export function calculateBodyFat(input: BodyFatInput): CalculationResult<BodyFatResult> {
  const { gender, age: _age, weight, height, neck, waist, hip } = input;

  if (weight <= 0 || height <= 0 || neck <= 0 || waist <= 0) {
    return {
      ok: false,
      error: "Weight, height, neck, and waist must be positive",
      code: "INVALID_INPUT",
    };
  }

  if (gender === "female" && (!hip || hip <= 0)) {
    return {
      ok: false,
      error: "Hip measurement is required for females and must be positive",
      code: "INVALID_INPUT",
    };
  }

  // US Navy Method for body fat calculation
  let bodyFatPercent: number;

  if (gender === "male") {
    // Male formula: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
    bodyFatPercent = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    // Female formula: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    bodyFatPercent =
      163.205 * Math.log10(waist + (hip || 0) - neck) - 97.684 * Math.log10(height) - 78.387;
  }

  bodyFatPercent = Math.max(0, Math.min(bodyFatPercent, 60));

  const fatMass = (weight * bodyFatPercent) / 100;
  const leanMass = weight - fatMass;
  const bmi = weight / (height / 100) ** 2;

  // Determine category based on gender and body fat percentage
  let category: string;
  let idealBodyFatMin: number;
  let idealBodyFatMax: number;

  if (gender === "male") {
    idealBodyFatMin = 10;
    idealBodyFatMax = 20;
    if (bodyFatPercent < 6) category = "essential";
    else if (bodyFatPercent < 14) category = "athletes";
    else if (bodyFatPercent < 18) category = "fitness";
    else if (bodyFatPercent < 25) category = "average";
    else category = "obese";
  } else {
    idealBodyFatMin = 18;
    idealBodyFatMax = 28;
    if (bodyFatPercent < 14) category = "essential";
    else if (bodyFatPercent < 21) category = "athletes";
    else if (bodyFatPercent < 25) category = "fitness";
    else if (bodyFatPercent < 32) category = "average";
    else category = "obese";
  }

  return {
    ok: true,
    value: {
      bodyFatPercent,
      fatMass,
      leanMass,
      category,
      bmi,
      idealBodyFatMin,
      idealBodyFatMax,
    },
  };
}
