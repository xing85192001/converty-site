import type { CalculationResult } from "@/types";

export interface PrimeFactorizationInput {
  number: number;
}

export interface PrimeFactorizationResult {
  originalNumber: number;
  isPrime: boolean;
  factors: Array<{ prime: number; power: number }>;
  factorString: string;
  expandedForm: string;
  allDivisors: number[];
  divisorCount: number;
  divisorSum: number;
  factorTree: string[];
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function calculatePrimeFactorization(
  input: PrimeFactorizationInput
): CalculationResult<PrimeFactorizationResult> {
  const { number } = input;

  if (!Number.isInteger(number) || number < 1 || number > 1000000000) {
    return {
      ok: false,
      error: "Number must be a positive integer up to 1,000,000,000",
      code: "INVALID_INPUT",
    };
  }

  const originalNumber = number;
  const isNumberPrime = isPrime(number);

  if (number === 1) {
    return {
      ok: true,
      value: {
        originalNumber: 1,
        isPrime: false,
        factors: [],
        factorString: "1",
        expandedForm: "1",
        allDivisors: [1],
        divisorCount: 1,
        divisorSum: 1,
        factorTree: ["1 (neither prime nor composite)"],
      },
    };
  }

  const factors: Array<{ prime: number; power: number }> = [];
  const factorTree: string[] = [];
  let remaining = number;
  let divisor = 2;

  while (remaining > 1) {
    let power = 0;
    while (remaining % divisor === 0) {
      factorTree.push(`${remaining} ÷ ${divisor} = ${remaining / divisor}`);
      remaining /= divisor;
      power++;
    }
    if (power > 0) {
      factors.push({ prime: divisor, power });
    }
    divisor++;
    if (divisor * divisor > remaining && remaining > 1) {
      factors.push({ prime: remaining, power: 1 });
      factorTree.push(`${remaining} is prime`);
      break;
    }
  }

  // Build factor string (e.g., "2³ × 3²")
  const factorString =
    factors.length > 0
      ? factors.map((f) => (f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`)).join(" × ")
      : "1";

  // Build expanded form (e.g., "2 × 2 × 2 × 3 × 3")
  const expandedFactors: number[] = [];
  for (const f of factors) {
    for (let i = 0; i < f.power; i++) {
      expandedFactors.push(f.prime);
    }
  }
  const expandedForm = expandedFactors.length > 0 ? expandedFactors.join(" × ") : "1";

  // Calculate all divisors
  const allDivisors: Set<number> = new Set([1]);

  function generateDivisors(index: number, current: number): void {
    if (index >= factors.length) {
      allDivisors.add(current);
      return;
    }
    for (let p = 0; p <= factors[index].power; p++) {
      generateDivisors(index + 1, current * factors[index].prime ** p);
    }
  }

  generateDivisors(0, 1);

  const sortedDivisors = [...allDivisors].sort((a, b) => a - b);
  const divisorSum = sortedDivisors.reduce((a, b) => a + b, 0);

  return {
    ok: true,
    value: {
      originalNumber,
      isPrime: isNumberPrime,
      factors,
      factorString,
      expandedForm,
      allDivisors: sortedDivisors,
      divisorCount: sortedDivisors.length,
      divisorSum,
      factorTree,
    },
  };
}
