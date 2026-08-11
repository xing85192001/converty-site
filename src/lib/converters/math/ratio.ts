import type { CalculationResult } from "@/types";

export interface RatioInput {
  mode: "simplify" | "scale" | "findMissing" | "compare";
  a: number;
  b: number;
  c?: number;
  d?: number;
  scaleFactor?: number;
  targetValue?: number;
}

export interface RatioResult {
  simplified: { a: number; b: number };
  decimal: number;
  percentage: number;
  fraction: string;
  scaled?: { a: number; b: number };
  missing?: number;
  comparison?: string;
  steps: string[];
  equivalentRatios: Array<{ a: number; b: number }>;
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

function simplifyRatio(a: number, b: number): { a: number; b: number } {
  if (b === 0) return { a, b };
  const divisor = gcd(a, b);
  return { a: a / divisor, b: b / divisor };
}

export function calculateRatio(input: RatioInput): CalculationResult<RatioResult> {
  const { mode, a, b } = input;

  if (b === 0 && mode !== "findMissing") {
    return { ok: false, error: "Second ratio value (b) cannot be zero", code: "DIVISION_BY_ZERO" };
  }

  const steps: string[] = [];
  const simplified = simplifyRatio(a, b);
  const decimal = b !== 0 ? a / b : 0;
  const percentage = decimal * 100;
  const fraction = `${simplified.a}/${simplified.b}`;

  steps.push(`Original ratio: ${a}:${b}`);
  steps.push(`GCD(${a}, ${b}) = ${gcd(a, b)}`);
  steps.push(`Simplified: ${simplified.a}:${simplified.b}`);

  // Generate equivalent ratios
  const equivalentRatios: Array<{ a: number; b: number }> = [];
  for (let i = 1; i <= 10; i++) {
    equivalentRatios.push({ a: simplified.a * i, b: simplified.b * i });
  }

  let scaled: { a: number; b: number } | undefined;
  let missing: number | undefined;
  let comparison: string | undefined;

  switch (mode) {
    case "simplify":
      // Already done above
      break;

    case "scale": {
      const { scaleFactor, targetValue } = input;
      if (scaleFactor !== undefined) {
        scaled = { a: a * scaleFactor, b: b * scaleFactor };
        steps.push(`Scaled by ${scaleFactor}: ${scaled.a}:${scaled.b}`);
      } else if (targetValue !== undefined) {
        const factor = targetValue / a;
        scaled = { a: targetValue, b: b * factor };
        steps.push(`Scaled to make first value ${targetValue}: ${scaled.a}:${scaled.b}`);
      }
      break;
    }

    case "findMissing": {
      // a:b = c:d, find missing value
      const { c, d } = input;
      if (c !== undefined && d === undefined) {
        // a:b = c:? → ? = (b × c) / a
        if (a === 0) {
          return {
            ok: false,
            error: "First ratio value (a) cannot be zero when finding missing value",
            code: "DIVISION_BY_ZERO",
          };
        }
        missing = (b * c) / a;
        steps.push(`${a}:${b} = ${c}:?`);
        steps.push(`? = (${b} × ${c}) / ${a} = ${missing}`);
      } else if (c === undefined && d !== undefined) {
        // a:b = ?:d → ? = (a × d) / b
        if (b === 0) {
          return {
            ok: false,
            error: "Second ratio value (b) cannot be zero when finding missing value",
            code: "DIVISION_BY_ZERO",
          };
        }
        missing = (a * d) / b;
        steps.push(`${a}:${b} = ?:${d}`);
        steps.push(`? = (${a} × ${d}) / ${b} = ${missing}`);
      }
      break;
    }

    case "compare": {
      const { c, d } = input;
      if (c === undefined || d === undefined || d === 0) {
        return {
          ok: false,
          error: "Valid c and non-zero d are required for comparison",
          code: "INVALID_INPUT",
        };
      }

      const ratio1 = a / b;
      const ratio2 = c / d;

      if (Math.abs(ratio1 - ratio2) < 0.0000001) {
        comparison = `${a}:${b} = ${c}:${d} (equivalent)`;
      } else if (ratio1 > ratio2) {
        comparison = `${a}:${b} > ${c}:${d}`;
      } else {
        comparison = `${a}:${b} < ${c}:${d}`;
      }

      steps.push(`Comparing ${a}:${b} with ${c}:${d}`);
      steps.push(`${a}/${b} = ${ratio1.toFixed(6)}`);
      steps.push(`${c}/${d} = ${ratio2.toFixed(6)}`);
      steps.push(comparison);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      simplified,
      decimal,
      percentage,
      fraction,
      scaled,
      missing,
      comparison,
      steps,
      equivalentRatios,
    },
  };
}
