import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface BinaryInput {
  mode: "decimalToBinary" | "binaryToDecimal" | "binaryOperation";
  decimal?: number;
  binary?: string;
  binary2?: string;
  operation?: "add" | "subtract" | "multiply" | "and" | "or" | "xor" | "not";
}

export interface BinaryResult {
  decimal: number;
  binary: string;
  octal: string;
  hexadecimal: string;
  operationResult?: {
    binary: string;
    decimal: number;
  };
  steps: CalcStep[];
  bitCount: number;
  twosComplement: string;
}

function isValidBinary(str: string): boolean {
  return /^[01]+$/.test(str);
}

function binaryToDecimal(binary: string): number {
  return parseInt(binary, 2);
}

function decimalToBinary(decimal: number): string {
  if (decimal < 0) {
    // For negative numbers, use 32-bit two's complement
    return (decimal >>> 0).toString(2);
  }
  return decimal.toString(2);
}

function binaryAdd(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA + numB);
}

function binarySubtract(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA - numB);
}

function binaryMultiply(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA * numB);
}

function binaryAnd(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA & numB);
}

function binaryOr(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA | numB);
}

function binaryXor(a: string, b: string): string {
  const numA = binaryToDecimal(a);
  const numB = binaryToDecimal(b);
  return decimalToBinary(numA ^ numB);
}

function binaryNot(a: string): string {
  // Flip all bits (limited to the length of input)
  return a
    .split("")
    .map((b) => (b === "0" ? "1" : "0"))
    .join("");
}

export function calculateBinary(input: BinaryInput): CalculationResult<BinaryResult> {
  const { mode, decimal: inputDecimal, binary: inputBinary, binary2, operation } = input;
  const steps: CalcStep[] = [];

  let decimal: number;
  let binary: string;

  switch (mode) {
    case "decimalToBinary": {
      if (inputDecimal === undefined || !Number.isInteger(inputDecimal)) {
        return {
          ok: false,
          error: "A valid integer is required for decimal to binary conversion",
          code: "INVALID_INPUT",
        };
      }
      decimal = inputDecimal;
      binary = decimalToBinary(decimal);
      steps.push({ key: "decimalToBinaryIntro", params: { decimal } });

      // Show division steps
      let temp = Math.abs(decimal);
      while (temp > 0) {
        steps.push({
          key: "decimalToBinaryDivision",
          params: { value: temp, quotient: Math.floor(temp / 2), remainder: temp % 2 },
        });
        temp = Math.floor(temp / 2);
      }
      steps.push({ key: "decimalToBinaryResult", params: { binary } });
      break;
    }

    case "binaryToDecimal": {
      if (!inputBinary || !isValidBinary(inputBinary)) {
        return {
          ok: false,
          error: "A valid binary string (only 0s and 1s) is required",
          code: "INVALID_INPUT",
        };
      }
      binary = inputBinary;
      decimal = binaryToDecimal(binary);
      steps.push({ key: "binaryToDecimalIntro", params: { binary } });

      // Show position values
      const bits = binary.split("").reverse();
      const terms: string[] = [];
      bits.forEach((bit, i) => {
        if (bit === "1") {
          terms.push(`2^${i}`);
          steps.push({
            key: "binaryToDecimalPosition",
            params: { position: i, bit, power: i, result: 2 ** i },
          });
        }
      });
      steps.push({ key: "binaryToDecimalSum", params: { terms: terms.join(" + "), decimal } });
      break;
    }

    case "binaryOperation": {
      if (!inputBinary || !isValidBinary(inputBinary)) {
        return { ok: false, error: "A valid binary string is required", code: "INVALID_INPUT" };
      }
      binary = inputBinary;
      decimal = binaryToDecimal(binary);

      if (operation === "not") {
        const result = binaryNot(binary);
        return {
          ok: true,
          value: {
            decimal,
            binary,
            octal: decimal.toString(8),
            hexadecimal: decimal.toString(16).toUpperCase(),
            operationResult: {
              binary: result,
              decimal: binaryToDecimal(result),
            },
            steps: [{ key: "binaryOpNot", params: { binary, result } }],
            bitCount: binary.length,
            twosComplement: decimalToBinary(-decimal),
          },
        };
      }

      if (!binary2 || !isValidBinary(binary2)) {
        return {
          ok: false,
          error: "A valid second binary string is required for this operation",
          code: "INVALID_INPUT",
        };
      }

      let resultBinary: string;
      switch (operation) {
        case "add":
          resultBinary = binaryAdd(binary, binary2);
          steps.push({
            key: "binaryOpAdd",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        case "subtract":
          resultBinary = binarySubtract(binary, binary2);
          steps.push({
            key: "binaryOpSubtract",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        case "multiply":
          resultBinary = binaryMultiply(binary, binary2);
          steps.push({
            key: "binaryOpMultiply",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        case "and":
          resultBinary = binaryAnd(binary, binary2);
          steps.push({
            key: "binaryOpAnd",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        case "or":
          resultBinary = binaryOr(binary, binary2);
          steps.push({
            key: "binaryOpOr",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        case "xor":
          resultBinary = binaryXor(binary, binary2);
          steps.push({
            key: "binaryOpXor",
            params: { binaryA: binary, binaryB: binary2, result: resultBinary },
          });
          break;
        default:
          return { ok: false, error: "Unknown binary operation", code: "INVALID_INPUT" };
      }

      return {
        ok: true,
        value: {
          decimal,
          binary,
          octal: decimal.toString(8),
          hexadecimal: decimal.toString(16).toUpperCase(),
          operationResult: {
            binary: resultBinary,
            decimal: binaryToDecimal(resultBinary),
          },
          steps,
          bitCount: binary.length,
          twosComplement: decimalToBinary(-decimal),
        },
      };
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const octal = decimal >= 0 ? decimal.toString(8) : (decimal >>> 0).toString(8);
  const hexadecimal =
    decimal >= 0 ? decimal.toString(16).toUpperCase() : (decimal >>> 0).toString(16).toUpperCase();

  // Two's complement (32-bit)
  const twosComplement = decimal >= 0 ? binary.padStart(32, "0") : decimalToBinary(-decimal);

  return {
    ok: true,
    value: {
      decimal,
      binary,
      octal,
      hexadecimal,
      steps,
      bitCount: binary.length,
      twosComplement,
    },
  };
}
