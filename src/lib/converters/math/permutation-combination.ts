import type { CalculationResult } from "@/types";

export interface PermutationCombinationInput {
  mode: "permutation" | "combination" | "permutationRepetition" | "combinationRepetition";
  n: number; // Total items
  r: number; // Items to choose
}

export interface PermutationCombinationResult {
  result: number;
  formula: string;
  notation: string;
  factorials: {
    nFactorial: number;
    rFactorial: number;
    nMinusRFactorial: number;
  };
  steps: string[];
  interpretation: string;
  examples: string[];
}

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Overflow for JavaScript numbers

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Calculate nPr more efficiently to avoid overflow
function permutation(n: number, r: number): number {
  if (r > n || r < 0 || n < 0) return 0;
  if (r === 0) return 1;

  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i;
    if (!Number.isFinite(result)) return Infinity;
  }
  return result;
}

// Calculate nCr more efficiently
function combination(n: number, r: number): number {
  if (r > n || r < 0 || n < 0) return 0;
  if (r === 0 || r === n) return 1;

  // Use symmetry: C(n,r) = C(n,n-r)
  if (r > n - r) {
    r = n - r;
  }

  let result = 1;
  for (let i = 0; i < r; i++) {
    result = (result * (n - i)) / (i + 1);
    if (!Number.isFinite(result)) return Infinity;
  }
  return Math.round(result);
}

export function calculatePermutationCombination(
  input: PermutationCombinationInput
): CalculationResult<PermutationCombinationResult> {
  const { mode, n, r } = input;

  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
    return { ok: false, error: "n and r must be non-negative integers", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  let result: number;
  let formula: string;
  let notation: string;
  let interpretation: string;
  let examples: string[] = [];

  const nFactorial = factorial(n);
  const rFactorial = factorial(r);
  const nMinusRFactorial = factorial(n - r);

  switch (mode) {
    case "permutation": {
      // nPr = n! / (n-r)!
      if (r > n) {
        return {
          ok: false,
          error: "r cannot be greater than n for permutation",
          code: "INVALID_INPUT",
        };
      }

      result = permutation(n, r);
      formula = "P(n,r) = n! / (n-r)!";
      notation = `P(${n},${r}) or ${n}P${r}`;

      steps.push(`Permutation without repetition`);
      steps.push(`P(${n},${r}) = ${n}! / (${n}-${r})!`);
      steps.push(`= ${n}! / ${n - r}!`);
      if (n <= 10) {
        steps.push(`= ${nFactorial} / ${nMinusRFactorial}`);
      }
      steps.push(`= ${result}`);

      interpretation = `There are ${result} ways to arrange ${r} items from ${n} distinct items where order matters.`;
      examples = [
        "Arranging people in a row",
        "Creating passwords with unique characters",
        "Assigning ranks to contestants",
      ];
      break;
    }

    case "combination": {
      // nCr = n! / (r! × (n-r)!)
      if (r > n) {
        return {
          ok: false,
          error: "r cannot be greater than n for combination",
          code: "INVALID_INPUT",
        };
      }

      result = combination(n, r);
      formula = "C(n,r) = n! / (r! × (n-r)!)";
      notation = `C(${n},${r}) or (${n} choose ${r}) or ${n}C${r}`;

      steps.push(`Combination without repetition`);
      steps.push(`C(${n},${r}) = ${n}! / (${r}! × (${n}-${r})!)`);
      steps.push(`= ${n}! / (${r}! × ${n - r}!)`);
      if (n <= 10) {
        steps.push(`= ${nFactorial} / (${rFactorial} × ${nMinusRFactorial})`);
      }
      steps.push(`= ${result}`);

      interpretation = `There are ${result} ways to choose ${r} items from ${n} distinct items where order doesn't matter.`;
      examples = [
        "Selecting a committee from a group",
        "Choosing lottery numbers",
        "Picking cards from a deck",
      ];
      break;
    }

    case "permutationRepetition": {
      // n^r
      result = n ** r;
      if (!Number.isFinite(result)) result = Infinity;

      formula = "P'(n,r) = n^r";
      notation = `${n}^${r}`;

      steps.push(`Permutation with repetition`);
      steps.push(`P'(${n},${r}) = ${n}^${r}`);
      steps.push(`= ${result}`);

      interpretation = `There are ${result} ways to arrange ${r} positions where each position can be any of ${n} items (repetition allowed).`;
      examples = [
        "PIN codes (digits can repeat)",
        "Binary strings of length r",
        "Creating passwords where characters can repeat",
      ];
      break;
    }

    case "combinationRepetition": {
      // C(n+r-1, r) = (n+r-1)! / (r! × (n-1)!)
      result = combination(n + r - 1, r);
      formula = "C'(n,r) = C(n+r-1, r) = (n+r-1)! / (r! × (n-1)!)";
      notation = `((${n} multichoose ${r})) or C(${n + r - 1},${r})`;

      steps.push(`Combination with repetition (multiset)`);
      steps.push(`C'(${n},${r}) = C(${n}+${r}-1, ${r})`);
      steps.push(`= C(${n + r - 1}, ${r})`);
      steps.push(`= ${result}`);

      interpretation = `There are ${result} ways to choose ${r} items from ${n} types where items can be repeated and order doesn't matter.`;
      examples = [
        "Selecting items from a menu (can order same item multiple times)",
        "Distributing identical balls into distinct boxes",
        "Choosing ice cream scoops (can have same flavor)",
      ];
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      result,
      formula,
      notation,
      factorials: {
        nFactorial,
        rFactorial,
        nMinusRFactorial,
      },
      steps,
      interpretation,
      examples,
    },
  };
}
