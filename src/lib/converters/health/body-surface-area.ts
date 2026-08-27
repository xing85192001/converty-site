import type { CalculationResult } from "@/types";

export interface BodySurfaceAreaInput {
  weight: number; // kg
  height: number; // cm
}

export interface BodySurfaceAreaResult {
  duBois: number;
  mosteller: number;
  haycock: number;
  gehanGeorge: number;
  boyd: number;
  average: number;
}

export function calculateBodySurfaceArea(
  input: BodySurfaceAreaInput
): CalculationResult<BodySurfaceAreaResult> {
  const { weight, height } = input;

  if (weight <= 0 || height <= 0) {
    return { ok: false, error: "Weight and height must be positive", code: "INVALID_INPUT" };
  }

  // Du Bois Formula: BSA = 0.007184 × W^0.425 × H^0.725
  const duBois = 0.007184 * weight ** 0.425 * height ** 0.725;

  // Mosteller Formula: BSA = √((H × W) / 3600)
  const mosteller = Math.sqrt((height * weight) / 3600);

  // Haycock Formula: BSA = 0.024265 × W^0.5378 × H^0.3964
  const haycock = 0.024265 * weight ** 0.5378 * height ** 0.3964;

  // Gehan & George Formula: BSA = 0.0235 × W^0.51456 × H^0.42246
  const gehanGeorge = 0.0235 * weight ** 0.51456 * height ** 0.42246;

  // Boyd Formula: BSA = 0.0003207 × H^0.3 × W^(0.7285 - 0.0188 × log10(W))
  const boyd = 0.0003207 * height ** 0.3 * weight ** (0.7285 - 0.0188 * Math.log10(weight));

  const average = (duBois + mosteller + haycock + gehanGeorge + boyd) / 5;

  return {
    ok: true,
    value: {
      duBois,
      mosteller,
      haycock,
      gehanGeorge,
      boyd,
      average,
    },
  };
}
