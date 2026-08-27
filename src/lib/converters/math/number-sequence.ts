import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface NumberSequenceInput {
  mode: "arithmetic" | "geometric" | "fibonacci" | "custom" | "findPattern";
  // For arithmetic
  firstTerm?: number;
  commonDifference?: number;
  // For geometric
  commonRatio?: number;
  // For custom
  terms?: number[];
  // Common
  numberOfTerms?: number;
  findNthTerm?: number;
}

export interface NumberSequenceResult {
  sequence: number[];
  sequenceType: string;
  formula: string;
  nthTermFormula: string;
  sumFormula?: string;
  sum: number;
  firstTerm: number;
  commonDifference?: number;
  commonRatio?: number;
  nthTerm?: number;
  steps: CalcStep[];
  isConvergent?: boolean;
  limit?: number;
}

function detectPattern(terms: number[]): { type: string; diff?: number; ratio?: number } {
  if (terms.length < 3) {
    return { type: "unknown" };
  }

  // Check arithmetic
  const differences: number[] = [];
  for (let i = 1; i < terms.length; i++) {
    differences.push(terms[i] - terms[i - 1]);
  }
  const isArithmetic = differences.every((d) => Math.abs(d - differences[0]) < 0.0001);

  if (isArithmetic) {
    return { type: "arithmetic", diff: differences[0] };
  }

  // Check geometric
  if (terms.every((t) => t !== 0)) {
    const ratios: number[] = [];
    for (let i = 1; i < terms.length; i++) {
      ratios.push(terms[i] / terms[i - 1]);
    }
    const isGeometric = ratios.every((r) => Math.abs(r - ratios[0]) < 0.0001);

    if (isGeometric) {
      return { type: "geometric", ratio: ratios[0] };
    }
  }

  // Check Fibonacci-like
  let isFibonacci = true;
  for (let i = 2; i < terms.length; i++) {
    if (Math.abs(terms[i] - (terms[i - 1] + terms[i - 2])) > 0.0001) {
      isFibonacci = false;
      break;
    }
  }

  if (isFibonacci) {
    return { type: "fibonacci" };
  }

  return { type: "unknown" };
}

export function calculateNumberSequence(
  input: NumberSequenceInput
): CalculationResult<NumberSequenceResult> {
  const {
    mode,
    firstTerm = 1,
    commonDifference = 1,
    commonRatio = 2,
    terms,
    numberOfTerms = 10,
    findNthTerm,
  } = input;

  if (numberOfTerms < 1 || numberOfTerms > 1000) {
    return {
      ok: false,
      error: "Number of terms must be between 1 and 1000",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];
  let sequence: number[] = [];
  let sequenceType: string;
  let formula: string;
  let nthTermFormula: string;
  let sumFormula: string | undefined;
  let sum: number;
  let resultDiff: number | undefined;
  let resultRatio: number | undefined;
  let nthTerm: number | undefined;
  let isConvergent: boolean | undefined;
  let limit: number | undefined;

  switch (mode) {
    case "arithmetic": {
      sequenceType = "Arithmetic Sequence";
      formula = `a_n = ${firstTerm} + (n-1) × ${commonDifference}`;
      nthTermFormula = `a_n = a_1 + (n-1)d = ${firstTerm} + (n-1)(${commonDifference})`;
      resultDiff = commonDifference;

      for (let i = 0; i < numberOfTerms; i++) {
        sequence.push(firstTerm + i * commonDifference);
      }

      // Sum formula: S_n = n/2 × (2a_1 + (n-1)d) = n/2 × (first + last)
      sum = (numberOfTerms / 2) * (2 * firstTerm + (numberOfTerms - 1) * commonDifference);
      sumFormula = `S_n = n/2 × (2a_1 + (n-1)d)`;

      steps.push({ key: "arithFirstTerm", params: { firstTerm } });
      steps.push({ key: "arithDiff", params: { commonDifference } });
      steps.push({ key: "arithNumTerms", params: { numberOfTerms } });
      steps.push({ key: "arithNthFormula" });
      steps.push({ key: "arithSumFormula" });
      steps.push({
        key: "arithSum",
        params: {
          numberOfTerms,
          first: sequence[0],
          last: sequence[sequence.length - 1],
          sum,
        },
      });

      if (findNthTerm) {
        nthTerm = firstTerm + (findNthTerm - 1) * commonDifference;
        steps.push({
          key: "arithNth",
          params: { findNthTerm, firstTerm, commonDifference, nthTerm },
        });
      }
      break;
    }

    case "geometric": {
      sequenceType = "Geometric Sequence";
      formula = `a_n = ${firstTerm} × ${commonRatio}^(n-1)`;
      nthTermFormula = `a_n = a_1 × r^(n-1) = ${firstTerm} × ${commonRatio}^(n-1)`;
      resultRatio = commonRatio;

      for (let i = 0; i < numberOfTerms; i++) {
        sequence.push(firstTerm * commonRatio ** i);
      }

      // Sum formula
      if (commonRatio === 1) {
        sum = firstTerm * numberOfTerms;
        sumFormula = `S_n = n × a_1 (when r = 1)`;
      } else {
        sum = (firstTerm * (1 - commonRatio ** numberOfTerms)) / (1 - commonRatio);
        sumFormula = `S_n = a_1 × (1 - r^n) / (1 - r)`;
      }

      // Convergence for infinite series
      if (Math.abs(commonRatio) < 1) {
        isConvergent = true;
        limit = firstTerm / (1 - commonRatio);
        steps.push({ key: "geoConverges" });
        steps.push({ key: "geoLimit", params: { firstTerm, commonRatio, limit } });
      } else {
        isConvergent = false;
      }

      steps.push({ key: "geoFirstTerm", params: { firstTerm } });
      steps.push({ key: "geoRatio", params: { commonRatio } });
      steps.push({ key: "geoNumTerms", params: { numberOfTerms } });
      steps.push({ key: "geoNthFormula" });
      steps.push({ key: "geoSum", params: { sum: sum.toFixed(6) } });

      if (findNthTerm) {
        nthTerm = firstTerm * commonRatio ** (findNthTerm - 1);
        steps.push({
          key: "geoNth",
          params: { findNthTerm, firstTerm, commonRatio, exponent: findNthTerm - 1, nthTerm },
        });
      }
      break;
    }

    case "fibonacci": {
      sequenceType = "Fibonacci Sequence";
      formula = `F_n = F_(n-1) + F_(n-2)`;
      nthTermFormula = `F_n = F_(n-1) + F_(n-2) where F_1 = F_2 = 1`;

      let a = 0;
      let b = 1;
      for (let i = 0; i < numberOfTerms; i++) {
        sequence.push(b);
        const temp = a + b;
        a = b;
        b = temp;
      }

      sum = sequence.reduce((acc, val) => acc + val, 0);

      steps.push({ key: "fibIntro" });
      steps.push({ key: "fibStart" });
      steps.push({ key: "fibFormula" });
      steps.push({ key: "fibSum", params: { numberOfTerms, sum } });

      // Golden ratio approximation
      if (numberOfTerms >= 2) {
        const goldenRatio = sequence[sequence.length - 1] / sequence[sequence.length - 2];
        steps.push({ key: "fibGoldenRatio", params: { goldenRatio: goldenRatio.toFixed(6) } });
      }

      if (findNthTerm && findNthTerm <= sequence.length) {
        nthTerm = sequence[findNthTerm - 1];
        steps.push({ key: "fibNth", params: { findNthTerm, nthTerm } });
      }
      break;
    }

    case "custom": {
      if (!terms || terms.length < 3) {
        return {
          ok: false,
          error: "At least 3 terms are required for custom sequence mode",
          code: "INVALID_INPUT",
        };
      }

      sequence = [...terms];
      const pattern = detectPattern(terms);

      if (pattern.type === "arithmetic") {
        sequenceType = "Arithmetic Sequence (detected)";
        resultDiff = pattern.diff;
        formula = `a_n = ${terms[0]} + (n-1) × ${pattern.diff}`;
        nthTermFormula = formula;
        steps.push({ key: "customArith", params: { diff: pattern.diff ?? 0 } });

        // Extend sequence if requested
        if (numberOfTerms > terms.length) {
          for (let i = terms.length; i < numberOfTerms; i++) {
            sequence.push(terms[0] + i * pattern.diff!);
          }
        }
      } else if (pattern.type === "geometric") {
        sequenceType = "Geometric Sequence (detected)";
        resultRatio = pattern.ratio;
        formula = `a_n = ${terms[0]} × ${pattern.ratio?.toFixed(4)}^(n-1)`;
        nthTermFormula = formula;
        steps.push({ key: "customGeo", params: { ratio: pattern.ratio?.toFixed(4) ?? "0" } });

        if (numberOfTerms > terms.length) {
          for (let i = terms.length; i < numberOfTerms; i++) {
            sequence.push(terms[0] * pattern.ratio! ** i);
          }
        }
      } else if (pattern.type === "fibonacci") {
        sequenceType = "Fibonacci-like Sequence (detected)";
        formula = `a_n = a_(n-1) + a_(n-2)`;
        nthTermFormula = formula;
        steps.push({ key: "customFib" });

        if (numberOfTerms > terms.length) {
          for (let i = terms.length; i < numberOfTerms; i++) {
            sequence.push(sequence[i - 1] + sequence[i - 2]);
          }
        }
      } else {
        sequenceType = "Unknown Pattern";
        formula = "Pattern not recognized";
        nthTermFormula = "Unable to determine";
        steps.push({ key: "customUnknown" });
      }

      sum = sequence.reduce((acc, val) => acc + val, 0);
      steps.push({ key: "customSum", params: { sum } });
      break;
    }

    case "findPattern": {
      if (!terms || terms.length < 3) {
        return {
          ok: false,
          error: "At least 3 terms are required for findPattern mode",
          code: "INVALID_INPUT",
        };
      }

      sequence = [...terms];
      const pattern = detectPattern(terms);

      sequenceType = `Pattern Analysis`;
      steps.push({ key: "fpAnalyzing", params: { sequence: terms.join(", ") } });

      if (pattern.type === "arithmetic") {
        formula = `Arithmetic: a_n = ${terms[0]} + (n-1) × ${pattern.diff}`;
        nthTermFormula = formula;
        resultDiff = pattern.diff;
        steps.push({ key: "fpArithPattern" });
        steps.push({ key: "fpArithDiff", params: { diff: pattern.diff ?? 0 } });
      } else if (pattern.type === "geometric") {
        formula = `Geometric: a_n = ${terms[0]} × ${pattern.ratio?.toFixed(4)}^(n-1)`;
        nthTermFormula = formula;
        resultRatio = pattern.ratio;
        steps.push({ key: "fpGeoPattern" });
        steps.push({ key: "fpGeoRatio", params: { ratio: pattern.ratio?.toFixed(4) ?? "0" } });
      } else if (pattern.type === "fibonacci") {
        formula = `Fibonacci-like: a_n = a_(n-1) + a_(n-2)`;
        nthTermFormula = formula;
        steps.push({ key: "fpFibPattern" });
      } else {
        formula = "No standard pattern detected";
        nthTermFormula = "Unknown";
        steps.push({ key: "fpUnknownPattern" });
      }

      sum = sequence.reduce((acc, val) => acc + val, 0);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      sequence,
      sequenceType,
      formula,
      nthTermFormula,
      sumFormula,
      sum,
      firstTerm: sequence[0],
      commonDifference: resultDiff,
      commonRatio: resultRatio,
      nthTerm,
      steps,
      isConvergent,
      limit,
    },
  };
}
