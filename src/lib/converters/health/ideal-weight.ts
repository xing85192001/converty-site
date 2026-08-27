import type { CalculationResult } from "@/types";

export interface IdealWeightInput {
  gender: "male" | "female";
  height: number; // cm
  frameSize: "small" | "medium" | "large";
}

export interface IdealWeightResult {
  robinson: number;
  miller: number;
  devine: number;
  hamwi: number;
  average: number;
  bmiBasedMin: number;
  bmiBasedMax: number;
  rangeMin: number;
  rangeMax: number;
}

export function calculateIdealWeight(
  input: IdealWeightInput
): CalculationResult<IdealWeightResult> {
  const { gender, height, frameSize } = input;

  if (height <= 0) {
    return { ok: false, error: "Height must be positive", code: "INVALID_INPUT" };
  }

  // Convert height to inches for formula calculations
  const heightInches = height / 2.54;
  const heightOver5Feet = Math.max(0, heightInches - 60);

  let robinson: number;
  let miller: number;
  let devine: number;
  let hamwi: number;

  if (gender === "male") {
    // Robinson Formula (1983): 52 kg + 1.9 kg per inch over 5 feet
    robinson = 52 + 1.9 * heightOver5Feet;

    // Miller Formula (1983): 56.2 kg + 1.41 kg per inch over 5 feet
    miller = 56.2 + 1.41 * heightOver5Feet;

    // Devine Formula (1974): 50 kg + 2.3 kg per inch over 5 feet
    devine = 50 + 2.3 * heightOver5Feet;

    // Hamwi Formula (1964): 48 kg + 2.7 kg per inch over 5 feet
    hamwi = 48 + 2.7 * heightOver5Feet;
  } else {
    // Robinson Formula (1983): 49 kg + 1.7 kg per inch over 5 feet
    robinson = 49 + 1.7 * heightOver5Feet;

    // Miller Formula (1983): 53.1 kg + 1.36 kg per inch over 5 feet
    miller = 53.1 + 1.36 * heightOver5Feet;

    // Devine Formula (1974): 45.5 kg + 2.3 kg per inch over 5 feet
    devine = 45.5 + 2.3 * heightOver5Feet;

    // Hamwi Formula (1964): 45.5 kg + 2.2 kg per inch over 5 feet
    hamwi = 45.5 + 2.2 * heightOver5Feet;
  }

  const average = (robinson + miller + devine + hamwi) / 4;

  // Apply frame size adjustment
  let frameAdjustment = 1.0;
  if (frameSize === "small") {
    frameAdjustment = 0.9;
  } else if (frameSize === "large") {
    frameAdjustment = 1.1;
  }

  // BMI-based ideal weight range (BMI 18.5 - 24.9)
  const heightM = height / 100;
  const bmiBasedMin = 18.5 * heightM * heightM;
  const bmiBasedMax = 24.9 * heightM * heightM;

  // Calculate range based on frame size
  const rangeMin = average * frameAdjustment * 0.95;
  const rangeMax = average * frameAdjustment * 1.05;

  return {
    ok: true,
    value: {
      robinson: robinson * frameAdjustment,
      miller: miller * frameAdjustment,
      devine: devine * frameAdjustment,
      hamwi: hamwi * frameAdjustment,
      average: average * frameAdjustment,
      bmiBasedMin,
      bmiBasedMax,
      rangeMin,
      rangeMax,
    },
  };
}
