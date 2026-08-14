import type { CalcStep } from "@/lib/calc-step";
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
  steps: CalcStep[];
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
  const steps: CalcStep[] = [];
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

      steps.push({ key: "twoPoints2DPoint1", params: { x: x1, y: y1 } });
      steps.push({ key: "twoPoints2DPoint2", params: { x: x2, y: y2 } });
      steps.push({ key: "twoPoints2DDx", params: { x2, x1, dx } });
      steps.push({ key: "twoPoints2DDy", params: { y2, y1, dy } });
      steps.push({ key: "twoPoints2DFormula1", params: { dx, dy } });
      steps.push({
        key: "twoPoints2DFormula2",
        params: { dxSquared: dx * dx, dySquared: dy * dy },
      });
      steps.push({ key: "twoPoints2DFormula3", params: { sum: dx * dx + dy * dy } });
      steps.push({ key: "twoPoints2DResult", params: { distance: distance.toFixed(6) } });
      steps.push({ key: "twoPoints2DMidpoint", params: { x: midpoint.x, y: midpoint.y } });
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

      steps.push({ key: "twoPoints3DPoint1", params: { x: x1, y: y1, z: z1 } });
      steps.push({ key: "twoPoints3DPoint2", params: { x: x2, y: y2, z: z2 } });
      steps.push({ key: "twoPoints3DDelta", params: { dx, dy, dz } });
      steps.push({ key: "twoPoints3DFormula1", params: { dx, dy, dz } });
      steps.push({
        key: "twoPoints3DFormula2",
        params: { dxSquared: dx * dx, dySquared: dy * dy, dzSquared: dz * dz },
      });
      steps.push({ key: "twoPoints3DResult", params: { distance: distance.toFixed(6) } });
      steps.push({
        key: "twoPoints3DMidpoint",
        params: { x: midpoint.x, y: midpoint.y, z: midpoint.z ?? 0 },
      });
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

      steps.push({ key: "pointToLinePoint", params: { x: x1, y: y1 } });
      steps.push({ key: "pointToLineLine", params: { a: lineA, b: lineB, c: lineC } });
      steps.push({
        key: "pointToLineFormula1",
        params: { a: lineA, x: x1, b: lineB, y: y1, c: lineC },
      });
      steps.push({
        key: "pointToLineFormula2",
        params: {
          numerator: lineA * x1 + lineB * y1 + lineC,
          denomSquared: lineA * lineA + lineB * lineB,
        },
      });
      steps.push({
        key: "pointToLineFormula3",
        params: { numerator, denominator: denominator.toFixed(6) },
      });
      steps.push({ key: "pointToLineResult", params: { distance: distance.toFixed(6) } });
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

      steps.push({ key: "manhattanPoint1", params: { x: x1, y: y1 } });
      steps.push({ key: "manhattanPoint2", params: { x: x2, y: y2 } });
      steps.push({ key: "manhattanFormula1", params: { x2, x1, y2, y1 } });
      steps.push({ key: "manhattanFormula2", params: { dx, dy } });
      steps.push({ key: "manhattanResult", params: { distance } });
      steps.push({ key: "manhattanNote" });
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

      steps.push({ key: "haversineLocation1", params: { lat: lat1, lon: lon1 } });
      steps.push({ key: "haversineLocation2", params: { lat: lat2, lon: lon2 } });
      steps.push({ key: "haversineConverting" });
      steps.push({ key: "haversinePhi", params: { phi1: φ1.toFixed(6), phi2: φ2.toFixed(6) } });
      steps.push({
        key: "haversineDelta",
        params: { deltaPhi: Δφ.toFixed(6), deltaLambda: Δλ.toFixed(6) },
      });
      steps.push({ key: "haversineA", params: { a: a.toFixed(6) } });
      steps.push({
        key: "haversineC",
        params: { a: a.toFixed(4), oneMinusA: (1 - a).toFixed(4), c: c.toFixed(6) },
      });
      steps.push({
        key: "haversineDistanceKm",
        params: { radius: EARTH_RADIUS_KM, c: c.toFixed(6), distance: distance.toFixed(2) },
      });
      steps.push({
        key: "haversineDistanceMiles",
        params: { distance: (distance * 0.621371).toFixed(2) },
      });
      steps.push({ key: "haversineBearing", params: { bearing: bearing.toFixed(1) } });
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
