import type { CalculationResult } from "@/types";

export interface TriangleInput {
  mode: "sides" | "sasAngle" | "asaAngles" | "aasAngles";
  sideA?: number;
  sideB?: number;
  sideC?: number;
  angleA?: number; // degrees
  angleB?: number; // degrees
  angleC?: number; // degrees
}

export interface TriangleResult {
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  perimeter: number;
  area: number;
  semiperimeter: number;
  inradius: number;
  circumradius: number;
  type: string;
  angleType: string;
  isValid: boolean;
  altitudeA: number;
  altitudeB: number;
  altitudeC: number;
  medianA: number;
  medianB: number;
  medianC: number;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function calculateTriangle(input: TriangleInput): CalculationResult<TriangleResult> {
  const { mode } = input;

  let a: number, b: number, c: number;
  let A: number, B: number, C: number; // angles in degrees

  switch (mode) {
    case "sides": {
      // Given three sides (SSS)
      if (!input.sideA || !input.sideB || !input.sideC) {
        return {
          ok: false,
          error: "All three sides (sideA, sideB, sideC) are required for sides mode",
          code: "INVALID_INPUT",
        };
      }
      a = input.sideA;
      b = input.sideB;
      c = input.sideC;

      // Check triangle inequality
      if (a + b <= c || b + c <= a || a + c <= b) {
        return {
          ok: false,
          error: "The given sides do not form a valid triangle (triangle inequality violated)",
          code: "INVALID_INPUT",
        };
      }

      // Law of cosines to find angles
      A = toDegrees(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
      B = toDegrees(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
      C = 180 - A - B;
      break;
    }

    case "sasAngle": {
      // Given two sides and included angle (SAS)
      if (!input.sideA || !input.sideB || input.angleC === undefined) {
        return {
          ok: false,
          error:
            "Two sides (sideA, sideB) and included angle (angleC) are required for sasAngle mode",
          code: "INVALID_INPUT",
        };
      }
      a = input.sideA;
      b = input.sideB;
      C = input.angleC;

      if (C <= 0 || C >= 180) {
        return {
          ok: false,
          error: "Angle C must be between 0 and 180 degrees (exclusive)",
          code: "INVALID_INPUT",
        };
      }

      // Law of cosines to find third side
      c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRadians(C)));

      // Law of sines to find other angles
      A = toDegrees(Math.asin((a * Math.sin(toRadians(C))) / c));
      B = 180 - A - C;
      break;
    }

    case "asaAngles": {
      // Given two angles and included side (ASA)
      if (input.angleA === undefined || input.angleB === undefined || !input.sideC) {
        return {
          ok: false,
          error:
            "Two angles (angleA, angleB) and included side (sideC) are required for asaAngles mode",
          code: "INVALID_INPUT",
        };
      }
      A = input.angleA;
      B = input.angleB;
      c = input.sideC;

      C = 180 - A - B;
      if (C <= 0 || A <= 0 || B <= 0) {
        return {
          ok: false,
          error: "All angles must be positive and sum to 180 degrees",
          code: "INVALID_INPUT",
        };
      }

      // Law of sines
      a = (c * Math.sin(toRadians(A))) / Math.sin(toRadians(C));
      b = (c * Math.sin(toRadians(B))) / Math.sin(toRadians(C));
      break;
    }

    case "aasAngles": {
      // Given two angles and non-included side (AAS)
      if (input.angleA === undefined || input.angleB === undefined || !input.sideA) {
        return {
          ok: false,
          error: "Two angles (angleA, angleB) and side (sideA) are required for aasAngles mode",
          code: "INVALID_INPUT",
        };
      }
      A = input.angleA;
      B = input.angleB;
      a = input.sideA;

      C = 180 - A - B;
      if (C <= 0 || A <= 0 || B <= 0) {
        return {
          ok: false,
          error: "All angles must be positive and sum to 180 degrees",
          code: "INVALID_INPUT",
        };
      }

      // Law of sines
      b = (a * Math.sin(toRadians(B))) / Math.sin(toRadians(A));
      c = (a * Math.sin(toRadians(C))) / Math.sin(toRadians(A));
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  // Calculate properties
  const perimeter = a + b + c;
  const s = perimeter / 2; // semiperimeter

  // Area using Heron's formula
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  // Inradius: r = Area / s
  const inradius = area / s;

  // Circumradius: R = abc / (4 * Area)
  const circumradius = (a * b * c) / (4 * area);

  // Determine triangle type by sides
  let type: string;
  const tolerance = 0.0001;
  if (Math.abs(a - b) < tolerance && Math.abs(b - c) < tolerance) {
    type = "Equilateral";
  } else if (
    Math.abs(a - b) < tolerance ||
    Math.abs(b - c) < tolerance ||
    Math.abs(a - c) < tolerance
  ) {
    type = "Isosceles";
  } else {
    type = "Scalene";
  }

  // Determine angle type
  let angleType: string;
  const maxAngle = Math.max(A, B, C);
  if (Math.abs(maxAngle - 90) < tolerance) {
    angleType = "Right";
  } else if (maxAngle > 90) {
    angleType = "Obtuse";
  } else {
    angleType = "Acute";
  }

  // Altitudes
  const altitudeA = (2 * area) / a;
  const altitudeB = (2 * area) / b;
  const altitudeC = (2 * area) / c;

  // Medians
  const medianA = 0.5 * Math.sqrt(2 * b * b + 2 * c * c - a * a);
  const medianB = 0.5 * Math.sqrt(2 * a * a + 2 * c * c - b * b);
  const medianC = 0.5 * Math.sqrt(2 * a * a + 2 * b * b - c * c);

  return {
    ok: true,
    value: {
      sideA: a,
      sideB: b,
      sideC: c,
      angleA: A,
      angleB: B,
      angleC: C,
      perimeter,
      area,
      semiperimeter: s,
      inradius,
      circumradius,
      type,
      angleType,
      isValid: true,
      altitudeA,
      altitudeB,
      altitudeC,
      medianA,
      medianB,
      medianC,
    },
  };
}
