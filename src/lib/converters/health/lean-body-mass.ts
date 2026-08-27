import type { CalculationResult } from "@/types";

export interface LeanBodyMassInput {
  gender: "male" | "female";
  weight: number; // kg
  height: number; // cm
}

export interface LeanBodyMassResult {
  boerFormula: number;
  jamesFormula: number;
  humeFormula: number;
  average: number;
  fatMassEstimate: number;
  bodyFatPercentEstimate: number;
}

export function calculateLeanBodyMass(
  input: LeanBodyMassInput
): CalculationResult<LeanBodyMassResult> {
  const { gender, weight, height } = input;

  if (weight <= 0 || height <= 0) {
    return { ok: false, error: "Weight and height must be positive", code: "INVALID_INPUT" };
  }

  let boerFormula: number;
  let jamesFormula: number;
  let humeFormula: number;

  if (gender === "male") {
    // Boer Formula (Male): LBM = 0.407W + 0.267H - 19.2
    boerFormula = 0.407 * weight + 0.267 * height - 19.2;

    // James Formula (Male): LBM = 1.1W - 128(W/H)²
    jamesFormula = 1.1 * weight - 128 * (weight / height) ** 2;

    // Hume Formula (Male): LBM = 0.32810W + 0.33929H - 29.5336
    humeFormula = 0.3281 * weight + 0.33929 * height - 29.5336;
  } else {
    // Boer Formula (Female): LBM = 0.252W + 0.473H - 48.3
    boerFormula = 0.252 * weight + 0.473 * height - 48.3;

    // James Formula (Female): LBM = 1.07W - 148(W/H)²
    jamesFormula = 1.07 * weight - 148 * (weight / height) ** 2;

    // Hume Formula (Female): LBM = 0.29569W + 0.41813H - 43.2933
    humeFormula = 0.29569 * weight + 0.41813 * height - 43.2933;
  }

  // Ensure non-negative values
  boerFormula = Math.max(0, boerFormula);
  jamesFormula = Math.max(0, jamesFormula);
  humeFormula = Math.max(0, humeFormula);

  const average = (boerFormula + jamesFormula + humeFormula) / 3;
  const fatMassEstimate = weight - average;
  const bodyFatPercentEstimate = (fatMassEstimate / weight) * 100;

  return {
    ok: true,
    value: {
      boerFormula,
      jamesFormula,
      humeFormula,
      average,
      fatMassEstimate,
      bodyFatPercentEstimate,
    },
  };
}
