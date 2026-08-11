/**
 * Diffraction Calculator
 *
 * Calculates when a camera becomes diffraction-limited based on aperture,
 * sensor size, and pixel density. Helps photographers understand the
 * optimal aperture range for maximum sharpness.
 *
 * Key concept: Airy disk diameter = 2.44 × λ × N
 * where λ = wavelength (typically 550nm for green light), N = f-number
 */

import type { CalculationResult } from "@/types";

export interface DiffractionInput {
  aperture: number; // f-number
  sensorWidth: number; // mm
  sensorHeight: number; // mm
  megapixels: number; // total megapixels
  wavelength?: number; // nm (default 550nm for green)
}

export interface DiffractionResult {
  airyDiskDiameter: number; // micrometers
  pixelPitch: number; // micrometers
  isDiffractionLimited: boolean;
  diffractionLimitAperture: number; // f-stop where diffraction starts
  optimalApertureRange: { min: number; max: number };
  sharpnessImpact: string;
  resolution: number; // theoretical resolution in lp/mm
  notes: string[];
}

/**
 * Calculate diffraction effects
 */
export function calculateDiffraction(
  input: DiffractionInput
): CalculationResult<DiffractionResult> {
  const { aperture, sensorWidth, sensorHeight, megapixels, wavelength = 550 } = input;

  if (aperture <= 0 || sensorWidth <= 0 || sensorHeight <= 0 || megapixels <= 0) {
    return {
      ok: false,
      error: "Aperture, sensor dimensions, and megapixels must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Calculate pixel pitch (micrometers)
  // Total pixels = megapixels × 1,000,000
  // Assuming 3:2 aspect ratio for calculation
  const aspectRatio = sensorWidth / sensorHeight;
  const pixelsHorizontal = Math.sqrt(megapixels * 1000000 * aspectRatio);
  const pixelPitch = (sensorWidth / pixelsHorizontal) * 1000; // mm to µm

  // Calculate Airy disk diameter (micrometers)
  // Airy disk = 2.44 × λ × N
  // λ in nm needs to be converted to µm (divide by 1000)
  const airyDiskDiameter = 2.44 * (wavelength / 1000) * aperture;

  // Diffraction-limited when Airy disk > pixel pitch
  const isDiffractionLimited = airyDiskDiameter > pixelPitch;

  // Calculate aperture where diffraction begins to affect
  // Solve for N when airyDisk = pixelPitch
  // N = pixelPitch / (2.44 × λ)
  const diffractionLimitAperture = pixelPitch / (2.44 * (wavelength / 1000));

  // Optimal aperture range
  // Typically 2-3 stops down from wide open to diffraction limit
  const optimalMin = Math.max(2.8, diffractionLimitAperture * 0.35);
  const optimalMax = diffractionLimitAperture;

  // Theoretical resolution (line pairs per mm)
  // Resolution = 1 / (airyDisk in mm × 2)
  const resolution = 1000 / (airyDiskDiameter * 2);

  // Determine sharpness impact
  let sharpnessImpact: string;
  const ratio = airyDiskDiameter / pixelPitch;

  if (ratio < 0.5) {
    sharpnessImpact = "No impact - well below diffraction limit";
  } else if (ratio < 0.75) {
    sharpnessImpact = "Minimal impact - approaching diffraction limit";
  } else if (ratio < 1) {
    sharpnessImpact = "Slight softening - near diffraction limit";
  } else if (ratio < 1.5) {
    sharpnessImpact = "Noticeable softening - beyond diffraction limit";
  } else if (ratio < 2) {
    sharpnessImpact = "Significant softening - well beyond diffraction limit";
  } else {
    sharpnessImpact = "Severe softening - strongly diffraction limited";
  }

  // Generate notes
  const notes: string[] = [];

  if (isDiffractionLimited) {
    notes.push(
      `At f/${aperture}, the Airy disk (${airyDiskDiameter.toFixed(1)}µm) is larger than pixels (${pixelPitch.toFixed(1)}µm).`
    );
    notes.push(
      `Consider using f/${Math.round(diffractionLimitAperture)} or wider for maximum sharpness.`
    );
  } else {
    notes.push(`At f/${aperture}, you're within the optimal range for this sensor.`);
  }

  if (pixelPitch < 3) {
    notes.push("High pixel density sensor - more susceptible to diffraction at smaller apertures.");
  }

  if (aperture > 16) {
    notes.push(
      "Very small apertures (f/16+) often show visible diffraction on most digital cameras."
    );
  }

  return {
    ok: true,
    value: {
      airyDiskDiameter: Math.round(airyDiskDiameter * 100) / 100,
      pixelPitch: Math.round(pixelPitch * 100) / 100,
      isDiffractionLimited,
      diffractionLimitAperture: Math.round(diffractionLimitAperture * 10) / 10,
      optimalApertureRange: {
        min: Math.round(optimalMin * 10) / 10,
        max: Math.round(optimalMax * 10) / 10,
      },
      sharpnessImpact,
      resolution: Math.round(resolution),
      notes,
    },
  };
}

/**
 * Common camera sensor presets
 */
export const DIFFRACTION_SENSOR_PRESETS = [
  { name: "Full Frame 24MP", width: 36, height: 24, megapixels: 24 },
  { name: "Full Frame 45MP", width: 36, height: 24, megapixels: 45 },
  { name: "Full Frame 61MP", width: 36, height: 24, megapixels: 61 },
  { name: "APS-C 24MP", width: 23.5, height: 15.6, megapixels: 24 },
  { name: "APS-C 26MP", width: 22.3, height: 14.9, megapixels: 26 },
  { name: "APS-C 40MP", width: 23.5, height: 15.6, megapixels: 40 },
  { name: "Micro 4/3 20MP", width: 17.3, height: 13, megapixels: 20 },
  { name: "Micro 4/3 25MP", width: 17.3, height: 13, megapixels: 25 },
  { name: "1 inch 20MP", width: 13.2, height: 8.8, megapixels: 20 },
  { name: "Medium Format 50MP", width: 43.8, height: 32.9, megapixels: 50 },
  { name: "Medium Format 100MP", width: 43.8, height: 32.9, megapixels: 100 },
];

/**
 * Light wavelengths
 */
export const LIGHT_WAVELENGTHS = [
  { name: "Blue (450nm)", value: 450 },
  { name: "Green (550nm)", value: 550 },
  { name: "Red (650nm)", value: 650 },
  { name: "Infrared (850nm)", value: 850 },
];
