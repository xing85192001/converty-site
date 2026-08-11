import type { CalculationResult } from "@/types";

export interface GfrInput {
  creatinine: number; // mg/dL or umol/L
  creatinineUnit: "mgdl" | "umol";
  age: number;
  gender: "male" | "female";
  race: "black" | "other";
  weight?: number; // kg (for Cockcroft-Gault)
  height?: number; // cm (for body surface area adjustment)
}

// CKD stage keys for translation lookup
export type CkdStageKey = "stage1" | "stage2" | "stage3a" | "stage3b" | "stage4" | "stage5";

export interface GfrResult {
  egfrMdrd: number;
  egfrCkdEpi: number;
  egfrCockcroftGault: number | null;
  stage: number;
  stageKey: CkdStageKey;
  creatinineMgdl: number;
}

export function calculateGfr(input: GfrInput): CalculationResult<GfrResult> {
  const { creatinine, creatinineUnit, age, gender, race, weight, height: _height } = input;

  if (creatinine <= 0 || age <= 0 || age > 120) {
    return {
      ok: false,
      error: "Creatinine must be positive and age must be between 1 and 120",
      code: "INVALID_INPUT",
    };
  }

  // Convert creatinine to mg/dL if needed
  const creatinineMgdl = creatinineUnit === "umol" ? creatinine / 88.4 : creatinine;

  // CKD-EPI equation (2021 - race-free version)
  // GFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^age × (1.012 if female)
  const kappa = gender === "female" ? 0.7 : 0.9;
  const alpha = gender === "female" ? -0.241 : -0.302;

  const scrOverKappa = creatinineMgdl / kappa;
  const minTerm = Math.min(scrOverKappa, 1) ** alpha;
  const maxTerm = Math.max(scrOverKappa, 1) ** -1.2;
  const ageTerm = 0.9938 ** age;
  const genderMultiplier = gender === "female" ? 1.012 : 1;

  const egfrCkdEpi = 142 * minTerm * maxTerm * ageTerm * genderMultiplier;

  // MDRD equation (original with race adjustment for comparison)
  // GFR = 175 × Scr^-1.154 × age^-0.203 × 0.742 (if female) × 1.212 (if Black)
  let egfrMdrd = 175 * creatinineMgdl ** -1.154 * age ** -0.203;
  if (gender === "female") egfrMdrd *= 0.742;
  if (race === "black") egfrMdrd *= 1.212;

  // Cockcroft-Gault equation (requires weight)
  let egfrCockcroftGault: number | null = null;
  if (weight && weight > 0) {
    egfrCockcroftGault = ((140 - age) * weight) / (72 * creatinineMgdl);
    if (gender === "female") egfrCockcroftGault *= 0.85;
  }

  // Determine CKD stage
  const gfr = egfrCkdEpi;
  let stage: number;
  let stageKey: CkdStageKey;

  if (gfr >= 90) {
    stage = 1;
    stageKey = "stage1";
  } else if (gfr >= 60) {
    stage = 2;
    stageKey = "stage2";
  } else if (gfr >= 45) {
    stage = 3;
    stageKey = "stage3a";
  } else if (gfr >= 30) {
    stage = 3;
    stageKey = "stage3b";
  } else if (gfr >= 15) {
    stage = 4;
    stageKey = "stage4";
  } else {
    stage = 5;
    stageKey = "stage5";
  }

  return {
    ok: true,
    value: {
      egfrMdrd,
      egfrCkdEpi,
      egfrCockcroftGault,
      stage,
      stageKey,
      creatinineMgdl,
    },
  };
}
