import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface ZScoreInput {
  mode: "calculate" | "fromZScore" | "probability";
  value?: number;
  mean?: number;
  standardDeviation?: number;
  zScore?: number;
}

export interface ZScoreResult {
  zScore: number;
  value: number;
  mean: number;
  standardDeviation: number;
  percentile: number;
  probabilityBelow: number;
  probabilityAbove: number;
  probabilityBetween?: number; // For range between -z and +z
  interpretation: string;
  steps: CalcStep[];
}

// Approximation of the cumulative distribution function for standard normal
function normalCDF(z: number): number {
  // Using the approximation from Abramowitz and Stegun
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

// Inverse normal CDF (approximation)
function normalInverseCDF(p: number): number {
  if (p <= 0) return Number.NEGATIVE_INFINITY;
  if (p >= 1) return Number.POSITIVE_INFINITY;

  // Rational approximation for central region
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

export function calculateZScore(input: ZScoreInput): CalculationResult<ZScoreResult> {
  const { mode, value, mean = 0, standardDeviation = 1, zScore: inputZScore } = input;

  if (standardDeviation <= 0) {
    return { ok: false, error: "Standard deviation must be positive", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];
  let zScore: number;
  let resultValue: number;

  switch (mode) {
    case "calculate": {
      // Calculate z-score from value
      if (value === undefined) {
        return { ok: false, error: "Value is required for calculate mode", code: "INVALID_INPUT" };
      }

      zScore = (value - mean) / standardDeviation;
      resultValue = value;

      steps.push({ key: "calcValue", params: { value } });
      steps.push({ key: "calcMean", params: { mean } });
      steps.push({ key: "calcStdDev", params: { standardDeviation } });
      steps.push({ key: "calcZFormula" });
      steps.push({ key: "calcZSubstitute", params: { value, mean, standardDeviation } });
      steps.push({ key: "calcZNumerator", params: { numerator: value - mean, standardDeviation } });
      steps.push({ key: "calcZResult", params: { zScore: zScore.toFixed(4) } });
      break;
    }

    case "fromZScore": {
      // Calculate value from z-score
      if (inputZScore === undefined) {
        return {
          ok: false,
          error: "Z-score is required for fromZScore mode",
          code: "INVALID_INPUT",
        };
      }

      zScore = inputZScore;
      resultValue = mean + zScore * standardDeviation;

      steps.push({ key: "fromZValue", params: { zScore } });
      steps.push({ key: "fromZMean", params: { mean } });
      steps.push({ key: "fromZStdDev", params: { standardDeviation } });
      steps.push({ key: "fromZXFormula" });
      steps.push({ key: "fromZXSubstitute", params: { mean, zScore, standardDeviation } });
      steps.push({ key: "fromZXProduct", params: { mean, product: zScore * standardDeviation } });
      steps.push({ key: "fromZXResult", params: { value: resultValue.toFixed(4) } });
      break;
    }

    case "probability": {
      // Calculate z-score for a given percentile
      if (value === undefined || value <= 0 || value >= 100) {
        return {
          ok: false,
          error: "Value must be a percentile between 0 and 100 (exclusive) for probability mode",
          code: "INVALID_INPUT",
        };
      }

      const percentile = value / 100;
      zScore = normalInverseCDF(percentile);
      resultValue = mean + zScore * standardDeviation;

      steps.push({ key: "probPercentile", params: { value } });
      steps.push({ key: "probZScoreForPercentile", params: { value, zScore: zScore.toFixed(4) } });
      steps.push({ key: "probValueAtPercentile", params: { value: resultValue.toFixed(4) } });
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const probabilityBelow = normalCDF(zScore);
  const probabilityAbove = 1 - probabilityBelow;
  const percentile = probabilityBelow * 100;
  const probabilityBetween = normalCDF(Math.abs(zScore)) - normalCDF(-Math.abs(zScore));

  steps.push({
    key: "probBelow",
    params: { zScore: zScore.toFixed(4), probability: (probabilityBelow * 100).toFixed(2) },
  });
  steps.push({
    key: "probAbove",
    params: { zScore: zScore.toFixed(4), probability: (probabilityAbove * 100).toFixed(2) },
  });
  steps.push({
    key: "probBetween",
    params: {
      zScore: Math.abs(zScore).toFixed(4),
      probability: (probabilityBetween * 100).toFixed(2),
    },
  });

  let interpretation: string;
  if (zScore < -2) {
    interpretation =
      "This value is unusually low (more than 2 standard deviations below the mean).";
  } else if (zScore < -1) {
    interpretation =
      "This value is below average (between 1 and 2 standard deviations below the mean).";
  } else if (zScore < 1) {
    interpretation =
      "This value is within the typical range (within 1 standard deviation of the mean).";
  } else if (zScore < 2) {
    interpretation =
      "This value is above average (between 1 and 2 standard deviations above the mean).";
  } else {
    interpretation =
      "This value is unusually high (more than 2 standard deviations above the mean).";
  }

  return {
    ok: true,
    value: {
      zScore,
      value: resultValue,
      mean,
      standardDeviation,
      percentile,
      probabilityBelow,
      probabilityAbove,
      probabilityBetween,
      interpretation,
      steps,
    },
  };
}
