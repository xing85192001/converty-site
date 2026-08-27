import type { CalculationResult } from "@/types";

export interface PythagoreanInput {
  mode: "findHypotenuse" | "findLeg";
  sideA: number;
  sideB?: number;
  hypotenuse?: number;
}

export interface PythagoreanResult {
  sideA: number;
  sideB: number;
  hypotenuse: number;
  area: number;
  perimeter: number;
  angles: { A: number; B: number };
  isValid: boolean;
  formula: string;
  verification: string;
  pythagoreanTriples: Array<{ a: number; b: number; c: number }>;
  isPythagoreanTriple: boolean;
}

export function calculatePythagorean(
  input: PythagoreanInput
): CalculationResult<PythagoreanResult> {
  const { mode, sideA, sideB, hypotenuse } = input;

  let a: number, b: number, c: number;

  switch (mode) {
    case "findHypotenuse":
      if (!sideB || sideA <= 0 || sideB <= 0) {
        return {
          ok: false,
          error: "Both sides A and B must be positive to find the hypotenuse",
          code: "INVALID_INPUT",
        };
      }
      a = sideA;
      b = sideB;
      c = Math.sqrt(a * a + b * b);
      break;

    case "findLeg":
      if (!hypotenuse || sideA <= 0 || hypotenuse <= 0) {
        return {
          ok: false,
          error: "Side A and hypotenuse must be positive to find the other leg",
          code: "INVALID_INPUT",
        };
      }
      if (sideA >= hypotenuse) {
        return {
          ok: false,
          error: "Leg must be smaller than the hypotenuse",
          code: "INVALID_INPUT",
        };
      }
      a = sideA;
      c = hypotenuse;
      b = Math.sqrt(c * c - a * a);
      break;

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  // Calculate area
  const area = (a * b) / 2;

  // Calculate perimeter
  const perimeter = a + b + c;

  // Calculate angles (in degrees)
  const angleA = Math.atan(a / b) * (180 / Math.PI);
  const angleB = 90 - angleA;

  // Formula
  const formula = `a² + b² = c²\n${a.toFixed(4)}² + ${b.toFixed(4)}² = ${c.toFixed(4)}²`;

  // Verification
  const verification = `${(a * a).toFixed(4)} + ${(b * b).toFixed(4)} = ${(a * a + b * b).toFixed(4)} ≈ ${(c * c).toFixed(4)}`;

  // Check if it's a Pythagorean triple (all integers)
  const isPythagoreanTriple =
    Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && a * a + b * b === c * c;

  // Common Pythagorean triples
  const pythagoreanTriples = [
    { a: 3, b: 4, c: 5 },
    { a: 5, b: 12, c: 13 },
    { a: 8, b: 15, c: 17 },
    { a: 7, b: 24, c: 25 },
    { a: 20, b: 21, c: 29 },
    { a: 9, b: 40, c: 41 },
    { a: 12, b: 35, c: 37 },
    { a: 11, b: 60, c: 61 },
    { a: 6, b: 8, c: 10 },
    { a: 9, b: 12, c: 15 },
  ];

  return {
    ok: true,
    value: {
      sideA: a,
      sideB: b,
      hypotenuse: c,
      area,
      perimeter,
      angles: { A: angleA, B: angleB },
      isValid: true,
      formula,
      verification,
      pythagoreanTriples,
      isPythagoreanTriple,
    },
  };
}
