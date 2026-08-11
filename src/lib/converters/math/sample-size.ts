import type { CalculationResult } from "@/types";

export interface SampleSizeInput {
  mode: "proportion" | "mean" | "fromMarginOfError";
  // For proportion
  confidenceLevel?: number; // 90, 95, 99
  marginOfError?: number; // as decimal, e.g., 0.05 for 5%
  populationProportion?: number; // estimated proportion, default 0.5
  populationSize?: number; // for finite population correction
  // For mean
  standardDeviation?: number;
  // For reverse calculation
  sampleSize?: number;
}

export interface SampleSizeResult {
  sampleSize: number;
  marginOfError: number;
  confidenceLevel: number;
  zScore: number;
  formula: string;
  finiteCorrected?: number;
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

export function calculateSampleSize(input: SampleSizeInput): CalculationResult<SampleSizeResult> {
  const {
    mode,
    confidenceLevel = 95,
    marginOfError = 0.05,
    populationProportion = 0.5,
    populationSize,
    standardDeviation,
    sampleSize: inputSampleSize,
  } = input;

  if (marginOfError <= 0 || marginOfError >= 1) {
    return {
      ok: false,
      error: "Margin of error must be between 0 and 1 (exclusive)",
      code: "INVALID_INPUT",
    };
  }

  const steps: string[] = [];
  const z = getZScore(confidenceLevel);
  let sampleSize: number;
  let formula: string;
  let finiteCorrected: number | undefined;
  let resultMarginOfError = marginOfError;

  switch (mode) {
    case "proportion": {
      // n = (z² × p × (1-p)) / E²
      const p = populationProportion;
      const q = 1 - p;

      sampleSize = Math.ceil((z * z * p * q) / (marginOfError * marginOfError));
      formula = "n = (z² × p × (1-p)) / E²";

      steps.push(`Confidence Level: ${confidenceLevel}%, Z-score = ${z}`);
      steps.push(`Margin of Error (E): ${(marginOfError * 100).toFixed(1)}%`);
      steps.push(`Population Proportion (p): ${p}`);
      steps.push(`n = (${z}² × ${p} × ${q}) / ${marginOfError}²`);
      steps.push(
        `n = (${(z * z).toFixed(4)} × ${(p * q).toFixed(4)}) / ${(marginOfError * marginOfError).toFixed(6)}`
      );
      steps.push(
        `n = ${(z * z * p * q).toFixed(4)} / ${(marginOfError * marginOfError).toFixed(6)}`
      );
      steps.push(`n = ${sampleSize}`);

      // Finite population correction
      if (populationSize && populationSize > 0) {
        finiteCorrected = Math.ceil(sampleSize / (1 + (sampleSize - 1) / populationSize));
        steps.push(`With finite population correction (N=${populationSize}):`);
        steps.push(`n_corrected = n / (1 + (n-1)/N) = ${finiteCorrected}`);
      }
      break;
    }

    case "mean": {
      // n = (z × σ / E)²
      if (!standardDeviation || standardDeviation <= 0) {
        return {
          ok: false,
          error: "Standard deviation must be positive for mean mode",
          code: "INVALID_INPUT",
        };
      }

      sampleSize = Math.ceil(((z * standardDeviation) / marginOfError) ** 2);
      formula = "n = (z × σ / E)²";

      steps.push(`Confidence Level: ${confidenceLevel}%, Z-score = ${z}`);
      steps.push(`Standard Deviation (σ): ${standardDeviation}`);
      steps.push(`Margin of Error (E): ${marginOfError}`);
      steps.push(`n = (${z} × ${standardDeviation} / ${marginOfError})²`);
      steps.push(`n = (${((z * standardDeviation) / marginOfError).toFixed(4)})²`);
      steps.push(`n = ${sampleSize}`);

      // Finite population correction
      if (populationSize && populationSize > 0) {
        finiteCorrected = Math.ceil(sampleSize / (1 + (sampleSize - 1) / populationSize));
        steps.push(`With finite population correction (N=${populationSize}):`);
        steps.push(`n_corrected = ${finiteCorrected}`);
      }
      break;
    }

    case "fromMarginOfError": {
      // Calculate margin of error from sample size
      if (!inputSampleSize || inputSampleSize <= 0) {
        return {
          ok: false,
          error: "Sample size must be positive for fromMarginOfError mode",
          code: "INVALID_INPUT",
        };
      }

      sampleSize = inputSampleSize;
      const p = populationProportion;
      const q = 1 - p;

      // E = z × √(p(1-p)/n)
      resultMarginOfError = z * Math.sqrt((p * q) / sampleSize);
      formula = "E = z × √(p(1-p)/n)";

      steps.push(`Sample Size (n): ${sampleSize}`);
      steps.push(`Confidence Level: ${confidenceLevel}%, Z-score = ${z}`);
      steps.push(`Population Proportion (p): ${p}`);
      steps.push(`E = ${z} × √(${p} × ${q} / ${sampleSize})`);
      steps.push(`E = ${z} × √(${((p * q) / sampleSize).toFixed(6)})`);
      steps.push(`E = ${z} × ${Math.sqrt((p * q) / sampleSize).toFixed(6)}`);
      steps.push(`E = ${(resultMarginOfError * 100).toFixed(2)}%`);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const interpretation =
    mode === "fromMarginOfError"
      ? `With a sample of ${sampleSize}, we can be ${confidenceLevel}% confident that the true value is within ±${(resultMarginOfError * 100).toFixed(2)}% of the sample result.`
      : `A sample size of ${finiteCorrected || sampleSize} is needed to achieve a ${(marginOfError * 100).toFixed(1)}% margin of error at ${confidenceLevel}% confidence.`;

  return {
    ok: true,
    value: {
      sampleSize: finiteCorrected || sampleSize,
      marginOfError: resultMarginOfError,
      confidenceLevel,
      zScore: z,
      formula,
      finiteCorrected,
      steps,
      interpretation,
    },
  };
}
