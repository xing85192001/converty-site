import type { CalculationResult } from "@/types";

export interface FootLambertResult {
  footLamberts: number;
  nits: number;
  candelasPerM2: number;
  lumens: number;
  descriptionKey: string;
  useCaseKey: string;
}

// 1 foot-lambert = 3.426 nits (cd/m²)
const FL_TO_NITS = 3.426;

export function calculateFootLambert(
  value: number,
  fromUnit: "fl" | "nits" | "lumens",
  screenWidthFt?: number,
  screenHeightFt?: number,
  gain: number = 1.0
): CalculationResult<FootLambertResult> {
  if (value <= 0) {
    return {
      ok: false,
      error: "Value must be positive",
      code: "INVALID_INPUT",
    };
  }

  let footLamberts: number;
  let lumens: number;

  if (fromUnit === "fl") {
    footLamberts = value;
  } else if (fromUnit === "nits") {
    footLamberts = value / FL_TO_NITS;
  } else {
    // From lumens - need screen size
    if (!screenWidthFt || !screenHeightFt) {
      return {
        ok: false,
        error: "Screen dimensions are required when converting from lumens",
        code: "INVALID_INPUT",
      };
    }
    const screenAreaSqFt = screenWidthFt * screenHeightFt;
    // FL = Lumens / (Screen Area × π × Gain)
    footLamberts = value / (screenAreaSqFt * Math.PI * gain);
  }

  const nits = footLamberts * FL_TO_NITS;
  const candelasPerM2 = nits; // nits = cd/m²

  // Calculate lumens if screen size provided
  if (screenWidthFt && screenHeightFt) {
    const screenAreaSqFt = screenWidthFt * screenHeightFt;
    lumens = footLamberts * screenAreaSqFt * Math.PI * gain;
  } else {
    lumens = 0;
  }

  const { descriptionKey, useCaseKey } = getBrightnessCategory(footLamberts);

  return {
    ok: true,
    value: {
      footLamberts: Math.round(footLamberts * 100) / 100,
      nits: Math.round(nits * 100) / 100,
      candelasPerM2: Math.round(candelasPerM2 * 100) / 100,
      lumens: Math.round(lumens),
      descriptionKey,
      useCaseKey,
    },
  };
}

// Brightness categories are translated in UI components using i18n
// See video.brightnesses.* keys in translation files
function getBrightnessCategory(fl: number): { descriptionKey: string; useCaseKey: string } {
  if (fl < 10) {
    return { descriptionKey: "very_dim", useCaseKey: "use_very_dim" };
  } else if (fl < 14) {
    return { descriptionKey: "dim", useCaseKey: "use_dim" };
  } else if (fl < 16) {
    return { descriptionKey: "standard_2d", useCaseKey: "use_standard_2d" };
  } else if (fl < 22) {
    return { descriptionKey: "bright", useCaseKey: "use_bright" };
  } else if (fl < 50) {
    return { descriptionKey: "very_bright", useCaseKey: "use_very_bright" };
  } else if (fl < 100) {
    return { descriptionKey: "home_theater", useCaseKey: "use_home_theater" };
  } else {
    return { descriptionKey: "display", useCaseKey: "use_display" };
  }
}

// Reference value names and descriptions are translated in UI components using i18n
// See video.references.* keys in translation files
export const REFERENCE_VALUES = [
  { key: "dci_2d", fl: 14, noteKey: "note_dci_2d" },
  { key: "dci_3d", fl: 4.5, noteKey: "note_dci_3d" },
  { key: "dolby", fl: 31, noteKey: "note_dolby" },
  { key: "imax", fl: 22, noteKey: "note_imax" },
  { key: "home_theater", fl: 16, noteKey: "note_home_theater" },
  { key: "hdr_display", fl: 300, noteKey: "note_hdr_display" },
];
