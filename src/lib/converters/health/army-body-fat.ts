import type { CalculationResult } from "@/types";

export interface ArmyBodyFatInput {
  gender: "male" | "female";
  age: number;
  height: number; // cm
  neck: number; // cm
  waist: number; // cm
  hip?: number; // cm (required for females)
}

export interface ArmyBodyFatResult {
  bodyFatPercent: number;
  maxAllowedPercent: number;
  passesStandard: boolean;
  category: string;
  circumferenceValue: number;
  heightInches: number;
  armyCategory: "pass" | "tape" | "fail";
}

export function calculateArmyBodyFat(
  input: ArmyBodyFatInput
): CalculationResult<ArmyBodyFatResult> {
  const { gender, age, height, neck, waist, hip } = input;

  if (height <= 0 || neck <= 0 || waist <= 0 || age <= 0) {
    return {
      ok: false,
      error: "Height, neck, waist, and age must be positive",
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

  // Convert measurements to inches for US Army formula
  const heightInches = height / 2.54;
  const neckInches = neck / 2.54;
  const waistInches = waist / 2.54;
  const hipInches = hip ? hip / 2.54 : 0;

  let bodyFatPercent: number;
  let circumferenceValue: number;

  if (gender === "male") {
    // Male formula: %BF = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
    circumferenceValue = waistInches - neckInches;
    bodyFatPercent =
      86.01 * Math.log10(circumferenceValue) - 70.041 * Math.log10(heightInches) + 36.76;
  } else {
    // Female formula: %BF = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    circumferenceValue = waistInches + hipInches - neckInches;
    bodyFatPercent =
      163.205 * Math.log10(circumferenceValue) - 97.684 * Math.log10(heightInches) - 78.387;
  }

  bodyFatPercent = Math.max(0, Math.min(bodyFatPercent, 50));

  // US Army maximum allowable body fat percentages by age and gender
  let maxAllowedPercent: number;

  if (gender === "male") {
    if (age <= 20) maxAllowedPercent = 20;
    else if (age <= 27) maxAllowedPercent = 22;
    else if (age <= 39) maxAllowedPercent = 24;
    else maxAllowedPercent = 26;
  } else {
    if (age <= 20) maxAllowedPercent = 30;
    else if (age <= 27) maxAllowedPercent = 32;
    else if (age <= 39) maxAllowedPercent = 34;
    else maxAllowedPercent = 36;
  }

  const passesStandard = bodyFatPercent <= maxAllowedPercent;

  // Determine category (return translation keys)
  let category: string;
  if (gender === "male") {
    if (bodyFatPercent < 6) category = "essential";
    else if (bodyFatPercent < 14) category = "athletes";
    else if (bodyFatPercent < 18) category = "fitness";
    else if (bodyFatPercent < 25) category = "acceptable";
    else category = "obese";
  } else {
    if (bodyFatPercent < 14) category = "essential";
    else if (bodyFatPercent < 21) category = "athletes";
    else if (bodyFatPercent < 25) category = "fitness";
    else if (bodyFatPercent < 32) category = "acceptable";
    else category = "obese";
  }

  // Army category determination
  let armyCategory: "pass" | "tape" | "fail";
  if (passesStandard) {
    armyCategory = "pass";
  } else if (bodyFatPercent <= maxAllowedPercent + 2) {
    armyCategory = "tape"; // Borderline, may require tape test
  } else {
    armyCategory = "fail";
  }

  return {
    ok: true,
    value: {
      bodyFatPercent,
      maxAllowedPercent,
      passesStandard,
      category,
      circumferenceValue: circumferenceValue * 2.54, // Convert back to cm for display
      heightInches,
      armyCategory,
    },
  };
}
