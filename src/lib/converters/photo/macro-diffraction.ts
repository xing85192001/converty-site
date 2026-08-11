/**
 * Macro Diffraction Calculator
 *
 * In macro photography, the effective aperture increases with magnification:
 * N_effective = N × (1 + m)
 *
 * This means diffraction becomes a problem at much wider marked apertures
 * than in normal photography.
 */

import type { CalculationResult } from "@/types";

export interface MacroDiffractionInput {
  aperture: number; // marked f-number
  magnification: number; // e.g., 1:1 = 1, 2:1 = 2
  sensorWidth: number; // mm
  sensorHeight: number; // mm
  megapixels: number;
  wavelength?: number; // nm (default 550nm)
}

export interface MacroDiffractionResult {
  markedAperture: number;
  effectiveAperture: number;
  airyDiskDiameter: number; // micrometers
  pixelPitch: number; // micrometers
  isDiffractionLimited: boolean;
  maxApertureForSharpness: number; // marked f-number before diffraction
  optimalApertureRange: { min: number; max: number };
  lightLossStops: number; // light loss due to magnification
  notes: string[];
}

/**
 * Calculate macro diffraction effects
 */
export function calculateMacroDiffraction(
  input: MacroDiffractionInput
): CalculationResult<MacroDiffractionResult> {
  const {
    aperture,
    magnification,
    sensorWidth,
    sensorHeight,
    megapixels,
    wavelength = 550,
  } = input;

  if (
    aperture <= 0 ||
    magnification <= 0 ||
    sensorWidth <= 0 ||
    sensorHeight <= 0 ||
    megapixels <= 0
  ) {
    return {
      ok: false,
      error: "Aperture, magnification, sensor dimensions, and megapixels must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Calculate effective aperture
  // N_effective = N × (1 + m)
  const effectiveAperture = aperture * (1 + magnification);

  // Calculate pixel pitch
  const aspectRatio = sensorWidth / sensorHeight;
  const pixelsHorizontal = Math.sqrt(megapixels * 1000000 * aspectRatio);
  const pixelPitch = (sensorWidth / pixelsHorizontal) * 1000; // µm

  // Calculate Airy disk using effective aperture
  const airyDiskDiameter = 2.44 * (wavelength / 1000) * effectiveAperture;

  // Is diffraction limited?
  const isDiffractionLimited = airyDiskDiameter > pixelPitch;

  // Calculate max marked aperture before diffraction
  // Solve: pixelPitch = 2.44 × λ × N × (1 + m)
  // N = pixelPitch / (2.44 × λ × (1 + m))
  const maxApertureForSharpness = pixelPitch / (2.44 * (wavelength / 1000) * (1 + magnification));

  // Optimal range
  const optimalMin = Math.max(2.8, maxApertureForSharpness * 0.35);
  const optimalMax = maxApertureForSharpness;

  // Light loss in stops
  // Light loss = (1 + m)²
  // In stops = log2((1 + m)²) = 2 × log2(1 + m)
  const lightLossStops = 2 * Math.log2(1 + magnification);

  // Generate notes
  const notes: string[] = [];

  notes.push(
    `At ${magnification}:1 magnification, effective aperture is f/${effectiveAperture.toFixed(1)} (marked f/${aperture}).`
  );

  if (isDiffractionLimited) {
    notes.push(
      `Diffraction is limiting sharpness. Consider using f/${maxApertureForSharpness.toFixed(1)} or wider.`
    );
  } else {
    notes.push(`Current aperture is within acceptable range for this magnification.`);
  }

  notes.push(
    `Light loss: ${lightLossStops.toFixed(1)} stops. Increase exposure time or ISO accordingly.`
  );

  if (magnification >= 1) {
    notes.push(`At life-size or greater, even moderate apertures become effectively very small.`);
  }

  if (effectiveAperture > 22) {
    notes.push(`Effective aperture exceeds f/22 - severe diffraction softening expected.`);
  }

  return {
    ok: true,
    value: {
      markedAperture: aperture,
      effectiveAperture: Math.round(effectiveAperture * 10) / 10,
      airyDiskDiameter: Math.round(airyDiskDiameter * 100) / 100,
      pixelPitch: Math.round(pixelPitch * 100) / 100,
      isDiffractionLimited,
      maxApertureForSharpness: Math.round(maxApertureForSharpness * 10) / 10,
      optimalApertureRange: {
        min: Math.round(optimalMin * 10) / 10,
        max: Math.round(optimalMax * 10) / 10,
      },
      lightLossStops: Math.round(lightLossStops * 10) / 10,
      notes,
    },
  };
}

/**
 * Generate table of effective apertures at different magnifications
 */
export function generateEffectiveApertureTable(
  markedApertures: number[],
  magnifications: number[]
): { marked: number; magnification: number; effective: number }[] {
  const results: { marked: number; magnification: number; effective: number }[] = [];

  for (const m of magnifications) {
    for (const n of markedApertures) {
      results.push({
        marked: n,
        magnification: m,
        effective: Math.round(n * (1 + m) * 10) / 10,
      });
    }
  }

  return results;
}

/**
 * Common magnifications for macro
 */
export const MACRO_MAGNIFICATIONS = [
  { label: "1:4 (0.25×)", value: 0.25 },
  { label: "1:2 (0.5×)", value: 0.5 },
  { label: "1:1 (1×)", value: 1 },
  { label: "2:1 (2×)", value: 2 },
  { label: "3:1 (3×)", value: 3 },
  { label: "5:1 (5×)", value: 5 },
];

/**
 * Macro apertures commonly used
 */
export const MACRO_APERTURES = [2.8, 4, 5.6, 8, 11, 16, 22, 32];
