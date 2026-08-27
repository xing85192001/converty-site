import type { CalculationResult } from "@/types";

export interface HealthyWeightInput {
  height: number; // cm
  age: number;
  gender: "male" | "female";
  frameSize?: "small" | "medium" | "large";
}

export type WeightCategoryKey =
  | "severelyUnderweight"
  | "underweight"
  | "normal"
  | "overweight"
  | "obeseClassI"
  | "obeseClassII"
  | "obeseClassIII";

export interface HealthyWeightResult {
  bmiBasedRange: { min: number; max: number };
  idealWeight: number;
  adjustedRange: { min: number; max: number };
  weightCategories: Array<{
    categoryKey: WeightCategoryKey;
    minWeight: number;
    maxWeight: number;
    bmiRange: string;
  }>;
  currentBmiThresholds: {
    underweight: number;
    normal: number;
    overweight: number;
    obese: number;
  };
}

export function calculateHealthyWeight(
  input: HealthyWeightInput
): CalculationResult<HealthyWeightResult> {
  const { height, age, gender, frameSize = "medium" } = input;

  if (height <= 0 || age <= 0 || age > 120) {
    return {
      ok: false,
      error: "Height must be positive and age must be between 1 and 120",
      code: "INVALID_INPUT",
    };
  }

  const heightM = height / 100;
  const heightSquared = heightM * heightM;

  // BMI-based healthy weight range (18.5 - 24.9)
  const bmiBasedRange = {
    min: 18.5 * heightSquared,
    max: 24.9 * heightSquared,
  };

  // Ideal weight using Devine formula (adjusted for metric)
  let idealWeight: number;
  const heightInches = height / 2.54;
  const heightOver5Feet = Math.max(0, heightInches - 60);

  if (gender === "male") {
    idealWeight = 50 + 2.3 * heightOver5Feet;
  } else {
    idealWeight = 45.5 + 2.3 * heightOver5Feet;
  }

  // Frame size adjustment
  let frameAdjustment = 1.0;
  if (frameSize === "small") {
    frameAdjustment = 0.9;
  } else if (frameSize === "large") {
    frameAdjustment = 1.1;
  }

  // Age adjustment (slight increase for older adults)
  let ageAdjustment = 0;
  if (age > 65) {
    ageAdjustment = 1; // Allow slightly higher weight for older adults
  }

  const adjustedIdeal = idealWeight * frameAdjustment;
  const adjustedRange = {
    min: (bmiBasedRange.min + ageAdjustment) * (frameSize === "small" ? 0.95 : 1),
    max: (bmiBasedRange.max + ageAdjustment) * (frameSize === "large" ? 1.05 : 1),
  };

  // Weight categories with actual weight ranges
  const weightCategories: HealthyWeightResult["weightCategories"] = [
    {
      categoryKey: "severelyUnderweight",
      minWeight: 0,
      maxWeight: 16 * heightSquared,
      bmiRange: "< 16",
    },
    {
      categoryKey: "underweight",
      minWeight: 16 * heightSquared,
      maxWeight: 18.5 * heightSquared,
      bmiRange: "16 - 18.4",
    },
    {
      categoryKey: "normal",
      minWeight: 18.5 * heightSquared,
      maxWeight: 24.9 * heightSquared,
      bmiRange: "18.5 - 24.9",
    },
    {
      categoryKey: "overweight",
      minWeight: 25 * heightSquared,
      maxWeight: 29.9 * heightSquared,
      bmiRange: "25 - 29.9",
    },
    {
      categoryKey: "obeseClassI",
      minWeight: 30 * heightSquared,
      maxWeight: 34.9 * heightSquared,
      bmiRange: "30 - 34.9",
    },
    {
      categoryKey: "obeseClassII",
      minWeight: 35 * heightSquared,
      maxWeight: 39.9 * heightSquared,
      bmiRange: "35 - 39.9",
    },
    {
      categoryKey: "obeseClassIII",
      minWeight: 40 * heightSquared,
      maxWeight: 100 * heightSquared,
      bmiRange: ">= 40",
    },
  ];

  // BMI threshold weights
  const currentBmiThresholds = {
    underweight: 18.5 * heightSquared,
    normal: 25 * heightSquared,
    overweight: 30 * heightSquared,
    obese: 35 * heightSquared,
  };

  return {
    ok: true,
    value: {
      bmiBasedRange,
      idealWeight: adjustedIdeal,
      adjustedRange,
      weightCategories,
      currentBmiThresholds,
    },
  };
}
