import type { CalcStep } from "@/lib/calc-step";
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
  steps: CalcStep[];
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

  const steps: CalcStep[] = [];
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

      steps.push({ key: "propConfidence", params: { confidenceLevel, z } });
      steps.push({
        key: "propMargin",
        params: { marginOfError: (marginOfError * 100).toFixed(1) },
      });
      steps.push({ key: "propProportion", params: { p } });
      steps.push({ key: "propFormula", params: { z, p, q, marginOfError } });
      steps.push({
        key: "propSubstitute",
        params: {
          zSquared: (z * z).toFixed(4),
          pq: (p * q).toFixed(4),
          eSquared: (marginOfError * marginOfError).toFixed(6),
        },
      });
      steps.push({
        key: "propNumerator",
        params: {
          numerator: (z * z * p * q).toFixed(4),
          denominator: (marginOfError * marginOfError).toFixed(6),
        },
      });
      steps.push({ key: "propResult", params: { sampleSize } });

      // Finite population correction
      if (populationSize && populationSize > 0) {
        finiteCorrected = Math.ceil(sampleSize / (1 + (sampleSize - 1) / populationSize));
        steps.push({ key: "propFpcIntro", params: { populationSize } });
        steps.push({ key: "propFpcResult", params: { finiteCorrected } });
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

      steps.push({ key: "meanConfidence", params: { confidenceLevel, z } });
      steps.push({ key: "meanStdDev", params: { standardDeviation } });
      steps.push({ key: "meanMargin", params: { marginOfError } });
      steps.push({ key: "meanFormula", params: { z, standardDeviation, marginOfError } });
      steps.push({
        key: "meanSubstitute",
        params: { ratio: ((z * standardDeviation) / marginOfError).toFixed(4) },
      });
      steps.push({ key: "meanResult", params: { sampleSize } });

      // Finite population correction
      if (populationSize && populationSize > 0) {
        finiteCorrected = Math.ceil(sampleSize / (1 + (sampleSize - 1) / populationSize));
        steps.push({ key: "meanFpcIntro", params: { populationSize } });
        steps.push({ key: "meanFpcResult", params: { finiteCorrected } });
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

      steps.push({ key: "fromMoESampleSize", params: { sampleSize } });
      steps.push({ key: "fromMoEConfidence", params: { confidenceLevel, z } });
      steps.push({ key: "fromMoEProportion", params: { p } });
      steps.push({ key: "fromMoEFormula", params: { z, p, q, sampleSize } });
      steps.push({
        key: "fromMoESubstitute",
        params: { z, pqOverN: ((p * q) / sampleSize).toFixed(6) },
      });
      steps.push({
        key: "fromMoESqrt",
        params: { z, sqrtValue: Math.sqrt((p * q) / sampleSize).toFixed(6) },
      });
      steps.push({
        key: "fromMoEResult",
        params: { marginOfError: (resultMarginOfError * 100).toFixed(2) },
      });
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
