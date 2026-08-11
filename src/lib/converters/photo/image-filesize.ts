import type { CalculationResult } from "@/types";

export type ImageFormat = "jpeg" | "png" | "raw" | "tiff" | "webp" | "heic";

export interface ImageFilesizeResult {
  estimatedBytes: number;
  estimatedKB: number;
  estimatedMB: number;
  formatted: string;
  bitsPerPixel: number;
  totalPixels: number;
  megapixels: number;
}

// Estimated bits per pixel for different formats
const FORMAT_BPP: Record<ImageFormat, { min: number; typical: number; max: number }> = {
  jpeg: { min: 0.5, typical: 2.5, max: 8 },
  png: { min: 1, typical: 8, max: 24 },
  raw: { min: 12, typical: 14, max: 16 },
  tiff: { min: 24, typical: 24, max: 48 },
  webp: { min: 0.3, typical: 1.5, max: 4 },
  heic: { min: 0.3, typical: 1.2, max: 3 },
};

export function calculateImageFilesize(
  width: number,
  height: number,
  format: ImageFormat,
  quality: "low" | "typical" | "high" = "typical"
): CalculationResult<ImageFilesizeResult> {
  if (width <= 0 || height <= 0) {
    return {
      ok: false,
      error: "Image dimensions must be positive",
      code: "INVALID_INPUT",
    };
  }

  const totalPixels = width * height;
  const megapixels = totalPixels / 1000000;

  const formatInfo = FORMAT_BPP[format];
  let bitsPerPixel: number;

  switch (quality) {
    case "low":
      bitsPerPixel = formatInfo.min;
      break;
    case "high":
      bitsPerPixel = formatInfo.max;
      break;
    default:
      bitsPerPixel = formatInfo.typical;
  }

  const totalBits = totalPixels * bitsPerPixel;
  const estimatedBytes = totalBits / 8;
  const estimatedKB = estimatedBytes / 1024;
  const estimatedMB = estimatedKB / 1024;

  let formatted: string;
  if (estimatedMB >= 1) {
    formatted = `${estimatedMB.toFixed(2)} MB`;
  } else if (estimatedKB >= 1) {
    formatted = `${estimatedKB.toFixed(2)} KB`;
  } else {
    formatted = `${Math.round(estimatedBytes)} bytes`;
  }

  return {
    ok: true,
    value: {
      estimatedBytes: Math.round(estimatedBytes),
      estimatedKB: Math.round(estimatedKB * 100) / 100,
      estimatedMB: Math.round(estimatedMB * 100) / 100,
      formatted,
      bitsPerPixel,
      totalPixels,
      megapixels: Math.round(megapixels * 100) / 100,
    },
  };
}

export const IMAGE_FORMATS: { id: ImageFormat; name: string; description: string }[] = [
  { id: "jpeg", name: "JPEG", description: "Lossy compression, photos" },
  { id: "png", name: "PNG", description: "Lossless, transparency support" },
  { id: "raw", name: "RAW", description: "Uncompressed sensor data" },
  { id: "tiff", name: "TIFF", description: "High quality, large files" },
  { id: "webp", name: "WebP", description: "Modern web format" },
  { id: "heic", name: "HEIC", description: "Apple's efficient format" },
];

export const COMMON_RESOLUTIONS = [
  { name: "HD (720p)", width: 1280, height: 720 },
  { name: "Full HD (1080p)", width: 1920, height: 1080 },
  { name: "4K UHD", width: 3840, height: 2160 },
  { name: "8K UHD", width: 7680, height: 4320 },
  { name: "12 MP", width: 4000, height: 3000 },
  { name: "24 MP", width: 6000, height: 4000 },
  { name: "45 MP", width: 8192, height: 5464 },
];
