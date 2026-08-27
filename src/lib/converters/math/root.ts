import type { CalculationResult } from "@/types";

export interface RootInput {
  radicand: number; // The number under the radical
  index: number; // The root index (2 for square root, 3 for cube root, etc.)
}

export interface RootResult {
  result: number;
  isRational: boolean;
  simplified: { coefficient: number; radicand: number } | null;
  formula: string;
  asFraction: { numerator: number; denominator: number } | null;
  verification: string;
  relatedRoots: Array<{ index: number; result: number }>;
}

function simplifyRadical(
  radicand: number,
  index: number
): { coefficient: number; radicand: number } | null {
  if (radicand <= 0 || index < 2 || !Number.isInteger(index)) return null;

  let coefficient = 1;
  let remaining = radicand;

  // Find perfect nth powers that divide the radicand
  for (let i = 2; i <= radicand ** (1 / index); i++) {
    const power = i ** index;
    while (remaining % power === 0) {
      coefficient *= i;
      remaining /= power;
    }
  }

  if (coefficient === 1 && remaining === radicand) {
    return null; // Cannot be simplified
  }

  return { coefficient, radicand: remaining };
}

export function calculateRoot(input: RootInput): CalculationResult<RootResult> {
  const { radicand, index } = input;

  // Validate inputs
  if (index < 1) {
    return { ok: false, error: "Root index must be at least 1", code: "INVALID_INPUT" };
  }
  if (radicand < 0 && index % 2 === 0) {
    return {
      ok: false,
      error: "Even roots of negative numbers are not real",
      code: "INVALID_INPUT",
    };
  }

  // Calculate the root
  let result: number;
  if (radicand < 0) {
    // Odd root of negative number
    result = -((-radicand) ** (1 / index));
  } else {
    result = radicand ** (1 / index);
  }

  // Check if result is rational (approximately an integer)
  const isRational = Math.abs(result - Math.round(result)) < 0.0000001;

  // Try to simplify the radical
  const simplified = radicand > 0 ? simplifyRadical(Math.round(radicand), Math.round(index)) : null;

  // Formula
  let formula: string;
  if (index === 2) {
    formula = `√${radicand} = ${result.toFixed(6)}`;
  } else if (index === 3) {
    formula = `∛${radicand} = ${result.toFixed(6)}`;
  } else {
    formula = `${index}√${radicand} = ${result.toFixed(6)}`;
  }

  // As fraction (only if rational)
  let asFraction: { numerator: number; denominator: number } | null = null;
  if (isRational) {
    asFraction = { numerator: Math.round(result), denominator: 1 };
  }

  // Verification
  const verification = `${result.toFixed(6)}^${index} = ${(result ** index).toFixed(6)} ≈ ${radicand}`;

  // Related roots
  const relatedRoots: Array<{ index: number; result: number }> = [];
  if (radicand >= 0) {
    relatedRoots.push({ index: 2, result: Math.sqrt(radicand) });
    relatedRoots.push({ index: 3, result: Math.cbrt(radicand) });
    relatedRoots.push({ index: 4, result: radicand ** 0.25 });
  }

  return {
    ok: true,
    value: {
      result,
      isRational,
      simplified,
      formula,
      asFraction,
      verification,
      relatedRoots,
    },
  };
}
