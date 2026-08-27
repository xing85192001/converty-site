import type { CalculationResult } from "@/types";

export interface AverageInput {
  numbers: number[];
  weights?: number[];
}

export interface AverageResult {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  min: number;
  max: number;
  sum: number;
  count: number;
  weightedMean: number | null;
  geometricMean: number | null;
  harmonicMean: number | null;
  variance: number;
  standardDeviation: number;
}

export function calculateAverage(input: AverageInput): CalculationResult<AverageResult> {
  const { numbers, weights } = input;

  if (numbers.length === 0) {
    return { ok: false, error: "At least one number is required", code: "INVALID_INPUT" };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = max - min;

  // Median
  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Mode
  const frequency: Record<number, number> = {};
  for (const num of numbers) {
    frequency[num] = (frequency[num] || 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.entries(frequency)
    .filter(([_, freq]) => freq === maxFreq)
    .map(([num]) => parseFloat(num));

  // Weighted mean
  let weightedMean: number | null = null;
  if (weights && weights.length === numbers.length) {
    const weightSum = weights.reduce((a, b) => a + b, 0);
    if (weightSum > 0) {
      weightedMean = numbers.reduce((acc, num, i) => acc + num * weights[i], 0) / weightSum;
    }
  }

  // Geometric mean (only for positive numbers)
  let geometricMean: number | null = null;
  if (numbers.every((n) => n > 0)) {
    const product = numbers.reduce((a, b) => a * b, 1);
    geometricMean = product ** (1 / count);
  }

  // Harmonic mean (only for positive numbers)
  let harmonicMean: number | null = null;
  if (numbers.every((n) => n > 0)) {
    const reciprocalSum = numbers.reduce((a, b) => a + 1 / b, 0);
    harmonicMean = count / reciprocalSum;
  }

  // Variance and standard deviation
  const variance = numbers.reduce((acc, num) => acc + (num - mean) ** 2, 0) / count;
  const standardDeviation = Math.sqrt(variance);

  return {
    ok: true,
    value: {
      mean,
      median,
      mode,
      range,
      min,
      max,
      sum,
      count,
      weightedMean,
      geometricMean,
      harmonicMean,
      variance,
      standardDeviation,
    },
  };
}
