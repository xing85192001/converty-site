import type { CalculationResult } from "@/types";

export type AudioFormat = "wav" | "flac" | "mp3" | "aac" | "ogg" | "opus";

export interface AudioFilesizeResult {
  estimatedBytes: number;
  estimatedMB: number;
  formatted: string;
  bitrate: number;
  duration: number;
}

const FORMAT_BITRATES: Record<
  AudioFormat,
  { min: number; typical: number; max: number; uncompressed?: boolean }
> = {
  wav: { min: 1411, typical: 1411, max: 4608, uncompressed: true }, // 16-bit/44.1kHz to 24-bit/96kHz
  flac: { min: 400, typical: 900, max: 1400 },
  mp3: { min: 128, typical: 256, max: 320 },
  aac: { min: 96, typical: 192, max: 320 },
  ogg: { min: 96, typical: 192, max: 500 },
  opus: { min: 64, typical: 128, max: 256 },
};

export function calculateAudioFilesize(
  durationSeconds: number,
  format: AudioFormat,
  quality: "low" | "typical" | "high" = "typical",
  channels: 1 | 2 = 2,
  sampleRate: number = 44100,
  bitDepth: number = 16
): CalculationResult<AudioFilesizeResult> {
  if (durationSeconds <= 0) {
    return {
      ok: false,
      error: "Duration must be positive",
      code: "INVALID_INPUT",
    };
  }

  const formatInfo = FORMAT_BITRATES[format];
  let bitrate: number;

  if (formatInfo.uncompressed) {
    // For uncompressed: bitrate = sampleRate × bitDepth × channels
    bitrate = (sampleRate * bitDepth * channels) / 1000; // kbps
  } else {
    switch (quality) {
      case "low":
        bitrate = formatInfo.min;
        break;
      case "high":
        bitrate = formatInfo.max;
        break;
      default:
        bitrate = formatInfo.typical;
    }
    bitrate = bitrate * (channels === 1 ? 0.6 : 1); // Mono is roughly 60% of stereo
  }

  // File size = bitrate (kbps) × duration (s) / 8 / 1024 = MB
  const estimatedBytes = (bitrate * 1000 * durationSeconds) / 8;
  const estimatedMB = estimatedBytes / (1024 * 1024);

  return {
    ok: true,
    value: {
      estimatedBytes: Math.round(estimatedBytes),
      estimatedMB: Math.round(estimatedMB * 100) / 100,
      formatted:
        estimatedMB >= 1000
          ? `${(estimatedMB / 1024).toFixed(2)} GB`
          : `${estimatedMB.toFixed(2)} MB`,
      bitrate: Math.round(bitrate),
      duration: durationSeconds,
    },
  };
}

export const AUDIO_FORMATS: { id: AudioFormat; name: string; description: string }[] = [
  { id: "wav", name: "WAV", description: "Uncompressed, lossless" },
  { id: "flac", name: "FLAC", description: "Lossless compression" },
  { id: "mp3", name: "MP3", description: "Lossy, widely compatible" },
  { id: "aac", name: "AAC", description: "Lossy, better than MP3" },
  { id: "ogg", name: "OGG Vorbis", description: "Open source lossy" },
  { id: "opus", name: "Opus", description: "Modern, efficient lossy" },
];

export const DURATION_PRESETS = [
  { name: "30 sec", seconds: 30 },
  { name: "1 min", seconds: 60 },
  { name: "3 min", seconds: 180 },
  { name: "5 min", seconds: 300 },
  { name: "1 hour", seconds: 3600 },
];
