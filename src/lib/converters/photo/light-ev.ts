import type { CalculationResult } from "@/types";

export interface ExposureResult {
  ev: number;
  ev100: number; // EV at ISO 100
  lux: number;
  footCandles: number;
  lightLevel: string;
  description: string;
}

// Calculate Exposure Value
// EV = log2(N² / t) where N = f-number, t = exposure time in seconds
// EV100 = EV + log2(ISO/100)
export function calculateEV(
  aperture: number, // f-number
  shutterSpeed: number, // seconds (e.g., 1/250 = 0.004)
  iso: number
): CalculationResult<ExposureResult> {
  if (aperture <= 0 || shutterSpeed <= 0 || iso <= 0) {
    return {
      ok: false,
      error: "Aperture, shutter speed, and ISO must be positive",
      code: "INVALID_INPUT",
    };
  }

  // EV = log2(aperture² / shutter_speed)
  const ev = Math.log2((aperture * aperture) / shutterSpeed);

  // EV100 = EV + log2(ISO / 100)
  const ev100 = ev + Math.log2(iso / 100);

  // Approximate lux from EV100: Lux ≈ 2.5 × 2^EV100
  const lux = 2.5 * 2 ** ev100;
  const footCandles = lux / 10.764;

  const { lightLevel, description } = getLightLevel(ev100);

  return {
    ok: true,
    value: {
      ev: Math.round(ev * 100) / 100,
      ev100: Math.round(ev100 * 100) / 100,
      lux: Math.round(lux),
      footCandles: Math.round(footCandles * 10) / 10,
      lightLevel,
      description,
    },
  };
}

// Calculate required settings for a target EV
export function calculateSettingsForEV(
  targetEV: number,
  fixedAperture?: number,
  fixedShutter?: number,
  _fixedISO?: number
): { aperture?: number; shutterSpeed?: number; iso?: number } {
  // If aperture is fixed, calculate shutter speed at ISO 100
  if (fixedAperture && !fixedShutter) {
    const shutterSpeed = (fixedAperture * fixedAperture) / 2 ** targetEV;
    return { shutterSpeed };
  }

  // If shutter is fixed, calculate aperture at ISO 100
  if (fixedShutter && !fixedAperture) {
    const aperture = Math.sqrt(fixedShutter * 2 ** targetEV);
    return { aperture };
  }

  return {};
}

function getLightLevel(ev100: number): { lightLevel: string; description: string } {
  if (ev100 < -4) {
    return { lightLevel: "Starlight", description: "Very dark, astrophotography conditions" };
  } else if (ev100 < 0) {
    return { lightLevel: "Night", description: "Night scenes, aurora, fireworks" };
  } else if (ev100 < 4) {
    return { lightLevel: "Dim Indoor", description: "Candlelight, dark interiors" };
  } else if (ev100 < 8) {
    return { lightLevel: "Indoor", description: "Normal indoor lighting" };
  } else if (ev100 < 12) {
    return { lightLevel: "Overcast/Shade", description: "Cloudy day or open shade" };
  } else if (ev100 < 14) {
    return { lightLevel: "Daylight", description: "Hazy sun, bright cloudy" };
  } else if (ev100 < 16) {
    return { lightLevel: "Bright Daylight", description: "Direct sunlight" };
  } else {
    return { lightLevel: "Very Bright", description: "Snow, sand, or bright sun" };
  }
}

export const COMMON_APERTURES = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
export const COMMON_SHUTTER_SPEEDS = [
  { label: "30s", value: 30 },
  { label: "15s", value: 15 },
  { label: "8s", value: 8 },
  { label: "4s", value: 4 },
  { label: "2s", value: 2 },
  { label: "1s", value: 1 },
  { label: "1/2", value: 0.5 },
  { label: "1/4", value: 0.25 },
  { label: "1/8", value: 0.125 },
  { label: "1/15", value: 1 / 15 },
  { label: "1/30", value: 1 / 30 },
  { label: "1/60", value: 1 / 60 },
  { label: "1/125", value: 1 / 125 },
  { label: "1/250", value: 1 / 250 },
  { label: "1/500", value: 1 / 500 },
  { label: "1/1000", value: 1 / 1000 },
  { label: "1/2000", value: 1 / 2000 },
  { label: "1/4000", value: 1 / 4000 },
  { label: "1/8000", value: 1 / 8000 },
];
export const COMMON_ISO = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
