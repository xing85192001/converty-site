import type { CalculationResult } from "@/types";

export interface ExponentInput {
  base: number;
  exponent: number;
}

export interface ExponentResult {
  result: number;
  scientificNotation: string;
  formula: string;
  rules: string[];
  reciprocal: number | null;
  logarithm: number | null;
}

export function calculateExponent(input: ExponentInput): CalculationResult<ExponentResult> {
  const { base, exponent } = input;

  // Handle special cases
  if (base === 0 && exponent <= 0) {
    return { ok: false, error: "0^0 and 0^negative are undefined", code: "INVALID_INPUT" };
  }

  const result = base ** exponent;

  if (!Number.isFinite(result)) {
    return { ok: false, error: "Result is too large or invalid", code: "CALCULATION_ERROR" };
  }

  // Scientific notation
  let scientificNotation: string;
  if (result === 0) {
    scientificNotation = "0";
  } else {
    const exp = Math.floor(Math.log10(Math.abs(result)));
    const mantissa = result / 10 ** exp;
    scientificNotation = `${mantissa.toFixed(4)} × 10^${exp}`;
  }

  // Formula
  const formula = `${base}^${exponent} = ${result}`;

  // Exponent rules
  const rules: string[] = [];
  if (exponent === 0) {
    rules.push("Any number raised to 0 equals 1 (except 0^0)");
  } else if (exponent === 1) {
    rules.push("Any number raised to 1 equals itself");
  } else if (exponent < 0) {
    rules.push(`Negative exponent: ${base}^${exponent} = 1/${base}^${-exponent}`);
  } else if (exponent === 0.5) {
    rules.push(`Exponent 0.5 is the square root: ${base}^0.5 = √${base}`);
  } else if (Number.isInteger(exponent)) {
    rules.push(`${base}^${exponent} = ${Array(exponent).fill(base).join(" × ")}`);
  }

  // Reciprocal (1/result)
  const reciprocal = result !== 0 ? 1 / result : null;

  // Logarithm (what power of base gives this result)
  const logarithm = base > 0 && base !== 1 ? Math.log(result) / Math.log(base) : null;

  return {
    ok: true,
    value: {
      result,
      scientificNotation,
      formula,
      rules,
      reciprocal,
      logarithm,
    },
  };
}
