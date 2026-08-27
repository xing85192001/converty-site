import type { CalculationResult } from "@/types";

export interface PregnancyWeightGainInput {
  prePregnancyWeight: number; // kg
  currentWeight: number; // kg
  height: number; // cm
  weeksPregnant: number;
  twins: boolean;
}

export interface PregnancyWeightGainResult {
  prePregnancyBmi: number;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese";
  currentWeightGain: number;
  recommendedGainMin: number;
  recommendedGainMax: number;
  recommendedGainAtWeek: { min: number; max: number };
  status: "under" | "on-track" | "over";
  weeklyGainRate: { min: number; max: number };
  projectedTotalGain: number;
  breakdown: {
    baby: number;
    placenta: number;
    amnioticFluid: number;
    uterus: number;
    breasts: number;
    blood: number;
    fluids: number;
    fatStores: number;
  };
}

export function calculatePregnancyWeightGain(
  input: PregnancyWeightGainInput
): CalculationResult<PregnancyWeightGainResult> {
  const { prePregnancyWeight, currentWeight, height, weeksPregnant, twins } = input;

  if (prePregnancyWeight <= 0 || height <= 0 || weeksPregnant < 0 || weeksPregnant > 42) {
    return {
      ok: false,
      error:
        "Pre-pregnancy weight and height must be positive, and weeks pregnant must be between 0 and 42",
      code: "INVALID_INPUT",
    };
  }

  const heightM = height / 100;
  const prePregnancyBmi = prePregnancyWeight / (heightM * heightM);

  // Determine BMI category
  let bmiCategory: "underweight" | "normal" | "overweight" | "obese";
  let recommendedGainMin: number;
  let recommendedGainMax: number;
  let weeklyGainSecondThird: { min: number; max: number };

  if (prePregnancyBmi < 18.5) {
    bmiCategory = "underweight";
    recommendedGainMin = twins ? 22.7 : 12.7;
    recommendedGainMax = twins ? 28.1 : 18.1;
    weeklyGainSecondThird = { min: 0.44, max: 0.58 };
  } else if (prePregnancyBmi < 25) {
    bmiCategory = "normal";
    recommendedGainMin = twins ? 16.8 : 11.3;
    recommendedGainMax = twins ? 24.5 : 15.9;
    weeklyGainSecondThird = { min: 0.35, max: 0.5 };
  } else if (prePregnancyBmi < 30) {
    bmiCategory = "overweight";
    recommendedGainMin = twins ? 14.1 : 6.8;
    recommendedGainMax = twins ? 22.7 : 11.3;
    weeklyGainSecondThird = { min: 0.23, max: 0.33 };
  } else {
    bmiCategory = "obese";
    recommendedGainMin = twins ? 11.3 : 5.0;
    recommendedGainMax = twins ? 19.1 : 9.1;
    weeklyGainSecondThird = { min: 0.17, max: 0.27 };
  }

  // Calculate expected weight gain at current week
  let recommendedGainAtWeek: { min: number; max: number };
  if (weeksPregnant <= 13) {
    // First trimester: minimal gain (0.5-2 kg total)
    const firstTrimesterGain = (weeksPregnant / 13) * 2;
    recommendedGainAtWeek = { min: firstTrimesterGain * 0.25, max: firstTrimesterGain };
  } else {
    // Second and third trimester
    const firstTrimesterGain = 2;
    const weeksAfterFirst = weeksPregnant - 13;
    recommendedGainAtWeek = {
      min: firstTrimesterGain * 0.25 + weeksAfterFirst * weeklyGainSecondThird.min,
      max: firstTrimesterGain + weeksAfterFirst * weeklyGainSecondThird.max,
    };
  }

  const currentWeightGain = currentWeight - prePregnancyWeight;

  // Determine status
  let status: "under" | "on-track" | "over";
  if (currentWeightGain < recommendedGainAtWeek.min) {
    status = "under";
  } else if (currentWeightGain > recommendedGainAtWeek.max) {
    status = "over";
  } else {
    status = "on-track";
  }

  // Project total gain based on current trajectory
  const weeksRemaining = 40 - weeksPregnant;
  const avgWeeklyGain = weeksPregnant > 0 ? currentWeightGain / weeksPregnant : 0;
  const projectedTotalGain = currentWeightGain + avgWeeklyGain * weeksRemaining;

  // Typical weight distribution at end of pregnancy
  const breakdown = {
    baby: 3.4, // 3.2-3.6 kg
    placenta: 0.7,
    amnioticFluid: 0.9,
    uterus: 0.9,
    breasts: 0.5,
    blood: 1.4,
    fluids: 1.4,
    fatStores: 2.7,
  };

  return {
    ok: true,
    value: {
      prePregnancyBmi,
      bmiCategory,
      currentWeightGain,
      recommendedGainMin,
      recommendedGainMax,
      recommendedGainAtWeek,
      status,
      weeklyGainRate: weeklyGainSecondThird,
      projectedTotalGain,
      breakdown,
    },
  };
}
