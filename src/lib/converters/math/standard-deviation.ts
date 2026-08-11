import type { CalculationResult } from "@/types";

export interface StandardDeviationInput {
  numbers: number[];
  isPopulation: boolean; // true for population, false for sample
}

export interface StandardDeviationResult {
  mean: number;
  variance: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  count: number;
  sum: number;
  sumOfSquares: number;
  deviations: Array<{
    value: number;
    deviation: number;
    squaredDeviation: number;
  }>;
  formula: string;
  zScores: Array<{ value: number; zScore: number }>;
}

export function calculateStandardDeviation(
  input: StandardDeviationInput
): CalculationResult<StandardDeviationResult> {
  const { numbers, isPopulation } = input;

  if (numbers.length === 0) {
    return { ok: false, error: "Numbers array cannot be empty", code: "INVALID_INPUT" };
  }
  if (!isPopulation && numbers.length < 2) {
    return {
      ok: false,
      error: "At least 2 numbers are required for sample standard deviation",
      code: "INVALID_INPUT",
    };
  }

  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Calculate deviations
  const deviations = numbers.map((value) => {
    const deviation = value - mean;
    return {
      value,
      deviation,
      squaredDeviation: deviation * deviation,
    };
  });

  const sumOfSquaredDeviations = deviations.reduce((a, d) => a + d.squaredDeviation, 0);

  // Variance: divide by n for population, n-1 for sample
  const divisor = isPopulation ? count : count - 1;
  const variance = sumOfSquaredDeviations / divisor;
  const standardDeviation = Math.sqrt(variance);

  // Coefficient of variation (relative standard deviation)
  const coefficientOfVariation = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0;

  // Sum of squares
  const sumOfSquares = numbers.reduce((a, n) => a + n * n, 0);

  // Formula explanation
  const formula = isPopulation ? `σ = √[Σ(xᵢ - μ)² / N]` : `s = √[Σ(xᵢ - x̄)² / (n-1)]`;

  // Z-scores
  const zScores = numbers.map((value) => ({
    value,
    zScore: standardDeviation !== 0 ? (value - mean) / standardDeviation : 0,
  }));

  return {
    ok: true,
    value: {
      mean,
      variance,
      standardDeviation,
      coefficientOfVariation,
      count,
      sum,
      sumOfSquares,
      deviations,
      formula,
      zScores,
    },
  };
}
