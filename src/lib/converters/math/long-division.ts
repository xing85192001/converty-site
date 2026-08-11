import type { CalculationResult } from "@/types";

export interface LongDivisionInput {
  dividend: number;
  divisor: number;
  decimalPlaces?: number;
}

export interface DivisionStep {
  step: number;
  bring: string;
  divide: string;
  multiply: string;
  subtract: string;
  remainder: number;
}

export interface LongDivisionResult {
  quotient: number;
  remainder: number;
  decimal: number;
  fraction: string;
  mixedNumber: string;
  steps: DivisionStep[];
  verification: string;
  isExact: boolean;
  repeatingDecimal?: string;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function calculateLongDivision(
  input: LongDivisionInput
): CalculationResult<LongDivisionResult> {
  const { dividend, divisor, decimalPlaces = 10 } = input;

  if (divisor === 0) {
    return { ok: false, error: "Divisor cannot be zero", code: "DIVISION_BY_ZERO" };
  }
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor)) {
    return { ok: false, error: "Dividend and divisor must be integers", code: "INVALID_INPUT" };
  }

  const isNegative = dividend < 0 !== divisor < 0;
  const absDividend = Math.abs(dividend);
  const absDivisor = Math.abs(divisor);

  const steps: DivisionStep[] = [];
  let quotient = Math.floor(absDividend / absDivisor);
  const remainder = absDividend % absDivisor;

  // Generate long division steps
  let current = 0;
  const dividendStr = absDividend.toString();
  let stepNum = 0;

  for (let i = 0; i < dividendStr.length; i++) {
    const digit = parseInt(dividendStr[i]);
    current = current * 10 + digit;

    if (current >= absDivisor || steps.length > 0) {
      const q = Math.floor(current / absDivisor);
      const product = q * absDivisor;
      const newRemainder = current - product;

      steps.push({
        step: ++stepNum,
        bring: `Bring down ${digit}: ${current}`,
        divide: `${current} ÷ ${absDivisor} = ${q}`,
        multiply: `${q} × ${absDivisor} = ${product}`,
        subtract: `${current} - ${product} = ${newRemainder}`,
        remainder: newRemainder,
      });

      current = newRemainder;
    }
  }

  // Calculate decimal
  const decimal = absDividend / absDivisor;

  // Simplify fraction
  const divisorGcd = gcd(absDividend, absDivisor);
  const simplifiedNum = absDividend / divisorGcd;
  const simplifiedDen = absDivisor / divisorGcd;
  const fraction = `${simplifiedNum}/${simplifiedDen}`;

  // Mixed number
  let mixedNumber: string;
  if (quotient === 0) {
    mixedNumber = fraction;
  } else if (remainder === 0) {
    mixedNumber = quotient.toString();
  } else {
    const remGcd = gcd(remainder, absDivisor);
    mixedNumber = `${quotient} ${remainder / remGcd}/${absDivisor / remGcd}`;
  }

  // Apply sign
  if (isNegative) {
    quotient = -quotient;
  }

  // Check for repeating decimal
  let repeatingDecimal: string | undefined;
  const seen = new Map<number, number>();
  let decimalPart = "";
  let rem = remainder;
  let pos = 0;

  while (rem !== 0 && pos < decimalPlaces) {
    if (seen.has(rem)) {
      const repeatStart = seen.get(rem)!;
      const nonRepeating = decimalPart.substring(0, repeatStart);
      const repeating = decimalPart.substring(repeatStart);
      repeatingDecimal = `${nonRepeating}(${repeating})`;
      break;
    }
    seen.set(rem, pos);
    rem *= 10;
    const d = Math.floor(rem / absDivisor);
    decimalPart += d;
    rem = rem % absDivisor;
    pos++;
  }

  return {
    ok: true,
    value: {
      quotient: isNegative ? -Math.abs(quotient) : Math.abs(quotient),
      remainder,
      decimal: isNegative ? -decimal : decimal,
      fraction: isNegative ? `-${fraction}` : fraction,
      mixedNumber: isNegative ? `-${mixedNumber}` : mixedNumber,
      steps,
      verification: `${quotient} × ${divisor} + ${remainder} = ${quotient * divisor + remainder}`,
      isExact: remainder === 0,
      repeatingDecimal,
    },
  };
}
