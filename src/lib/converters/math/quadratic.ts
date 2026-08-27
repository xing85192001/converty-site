import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface QuadraticInput {
  a: number;
  b: number;
  c: number;
}

export interface QuadraticResult {
  hasRealRoots: boolean;
  discriminant: number;
  discriminantType: "positive" | "zero" | "negative";
  roots: { x1: number | null; x2: number | null };
  complexRoots: { real: number; imaginary: number } | null;
  vertex: { x: number; y: number };
  axisOfSymmetry: number;
  yIntercept: number;
  opensUpward: boolean;
  formula: string;
  steps: CalcStep[];
}

export function calculateQuadratic(input: QuadraticInput): CalculationResult<QuadraticResult> {
  const { a, b, c } = input;

  if (a === 0) {
    return {
      ok: false,
      error: "Coefficient 'a' cannot be zero (not a quadratic equation)",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];
  steps.push({ key: "equation", params: { a, b, c } });

  // Discriminant
  const discriminant = b * b - 4 * a * c;
  steps.push({ key: "discriminant", params: { b, a, c, discriminant } });

  let discriminantType: "positive" | "zero" | "negative";
  let hasRealRoots: boolean;
  const roots: { x1: number | null; x2: number | null } = { x1: null, x2: null };
  let complexRoots: { real: number; imaginary: number } | null = null;

  if (discriminant > 0) {
    discriminantType = "positive";
    hasRealRoots = true;
    const sqrtD = Math.sqrt(discriminant);
    roots.x1 = (-b + sqrtD) / (2 * a);
    roots.x2 = (-b - sqrtD) / (2 * a);
    steps.push({ key: "twoRealRoots" });
    steps.push({ key: "root1", params: { b, discriminant, a, x: roots.x1 } });
    steps.push({ key: "root2", params: { b, discriminant, a, x: roots.x2 } });
  } else if (discriminant === 0) {
    discriminantType = "zero";
    hasRealRoots = true;
    roots.x1 = -b / (2 * a);
    roots.x2 = roots.x1;
    steps.push({ key: "oneRealRoot" });
    steps.push({ key: "repeatedRoot", params: { b, a, x: roots.x1 } });
  } else {
    discriminantType = "negative";
    hasRealRoots = false;
    const realPart = -b / (2 * a);
    const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
    complexRoots = { real: realPart, imaginary: Math.abs(imaginaryPart) };
    steps.push({ key: "complexRoots" });
    steps.push({
      key: "complexRootResult",
      params: { real: realPart.toFixed(4), imaginary: complexRoots.imaginary.toFixed(4) },
    });
  }

  // Vertex
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  steps.push({ key: "vertex", params: { x: vertexX.toFixed(4), y: vertexY.toFixed(4) } });

  // Axis of symmetry
  const axisOfSymmetry = vertexX;

  // Y-intercept
  const yIntercept = c;
  steps.push({ key: "yIntercept", params: { yIntercept } });

  // Direction
  const opensUpward = a > 0;
  steps.push({
    key: "parabolaDirection",
    params: { direction: opensUpward ? "upward" : "downward", a, comparison: a > 0 ? ">" : "<" },
  });

  // Standard form
  const formula = `f(x) = ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c}`;

  return {
    ok: true,
    value: {
      hasRealRoots,
      discriminant,
      discriminantType,
      roots,
      complexRoots,
      vertex: { x: vertexX, y: vertexY },
      axisOfSymmetry,
      yIntercept,
      opensUpward,
      formula,
      steps,
    },
  };
}
