import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface SlopeInput {
  mode: "twoPoints" | "slopeIntercept" | "pointSlope";
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  slope?: number;
  yIntercept?: number;
}

export interface SlopeResult {
  slope: number | null;
  yIntercept: number;
  xIntercept: number | null;
  slopeInterceptForm: string;
  pointSlopeForm: string;
  standardForm: string;
  angle: number; // degrees from horizontal
  distance: number | null;
  midpoint: { x: number; y: number } | null;
  isVertical: boolean;
  isHorizontal: boolean;
  slopeType: string;
  steps: CalcStep[];
  parallelSlope: number | null;
  perpendicularSlope: number | null;
}

export function calculateSlope(input: SlopeInput): CalculationResult<SlopeResult> {
  const { mode } = input;
  const steps: CalcStep[] = [];

  let slope: number | null;
  let yIntercept: number;
  let x1: number, y1: number;
  let x2: number | undefined, y2: number | undefined;

  switch (mode) {
    case "twoPoints": {
      if (
        input.x1 === undefined ||
        input.y1 === undefined ||
        input.x2 === undefined ||
        input.y2 === undefined
      ) {
        return {
          ok: false,
          error: "All four coordinates (x1, y1, x2, y2) are required for twoPoints mode",
          code: "INVALID_INPUT",
        };
      }
      x1 = input.x1;
      y1 = input.y1;
      x2 = input.x2;
      y2 = input.y2;

      steps.push({ key: "point1", params: { x1, y1 } });
      steps.push({ key: "point2", params: { x2, y2 } });

      // Check for vertical line
      if (x2 - x1 === 0) {
        slope = null; // undefined slope (vertical line)
        yIntercept = NaN;
        steps.push({ key: "verticalLine" });
      } else {
        slope = (y2 - y1) / (x2 - x1);
        yIntercept = y1 - slope * x1;
        steps.push({ key: "slopeCalc", params: { y2, y1, x2, x1, slope } });
        steps.push({ key: "yInterceptCalc", params: { y1, slope, x1, yIntercept } });
      }
      break;
    }

    case "slopeIntercept": {
      if (input.slope === undefined || input.yIntercept === undefined) {
        return {
          ok: false,
          error: "Slope and y-intercept are required for slopeIntercept mode",
          code: "INVALID_INPUT",
        };
      }
      slope = input.slope;
      yIntercept = input.yIntercept;
      x1 = 0;
      y1 = yIntercept;
      x2 = 1;
      y2 = yIntercept + slope;

      steps.push({ key: "givenSlopeIntercept", params: { slope, yIntercept } });
      break;
    }

    case "pointSlope": {
      if (input.x1 === undefined || input.y1 === undefined || input.slope === undefined) {
        return {
          ok: false,
          error: "Point (x1, y1) and slope are required for pointSlope mode",
          code: "INVALID_INPUT",
        };
      }
      x1 = input.x1;
      y1 = input.y1;
      slope = input.slope;
      yIntercept = y1 - slope * x1;

      steps.push({ key: "givenPointSlope", params: { x1, y1, slope } });
      steps.push({ key: "pointSlopeYIntercept", params: { y1, slope, x1, yIntercept } });
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  // Calculate properties
  const isVertical = slope === null;
  const isHorizontal = slope === 0;

  // X-intercept (where y = 0)
  let xIntercept: number | null = null;
  if (slope !== null && slope !== 0) {
    xIntercept = -yIntercept / slope;
    steps.push({ key: "xIntercept", params: { xIntercept } });
  } else if (slope === 0) {
    xIntercept = null; // Horizontal line (no x-intercept unless at y=0)
    if (yIntercept === 0) {
      xIntercept = 0; // Line is y = 0 (x-axis)
    }
  }

  // Angle from horizontal
  const angle = slope !== null ? Math.atan(slope) * (180 / Math.PI) : 90;

  // Distance between points (if two points given)
  let distance: number | null = null;
  let midpoint: { x: number; y: number } | null = null;
  if (x2 !== undefined && y2 !== undefined) {
    distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    midpoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    steps.push({ key: "distance", params: { distance: distance.toFixed(6) } });
    steps.push({ key: "midpoint", params: { x: midpoint.x, y: midpoint.y } });
  }

  // Slope type
  let slopeType: string;
  if (isVertical) {
    slopeType = "Vertical (undefined)";
  } else if (isHorizontal) {
    slopeType = "Horizontal (zero)";
  } else if (slope! > 0) {
    slopeType = "Positive (rising)";
  } else {
    slopeType = "Negative (falling)";
  }

  // Equation forms
  let slopeInterceptForm: string;
  let pointSlopeForm: string;
  let standardForm: string;

  if (isVertical) {
    slopeInterceptForm = "undefined (vertical line)";
    pointSlopeForm = `x = ${x1}`;
    standardForm = `x = ${x1}`;
  } else {
    const m = slope!;
    const b = yIntercept;

    slopeInterceptForm = `y = ${m}x ${b >= 0 ? "+" : ""}${b}`;
    pointSlopeForm = `y - ${y1} = ${m}(x - ${x1})`;

    // Standard form: Ax + By = C
    const A = -m;
    const B = 1;
    const C = b;
    standardForm = `${A}x + ${B}y = ${C}`;
  }

  // Parallel and perpendicular slopes
  const parallelSlope = slope;
  const perpendicularSlope = slope !== null && slope !== 0 ? -1 / slope : slope === 0 ? null : 0;

  return {
    ok: true,
    value: {
      slope,
      yIntercept,
      xIntercept,
      slopeInterceptForm,
      pointSlopeForm,
      standardForm,
      angle,
      distance,
      midpoint,
      isVertical,
      isHorizontal,
      slopeType,
      steps,
      parallelSlope,
      perpendicularSlope,
    },
  };
}
