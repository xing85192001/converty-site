import type { CalculationResult } from "@/types";

export interface CompositionResult {
  fieldOfView: number; // degrees
  horizontalFOV: number;
  verticalFOV: number;
  subjectCoverage: number; // percentage of frame
  effectiveFocalLength: number;
  angleOfView: number;
}

// Calculate field of view and composition
export function calculateComposition(
  focalLength: number, // mm
  distance: number, // meters
  cropFactor: number = 1,
  sensorWidth: number = 36, // mm (full frame default)
  sensorHeight: number = 24 // mm
): CalculationResult<CompositionResult> {
  if (focalLength <= 0 || distance <= 0 || cropFactor <= 0) {
    return {
      ok: false,
      error: "Focal length, distance, and crop factor must be positive",
      code: "INVALID_INPUT",
    };
  }

  const effectiveFocalLength = focalLength * cropFactor;
  const effectiveSensorWidth = sensorWidth / cropFactor;
  const effectiveSensorHeight = sensorHeight / cropFactor;

  // Horizontal field of view: 2 * atan(sensor_width / (2 * focal_length))
  const horizontalFOV = 2 * Math.atan(effectiveSensorWidth / (2 * focalLength)) * (180 / Math.PI);
  const verticalFOV = 2 * Math.atan(effectiveSensorHeight / (2 * focalLength)) * (180 / Math.PI);

  // Diagonal field of view
  const sensorDiagonal = Math.sqrt(effectiveSensorWidth ** 2 + effectiveSensorHeight ** 2);
  const fieldOfView = 2 * Math.atan(sensorDiagonal / (2 * focalLength)) * (180 / Math.PI);

  // Calculate how much of the scene is covered at given distance
  const horizontalCoverage = 2 * distance * Math.tan((horizontalFOV / 2) * (Math.PI / 180));
  const _verticalCoverage = 2 * distance * Math.tan((verticalFOV / 2) * (Math.PI / 180));

  // Assuming a standard portrait (0.5m wide subject), calculate coverage
  const subjectWidth = 0.5; // meters
  const subjectCoverage = (subjectWidth / horizontalCoverage) * 100;

  return {
    ok: true,
    value: {
      fieldOfView: Math.round(fieldOfView * 10) / 10,
      horizontalFOV: Math.round(horizontalFOV * 10) / 10,
      verticalFOV: Math.round(verticalFOV * 10) / 10,
      subjectCoverage: Math.round(subjectCoverage * 10) / 10,
      effectiveFocalLength: Math.round(effectiveFocalLength),
      angleOfView: Math.round(fieldOfView * 10) / 10,
    },
  };
}

export const CROP_FACTORS = [
  { name: "Full Frame", factor: 1.0 },
  { name: "APS-C (Canon)", factor: 1.6 },
  { name: "APS-C (Nikon/Sony)", factor: 1.5 },
  { name: "Micro 4/3", factor: 2.0 },
  { name: "1 inch", factor: 2.7 },
  { name: "Medium Format", factor: 0.79 },
];

export const COMMON_FOCAL_LENGTHS = [14, 24, 35, 50, 85, 100, 135, 200, 300, 400];
