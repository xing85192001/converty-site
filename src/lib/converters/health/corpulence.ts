import type { CalculationResult } from "@/types";

// Category keys for translation lookup
export type CorpulenceCategoryKey =
  | "underweight"
  | "normalLower"
  | "normal"
  | "normalUpper"
  | "overweight"
  | "obese";

// Comparison keys for translation lookup
export type ComparisonKey = "similar" | "ciHigher" | "ciLower";

export interface CorpulenceResult {
  corpulenceIndex: number;
  categoryKey: CorpulenceCategoryKey;
}

// Corpulence Index (Ponderal Index) = weight (kg) / height (m)³
// Normal range is typically 11-14 kg/m³

export function calculateCorpulence(
  weight: number,
  height: number,
  unit: "metric" | "imperial" = "metric"
): CalculationResult<CorpulenceResult> {
  if (weight <= 0 || height <= 0) {
    return { ok: false, error: "Weight and height must be positive", code: "INVALID_INPUT" };
  }

  let weightKg: number;
  let heightM: number;

  if (unit === "imperial") {
    // Convert lbs to kg and inches to meters
    weightKg = weight * 0.453592;
    heightM = height * 0.0254;
  } else {
    weightKg = weight;
    heightM = height / 100; // cm to meters
  }

  // Corpulence Index = weight / height³
  const corpulenceIndex = weightKg / heightM ** 3;

  const categoryKey = getCorpulenceCategory(corpulenceIndex);

  return {
    ok: true,
    value: {
      corpulenceIndex: Math.round(corpulenceIndex * 100) / 100,
      categoryKey,
    },
  };
}

function getCorpulenceCategory(ci: number): CorpulenceCategoryKey {
  if (ci < 11) {
    return "underweight";
  } else if (ci < 13) {
    return "normalLower";
  } else if (ci < 14) {
    return "normal";
  } else if (ci < 15) {
    return "normalUpper";
  } else if (ci < 17) {
    return "overweight";
  } else {
    return "obese";
  }
}

// Compare CI with BMI
export function compareToBMI(
  weight: number,
  height: number,
  unit: "metric" | "imperial" = "metric"
): CalculationResult<{ bmi: number; ci: number; comparisonKey: ComparisonKey }> {
  if (weight <= 0 || height <= 0) {
    return { ok: false, error: "Weight and height must be positive", code: "INVALID_INPUT" };
  }

  let weightKg: number;
  let heightM: number;

  if (unit === "imperial") {
    weightKg = weight * 0.453592;
    heightM = height * 0.0254;
  } else {
    weightKg = weight;
    heightM = height / 100;
  }

  const bmi = weightKg / heightM ** 2;
  const ci = weightKg / heightM ** 3;

  let comparisonKey: ComparisonKey;
  if (Math.abs(bmi - ci) < 2) {
    comparisonKey = "similar";
  } else if (ci > bmi) {
    comparisonKey = "ciHigher";
  } else {
    comparisonKey = "ciLower";
  }

  return {
    ok: true,
    value: {
      bmi: Math.round(bmi * 100) / 100,
      ci: Math.round(ci * 100) / 100,
      comparisonKey,
    },
  };
}
