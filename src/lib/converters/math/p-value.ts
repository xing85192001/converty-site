import type { CalculationResult } from "@/types";

export interface PValueInput {
  mode: "fromZScore" | "fromTScore" | "fromChiSquare" | "fromFScore";
  testStatistic: number;
  degreesOfFreedom?: number;
  degreesOfFreedom2?: number; // For F-test
  twoTailed?: boolean;
}

export interface PValueResult {
  pValue: number;
  testStatistic: number;
  statisticType: string;
  twoTailed: boolean;
  degreesOfFreedom?: number;
  significantAt05: boolean;
  significantAt01: boolean;
  significantAt001: boolean;
  interpretation: string;
  steps: string[];
}

// Normal CDF approximation
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return 0.5 * (1.0 + sign * y);
}

// Gamma function approximation (Stirling)
function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  let x = coefficients[0];
  for (let i = 1; i < g + 2; i++) {
    x += coefficients[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
}

// Incomplete beta function (regularized)
function incompleteBeta(x: number, a: number, b: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;

  // Use continued fraction expansion
  const maxIterations = 200;
  const epsilon = 1e-10;

  const lnBeta = Math.log(gamma(a)) + Math.log(gamma(b)) - Math.log(gamma(a + b));
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

  let f = 1;
  let c = 1;
  let d = 0;

  for (let i = 0; i <= maxIterations; i++) {
    const m = Math.floor(i / 2);
    let numerator: number;

    if (i === 0) {
      numerator = 1;
    } else if (i % 2 === 0) {
      numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    } else {
      numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    }

    d = 1 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;

    c = 1 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;

    const delta = c * d;
    f *= delta;

    if (Math.abs(delta - 1) < epsilon) break;
  }

  return front * (f - 1);
}

// T-distribution CDF
function tCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  const prob = 0.5 * incompleteBeta(x, df / 2, 0.5);
  return t > 0 ? 1 - prob : prob;
}

// Chi-square CDF (using incomplete gamma)
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;

  // Lower incomplete gamma function / gamma(a)
  const a = df / 2;
  const z = x / 2;

  let sum = 0;
  let term = 1 / a;
  sum = term;

  for (let n = 1; n < 200; n++) {
    term *= z / (a + n);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }

  return Math.exp(-z + a * Math.log(z) - Math.log(gamma(a))) * sum;
}

// F-distribution CDF
function fCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  const x = (df1 * f) / (df1 * f + df2);
  return incompleteBeta(x, df1 / 2, df2 / 2);
}

export function calculatePValue(input: PValueInput): CalculationResult<PValueResult> {
  const { mode, testStatistic, degreesOfFreedom, degreesOfFreedom2, twoTailed = true } = input;

  const steps: string[] = [];
  let pValue: number;
  let statisticType: string;

  switch (mode) {
    case "fromZScore": {
      statisticType = "Z-score";
      const oneTailP = 1 - normalCDF(Math.abs(testStatistic));
      pValue = twoTailed ? 2 * oneTailP : oneTailP;

      steps.push(`Test statistic (z) = ${testStatistic}`);
      steps.push(`P(Z > |${testStatistic}|) = ${oneTailP.toFixed(6)}`);
      if (twoTailed) {
        steps.push(`Two-tailed p-value = 2 × ${oneTailP.toFixed(6)} = ${pValue.toFixed(6)}`);
      }
      break;
    }

    case "fromTScore": {
      if (!degreesOfFreedom || degreesOfFreedom <= 0) {
        return {
          ok: false,
          error: "Positive degrees of freedom is required for t-score",
          code: "INVALID_INPUT",
        };
      }

      statisticType = "t-score";
      const oneTailP = 1 - tCDF(Math.abs(testStatistic), degreesOfFreedom);
      pValue = twoTailed ? 2 * oneTailP : oneTailP;

      steps.push(`Test statistic (t) = ${testStatistic}`);
      steps.push(`Degrees of freedom = ${degreesOfFreedom}`);
      steps.push(`P(t > |${testStatistic}|) = ${oneTailP.toFixed(6)}`);
      if (twoTailed) {
        steps.push(`Two-tailed p-value = 2 × ${oneTailP.toFixed(6)} = ${pValue.toFixed(6)}`);
      }
      break;
    }

    case "fromChiSquare": {
      if (!degreesOfFreedom || degreesOfFreedom <= 0) {
        return {
          ok: false,
          error: "Positive degrees of freedom is required for chi-square test",
          code: "INVALID_INPUT",
        };
      }

      statisticType = "Chi-square";
      pValue = 1 - chiSquareCDF(testStatistic, degreesOfFreedom);

      steps.push(`Test statistic (χ²) = ${testStatistic}`);
      steps.push(`Degrees of freedom = ${degreesOfFreedom}`);
      steps.push(`P(χ² > ${testStatistic}) = ${pValue.toFixed(6)}`);
      break;
    }

    case "fromFScore": {
      if (
        !degreesOfFreedom ||
        !degreesOfFreedom2 ||
        degreesOfFreedom <= 0 ||
        degreesOfFreedom2 <= 0
      ) {
        return {
          ok: false,
          error: "Two positive degrees of freedom values are required for F-test",
          code: "INVALID_INPUT",
        };
      }

      statisticType = "F-score";
      pValue = 1 - fCDF(testStatistic, degreesOfFreedom, degreesOfFreedom2);

      steps.push(`Test statistic (F) = ${testStatistic}`);
      steps.push(`Degrees of freedom 1 = ${degreesOfFreedom}`);
      steps.push(`Degrees of freedom 2 = ${degreesOfFreedom2}`);
      steps.push(`P(F > ${testStatistic}) = ${pValue.toFixed(6)}`);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  // Ensure p-value is in valid range
  pValue = Math.max(0, Math.min(1, pValue));

  const significantAt05 = pValue < 0.05;
  const significantAt01 = pValue < 0.01;
  const significantAt001 = pValue < 0.001;

  let interpretation: string;
  if (pValue < 0.001) {
    interpretation =
      "The result is highly statistically significant (p < 0.001). Strong evidence against the null hypothesis.";
  } else if (pValue < 0.01) {
    interpretation =
      "The result is statistically significant (p < 0.01). Good evidence against the null hypothesis.";
  } else if (pValue < 0.05) {
    interpretation =
      "The result is statistically significant (p < 0.05). Moderate evidence against the null hypothesis.";
  } else if (pValue < 0.1) {
    interpretation =
      "The result is marginally significant (p < 0.10). Weak evidence against the null hypothesis.";
  } else {
    interpretation =
      "The result is not statistically significant (p ≥ 0.10). Insufficient evidence to reject the null hypothesis.";
  }

  steps.push(`Significant at α = 0.05? ${significantAt05 ? "Yes" : "No"}`);
  steps.push(`Significant at α = 0.01? ${significantAt01 ? "Yes" : "No"}`);
  steps.push(`Significant at α = 0.001? ${significantAt001 ? "Yes" : "No"}`);

  return {
    ok: true,
    value: {
      pValue,
      testStatistic,
      statisticType,
      twoTailed,
      degreesOfFreedom,
      significantAt05,
      significantAt01,
      significantAt001,
      interpretation,
      steps,
    },
  };
}
