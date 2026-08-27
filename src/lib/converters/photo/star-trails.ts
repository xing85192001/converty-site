/**
 * Star Trails Calculator
 * Calculate exposure time for desired star trail length/rotation
 */

export interface StarTrailsInput {
  exposureMinutes: number;
  hemisphere: "north" | "south";
}

export interface StarTrailsResult {
  exposureMinutes: number;
  exposureHours: number;
  rotationDegrees: number;
  rotationPercent: number; // percentage of full circle
  trailDescription: string;
}

// Earth rotates 360° in 24 hours = 15° per hour = 0.25° per minute
const DEGREES_PER_MINUTE = 0.25;
const _DEGREES_PER_HOUR = 15;

export function calculateStarTrails(input: StarTrailsInput): StarTrailsResult {
  const { exposureMinutes } = input;

  const rotationDegrees = exposureMinutes * DEGREES_PER_MINUTE;
  const rotationPercent = (rotationDegrees / 360) * 100;
  const exposureHours = exposureMinutes / 60;

  let trailDescription = "";
  if (rotationDegrees < 5) {
    trailDescription = "Very short trails - stars will appear as short streaks";
  } else if (rotationDegrees < 15) {
    trailDescription = "Short trails - noticeable curved streaks";
  } else if (rotationDegrees < 45) {
    trailDescription = "Medium trails - clear arc patterns visible";
  } else if (rotationDegrees < 90) {
    trailDescription = "Long trails - dramatic quarter-circle arcs";
  } else if (rotationDegrees < 180) {
    trailDescription = "Very long trails - impressive half-circle patterns";
  } else if (rotationDegrees < 360) {
    trailDescription = "Extended trails - approaching full circle";
  } else {
    trailDescription = "Full circle or more - complete circular trails";
  }

  return {
    exposureMinutes,
    exposureHours,
    rotationDegrees,
    rotationPercent,
    trailDescription,
  };
}

export function calculateExposureFromRotation(rotationDegrees: number): number {
  return rotationDegrees / DEGREES_PER_MINUTE;
}

export function calculateRotationFromExposure(exposureMinutes: number): number {
  return exposureMinutes * DEGREES_PER_MINUTE;
}

// Common presets for star trails photography
export const STAR_TRAILS_PRESETS = [
  { name: "15 minutes", minutes: 15, degrees: 3.75 },
  { name: "30 minutes", minutes: 30, degrees: 7.5 },
  { name: "1 hour", minutes: 60, degrees: 15 },
  { name: "2 hours", minutes: 120, degrees: 30 },
  { name: "4 hours", minutes: 240, degrees: 60 },
  { name: "6 hours", minutes: 360, degrees: 90 },
  { name: "8 hours", minutes: 480, degrees: 120 },
  { name: "12 hours", minutes: 720, degrees: 180 },
  { name: "24 hours", minutes: 1440, degrees: 360 },
];

// Reference information
export const STAR_TRAILS_INFO = {
  earthRotation: "Earth rotates 360° in 24 hours (15°/hour)",
  polaris: "Polaris (North Star) is within 1° of the celestial pole",
  bestConditions: [
    "Dark sky location with minimal light pollution",
    "Clear weather with no clouds",
    "No Moon or thin crescent Moon",
    "Stable tripod setup",
  ],
  techniques: [
    "Single long exposure: Simple but risks noise/battery drain",
    "Image stacking: Multiple shorter exposures combined in post",
    "Recommended: 30-second exposures at high ISO, stack in software",
  ],
  stackingSoftware: [
    "StarStaX (free)",
    "Photoshop (lighten blend mode)",
    "Sequator",
    "Deep Sky Stacker",
  ],
};
