import type { CalculationResult } from "@/types";

export interface HexInput {
  mode: "decimalToHex" | "hexToDecimal" | "hexOperation" | "hexToRgb" | "rgbToHex";
  decimal?: number;
  hex?: string;
  hex2?: string;
  operation?: "add" | "subtract" | "multiply" | "and" | "or" | "xor";
  rgb?: { r: number; g: number; b: number };
}

export interface HexResult {
  decimal: number;
  hexadecimal: string;
  binary: string;
  octal: string;
  operationResult?: {
    hex: string;
    decimal: number;
  };
  rgb?: { r: number; g: number; b: number };
  steps: string[];
}

function isValidHex(str: string): boolean {
  return /^[0-9A-Fa-f]+$/.test(str);
}

function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

function decimalToHex(decimal: number): string {
  if (decimal < 0) {
    return (decimal >>> 0).toString(16).toUpperCase();
  }
  return decimal.toString(16).toUpperCase();
}

export function calculateHex(input: HexInput): CalculationResult<HexResult> {
  const { mode, decimal: inputDecimal, hex: inputHex, hex2, operation, rgb: inputRgb } = input;
  const steps: string[] = [];

  let decimal: number;
  let hexadecimal: string;

  switch (mode) {
    case "decimalToHex": {
      if (inputDecimal === undefined || !Number.isInteger(inputDecimal)) {
        return {
          ok: false,
          error: "A valid integer is required for decimal to hex conversion",
          code: "INVALID_INPUT",
        };
      }
      decimal = inputDecimal;
      hexadecimal = decimalToHex(decimal);
      steps.push(`Converting ${decimal} to hexadecimal:`);

      // Show division steps
      let temp = Math.abs(decimal);
      while (temp > 0) {
        const remainder = temp % 16;
        const hexDigit = remainder.toString(16).toUpperCase();
        steps.push(`${temp} ÷ 16 = ${Math.floor(temp / 16)} remainder ${remainder} (${hexDigit})`);
        temp = Math.floor(temp / 16);
      }
      steps.push(`Result: ${hexadecimal}`);
      break;
    }

    case "hexToDecimal": {
      if (!inputHex || !isValidHex(inputHex)) {
        return {
          ok: false,
          error: "A valid hexadecimal string is required",
          code: "INVALID_INPUT",
        };
      }
      hexadecimal = inputHex.toUpperCase();
      decimal = hexToDecimal(hexadecimal);
      steps.push(`Converting ${hexadecimal} to decimal:`);

      // Show position values
      const digits = hexadecimal.split("").reverse();
      const terms: string[] = [];
      digits.forEach((digit, i) => {
        const value = parseInt(digit, 16);
        if (value > 0) {
          terms.push(`${value} × 16^${i}`);
          steps.push(`Position ${i}: ${digit} (${value}) × 16^${i} = ${value * 16 ** i}`);
        }
      });
      steps.push(`Sum: ${terms.join(" + ")} = ${decimal}`);
      break;
    }

    case "hexOperation": {
      if (!inputHex || !isValidHex(inputHex) || !hex2 || !isValidHex(hex2)) {
        return {
          ok: false,
          error: "Two valid hexadecimal strings are required for hex operations",
          code: "INVALID_INPUT",
        };
      }
      hexadecimal = inputHex.toUpperCase();
      decimal = hexToDecimal(hexadecimal);
      const decimal2 = hexToDecimal(hex2);

      let resultDecimal: number;
      switch (operation) {
        case "add":
          resultDecimal = decimal + decimal2;
          steps.push(`${hexadecimal} + ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        case "subtract":
          resultDecimal = decimal - decimal2;
          steps.push(`${hexadecimal} - ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        case "multiply":
          resultDecimal = decimal * decimal2;
          steps.push(`${hexadecimal} × ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        case "and":
          resultDecimal = decimal & decimal2;
          steps.push(`${hexadecimal} AND ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        case "or":
          resultDecimal = decimal | decimal2;
          steps.push(`${hexadecimal} OR ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        case "xor":
          resultDecimal = decimal ^ decimal2;
          steps.push(`${hexadecimal} XOR ${hex2.toUpperCase()} = ${decimalToHex(resultDecimal)}`);
          break;
        default:
          return { ok: false, error: "Unknown hex operation", code: "INVALID_INPUT" };
      }

      return {
        ok: true,
        value: {
          decimal,
          hexadecimal,
          binary: decimal.toString(2),
          octal: decimal.toString(8),
          operationResult: {
            hex: decimalToHex(resultDecimal),
            decimal: resultDecimal,
          },
          steps,
        },
      };
    }

    case "hexToRgb": {
      if (!inputHex) {
        return { ok: false, error: "A hex color string is required", code: "INVALID_INPUT" };
      }
      let cleanHex = inputHex.replace(/^#/, "");
      if (cleanHex.length === 3) {
        cleanHex = cleanHex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      if (!isValidHex(cleanHex) || cleanHex.length !== 6) {
        return {
          ok: false,
          error: "A valid 3 or 6 digit hex color is required",
          code: "INVALID_INPUT",
        };
      }

      hexadecimal = cleanHex.toUpperCase();
      decimal = hexToDecimal(hexadecimal);

      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);

      steps.push(`#${hexadecimal} → RGB(${r}, ${g}, ${b})`);
      steps.push(`R: ${cleanHex.substring(0, 2)} = ${r}`);
      steps.push(`G: ${cleanHex.substring(2, 4)} = ${g}`);
      steps.push(`B: ${cleanHex.substring(4, 6)} = ${b}`);

      return {
        ok: true,
        value: {
          decimal,
          hexadecimal: `#${hexadecimal}`,
          binary: decimal.toString(2),
          octal: decimal.toString(8),
          rgb: { r, g, b },
          steps,
        },
      };
    }

    case "rgbToHex": {
      if (!inputRgb) {
        return { ok: false, error: "RGB values are required", code: "INVALID_INPUT" };
      }
      const { r, g, b } = inputRgb;
      if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        return { ok: false, error: "RGB values must be between 0 and 255", code: "INVALID_INPUT" };
      }

      const rHex = r.toString(16).padStart(2, "0").toUpperCase();
      const gHex = g.toString(16).padStart(2, "0").toUpperCase();
      const bHex = b.toString(16).padStart(2, "0").toUpperCase();

      hexadecimal = `#${rHex}${gHex}${bHex}`;
      decimal = (r << 16) + (g << 8) + b;

      steps.push(`RGB(${r}, ${g}, ${b}) → ${hexadecimal}`);
      steps.push(`R: ${r} = ${rHex}`);
      steps.push(`G: ${g} = ${gHex}`);
      steps.push(`B: ${b} = ${bHex}`);

      return {
        ok: true,
        value: {
          decimal,
          hexadecimal,
          binary: decimal.toString(2),
          octal: decimal.toString(8),
          rgb: { r, g, b },
          steps,
        },
      };
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      decimal,
      hexadecimal,
      binary: decimal >= 0 ? decimal.toString(2) : (decimal >>> 0).toString(2),
      octal: decimal >= 0 ? decimal.toString(8) : (decimal >>> 0).toString(8),
      steps,
    },
  };
}
