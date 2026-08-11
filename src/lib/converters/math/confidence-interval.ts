import type { CalculationResult } from "@/types";

export interface ConfidenceIntervalInput {
  mode: "mean" | "proportion" | "difference";
  // For mean
  sampleMean?: number;
  sampleSize: number;
  standardDeviation?: number;
  confidenceLevel: number; // 90, 95, 99
  // For proportion
  successes?: number;
  // For difference of means
  sampleMean2?: number;
  sampleSize2?: number;
  standardDeviation2?: number;
}

export interface ConfidenceIntervalResult {
  lowerBound: number;
  upperBound: number;
  pointEstimate: number;
  marginOfError: number;
  confidenceLevel: number;
  criticalValue: number;
  standardError: number;
  formula: string;
  steps: string[];
  interpretation: string;
}

function getZScore(confidenceLevel: number): number {
  const zScores: Record<number, number> = {
    80: 1.282,
    85: 1.44,
    90: 1.645,
    95: 1.96,
    99: 2.576,
    99.9: 3.291,
  };
  return zScores[confidenceLevel] || 1.96;
}

// T critical value approximation for small samples
function getTValue(confidenceLevel: number, df: number): number {
  // Use z-score for large df (>30)
  if (df > 30) return getZScore(confidenceLevel);

  // Approximation for common confidence levels
  const tValues: Record<number, Record<number, number>> = {
    90: {
      1: 6.314,
      2: 2.92,
      3: 2.353,
      4: 2.132,
      5: 2.015,
      10: 1.812,
      15: 1.753,
      20: 1.725,
      25: 1.708,
      30: 1.697,
    },
    95: {
      1: 12.706,
      2: 4.303,
      3: 3.182,
      4: 2.776,
      5: 2.571,
      10: 2.228,
      15: 2.131,
      20: 2.086,
      25: 2.06,
      30: 2.042,
    },
    99: {
      1: 63.657,
      2: 9.925,
      3: 5.841,
      4: 4.604,
      5: 4.032,
      10: 3.169,
      15: 2.947,
      20: 2.845,
      25: 2.787,
      30: 2.75,
    },
  };

  const levelValues = tValues[confidenceLevel];
  if (!levelValues) return getZScore(confidenceLevel);

  // Find closest df
  const dfs = Object.keys(levelValues)
    .map(Number)
    .sort((a, b) => a - b);
  let closestDf = dfs[0];
  for (const d of dfs) {
    if (d <= df) closestDf = d;
  }

  return levelValues[closestDf] || getZScore(confidenceLevel);
}

export function calculateConfidenceInterval(
  input: ConfidenceIntervalInput
): CalculationResult<ConfidenceIntervalResult> {
  const {
    mode,
    sampleMean,
    sampleSize,
    standardDeviation,
    confidenceLevel,
    successes,
    sampleMean2,
    sampleSize2,
    standardDeviation2,
  } = input;

  if (sampleSize <= 0) {
    return { ok: false, error: "Sample size must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  let pointEstimate: number;
  let standardError: number;
  let criticalValue: number;
  let formula: string;

  switch (mode) {
    case "mean": {
      if (sampleMean === undefined || standardDeviation === undefined || standardDeviation <= 0) {
        return {
          ok: false,
          error: "Sample mean and positive standard deviation are required for mean mode",
          code: "INVALID_INPUT",
        };
      }

      pointEstimate = sampleMean;
      standardError = standardDeviation / Math.sqrt(sampleSize);

      // Use t-distribution for small samples, z for large
      const df = sampleSize - 1;
      criticalValue = sampleSize < 30 ? getTValue(confidenceLevel, df) : getZScore(confidenceLevel);

      formula = sampleSize < 30 ? "x̄ ± t × (s/√n)" : "x̄ ± z × (σ/√n)";

      steps.push(`Sample mean (x̄) = ${sampleMean}`);
      steps.push(`Sample size (n) = ${sampleSize}`);
      steps.push(`Standard deviation = ${standardDeviation}`);
      steps.push(
        `Standard error = ${standardDeviation}/√${sampleSize} = ${standardError.toFixed(4)}`
      );
      steps.push(`Critical value = ${criticalValue.toFixed(4)}`);
      break;
    }

    case "proportion": {
      if (successes === undefined || successes < 0 || successes > sampleSize) {
        return {
          ok: false,
          error: "Successes must be between 0 and sample size",
          code: "INVALID_INPUT",
        };
      }

      pointEstimate = successes / sampleSize;
      standardError = Math.sqrt((pointEstimate * (1 - pointEstimate)) / sampleSize);
      criticalValue = getZScore(confidenceLevel);
      formula = "p̂ ± z × √(p̂(1-p̂)/n)";

      steps.push(`Successes = ${successes}`);
      steps.push(`Sample size (n) = ${sampleSize}`);
      steps.push(
        `Sample proportion (p̂) = ${successes}/${sampleSize} = ${pointEstimate.toFixed(4)}`
      );
      steps.push(
        `Standard error = √(${pointEstimate.toFixed(4)} × ${(1 - pointEstimate).toFixed(4)} / ${sampleSize}) = ${standardError.toFixed(4)}`
      );
      steps.push(`Z critical value = ${criticalValue.toFixed(4)}`);
      break;
    }

    case "difference": {
      if (
        sampleMean === undefined ||
        sampleMean2 === undefined ||
        standardDeviation === undefined ||
        standardDeviation2 === undefined ||
        sampleSize2 === undefined ||
        sampleSize2 <= 0
      ) {
        return {
          ok: false,
          error:
            "Both sample means, standard deviations, and sizes are required for difference mode",
          code: "INVALID_INPUT",
        };
      }

      pointEstimate = sampleMean - sampleMean2;
      standardError = Math.sqrt(
        (standardDeviation * standardDeviation) / sampleSize +
          (standardDeviation2 * standardDeviation2) / sampleSize2
      );

      // Pooled degrees of freedom (Welch's approximation)
      const v1 = (standardDeviation * standardDeviation) / sampleSize;
      const v2 = (standardDeviation2 * standardDeviation2) / sampleSize2;
      const df = Math.floor(
        (v1 + v2) ** 2 / (v1 ** 2 / (sampleSize - 1) + v2 ** 2 / (sampleSize2 - 1))
      );

      criticalValue = df < 30 ? getTValue(confidenceLevel, df) : getZScore(confidenceLevel);
      formula = "(x̄₁ - x̄₂) ± t × √(s₁²/n₁ + s₂²/n₂)";

      steps.push(`Sample 1: mean = ${sampleMean}, n = ${sampleSize}, s = ${standardDeviation}`);
      steps.push(`Sample 2: mean = ${sampleMean2}, n = ${sampleSize2}, s = ${standardDeviation2}`);
      steps.push(`Point estimate = ${sampleMean} - ${sampleMean2} = ${pointEstimate.toFixed(4)}`);
      steps.push(`Standard error = ${standardError.toFixed(4)}`);
      steps.push(`Degrees of freedom (Welch) ≈ ${df}`);
      steps.push(`Critical value = ${criticalValue.toFixed(4)}`);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const marginOfError = criticalValue * standardError;
  const lowerBound = pointEstimate - marginOfError;
  const upperBound = pointEstimate + marginOfError;

  steps.push(
    `Margin of error = ${criticalValue.toFixed(4)} × ${standardError.toFixed(4)} = ${marginOfError.toFixed(4)}`
  );
  steps.push(`Confidence interval = ${pointEstimate.toFixed(4)} ± ${marginOfError.toFixed(4)}`);
  steps.push(`= (${lowerBound.toFixed(4)}, ${upperBound.toFixed(4)})`);

  let interpretation: string;
  if (mode === "proportion") {
    interpretation = `We are ${confidenceLevel}% confident that the true population proportion lies between ${(lowerBound * 100).toFixed(2)}% and ${(upperBound * 100).toFixed(2)}%.`;
  } else if (mode === "difference") {
    if (lowerBound > 0) {
      interpretation = `We are ${confidenceLevel}% confident that population 1 has a higher mean than population 2 (difference between ${lowerBound.toFixed(4)} and ${upperBound.toFixed(4)}).`;
    } else if (upperBound < 0) {
      interpretation = `We are ${confidenceLevel}% confident that population 2 has a higher mean than population 1 (difference between ${lowerBound.toFixed(4)} and ${upperBound.toFixed(4)}).`;
    } else {
      interpretation = `We are ${confidenceLevel}% confident that the difference in population means lies between ${lowerBound.toFixed(4)} and ${upperBound.toFixed(4)}. The interval includes 0, suggesting no significant difference.`;
    }
  } else {
    interpretation = `We are ${confidenceLevel}% confident that the true population mean lies between ${lowerBound.toFixed(4)} and ${upperBound.toFixed(4)}.`;
  }

  return {
    ok: true,
    value: {
      lowerBound,
      upperBound,
      pointEstimate,
      marginOfError,
      confidenceLevel,
      criticalValue,
      standardError,
      formula,
      steps,
      interpretation,
    },
  };
}
