import type { CalculationResult } from "@/types";

export interface BigNumberInput {
  mode: "add" | "subtract" | "multiply" | "divide" | "power" | "factorial" | "compare";
  numberA: string;
  numberB?: string;
  precision?: number;
}

export interface BigNumberResult {
  result: string;
  operation: string;
  numberA: string;
  numberB?: string;
  scientificNotation: string;
  digitCount: number;
  steps: string[];
  comparison?: string;
}

// Simple big integer addition (for positive integers)
function addBigIntegers(a: string, b: string): string {
  // Remove leading zeros but keep at least one digit
  a = a.replace(/^0+/, "") || "0";
  b = b.replace(/^0+/, "") || "0";

  // Pad to same length
  const maxLen = Math.max(a.length, b.length);
  a = a.padStart(maxLen, "0");
  b = b.padStart(maxLen, "0");

  let result = "";
  let carry = 0;

  for (let i = maxLen - 1; i >= 0; i--) {
    const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
  }

  if (carry) {
    result = carry + result;
  }

  return result;
}

// Simple big integer subtraction (assumes a >= b, both positive)
function subtractBigIntegers(a: string, b: string): string {
  a = a.replace(/^0+/, "") || "0";
  b = b.replace(/^0+/, "") || "0";

  const maxLen = Math.max(a.length, b.length);
  a = a.padStart(maxLen, "0");
  b = b.padStart(maxLen, "0");

  let result = "";
  let borrow = 0;

  for (let i = maxLen - 1; i >= 0; i--) {
    let diff = parseInt(a[i]) - parseInt(b[i]) - borrow;
    if (diff < 0) {
      diff += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = diff + result;
  }

  return result.replace(/^0+/, "") || "0";
}

// Compare two big integers (returns -1, 0, or 1)
function compareBigIntegers(a: string, b: string): number {
  a = a.replace(/^0+/, "") || "0";
  b = b.replace(/^0+/, "") || "0";

  if (a.length !== b.length) {
    return a.length > b.length ? 1 : -1;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] > b[i] ? 1 : -1;
    }
  }

  return 0;
}

// Multiply big integer by single digit
function multiplyByDigit(a: string, d: number): string {
  if (d === 0) return "0";
  if (d === 1) return a;

  let result = "";
  let carry = 0;

  for (let i = a.length - 1; i >= 0; i--) {
    const prod = parseInt(a[i]) * d + carry;
    result = (prod % 10) + result;
    carry = Math.floor(prod / 10);
  }

  if (carry) {
    result = carry + result;
  }

  return result;
}

// Big integer multiplication
function multiplyBigIntegers(a: string, b: string): string {
  a = a.replace(/^0+/, "") || "0";
  b = b.replace(/^0+/, "") || "0";

  if (a === "0" || b === "0") return "0";

  let result = "0";

  for (let i = b.length - 1; i >= 0; i--) {
    const digit = parseInt(b[i]);
    let partial = multiplyByDigit(a, digit);

    // Add trailing zeros
    const zeros = b.length - 1 - i;
    partial += "0".repeat(zeros);

    result = addBigIntegers(result, partial);
  }

  return result;
}

// Big integer factorial
function factorialBig(n: number): string {
  if (n < 0) return "0";
  if (n <= 1) return "1";

  let result = "1";
  for (let i = 2; i <= n; i++) {
    result = multiplyBigIntegers(result, i.toString());
  }

  return result;
}

// Convert to scientific notation
function toScientificNotation(num: string, precision: number = 6): string {
  num = num.replace(/^0+/, "") || "0";
  if (num === "0") return "0";

  const exponent = num.length - 1;
  const mantissa = `${num[0]}.${num.slice(1, precision + 1).padEnd(precision, "0")}`;

  return `${mantissa} × 10^${exponent}`;
}

export function calculateBigNumber(input: BigNumberInput): CalculationResult<BigNumberResult> {
  const { mode, numberA, numberB, precision = 10 } = input;

  // Validate inputs are valid integers
  if (!/^-?\d+$/.test(numberA)) {
    return { ok: false, error: "numberA must be a valid integer", code: "INVALID_INPUT" };
  }
  if (numberB && !/^-?\d+$/.test(numberB)) {
    return { ok: false, error: "numberB must be a valid integer", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  let result: string;
  let operation: string;
  let comparison: string | undefined;

  // Handle signs
  const isNegativeA = numberA.startsWith("-");
  const isNegativeB = numberB?.startsWith("-");
  const absA = numberA.replace("-", "");
  const absB = numberB?.replace("-", "");

  switch (mode) {
    case "add": {
      if (!numberB || !absB) {
        return { ok: false, error: "numberB is required for addition", code: "INVALID_INPUT" };
      }

      operation = `${numberA} + ${numberB}`;

      if (isNegativeA === isNegativeB) {
        // Same sign: add and keep sign
        result = addBigIntegers(absA, absB);
        if (isNegativeA) result = `-${result}`;
      } else {
        // Different signs: subtract
        const cmp = compareBigIntegers(absA, absB);
        if (cmp === 0) {
          result = "0";
        } else if (cmp > 0) {
          result = subtractBigIntegers(absA, absB);
          if (isNegativeA) result = `-${result}`;
        } else {
          result = subtractBigIntegers(absB, absA);
          if (isNegativeB) result = `-${result}`;
        }
      }

      steps.push(`Adding ${numberA} and ${numberB}`);
      steps.push(`Result: ${result}`);
      break;
    }

    case "subtract": {
      if (!numberB || !absB) {
        return { ok: false, error: "numberB is required for subtraction", code: "INVALID_INPUT" };
      }

      operation = `${numberA} - ${numberB}`;

      // a - b = a + (-b)
      const effectiveNegB = !isNegativeB;

      if (isNegativeA === effectiveNegB) {
        result = addBigIntegers(absA, absB);
        if (isNegativeA) result = `-${result}`;
      } else {
        const cmp = compareBigIntegers(absA, absB);
        if (cmp === 0) {
          result = "0";
        } else if (cmp > 0) {
          result = subtractBigIntegers(absA, absB);
          if (isNegativeA) result = `-${result}`;
        } else {
          result = subtractBigIntegers(absB, absA);
          if (!isNegativeA) result = `-${result}`;
        }
      }

      steps.push(`Subtracting ${numberB} from ${numberA}`);
      steps.push(`Result: ${result}`);
      break;
    }

    case "multiply": {
      if (!numberB || !absB) {
        return {
          ok: false,
          error: "numberB is required for multiplication",
          code: "INVALID_INPUT",
        };
      }

      operation = `${numberA} × ${numberB}`;
      result = multiplyBigIntegers(absA, absB);

      // Determine sign
      if (isNegativeA !== isNegativeB && result !== "0") {
        result = `-${result}`;
      }

      steps.push(`Multiplying ${numberA} by ${numberB}`);
      steps.push(`Result has ${result.replace("-", "").length} digits`);
      steps.push(`Result: ${result}`);
      break;
    }

    case "divide": {
      if (!numberB || !absB || absB === "0") {
        return {
          ok: false,
          error: "numberB must be a non-zero integer for division",
          code: "DIVISION_BY_ZERO",
        };
      }

      operation = `${numberA} ÷ ${numberB}`;

      // Simple integer division using JavaScript's BigInt
      try {
        const bigA = BigInt(numberA);
        const bigB = BigInt(numberB);
        const quotient = bigA / bigB;
        const remainder = bigA % bigB;

        result = quotient.toString();
        steps.push(`Dividing ${numberA} by ${numberB}`);
        steps.push(`Quotient: ${result}`);
        steps.push(`Remainder: ${remainder.toString()}`);
      } catch {
        return { ok: false, error: "Division calculation failed", code: "CALCULATION_ERROR" };
      }
      break;
    }

    case "power": {
      if (!numberB || !absB) {
        return {
          ok: false,
          error: "numberB is required for power operation",
          code: "INVALID_INPUT",
        };
      }

      const exp = parseInt(numberB);
      if (exp < 0) {
        return {
          ok: false,
          error: "Exponent must be non-negative for big number power",
          code: "INVALID_INPUT",
        };
      }

      operation = `${numberA}^${numberB}`;

      if (exp === 0) {
        result = "1";
      } else {
        result = absA;
        for (let i = 1; i < exp; i++) {
          result = multiplyBigIntegers(result, absA);
        }

        // Handle sign
        if (isNegativeA && exp % 2 === 1) {
          result = `-${result}`;
        }
      }

      steps.push(`Calculating ${numberA}^${numberB}`);
      steps.push(`Result has ${result.replace("-", "").length} digits`);
      break;
    }

    case "factorial": {
      const n = parseInt(numberA);
      if (n < 0 || n > 10000) {
        return {
          ok: false,
          error: "Number must be between 0 and 10000 for factorial",
          code: "INVALID_INPUT",
        };
      }

      operation = `${n}!`;
      result = factorialBig(n);

      steps.push(`Calculating ${n}!`);
      steps.push(`${n}! = 1 × 2 × 3 × ... × ${n}`);
      steps.push(`Result has ${result.length} digits`);
      break;
    }

    case "compare": {
      if (!numberB || !absB) {
        return { ok: false, error: "numberB is required for comparison", code: "INVALID_INPUT" };
      }

      operation = `Compare ${numberA} and ${numberB}`;

      // Handle signs first
      if (isNegativeA && !isNegativeB) {
        comparison = `${numberA} < ${numberB}`;
        result = "-1";
      } else if (!isNegativeA && isNegativeB) {
        comparison = `${numberA} > ${numberB}`;
        result = "1";
      } else {
        const cmp = compareBigIntegers(absA, absB);
        // If both negative, reverse comparison
        const effectiveCmp = isNegativeA ? -cmp : cmp;

        if (effectiveCmp === 0) {
          comparison = `${numberA} = ${numberB}`;
          result = "0";
        } else if (effectiveCmp > 0) {
          comparison = `${numberA} > ${numberB}`;
          result = "1";
        } else {
          comparison = `${numberA} < ${numberB}`;
          result = "-1";
        }
      }

      steps.push(comparison);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const absResult = result.replace("-", "");

  return {
    ok: true,
    value: {
      result,
      operation,
      numberA,
      numberB,
      scientificNotation: toScientificNotation(absResult, precision),
      digitCount: absResult.length,
      steps,
      comparison,
    },
  };
}
