import type { CalculationResult } from "@/types";

export interface PercentageInput {
  mode: "percentOf" | "whatPercent" | "percentChange" | "percentDifference";
  value1: number;
  value2: number;
}

export interface PercentageResult {
  result: number;
  formula: string;
  explanation: string;
}

export function calculatePercentage(input: PercentageInput): CalculationResult<PercentageResult> {
  const { mode, value1, value2 } = input;

  let result: number;
  let formula: string;
  let explanation: string;

  switch (mode) {
    case "percentOf":
      // What is X% of Y?
      if (value2 === 0) {
        return { ok: false, error: "Base value (Y) cannot be zero", code: "INVALID_INPUT" };
      }
      result = (value1 / 100) * value2;
      formula = `${value1}% × ${value2} = ${result}`;
      explanation = `${value1}% of ${value2} is ${result}`;
      break;

    case "whatPercent":
      // X is what percent of Y?
      if (value2 === 0) {
        return { ok: false, error: "Base value (Y) cannot be zero", code: "DIVISION_BY_ZERO" };
      }
      result = (value1 / value2) * 100;
      formula = `(${value1} ÷ ${value2}) × 100 = ${result}%`;
      explanation = `${value1} is ${result.toFixed(2)}% of ${value2}`;
      break;

    case "percentChange":
      // Percent change from X to Y
      if (value1 === 0) {
        return {
          ok: false,
          error: "Starting value (X) cannot be zero for percent change",
          code: "DIVISION_BY_ZERO",
        };
      }
      result = ((value2 - value1) / Math.abs(value1)) * 100;
      formula = `((${value2} - ${value1}) ÷ |${value1}|) × 100 = ${result}%`;
      explanation =
        result >= 0
          ? `Increase of ${result.toFixed(2)}% from ${value1} to ${value2}`
          : `Decrease of ${Math.abs(result).toFixed(2)}% from ${value1} to ${value2}`;
      break;

    case "percentDifference": {
      // Percent difference between X and Y
      const avg = (Math.abs(value1) + Math.abs(value2)) / 2;
      if (avg === 0) {
        return {
          ok: false,
          error: "Average of values cannot be zero for percent difference",
          code: "DIVISION_BY_ZERO",
        };
      }
      result = (Math.abs(value1 - value2) / avg) * 100;
      formula = `(|${value1} - ${value2}| ÷ ((|${value1}| + |${value2}|) ÷ 2)) × 100 = ${result}%`;
      explanation = `The percent difference between ${value1} and ${value2} is ${result.toFixed(2)}%`;
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return { ok: true, value: { result, formula, explanation } };
}
