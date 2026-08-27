import type { CalculationResult } from "@/types";

export interface GcdLcmInput {
  numbers: number[];
}

export interface GcdLcmResult {
  gcd: number;
  lcm: number;
  gcdSteps: string[];
  lcmSteps: string[];
  primeFactorizations: Array<{
    number: number;
    factors: Array<{ prime: number; power: number }>;
    factorString: string;
  }>;
}

function gcdTwo(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcmTwo(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcdTwo(a, b);
}

function primeFactorization(n: number): Array<{ prime: number; power: number }> {
  n = Math.abs(Math.round(n));
  if (n <= 1) return [];

  const factors: Array<{ prime: number; power: number }> = [];
  let divisor = 2;

  while (n > 1) {
    let power = 0;
    while (n % divisor === 0) {
      n /= divisor;
      power++;
    }
    if (power > 0) {
      factors.push({ prime: divisor, power });
    }
    divisor++;
    if (divisor * divisor > n && n > 1) {
      factors.push({ prime: n, power: 1 });
      break;
    }
  }

  return factors;
}

export function calculateGcdLcm(input: GcdLcmInput): CalculationResult<GcdLcmResult> {
  const { numbers } = input;

  if (numbers.length === 0) {
    return { ok: false, error: "At least one number is required", code: "INVALID_INPUT" };
  }
  if (numbers.some((n) => !Number.isInteger(n) || n === 0)) {
    return { ok: false, error: "All numbers must be non-zero integers", code: "INVALID_INPUT" };
  }

  const absNumbers = numbers.map((n) => Math.abs(Math.round(n)));

  // Calculate GCD
  let gcd = absNumbers[0];
  const gcdSteps: string[] = [`Starting with ${absNumbers[0]}`];

  for (let i = 1; i < absNumbers.length; i++) {
    const prev = gcd;
    gcd = gcdTwo(gcd, absNumbers[i]);
    gcdSteps.push(`GCD(${prev}, ${absNumbers[i]}) = ${gcd}`);
  }

  // Calculate LCM
  let lcm = absNumbers[0];
  const lcmSteps: string[] = [`Starting with ${absNumbers[0]}`];

  for (let i = 1; i < absNumbers.length; i++) {
    const prev = lcm;
    lcm = lcmTwo(lcm, absNumbers[i]);
    lcmSteps.push(`LCM(${prev}, ${absNumbers[i]}) = ${lcm}`);
  }

  // Prime factorizations
  const primeFactorizations = absNumbers.map((n) => {
    const factors = primeFactorization(n);
    const factorString =
      factors.length > 0
        ? factors.map((f) => (f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`)).join(" × ")
        : "1";
    return { number: n, factors, factorString };
  });

  return {
    ok: true,
    value: {
      gcd,
      lcm,
      gcdSteps,
      lcmSteps,
      primeFactorizations,
    },
  };
}
