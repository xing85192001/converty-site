import type { CalculationResult } from "@/types";

export interface MegapixelResult {
  megapixels: number;
  totalPixels: number;
  aspectRatio: string;
  aspectDecimal: number;
  orientation: "landscape" | "portrait" | "square";
}

export function calculateMegapixels(
  width: number,
  height: number
): CalculationResult<MegapixelResult> {
  if (width <= 0 || height <= 0) {
    return {
      ok: false,
      error: "Width and height must be positive",
      code: "INVALID_INPUT",
    };
  }

  const totalPixels = width * height;
  const megapixels = totalPixels / 1000000;

  // Calculate aspect ratio
  const gcd = calculateGCD(width, height);
  const ratioW = width / gcd;
  const ratioH = height / gcd;
  const aspectRatio = `${ratioW}:${ratioH}`;
  const aspectDecimal = width / height;

  let orientation: "landscape" | "portrait" | "square";
  if (Math.abs(aspectDecimal - 1) < 0.01) {
    orientation = "square";
  } else if (aspectDecimal > 1) {
    orientation = "landscape";
  } else {
    orientation = "portrait";
  }

  return {
    ok: true,
    value: {
      megapixels: Math.round(megapixels * 100) / 100,
      totalPixels,
      aspectRatio,
      aspectDecimal: Math.round(aspectDecimal * 1000) / 1000,
      orientation,
    },
  };
}

export function calculateDimensionsFromMegapixels(
  megapixels: number,
  aspectRatioW: number,
  aspectRatioH: number
): CalculationResult<{ width: number; height: number }> {
  if (megapixels <= 0 || aspectRatioW <= 0 || aspectRatioH <= 0) {
    return {
      ok: false,
      error: "Megapixels and aspect ratio values must be positive",
      code: "INVALID_INPUT",
    };
  }

  const totalPixels = megapixels * 1000000;
  // width × height = totalPixels
  // width / height = aspectRatioW / aspectRatioH
  // width = height × (aspectRatioW / aspectRatioH)
  // height × (aspectRatioW / aspectRatioH) × height = totalPixels
  // height² = totalPixels / (aspectRatioW / aspectRatioH)
  const height = Math.sqrt(totalPixels / (aspectRatioW / aspectRatioH));
  const width = height * (aspectRatioW / aspectRatioH);

  return {
    ok: true,
    value: {
      width: Math.round(width),
      height: Math.round(height),
    },
  };
}

function calculateGCD(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export const COMMON_MEGAPIXELS = [
  { mp: 2, name: "2 MP", typical: "Basic webcam" },
  { mp: 5, name: "5 MP", typical: "Entry smartphone" },
  { mp: 8, name: "8 MP", typical: "4K video frame" },
  { mp: 12, name: "12 MP", typical: "iPhone, prosumer" },
  { mp: 24, name: "24 MP", typical: "Enthusiast DSLR" },
  { mp: 36, name: "36 MP", typical: "Pro full-frame" },
  { mp: 45, name: "45 MP", typical: "High-res full-frame" },
  { mp: 61, name: "61 MP", typical: "Sony A7R IV" },
  { mp: 100, name: "100 MP", typical: "Medium format" },
  { mp: 150, name: "150 MP", typical: "Phase One" },
];

export const SENSOR_RESOLUTIONS = [
  { name: "VGA", width: 640, height: 480 },
  { name: "HD 720p", width: 1280, height: 720 },
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "4K UHD", width: 3840, height: 2160 },
  { name: "5K", width: 5120, height: 2880 },
  { name: "6K", width: 6144, height: 3456 },
  { name: "8K UHD", width: 7680, height: 4320 },
];
