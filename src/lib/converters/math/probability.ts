import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface ProbabilityInput {
  mode:
    | "single"
    | "and"
    | "or"
    | "conditional"
    | "complement"
    | "binomial"
    | "permutation"
    | "combination";
  probabilityA?: number;
  probabilityB?: number;
  probabilityAandB?: number; // P(A and B) for conditional
  n?: number; // total items
  r?: number; // selected items
  trials?: number; // for binomial
  successes?: number; // for binomial
}

export interface ProbabilityResult {
  result: number;
  percentage: number;
  odds: { for: string; against: string };
  formula: string;
  explanation: string;
  steps: CalcStep[];
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function combination(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function permutation(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  return factorial(n) / factorial(n - r);
}

export function calculateProbability(
  input: ProbabilityInput
): CalculationResult<ProbabilityResult> {
  const { mode } = input;
  let result: number;
  let formula: string;
  let explanation: string;
  const steps: CalcStep[] = [];

  switch (mode) {
    case "single": {
      const { probabilityA } = input;
      if (probabilityA === undefined || probabilityA < 0 || probabilityA > 1) {
        return { ok: false, error: "Probability A must be between 0 and 1", code: "INVALID_INPUT" };
      }
      result = probabilityA;
      formula = "P(A)";
      explanation = `The probability of event A is ${(probabilityA * 100).toFixed(2)}%`;
      steps.push({ key: "singleResult", params: { probabilityA } });
      break;
    }

    case "and": {
      // P(A and B) = P(A) × P(B) for independent events
      const { probabilityA, probabilityB } = input;
      if (probabilityA === undefined || probabilityB === undefined) {
        return {
          ok: false,
          error: "Both probability A and probability B are required",
          code: "INVALID_INPUT",
        };
      }
      if (probabilityA < 0 || probabilityA > 1 || probabilityB < 0 || probabilityB > 1) {
        return { ok: false, error: "Probabilities must be between 0 and 1", code: "INVALID_INPUT" };
      }
      result = probabilityA * probabilityB;
      formula = "P(A ∩ B) = P(A) × P(B)";
      explanation = "For independent events, multiply the probabilities";
      steps.push({ key: "andFormula", params: { probabilityA, probabilityB } });
      steps.push({ key: "andResult", params: { result } });
      break;
    }

    case "or": {
      // P(A or B) = P(A) + P(B) - P(A and B)
      const { probabilityA, probabilityB, probabilityAandB = 0 } = input;
      if (probabilityA === undefined || probabilityB === undefined) {
        return {
          ok: false,
          error: "Both probability A and probability B are required",
          code: "INVALID_INPUT",
        };
      }
      if (probabilityA < 0 || probabilityA > 1 || probabilityB < 0 || probabilityB > 1) {
        return { ok: false, error: "Probabilities must be between 0 and 1", code: "INVALID_INPUT" };
      }
      result = probabilityA + probabilityB - probabilityAandB;
      result = Math.min(1, Math.max(0, result));
      formula = "P(A ∪ B) = P(A) + P(B) - P(A ∩ B)";
      explanation = "Add probabilities and subtract the overlap";
      steps.push({ key: "orFormula", params: { probabilityA, probabilityB, probabilityAandB } });
      steps.push({ key: "orResult", params: { result } });
      break;
    }

    case "conditional": {
      // P(A|B) = P(A and B) / P(B)
      const { probabilityAandB, probabilityB } = input;
      if (probabilityAandB === undefined || probabilityB === undefined) {
        return {
          ok: false,
          error: "P(A and B) and P(B) are required for conditional probability",
          code: "INVALID_INPUT",
        };
      }
      if (probabilityB === 0) {
        return {
          ok: false,
          error: "P(B) cannot be zero for conditional probability",
          code: "DIVISION_BY_ZERO",
        };
      }
      result = probabilityAandB / probabilityB;
      formula = "P(A|B) = P(A ∩ B) / P(B)";
      explanation = "The probability of A given that B has occurred";
      steps.push({ key: "condFormula", params: { probabilityAandB, probabilityB } });
      steps.push({ key: "condResult", params: { result } });
      break;
    }

    case "complement": {
      const { probabilityA } = input;
      if (probabilityA === undefined || probabilityA < 0 || probabilityA > 1) {
        return { ok: false, error: "Probability A must be between 0 and 1", code: "INVALID_INPUT" };
      }
      result = 1 - probabilityA;
      formula = "P(A') = 1 - P(A)";
      explanation = "The probability that A does NOT occur";
      steps.push({ key: "compFormula", params: { probabilityA } });
      steps.push({ key: "compResult", params: { result } });
      break;
    }

    case "binomial": {
      const { trials, successes, probabilityA } = input;
      if (trials === undefined || successes === undefined || probabilityA === undefined) {
        return {
          ok: false,
          error: "Trials, successes, and probability are required for binomial",
          code: "INVALID_INPUT",
        };
      }
      if (trials < 0 || successes < 0 || successes > trials) {
        return {
          ok: false,
          error: "Trials and successes must be non-negative, successes cannot exceed trials",
          code: "INVALID_INPUT",
        };
      }
      if (probabilityA < 0 || probabilityA > 1) {
        return { ok: false, error: "Probability must be between 0 and 1", code: "INVALID_INPUT" };
      }

      const n = trials;
      const k = successes;
      const p = probabilityA;
      const q = 1 - p;

      const coeff = combination(n, k);
      result = coeff * p ** k * q ** (n - k);
      formula = "P(X = k) = C(n,k) × p^k × (1-p)^(n-k)";
      explanation = `Probability of exactly ${k} successes in ${n} trials`;
      steps.push({ key: "binomCoeff", params: { n, k, coeff } });
      steps.push({ key: "binomFormula", params: { k, coeff, p, q, expK: k, expNk: n - k } });
      steps.push({ key: "binomResult", params: { k, result } });
      break;
    }

    case "permutation": {
      const { n, r } = input;
      if (n === undefined || r === undefined || n < 0 || r < 0 || r > n) {
        return {
          ok: false,
          error: "Valid n and r values are required (r ≤ n, both non-negative)",
          code: "INVALID_INPUT",
        };
      }
      result = permutation(n, r);
      formula = "P(n,r) = n! / (n-r)!";
      explanation = `Number of ways to arrange ${r} items from ${n} items (order matters)`;
      steps.push({ key: "permFormula", params: { n, r, nMinusR: n - r } });
      steps.push({ key: "permResult", params: { n, r, result } });
      break;
    }

    case "combination": {
      const { n, r } = input;
      if (n === undefined || r === undefined || n < 0 || r < 0 || r > n) {
        return {
          ok: false,
          error: "Valid n and r values are required (r ≤ n, both non-negative)",
          code: "INVALID_INPUT",
        };
      }
      result = combination(n, r);
      formula = "C(n,r) = n! / (r! × (n-r)!)";
      explanation = `Number of ways to choose ${r} items from ${n} items (order doesn't matter)`;
      steps.push({ key: "combFormula", params: { n, r, nMinusR: n - r } });
      steps.push({ key: "combResult", params: { n, r, result } });
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  // Calculate odds
  const percentage = result * 100;
  const oddsFor = result / (1 - result);
  const oddsAgainst = (1 - result) / result;

  return {
    ok: true,
    value: {
      result,
      percentage,
      odds: {
        for: Number.isFinite(oddsFor) ? `${oddsFor.toFixed(2)} to 1` : "∞",
        against: Number.isFinite(oddsAgainst) ? `${oddsAgainst.toFixed(2)} to 1` : "∞",
      },
      formula,
      explanation,
      steps,
    },
  };
}
