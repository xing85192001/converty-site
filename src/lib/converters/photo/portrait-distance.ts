import type { CalculationResult } from "@/types";

export interface PortraitDistanceResult {
  recommendedDistance: number; // meters
  minimumDistance: number;
  maximumDistance: number;
  fieldOfView: number; // degrees
  subjectHeight: number; // meters that fit in frame
  compressionEffect: string;
  description: string;
}

export type PortraitType =
  | "headshot"
  | "head-shoulders"
  | "half-body"
  | "full-body"
  | "environmental";

const PORTRAIT_COVERAGE: Record<PortraitType, { height: number; name: string }> = {
  headshot: { height: 0.3, name: "Headshot" },
  "head-shoulders": { height: 0.5, name: "Head & Shoulders" },
  "half-body": { height: 1.0, name: "Half Body" },
  "full-body": { height: 1.8, name: "Full Body" },
  environmental: { height: 3.0, name: "Environmental" },
};

export function calculatePortraitDistance(
  focalLength: number, // mm
  portraitType: PortraitType,
  cropFactor: number = 1,
  sensorHeight: number = 24 // mm (full frame default)
): CalculationResult<PortraitDistanceResult> {
  if (focalLength <= 0 || cropFactor <= 0) {
    return {
      ok: false,
      error: "Focal length and crop factor must be positive",
      code: "INVALID_INPUT",
    };
  }

  const effectiveFocalLength = focalLength * cropFactor;
  const effectiveSensorHeight = sensorHeight / cropFactor;

  const targetHeight = PORTRAIT_COVERAGE[portraitType].height;

  // Vertical field of view: 2 * atan(sensor_height / (2 * focal_length))
  const vFOV = 2 * Math.atan(effectiveSensorHeight / (2 * focalLength)) * (180 / Math.PI);

  // Distance = (subject_height / 2) / tan(FOV / 2)
  const recommendedDistance = targetHeight / 2 / Math.tan((vFOV / 2) * (Math.PI / 180));

  // Allow 20% margin on either side
  const minimumDistance = recommendedDistance * 0.8;
  const maximumDistance = recommendedDistance * 1.2;

  // Determine compression effect
  let compressionEffect: string;
  let description: string;

  if (effectiveFocalLength < 35) {
    compressionEffect = "Distorted";
    description = "Wide-angle distortion, exaggerated features. Not recommended for portraits.";
  } else if (effectiveFocalLength < 50) {
    compressionEffect = "Slight distortion";
    description = "Mild perspective distortion. Can work for environmental portraits.";
  } else if (effectiveFocalLength < 85) {
    compressionEffect = "Natural";
    description = "Natural perspective. Good for portraits with context.";
  } else if (effectiveFocalLength < 135) {
    compressionEffect = "Flattering";
    description = "Classic portrait focal length. Flattering compression.";
  } else if (effectiveFocalLength < 200) {
    compressionEffect = "Compressed";
    description = "Strong compression. Great for headshots, separates subject from background.";
  } else {
    compressionEffect = "Very compressed";
    description = "Extreme compression. Dramatic isolation from background.";
  }

  return {
    ok: true,
    value: {
      recommendedDistance: Math.round(recommendedDistance * 100) / 100,
      minimumDistance: Math.round(minimumDistance * 100) / 100,
      maximumDistance: Math.round(maximumDistance * 100) / 100,
      fieldOfView: Math.round(vFOV * 10) / 10,
      subjectHeight: targetHeight,
      compressionEffect,
      description,
    },
  };
}

export const PORTRAIT_TYPES: { id: PortraitType; name: string }[] = [
  { id: "headshot", name: "Headshot" },
  { id: "head-shoulders", name: "Head & Shoulders" },
  { id: "half-body", name: "Half Body" },
  { id: "full-body", name: "Full Body" },
  { id: "environmental", name: "Environmental" },
];

export const PORTRAIT_FOCAL_LENGTHS = [35, 50, 85, 100, 135, 200];
