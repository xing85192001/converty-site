import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface FractionInput {
  mode: "simplify" | "add" | "subtract" | "multiply" | "divide" | "toDecimal" | "toFraction";
  numerator1: number;
  denominator1: number;
  numerator2?: number;
  denominator2?: number;
  decimal?: number;
}

export interface FractionResult {
  numerator: number;
  denominator: number;
  simplified: { numerator: number; denominator: number };
  decimal: number;
  mixedNumber: { whole: number; numerator: number; denominator: number } | null;
  percentage: number;
  steps: CalcStep[];
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

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function simplifyFraction(num: number, den: number): { numerator: number; denominator: number } {
  if (den === 0) return { numerator: num, denominator: den };
  const divisor = gcd(num, den);
  let newNum = num / divisor;
  let newDen = den / divisor;
  // Keep denominator positive
  if (newDen < 0) {
    newNum = -newNum;
    newDen = -newDen;
  }
  return { numerator: newNum, denominator: newDen };
}

export function calculateFraction(input: FractionInput): CalculationResult<FractionResult> {
  const { mode, numerator1, denominator1, numerator2, denominator2, decimal } = input;

  if (denominator1 === 0) {
    return { ok: false, error: "Denominator cannot be zero", code: "DIVISION_BY_ZERO" };
  }

  let resultNum: number;
  let resultDen: number;
  const steps: CalcStep[] = [];

  switch (mode) {
    case "simplify":
      resultNum = numerator1;
      resultDen = denominator1;
      steps.push({
        key: "simplifyOriginal",
        params: { numerator: numerator1, denominator: denominator1 },
      });
      break;

    case "add": {
      if (numerator2 === undefined || denominator2 === undefined || denominator2 === 0) {
        return {
          ok: false,
          error: "Valid second fraction with non-zero denominator is required for addition",
          code: "INVALID_INPUT",
        };
      }
      const commonDenAdd = lcm(denominator1, denominator2);
      resultNum =
        numerator1 * (commonDenAdd / denominator1) + numerator2 * (commonDenAdd / denominator2);
      resultDen = commonDenAdd;
      steps.push({
        key: "addExpression",
        params: { n1: numerator1, d1: denominator1, n2: numerator2, d2: denominator2 },
      });
      steps.push({
        key: "addCommonDenominator",
        params: {
          n1Converted: numerator1 * (commonDenAdd / denominator1),
          commonDen: commonDenAdd,
          n2Converted: numerator2 * (commonDenAdd / denominator2),
        },
      });
      steps.push({ key: "addResult", params: { numerator: resultNum, denominator: resultDen } });
      break;
    }

    case "subtract": {
      if (numerator2 === undefined || denominator2 === undefined || denominator2 === 0) {
        return {
          ok: false,
          error: "Valid second fraction with non-zero denominator is required for subtraction",
          code: "INVALID_INPUT",
        };
      }
      const commonDenSub = lcm(denominator1, denominator2);
      resultNum =
        numerator1 * (commonDenSub / denominator1) - numerator2 * (commonDenSub / denominator2);
      resultDen = commonDenSub;
      steps.push({
        key: "subtractExpression",
        params: { n1: numerator1, d1: denominator1, n2: numerator2, d2: denominator2 },
      });
      steps.push({
        key: "subtractResult",
        params: { numerator: resultNum, denominator: resultDen },
      });
      break;
    }

    case "multiply":
      if (numerator2 === undefined || denominator2 === undefined || denominator2 === 0) {
        return {
          ok: false,
          error: "Valid second fraction with non-zero denominator is required for multiplication",
          code: "INVALID_INPUT",
        };
      }
      resultNum = numerator1 * numerator2;
      resultDen = denominator1 * denominator2;
      steps.push({
        key: "multiplyExpression",
        params: { n1: numerator1, d1: denominator1, n2: numerator2, d2: denominator2 },
      });
      steps.push({
        key: "multiplyResult",
        params: { numerator: resultNum, denominator: resultDen },
      });
      break;

    case "divide":
      if (numerator2 === undefined || denominator2 === undefined || numerator2 === 0) {
        return {
          ok: false,
          error: "Valid second fraction with non-zero numerator is required for division",
          code: "DIVISION_BY_ZERO",
        };
      }
      resultNum = numerator1 * denominator2;
      resultDen = denominator1 * numerator2;
      steps.push({
        key: "divideExpression",
        params: { n1: numerator1, d1: denominator1, n2: numerator2, d2: denominator2 },
      });
      steps.push({
        key: "divideInvert",
        params: { n1: numerator1, d1: denominator1, n2: numerator2, d2: denominator2 },
      });
      steps.push({ key: "divideResult", params: { numerator: resultNum, denominator: resultDen } });
      break;

    case "toDecimal":
      resultNum = numerator1;
      resultDen = denominator1;
      steps.push({
        key: "toDecimalResult",
        params: {
          numerator: numerator1,
          denominator: denominator1,
          decimal: (numerator1 / denominator1).toFixed(6),
        },
      });
      break;

    case "toFraction": {
      if (decimal === undefined) {
        return {
          ok: false,
          error: "Decimal value is required for toFraction mode",
          code: "INVALID_INPUT",
        };
      }
      // Convert decimal to fraction
      const precision = 1000000;
      resultNum = Math.round(decimal * precision);
      resultDen = precision;
      steps.push({
        key: "toFractionResult",
        params: { decimal, numerator: resultNum, denominator: resultDen },
      });
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const simplified = simplifyFraction(resultNum, resultDen);
  const decimalValue = resultDen !== 0 ? resultNum / resultDen : 0;

  // Calculate mixed number if improper fraction
  let mixedNumber = null;
  if (
    Math.abs(simplified.numerator) >= Math.abs(simplified.denominator) &&
    simplified.denominator !== 0
  ) {
    const whole = Math.trunc(simplified.numerator / simplified.denominator);
    const remainder = Math.abs(simplified.numerator % simplified.denominator);
    if (remainder !== 0) {
      mixedNumber = {
        whole,
        numerator: remainder,
        denominator: Math.abs(simplified.denominator),
      };
    }
  }

  if (simplified.numerator !== resultNum || simplified.denominator !== resultDen) {
    steps.push({
      key: "simplifiedResult",
      params: { numerator: simplified.numerator, denominator: simplified.denominator },
    });
  }

  return {
    ok: true,
    value: {
      numerator: resultNum,
      denominator: resultDen,
      simplified,
      decimal: decimalValue,
      mixedNumber,
      percentage: decimalValue * 100,
      steps,
    },
  };
}
