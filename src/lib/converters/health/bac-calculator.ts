import type { CalculationResult } from "@/types";

export interface BacInput {
  gender: "male" | "female";
  weight: number; // kg
  drinks: number;
  drinkType: "beer" | "wine" | "spirits" | "custom";
  customAlcoholGrams?: number;
  hoursSinceDrinking: number;
}

export interface BacResult {
  bac: number; // Blood Alcohol Content percentage
  status: string;
  timeToSober: number; // hours
  timeToLegal: number; // hours to reach 0.08%
  alcoholGrams: number;
  peakBac: number;
  effects: string[];
  legalToDrive: boolean;
}

export function calculateBac(input: BacInput): CalculationResult<BacResult> {
  const { gender, weight, drinks, drinkType, customAlcoholGrams, hoursSinceDrinking } = input;

  if (weight <= 0 || drinks < 0 || hoursSinceDrinking < 0) {
    return {
      ok: false,
      error: "Weight must be positive and drinks and hours cannot be negative",
      code: "INVALID_INPUT",
    };
  }

  // Standard drink alcohol content in grams
  const alcoholPerDrink: Record<string, number> = {
    beer: 14, // 355ml beer at 5%
    wine: 14, // 150ml wine at 12%
    spirits: 14, // 44ml spirits at 40%
    custom: customAlcoholGrams || 14,
  };

  const alcoholGrams = drinks * alcoholPerDrink[drinkType];

  // Widmark formula for BAC
  // BAC = (A / (r × W)) - (β × t)
  // A = alcohol consumed in grams
  // r = Widmark factor (0.68 for men, 0.55 for women)
  // W = body weight in grams
  // β = alcohol elimination rate (0.015% per hour average)
  // t = time since drinking in hours

  const widmarkFactor = gender === "male" ? 0.68 : 0.55;
  const weightGrams = weight * 1000;
  const eliminationRate = 0.015;

  // Calculate peak BAC (at time 0)
  const peakBac = (alcoholGrams / (widmarkFactor * weightGrams)) * 100;

  // Current BAC after elimination
  const bac = Math.max(0, peakBac - eliminationRate * hoursSinceDrinking);

  // Time to reach 0% BAC
  const timeToSober = bac > 0 ? bac / eliminationRate : 0;

  // Time to reach legal limit (0.08%)
  const legalLimit = 0.08;
  const timeToLegal = bac > legalLimit ? (bac - legalLimit) / eliminationRate : 0;

  // Determine status and effects
  let status: string;
  let effects: string[];

  if (bac === 0) {
    status = "sober";
    effects = ["noImpairment"];
  } else if (bac < 0.02) {
    status = "minimal";
    effects = ["slightMoodElevation", "relaxation"];
  } else if (bac < 0.05) {
    status = "euphoria";
    effects = ["loweredInhibitions", "mildEuphoria", "slightImpairmentReasoning"];
  } else if (bac < 0.08) {
    status = "excitement";
    effects = ["impairedJudgment", "reducedCoordination", "slowerReactionTime"];
  } else if (bac < 0.15) {
    status = "confusion";
    effects = [
      "poorMuscleCoordination",
      "slurredSpeech",
      "impairedBalance",
      "memoryBlackoutsPossible",
    ];
  } else if (bac < 0.25) {
    status = "stupor";
    effects = ["severeMotorImpairment", "vomitingLikely", "lossConsciousnessPossible"];
  } else if (bac < 0.35) {
    status = "coma";
    effects = ["unconsciousness", "depressedReflexes", "respiratoryDepression"];
  } else {
    status = "deathRisk";
    effects = ["lifeThreatening", "respiratoryArrestPossible", "seekEmergencyHelp"];
  }

  return {
    ok: true,
    value: {
      bac,
      status,
      timeToSober,
      timeToLegal,
      alcoholGrams,
      peakBac,
      effects,
      legalToDrive: bac < legalLimit,
    },
  };
}
