/**
 * Programmer Calculator
 *
 * Converts between decimal, hexadecimal, octal and binary representations and
 * performs bitwise (AND / OR / XOR / NOT) and shift operations using BigInt
 * for arbitrary-precision safety.
 */

import type { CalculationResult } from "@/types";

export type Base = "dec" | "hex" | "oct" | "bin";
export type BitwiseOp = "and" | "or" | "xor" | "none";
export type ShiftDir = "left" | "right" | "none";

export const BASE_OPTIONS: { value: Base; label: string }[] = [
  { value: "dec", label: "Decimal" },
  { value: "hex", label: "Hexadecimal" },
  { value: "oct", label: "Octal" },
  { value: "bin", label: "Binary" },
];

export interface ProgrammerCalculatorInput {
  a: string;
  aBase: Base;
  b: string;
  bBase: Base;
  bitwiseOp: BitwiseOp;
  shiftDir: ShiftDir;
  shiftAmount: number;
}

export interface RepresentationResult {
  dec: string;
  hex: string;
  oct: string;
  bin: string;
}

export interface ProgrammerCalculatorResult {
  a: RepresentationResult;
  b: RepresentationResult;
  bitwise: RepresentationResult | null;
  not: RepresentationResult;
  shifted: RepresentationResult | null;
}

/** Parse a string in the given base into a BigInt. */
function parseValue(raw: string, base: Base): bigint {
  const cleaned = raw.trim().replace(/^0x/i, "").replace(/^0o/i, "").replace(/^0b/i, "");
  if (cleaned === "" || cleaned === "-") {
    throw new Error("Enter a value");
  }
  let value: bigint;
  switch (base) {
    case "hex":
      value = BigInt(`0x${cleaned}`);
      break;
    case "oct":
      value = BigInt(`0o${cleaned}`);
      break;
    case "bin":
      value = BigInt(`0b${cleaned}`);
      break;
    default:
      value = BigInt(cleaned);
  }
  return value;
}

/** Render a BigInt into all four bases. */
function represent(value: bigint): RepresentationResult {
  const v = value < 0n ? -value : value;
  const sign = value < 0n ? "-" : "";
  return {
    dec: sign + v.toString(10),
    hex: sign + "0x" + v.toString(16).toUpperCase(),
    oct: sign + "0o" + v.toString(8),
    bin: sign + "0b" + v.toString(2),
  };
}

export function calculateProgrammerCalculator(
  input: ProgrammerCalculatorInput
): CalculationResult<ProgrammerCalculatorResult> {
  const { a, aBase, b, bBase, bitwiseOp, shiftDir, shiftAmount } = input;

  let aVal: bigint;
  let bVal: bigint;
  try {
    aVal = parseValue(a, aBase);
  } catch {
    return { ok: false, error: "Invalid value A", code: "INVALID_INPUT" };
  }
  try {
    bVal = parseValue(b, bBase);
  } catch {
    return { ok: false, error: "Invalid value B", code: "INVALID_INPUT" };
  }

  const aRep = represent(aVal);
  const bRep = represent(bVal);
  const notRep = represent(~aVal);

  let bitwise: RepresentationResult | null = null;
  if (bitwiseOp !== "none") {
    let r: bigint;
    if (bitwiseOp === "and") r = aVal & bVal;
    else if (bitwiseOp === "or") r = aVal | bVal;
    else r = aVal ^ bVal;
    bitwise = represent(r);
  }

  let shifted: RepresentationResult | null = null;
  if (shiftDir !== "none" && Number.isFinite(shiftAmount) && shiftAmount >= 0) {
    const n = BigInt(Math.trunc(shiftAmount));
    const r = shiftDir === "left" ? aVal << n : aVal >> n;
    shifted = represent(r);
  }

  return {
    ok: true,
    value: { a: aRep, b: bRep, bitwise, not: notRep, shifted },
  };
}
