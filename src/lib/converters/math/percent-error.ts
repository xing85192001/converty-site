import type { CalculationResult } from "@/types";

export interface PercentErrorInput {
  experimental: number;
  theoretical: number;
}

export interface PercentErrorResult {
  percentError: number;
  absoluteError: number;
  relativeError: number;
  formula: string;
  interpretation: string;
}

export function calculatePercentError(
  input: PercentErrorInput
): CalculationResult<PercentErrorResult> {
  const { experimental, theoretical } = input;

  if (theoretical === 0) {
    return { ok: false, error: "Theoretical value cannot be zero", code: "DIVISION_BY_ZERO" };
  }

  const absoluteError = Math.abs(experimental - theoretical);
  const relativeError = absoluteError / Math.abs(theoretical);
  const percentError = relativeError * 100;

  const formula = `|${experimental} - ${theoretical}| ÷ |${theoretical}| × 100 = ${percentError.toFixed(4)}%`;

  let interpretation: string;
  if (percentError < 1) {
    interpretation = "Excellent accuracy - error is less than 1%";
  } else if (percentError < 5) {
    interpretation = "Good accuracy - error is between 1% and 5%";
  } else if (percentError < 10) {
    interpretation = "Acceptable accuracy - error is between 5% and 10%";
  } else {
    interpretation = "Significant error - consider reviewing the experimental method";
  }

  return {
    ok: true,
    value: {
      percentError,
      absoluteError,
      relativeError,
      formula,
      interpretation,
    },
  };
}
