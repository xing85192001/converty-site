import type { CalculationResult } from "@/types";

export interface DistanceInput {
  mode: "twoPoints2D" | "twoPoints3D" | "pointToLine" | "manhattan" | "haversine";
  // 2D points
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // 3D points
  z1?: number;
  z2?: number;
  // Line equation: ax + by + c = 0
  lineA?: number;
  lineB?: number;
  lineC?: number;
  // Geographic coordinates (for haversine)
  lat1?: number;
  lon1?: number;
  lat2?: number;
  lon2?: number;
}

export interface DistanceResult {
  distance: number;
  distanceType: string;
  unit: string;
  formula: string;
  steps: string[];
  midpoint?: { x: number; y: number; z?: number };
  bearing?: number; // For haversine
}

const EARTH_RADIUS_KM = 6371;
const _EARTH_RADIUS_MILES = 3959;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function calculateDistance(input: DistanceInput): CalculationResult<DistanceResult> {
  const { mode } = input;
  const steps: string[] = [];
  let distance: number;
  let distanceType: string;
  let unit: string;
  let formula: string;
  let midpoint: { x: number; y: number; z?: number } | undefined;
  let bearing: number | undefined;

  switch (mode) {
    case "twoPoints2D": {
      const { x1, y1, x2, y2 } = input;
      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        return {
          ok: false,
          error: "All four coordinates (x1, y1, x2, y2) are required",
          code: "INVALID_INPUT",
        };
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      distance = Math.sqrt(dx * dx + dy * dy);
      distanceType = "Euclidean Distance (2D)";
      unit = "units";
      formula = "d = √[(x₂-x₁)² + (y₂-y₁)²]";

      midpoint = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
      };

      steps.push(`Point 1: (${x1}, ${y1})`);
      steps.push(`Point 2: (${x2}, ${y2})`);
      steps.push(`Δx = ${x2} - ${x1} = ${dx}`);
      steps.push(`Δy = ${y2} - ${y1} = ${dy}`);
      steps.push(`d = √(${dx}² + ${dy}²)`);
      steps.push(`d = √(${dx * dx} + ${dy * dy})`);
      steps.push(`d = √${dx * dx + dy * dy}`);
      steps.push(`d = ${distance.toFixed(6)}`);
      steps.push(`Midpoint: (${midpoint.x}, ${midpoint.y})`);
      break;
    }

    case "twoPoints3D": {
      const { x1, y1, z1, x2, y2, z2 } = input;
      if (
        x1 === undefined ||
        y1 === undefined ||
        z1 === undefined ||
        x2 === undefined ||
        y2 === undefined ||
        z2 === undefined
      ) {
        return {
          ok: false,
          error: "All six coordinates (x1, y1, z1, x2, y2, z2) are required",
          code: "INVALID_INPUT",
        };
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      distanceType = "Euclidean Distance (3D)";
      unit = "units";
      formula = "d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]";

      midpoint = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        z: (z1 + z2) / 2,
      };

      steps.push(`Point 1: (${x1}, ${y1}, ${z1})`);
      steps.push(`Point 2: (${x2}, ${y2}, ${z2})`);
      steps.push(`Δx = ${dx}, Δy = ${dy}, Δz = ${dz}`);
      steps.push(`d = √(${dx}² + ${dy}² + ${dz}²)`);
      steps.push(`d = √(${dx * dx} + ${dy * dy} + ${dz * dz})`);
      steps.push(`d = ${distance.toFixed(6)}`);
      steps.push(`Midpoint: (${midpoint.x}, ${midpoint.y}, ${midpoint.z})`);
      break;
    }

    case "pointToLine": {
      const { x1, y1, lineA, lineB, lineC } = input;
      if (
        x1 === undefined ||
        y1 === undefined ||
        lineA === undefined ||
        lineB === undefined ||
        lineC === undefined
      ) {
        return {
          ok: false,
          error: "Point coordinates and line coefficients (a, b, c) are required",
          code: "INVALID_INPUT",
        };
      }

      // Distance from point (x₁, y₁) to line ax + by + c = 0
      // d = |ax₁ + by₁ + c| / √(a² + b²)
      const numerator = Math.abs(lineA * x1 + lineB * y1 + lineC);
      const denominator = Math.sqrt(lineA * lineA + lineB * lineB);

      if (denominator === 0) {
        return {
          ok: false,
          error: "Line coefficients a and b cannot both be zero",
          code: "DIVISION_BY_ZERO",
        };
      }

      distance = numerator / denominator;
      distanceType = "Point to Line Distance";
      unit = "units";
      formula = "d = |ax₁ + by₁ + c| / √(a² + b²)";

      steps.push(`Point: (${x1}, ${y1})`);
      steps.push(`Line: ${lineA}x + ${lineB}y + ${lineC} = 0`);
      steps.push(`d = |${lineA}(${x1}) + ${lineB}(${y1}) + ${lineC}| / √(${lineA}² + ${lineB}²)`);
      steps.push(`d = |${lineA * x1 + lineB * y1 + lineC}| / √(${lineA * lineA + lineB * lineB})`);
      steps.push(`d = ${numerator} / ${denominator.toFixed(6)}`);
      steps.push(`d = ${distance.toFixed(6)}`);
      break;
    }

    case "manhattan": {
      const { x1, y1, x2, y2 } = input;
      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        return {
          ok: false,
          error: "All four coordinates (x1, y1, x2, y2) are required",
          code: "INVALID_INPUT",
        };
      }

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      distance = dx + dy;
      distanceType = "Manhattan Distance (L1)";
      unit = "units";
      formula = "d = |x₂-x₁| + |y₂-y₁|";

      steps.push(`Point 1: (${x1}, ${y1})`);
      steps.push(`Point 2: (${x2}, ${y2})`);
      steps.push(`d = |${x2} - ${x1}| + |${y2} - ${y1}|`);
      steps.push(`d = ${dx} + ${dy}`);
      steps.push(`d = ${distance}`);
      steps.push("(Also known as taxicab or city block distance)");
      break;
    }

    case "haversine": {
      const { lat1, lon1, lat2, lon2 } = input;
      if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
        return {
          ok: false,
          error: "All four geographic coordinates (lat1, lon1, lat2, lon2) are required",
          code: "INVALID_INPUT",
        };
      }

      // Haversine formula for great-circle distance
      const φ1 = toRadians(lat1);
      const φ2 = toRadians(lat2);
      const Δφ = toRadians(lat2 - lat1);
      const Δλ = toRadians(lon2 - lon1);

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      distance = EARTH_RADIUS_KM * c;
      distanceType = "Great-Circle Distance (Haversine)";
      unit = "km";
      formula = "d = R × c, where c = 2 × atan2(√a, √(1−a))";

      // Calculate bearing
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

      steps.push(`Location 1: (${lat1}°, ${lon1}°)`);
      steps.push(`Location 2: (${lat2}°, ${lon2}°)`);
      steps.push(`Converting to radians...`);
      steps.push(`φ₁ = ${φ1.toFixed(6)} rad, φ₂ = ${φ2.toFixed(6)} rad`);
      steps.push(`Δφ = ${Δφ.toFixed(6)} rad, Δλ = ${Δλ.toFixed(6)} rad`);
      steps.push(`a = sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2) = ${a.toFixed(6)}`);
      steps.push(`c = 2 × atan2(√${a.toFixed(4)}, √${(1 - a).toFixed(4)}) = ${c.toFixed(6)} rad`);
      steps.push(`d = ${EARTH_RADIUS_KM} × ${c.toFixed(6)} = ${distance.toFixed(2)} km`);
      steps.push(`d = ${(distance * 0.621371).toFixed(2)} miles`);
      steps.push(`Initial bearing: ${bearing.toFixed(1)}°`);
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      distance,
      distanceType,
      unit,
      formula,
      steps,
      midpoint,
      bearing,
    },
  };
}
