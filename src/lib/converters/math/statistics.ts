import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface StatisticsInput {
  data: number[];
  population?: boolean; // true for population, false for sample
}

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  range: number;
  min: number;
  max: number;
  variance: number;
  standardDeviation: number;
  standardError: number;
  coefficientOfVariation: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
  };
  percentiles: Record<number, number>;
  skewness: number;
  kurtosis: number;
  geometricMean: number | null;
  harmonicMean: number | null;
  sumOfSquares: number;
  sortedData: number[];
  frequencyDistribution: Record<number, number>;
  isPopulation: boolean;
  steps: CalcStep[];
}

function calculateQuartile(sorted: number[], quartile: number): number {
  const pos = (sorted.length - 1) * quartile;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function calculatePercentile(sorted: number[], percentile: number): number {
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateStatistics(input: StatisticsInput): CalculationResult<StatisticsResult> {
  const { data, population = false } = input;

  if (!data || data.length === 0) {
    return { ok: false, error: "Data array cannot be empty", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);

  steps.push({ key: "dataset", params: { data: data.join(", ") } });
  steps.push({ key: "count", params: { n } });

  // Basic statistics
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  steps.push({ key: "sum", params: { sum } });
  steps.push({ key: "mean", params: { sum, n, mean: mean.toFixed(6) } });
  steps.push({ key: "minMax", params: { min, max } });
  steps.push({ key: "range", params: { max, min, range } });

  // Median
  let median: number;
  if (n % 2 === 0) {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    steps.push({ key: "medianEven", params: { a: sorted[n / 2 - 1], b: sorted[n / 2], median } });
  } else {
    median = sorted[Math.floor(n / 2)];
    steps.push({ key: "medianOdd", params: { median } });
  }

  // Mode
  const frequency: Record<number, number> = {};
  for (const value of data) {
    frequency[value] = (frequency[value] || 0) + 1;
  }

  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.keys(frequency)
    .filter((key) => frequency[Number(key)] === maxFreq)
    .map(Number);

  if (maxFreq === 1) {
    steps.push({ key: "noMode" });
  } else {
    steps.push({ key: "mode", params: { mode: mode.join(", "), maxFreq } });
  }

  // Variance and Standard Deviation
  const sumOfSquares = data.reduce((acc, val) => acc + (val - mean) ** 2, 0);
  const denominator = population ? n : n - 1;
  const variance = sumOfSquares / denominator;
  const standardDeviation = Math.sqrt(variance);

  const varianceType = population ? "Population" : "Sample";
  steps.push({
    key: "variance",
    params: {
      varianceType,
      sumOfSquares: sumOfSquares.toFixed(4),
      denominator,
      variance: variance.toFixed(6),
    },
  });
  steps.push({
    key: "standardDeviation",
    params: {
      varianceType,
      variance: variance.toFixed(4),
      standardDeviation: standardDeviation.toFixed(6),
    },
  });

  // Standard Error
  const standardError = standardDeviation / Math.sqrt(n);
  steps.push({
    key: "standardError",
    params: {
      standardDeviation: standardDeviation.toFixed(4),
      n,
      standardError: standardError.toFixed(6),
    },
  });

  // Coefficient of Variation
  const coefficientOfVariation = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0;
  steps.push({
    key: "coefficientOfVariation",
    params: { coefficientOfVariation: coefficientOfVariation.toFixed(2) },
  });

  // Quartiles
  const q1 = calculateQuartile(sorted, 0.25);
  const q2 = median;
  const q3 = calculateQuartile(sorted, 0.75);
  const iqr = q3 - q1;

  steps.push({ key: "q1", params: { q1: q1.toFixed(4) } });
  steps.push({ key: "q2", params: { q2: q2.toFixed(4) } });
  steps.push({ key: "q3", params: { q3: q3.toFixed(4) } });
  steps.push({ key: "iqr", params: { q3: q3.toFixed(4), q1: q1.toFixed(4), iqr: iqr.toFixed(4) } });

  // Common percentiles
  const percentiles: Record<number, number> = {};
  for (const p of [5, 10, 25, 50, 75, 90, 95]) {
    percentiles[p] = calculatePercentile(sorted, p);
  }

  // Skewness (Fisher-Pearson)
  const skewness = data.reduce((acc, val) => acc + ((val - mean) / standardDeviation) ** 3, 0) / n;
  steps.push({ key: "skewness", params: { skewness: skewness.toFixed(6) } });
  if (skewness < -0.5) {
    steps.push({ key: "negativelySkewed" });
  } else if (skewness > 0.5) {
    steps.push({ key: "positivelySkewed" });
  } else {
    steps.push({ key: "symmetric" });
  }

  // Kurtosis (excess kurtosis)
  const kurtosis =
    data.reduce((acc, val) => acc + ((val - mean) / standardDeviation) ** 4, 0) / n - 3;
  steps.push({ key: "kurtosis", params: { kurtosis: kurtosis.toFixed(6) } });

  // Geometric Mean (only for positive numbers)
  let geometricMean: number | null = null;
  if (data.every((v) => v > 0)) {
    const logSum = data.reduce((acc, val) => acc + Math.log(val), 0);
    geometricMean = Math.exp(logSum / n);
    steps.push({ key: "geometricMean", params: { geometricMean: geometricMean.toFixed(6) } });
  }

  // Harmonic Mean (only for positive numbers)
  let harmonicMean: number | null = null;
  if (data.every((v) => v > 0)) {
    const reciprocalSum = data.reduce((acc, val) => acc + 1 / val, 0);
    harmonicMean = n / reciprocalSum;
    steps.push({ key: "harmonicMean", params: { harmonicMean: harmonicMean.toFixed(6) } });
  }

  return {
    ok: true,
    value: {
      count: n,
      sum,
      mean,
      median,
      mode,
      range,
      min,
      max,
      variance,
      standardDeviation,
      standardError,
      coefficientOfVariation,
      quartiles: { q1, q2, q3, iqr },
      percentiles,
      skewness,
      kurtosis,
      geometricMean,
      harmonicMean,
      sumOfSquares,
      sortedData: sorted,
      frequencyDistribution: frequency,
      isPopulation: population,
      steps,
    },
  };
}
