import type { CalculationResult } from "@/types";

export interface FactorInput {
  mode: "factors" | "factorPairs" | "commonFactors" | "factorTree";
  number: number;
  number2?: number;
}

export interface FactorResult {
  number: number;
  factors: number[];
  factorPairs: Array<[number, number]>;
  primeFactors: number[];
  primeFactorization: string;
  factorCount: number;
  factorSum: number;
  isPrime: boolean;
  isPerfect: boolean;
  isAbundant: boolean;
  isDeficient: boolean;
  commonFactors?: number[];
  greatestCommonFactor?: number;
  steps: string[];
}

function getFactors(n: number): number[] {
  if (n <= 0) return [];
  const factors: number[] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) {
        factors.push(n / i);
      }
    }
  }
  return factors.sort((a, b) => a - b);
}

function getPrimeFactors(n: number): number[] {
  const factors: number[] = [];
  let num = Math.abs(n);

  while (num % 2 === 0) {
    factors.push(2);
    num /= 2;
  }

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    while (num % i === 0) {
      factors.push(i);
      num /= i;
    }
  }

  if (num > 2) {
    factors.push(num);
  }

  return factors;
}

function formatPrimeFactorization(factors: number[]): string {
  if (factors.length === 0) return "1";

  const counts = new Map<number, number>();
  for (const f of factors) {
    counts.set(f, (counts.get(f) || 0) + 1);
  }

  const parts: string[] = [];
  for (const [prime, count] of Array.from(counts).sort((a, b) => a[0] - b[0])) {
    if (count === 1) {
      parts.push(prime.toString());
    } else {
      parts.push(`${prime}^${count}`);
    }
  }

  return parts.join(" × ");
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

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function calculateFactor(input: FactorInput): CalculationResult<FactorResult> {
  const { mode, number, number2 } = input;

  if (!Number.isInteger(number) || number <= 0) {
    return { ok: false, error: "Number must be a positive integer", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  const factors = getFactors(number);
  const primeFactors = getPrimeFactors(number);

  // Generate factor pairs
  const factorPairs: Array<[number, number]> = [];
  for (const f of factors) {
    if (f <= Math.sqrt(number)) {
      factorPairs.push([f, number / f]);
    }
  }

  steps.push(`Finding factors of ${number}`);
  steps.push(`Factors: ${factors.join(", ")}`);
  steps.push(`Prime factorization: ${formatPrimeFactorization(primeFactors)}`);

  const factorSum = factors.reduce((a, b) => a + b, 0) - number; // Sum of proper divisors
  const isPerfectNumber = factorSum === number;
  const isAbundant = factorSum > number;
  const isDeficient = factorSum < number;

  let commonFactors: number[] | undefined;
  let greatestCommonFactor: number | undefined;

  if (
    mode === "commonFactors" &&
    number2 !== undefined &&
    Number.isInteger(number2) &&
    number2 > 0
  ) {
    const factors2 = getFactors(number2);
    commonFactors = factors.filter((f) => factors2.includes(f));
    greatestCommonFactor = gcd(number, number2);
    steps.push(`Factors of ${number2}: ${factors2.join(", ")}`);
    steps.push(`Common factors: ${commonFactors.join(", ")}`);
    steps.push(`GCF: ${greatestCommonFactor}`);
  }

  return {
    ok: true,
    value: {
      number,
      factors,
      factorPairs,
      primeFactors,
      primeFactorization: formatPrimeFactorization(primeFactors),
      factorCount: factors.length,
      factorSum: factors.reduce((a, b) => a + b, 0),
      isPrime: isPrime(number),
      isPerfect: isPerfectNumber,
      isAbundant,
      isDeficient,
      commonFactors,
      greatestCommonFactor,
      steps,
    },
  };
}
