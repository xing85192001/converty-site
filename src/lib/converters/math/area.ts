import type { CalculationResult } from "@/types";

export interface AreaInput {
  shape:
    | "rectangle"
    | "square"
    | "triangle"
    | "circle"
    | "trapezoid"
    | "parallelogram"
    | "ellipse"
    | "sector"
    | "rhombus";
  // Rectangle/Square
  length?: number;
  width?: number;
  // Triangle
  base?: number;
  height?: number;
  // Circle/Ellipse
  radius?: number;
  radiusA?: number;
  radiusB?: number;
  // Trapezoid
  base1?: number;
  base2?: number;
  // Sector
  angle?: number; // degrees
  // Rhombus
  diagonal1?: number;
  diagonal2?: number;
}

export interface AreaResult {
  area: number;
  perimeter: number | null;
  formula: string;
  steps: string[];
  unit: string;
}

export function calculateArea(input: AreaInput): CalculationResult<AreaResult> {
  const { shape } = input;
  let area: number;
  let perimeter: number | null = null;
  let formula: string;
  const steps: string[] = [];

  switch (shape) {
    case "rectangle": {
      const { length, width } = input;
      if (!length || !width || length <= 0 || width <= 0) {
        return { ok: false, error: "Length and width must be positive", code: "INVALID_INPUT" };
      }
      area = length * width;
      perimeter = 2 * (length + width);
      formula = "A = length × width";
      steps.push(`A = ${length} × ${width}`);
      steps.push(`A = ${area}`);
      break;
    }

    case "square": {
      const { length } = input;
      if (!length || length <= 0) {
        return { ok: false, error: "Side length must be positive", code: "INVALID_INPUT" };
      }
      area = length * length;
      perimeter = 4 * length;
      formula = "A = side²";
      steps.push(`A = ${length}²`);
      steps.push(`A = ${area}`);
      break;
    }

    case "triangle": {
      const { base, height } = input;
      if (!base || !height || base <= 0 || height <= 0) {
        return { ok: false, error: "Base and height must be positive", code: "INVALID_INPUT" };
      }
      area = 0.5 * base * height;
      formula = "A = ½ × base × height";
      steps.push(`A = ½ × ${base} × ${height}`);
      steps.push(`A = ${area}`);
      break;
    }

    case "circle": {
      const { radius } = input;
      if (!radius || radius <= 0) {
        return { ok: false, error: "Radius must be positive", code: "INVALID_INPUT" };
      }
      area = Math.PI * radius * radius;
      perimeter = 2 * Math.PI * radius; // Circumference
      formula = "A = πr²";
      steps.push(`A = π × ${radius}²`);
      steps.push(`A = π × ${radius * radius}`);
      steps.push(`A = ${area.toFixed(6)}`);
      break;
    }

    case "trapezoid": {
      const { base1, base2, height } = input;
      if (!base1 || !base2 || !height || base1 <= 0 || base2 <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Both bases and height must be positive",
          code: "INVALID_INPUT",
        };
      }
      area = 0.5 * (base1 + base2) * height;
      formula = "A = ½ × (base₁ + base₂) × height";
      steps.push(`A = ½ × (${base1} + ${base2}) × ${height}`);
      steps.push(`A = ½ × ${base1 + base2} × ${height}`);
      steps.push(`A = ${area}`);
      break;
    }

    case "parallelogram": {
      const { base, height } = input;
      if (!base || !height || base <= 0 || height <= 0) {
        return { ok: false, error: "Base and height must be positive", code: "INVALID_INPUT" };
      }
      area = base * height;
      formula = "A = base × height";
      steps.push(`A = ${base} × ${height}`);
      steps.push(`A = ${area}`);
      break;
    }

    case "ellipse": {
      const { radiusA, radiusB } = input;
      if (!radiusA || !radiusB || radiusA <= 0 || radiusB <= 0) {
        return { ok: false, error: "Both radii must be positive", code: "INVALID_INPUT" };
      }
      area = Math.PI * radiusA * radiusB;
      // Approximate perimeter using Ramanujan's formula
      const h = (radiusA - radiusB) ** 2 / (radiusA + radiusB) ** 2;
      perimeter = Math.PI * (radiusA + radiusB) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      formula = "A = π × a × b";
      steps.push(`A = π × ${radiusA} × ${radiusB}`);
      steps.push(`A = ${area.toFixed(6)}`);
      break;
    }

    case "sector": {
      const { radius, angle } = input;
      if (!radius || !angle || radius <= 0 || angle <= 0 || angle > 360) {
        return {
          ok: false,
          error: "Radius must be positive and angle must be between 0 and 360",
          code: "INVALID_INPUT",
        };
      }
      area = (angle / 360) * Math.PI * radius * radius;
      const arcLength = (angle / 360) * 2 * Math.PI * radius;
      perimeter = arcLength + 2 * radius;
      formula = "A = (θ/360) × πr²";
      steps.push(`A = (${angle}/360) × π × ${radius}²`);
      steps.push(`A = ${(angle / 360).toFixed(6)} × ${(Math.PI * radius * radius).toFixed(6)}`);
      steps.push(`A = ${area.toFixed(6)}`);
      break;
    }

    case "rhombus": {
      const { diagonal1, diagonal2 } = input;
      if (!diagonal1 || !diagonal2 || diagonal1 <= 0 || diagonal2 <= 0) {
        return { ok: false, error: "Both diagonals must be positive", code: "INVALID_INPUT" };
      }
      area = 0.5 * diagonal1 * diagonal2;
      const side = Math.sqrt((diagonal1 / 2) ** 2 + (diagonal2 / 2) ** 2);
      perimeter = 4 * side;
      formula = "A = ½ × d₁ × d₂";
      steps.push(`A = ½ × ${diagonal1} × ${diagonal2}`);
      steps.push(`A = ${area}`);
      break;
    }

    default:
      return { ok: false, error: "Unknown shape specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      area,
      perimeter,
      formula,
      steps,
      unit: "square units",
    },
  };
}
