import type { CalculationResult } from "@/types";

export interface BodyTypeInput {
  gender: "male" | "female";
  wristCircumference: number; // cm
  height: number; // cm
  shoulderWidth?: number; // cm
  hipWidth?: number; // cm
  waist?: number; // cm
}

export interface BodyTypeResult {
  frameSize: "small" | "medium" | "large";
  bodyType: "ectomorph" | "mesomorph" | "endomorph" | "combination";
  wristRatio: number;
  shoulderToHipRatio?: number;
  waistToHipRatio?: number;
  characteristics: string[];
  trainingRecommendations: string[];
  nutritionRecommendations: string[];
}

export function calculateBodyType(input: BodyTypeInput): CalculationResult<BodyTypeResult> {
  const { gender, wristCircumference, height, shoulderWidth, hipWidth, waist } = input;

  if (wristCircumference <= 0 || height <= 0) {
    return {
      ok: false,
      error: "Wrist circumference and height must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Frame size calculation using wrist circumference
  // Height in cm / wrist circumference in cm
  const wristRatio = height / wristCircumference;

  let frameSize: "small" | "medium" | "large";
  if (gender === "male") {
    if (wristRatio > 10.4) {
      frameSize = "small";
    } else if (wristRatio >= 9.6) {
      frameSize = "medium";
    } else {
      frameSize = "large";
    }
  } else {
    if (wristRatio > 11.0) {
      frameSize = "small";
    } else if (wristRatio >= 10.1) {
      frameSize = "medium";
    } else {
      frameSize = "large";
    }
  }

  // Calculate ratios if data available
  const shoulderToHipRatio = shoulderWidth && hipWidth ? shoulderWidth / hipWidth : undefined;
  const waistToHipRatio = waist && hipWidth ? waist / hipWidth : undefined;

  // Determine body type (somatotype)
  let bodyType: "ectomorph" | "mesomorph" | "endomorph" | "combination";
  let characteristics: string[];
  let trainingRecommendations: string[];
  let nutritionRecommendations: string[];

  // Primary determination based on frame size and ratios
  if (frameSize === "small") {
    bodyType = "ectomorph";
    characteristics = [
      "ecto_narrow_frame",
      "ecto_long_limbs",
      "ecto_fast_metabolism",
      "ecto_difficulty_gaining",
      "ecto_low_body_fat",
      "ecto_lean_muscle",
    ];
    trainingRecommendations = [
      "ecto_train_compound",
      "ecto_train_limit_cardio",
      "ecto_train_frequency",
      "ecto_train_heavy_weights",
      "ecto_train_rest",
    ];
    nutritionRecommendations = [
      "ecto_nutr_calorie_dense",
      "ecto_nutr_protein",
      "ecto_nutr_frequent_meals",
      "ecto_nutr_healthy_fats",
      "ecto_nutr_post_workout",
    ];
  } else if (frameSize === "large" || (waistToHipRatio && waistToHipRatio > 0.9)) {
    bodyType = "endomorph";
    characteristics = [
      "endo_wide_frame",
      "endo_large_bones",
      "endo_slow_metabolism",
      "endo_gains_easily",
      "endo_stores_fat",
      "endo_strong_lower",
    ];
    trainingRecommendations = [
      "endo_train_cardio",
      "endo_train_circuit",
      "endo_train_hiit",
      "endo_train_full_body",
      "endo_train_stay_active",
    ];
    nutritionRecommendations = [
      "endo_nutr_monitor_carbs",
      "endo_nutr_protein_veggies",
      "endo_nutr_frequent_small",
      "endo_nutr_avoid_processed",
      "endo_nutr_time_carbs",
    ];
  } else {
    bodyType = "mesomorph";
    characteristics = [
      "meso_broad_shoulders",
      "meso_narrow_waist",
      "meso_athletic_build",
      "meso_gains_muscle",
      "meso_moderate_metabolism",
      "meso_well_proportioned",
    ];
    trainingRecommendations = [
      "meso_train_balanced",
      "meso_train_variety",
      "meso_train_high_volume",
      "meso_train_progressive",
      "meso_train_mix_exercises",
    ];
    nutritionRecommendations = [
      "meso_nutr_balanced_macros",
      "meso_nutr_moderate_carbs",
      "meso_nutr_protein",
      "meso_nutr_adjust_calories",
      "meso_nutr_flexible",
    ];
  }

  // Check for combination types based on ratios
  if (shoulderToHipRatio) {
    if (frameSize === "small" && shoulderToHipRatio > 1.3) {
      bodyType = "combination";
      characteristics.push("combo_ecto_meso");
    } else if (frameSize === "large" && shoulderToHipRatio > 1.2) {
      bodyType = "combination";
      characteristics.push("combo_meso_endo");
    }
  }

  return {
    ok: true,
    value: {
      frameSize,
      bodyType,
      wristRatio,
      shoulderToHipRatio,
      waistToHipRatio,
      characteristics,
      trainingRecommendations,
      nutritionRecommendations,
    },
  };
}
