import type { CalcStep } from "@/lib/calc-step";
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
  steps: CalcStep[];
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
  const steps: CalcStep[] = [];

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
      steps.push({ key: "decimalToHexIntro", params: { decimal } });

      // Show division steps
      let temp = Math.abs(decimal);
      while (temp > 0) {
        const remainder = temp % 16;
        const hexDigit = remainder.toString(16).toUpperCase();
        steps.push({
          key: "decimalToHexDivision",
          params: { value: temp, quotient: Math.floor(temp / 16), remainder, hexDigit },
        });
        temp = Math.floor(temp / 16);
      }
      steps.push({ key: "decimalToHexResult", params: { hexadecimal } });
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
      steps.push({ key: "hexToDecimalIntro", params: { hexadecimal } });

      // Show position values
      const digits = hexadecimal.split("").reverse();
      const terms: string[] = [];
      digits.forEach((digit, i) => {
        const value = parseInt(digit, 16);
        if (value > 0) {
          terms.push(`${value} × 16^${i}`);
          steps.push({
            key: "hexToDecimalPosition",
            params: { position: i, digit, value, power: i, result: value * 16 ** i },
          });
        }
      });
      steps.push({ key: "hexToDecimalSum", params: { terms: terms.join(" + "), decimal } });
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
          steps.push({
            key: "hexOpAdd",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
          break;
        case "subtract":
          resultDecimal = decimal - decimal2;
          steps.push({
            key: "hexOpSubtract",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
          break;
        case "multiply":
          resultDecimal = decimal * decimal2;
          steps.push({
            key: "hexOpMultiply",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
          break;
        case "and":
          resultDecimal = decimal & decimal2;
          steps.push({
            key: "hexOpAnd",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
          break;
        case "or":
          resultDecimal = decimal | decimal2;
          steps.push({
            key: "hexOpOr",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
          break;
        case "xor":
          resultDecimal = decimal ^ decimal2;
          steps.push({
            key: "hexOpXor",
            params: {
              hexA: hexadecimal,
              hexB: hex2.toUpperCase(),
              result: decimalToHex(resultDecimal),
            },
          });
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

      steps.push({ key: "hexToRgbIntro", params: { hexadecimal, r, g, b } });
      steps.push({ key: "hexToRgbR", params: { hexPart: cleanHex.substring(0, 2), value: r } });
      steps.push({ key: "hexToRgbG", params: { hexPart: cleanHex.substring(2, 4), value: g } });
      steps.push({ key: "hexToRgbB", params: { hexPart: cleanHex.substring(4, 6), value: b } });

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

      steps.push({ key: "rgbToHexIntro", params: { r, g, b, hexadecimal } });
      steps.push({ key: "rgbToHexR", params: { value: r, hex: rHex } });
      steps.push({ key: "rgbToHexG", params: { value: g, hex: gHex } });
      steps.push({ key: "rgbToHexB", params: { value: b, hex: bHex } });

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
