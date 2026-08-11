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
  steps: string[];
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

  const steps: string[] = [];
  steps.push(`Equation: ${a}x² + ${b}x + ${c} = 0`);

  // Discriminant
  const discriminant = b * b - 4 * a * c;
  steps.push(`Discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`);

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
    steps.push(`Two distinct real roots:`);
    steps.push(`x₁ = (-${b} + √${discriminant}) / (2 × ${a}) = ${roots.x1}`);
    steps.push(`x₂ = (-${b} - √${discriminant}) / (2 × ${a}) = ${roots.x2}`);
  } else if (discriminant === 0) {
    discriminantType = "zero";
    hasRealRoots = true;
    roots.x1 = -b / (2 * a);
    roots.x2 = roots.x1;
    steps.push(`One repeated real root:`);
    steps.push(`x = -${b} / (2 × ${a}) = ${roots.x1}`);
  } else {
    discriminantType = "negative";
    hasRealRoots = false;
    const realPart = -b / (2 * a);
    const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
    complexRoots = { real: realPart, imaginary: Math.abs(imaginaryPart) };
    steps.push(`Two complex conjugate roots:`);
    steps.push(`x = ${realPart.toFixed(4)} ± ${complexRoots.imaginary.toFixed(4)}i`);
  }

  // Vertex
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  steps.push(`Vertex: (-b/2a, f(-b/2a)) = (${vertexX.toFixed(4)}, ${vertexY.toFixed(4)})`);

  // Axis of symmetry
  const axisOfSymmetry = vertexX;

  // Y-intercept
  const yIntercept = c;
  steps.push(`Y-intercept: (0, ${yIntercept})`);

  // Direction
  const opensUpward = a > 0;
  steps.push(`Parabola opens ${opensUpward ? "upward" : "downward"} (a ${a > 0 ? ">" : "<"} 0)`);

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
