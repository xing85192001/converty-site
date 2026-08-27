import type { CalculationResult } from "@/types";

export interface VideoBitrateResult {
  bitrateMbps: number;
  bitrateKbps: number;
  bitsPerPixel: number;
  qualityLevel: string;
  recommendation: string;
}

export function calculateVideoBitrate(
  width: number,
  height: number,
  fps: number,
  bitDepth: 8 | 10 | 12 = 8,
  codec: "h264" | "h265" | "prores" | "raw" = "h264",
  quality: "low" | "medium" | "high" | "lossless" = "medium"
): CalculationResult<VideoBitrateResult> {
  if (width <= 0 || height <= 0 || fps <= 0) {
    return {
      ok: false,
      error: "Width, height, and FPS must be positive",
      code: "INVALID_INPUT",
    };
  }

  const totalPixels = width * height;
  const pixelsPerSecond = totalPixels * fps;

  // Base bits per pixel for different codecs and quality levels
  const codecFactors: Record<string, Record<string, number>> = {
    h264: { low: 0.05, medium: 0.1, high: 0.2, lossless: 0.5 },
    h265: { low: 0.03, medium: 0.07, high: 0.15, lossless: 0.35 },
    prores: { low: 0.5, medium: 1.0, high: 1.5, lossless: 2.0 },
    raw: { low: 8, medium: 10, high: 12, lossless: 16 },
  };

  // Bit depth multiplier
  const bitDepthMultiplier = bitDepth / 8;

  const baseBpp = codecFactors[codec][quality];
  const adjustedBpp = baseBpp * bitDepthMultiplier;

  // Calculate bitrate
  const bitrateBps = pixelsPerSecond * adjustedBpp;
  const bitrateKbps = bitrateBps / 1000;
  const bitrateMbps = bitrateKbps / 1000;

  // Determine quality level and recommendation
  const { qualityLevel, recommendation } = getQualityAssessment(bitrateMbps, width, height, codec);

  return {
    ok: true,
    value: {
      bitrateMbps: Math.round(bitrateMbps * 100) / 100,
      bitrateKbps: Math.round(bitrateKbps),
      bitsPerPixel: Math.round(adjustedBpp * 1000) / 1000,
      qualityLevel,
      recommendation,
    },
  };
}

function getQualityAssessment(
  bitrateMbps: number,
  width: number,
  _height: number,
  codec: string
): { qualityLevel: string; recommendation: string } {
  const is4K = width >= 3840;
  const isHD = width >= 1920;

  if (codec === "raw" || codec === "prores") {
    return { qualityLevel: "bitrate_quality_production", recommendation: "bitrate_rec_production" };
  }

  if (is4K) {
    if (bitrateMbps < 15)
      return {
        qualityLevel: "bitrate_quality_low",
        recommendation: "bitrate_rec_compression_artifacts",
      };
    if (bitrateMbps < 35)
      return { qualityLevel: "bitrate_quality_good", recommendation: "bitrate_rec_good_streaming" };
    if (bitrateMbps < 80)
      return { qualityLevel: "bitrate_quality_high", recommendation: "bitrate_rec_excellent" };
    return { qualityLevel: "bitrate_quality_master", recommendation: "bitrate_rec_archive" };
  }

  if (isHD) {
    if (bitrateMbps < 4)
      return {
        qualityLevel: "bitrate_quality_low",
        recommendation: "bitrate_rec_compression_artifacts",
      };
    if (bitrateMbps < 8)
      return { qualityLevel: "bitrate_quality_good", recommendation: "bitrate_rec_good_streaming" };
    if (bitrateMbps < 20)
      return { qualityLevel: "bitrate_quality_high", recommendation: "bitrate_rec_excellent" };
    return { qualityLevel: "bitrate_quality_master", recommendation: "bitrate_rec_archive" };
  }

  if (bitrateMbps < 2)
    return { qualityLevel: "bitrate_quality_low", recommendation: "bitrate_rec_acceptable_sd" };
  if (bitrateMbps < 5)
    return { qualityLevel: "bitrate_quality_good", recommendation: "bitrate_rec_good_sd" };
  return { qualityLevel: "bitrate_quality_high", recommendation: "bitrate_rec_excellent_sd" };
}

export const COMMON_RESOLUTIONS = [
  { name: "480p SD", width: 854, height: 480 },
  { name: "720p HD", width: 1280, height: 720 },
  { name: "1080p FHD", width: 1920, height: 1080 },
  { name: "1440p QHD", width: 2560, height: 1440 },
  { name: "4K UHD", width: 3840, height: 2160 },
  { name: "8K UHD", width: 7680, height: 4320 },
];

export const COMMON_FRAMERATES = [24, 25, 30, 50, 60, 120];
