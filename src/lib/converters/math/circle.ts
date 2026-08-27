import type { CalculationResult } from "@/types";

export interface CircleInput {
  mode: "radius" | "diameter" | "circumference" | "area";
  value: number;
}

export interface CircleResult {
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
  arcLength: (degrees: number) => number;
  sectorArea: (degrees: number) => number;
  chordLength: (degrees: number) => number;
  formulas: {
    circumference: string;
    area: string;
    arcLength: string;
    sectorArea: string;
  };
  commonAngles: Array<{
    degrees: number;
    arcLength: number;
    sectorArea: number;
    chordLength: number;
  }>;
}

export function calculateCircle(input: CircleInput): CalculationResult<CircleResult> {
  const { mode, value } = input;

  if (value <= 0) {
    return { ok: false, error: "Value must be positive", code: "INVALID_INPUT" };
  }

  let radius: number;

  switch (mode) {
    case "radius":
      radius = value;
      break;
    case "diameter":
      radius = value / 2;
      break;
    case "circumference":
      radius = value / (2 * Math.PI);
      break;
    case "area":
      radius = Math.sqrt(value / Math.PI);
      break;
    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const diameter = radius * 2;
  const circumference = 2 * Math.PI * radius;
  const area = Math.PI * radius * radius;

  // Arc length for a given angle in degrees
  const arcLength = (degrees: number): number => {
    return (degrees / 360) * circumference;
  };

  // Sector area for a given angle in degrees
  const sectorArea = (degrees: number): number => {
    return (degrees / 360) * area;
  };

  // Chord length for a given central angle in degrees
  const chordLength = (degrees: number): number => {
    const radians = (degrees * Math.PI) / 180;
    return 2 * radius * Math.sin(radians / 2);
  };

  const formulas = {
    circumference: `C = 2πr = 2 × π × ${radius.toFixed(4)} = ${circumference.toFixed(4)}`,
    area: `A = πr² = π × ${radius.toFixed(4)}² = ${area.toFixed(4)}`,
    arcLength: `Arc = (θ/360) × 2πr`,
    sectorArea: `Sector = (θ/360) × πr²`,
  };

  // Calculate for common angles
  const commonAngles = [30, 45, 60, 90, 120, 180, 270].map((degrees) => ({
    degrees,
    arcLength: arcLength(degrees),
    sectorArea: sectorArea(degrees),
    chordLength: chordLength(degrees),
  }));

  return {
    ok: true,
    value: {
      radius,
      diameter,
      circumference,
      area,
      arcLength,
      sectorArea,
      chordLength,
      formulas,
      commonAngles,
    },
  };
}
