import type { CalculationResult } from "@/types";

export type VideoResolution = "720p" | "1080p" | "1440p" | "4k" | "8k" | "custom";

export interface ResolutionInfo {
  id: VideoResolution;
  name: string;
  width: number;
  height: number;
}

export const RESOLUTIONS: ResolutionInfo[] = [
  { id: "720p", name: "720p HD", width: 1280, height: 720 },
  { id: "1080p", name: "1080p Full HD", width: 1920, height: 1080 },
  { id: "1440p", name: "1440p QHD", width: 2560, height: 1440 },
  { id: "4k", name: "4K UHD", width: 3840, height: 2160 },
  { id: "8k", name: "8K UHD", width: 7680, height: 4320 },
];

export interface VideoFileSizeInput {
  duration: number; // in seconds
  bitrateMbps: number; // video bitrate in Mbps
  audioBitrateKbps?: number; // audio bitrate in Kbps
}

export interface VideoFileSizeResult {
  totalBytes: number;
  totalMB: number;
  totalGB: number;
  videoBytes: number;
  audioBytes: number;
  formatted: string;
}

export function calculateVideoFileSize(
  input: VideoFileSizeInput
): CalculationResult<VideoFileSizeResult> {
  const { duration, bitrateMbps, audioBitrateKbps = 192 } = input;

  if (duration <= 0 || bitrateMbps <= 0) {
    return {
      ok: false,
      error: "Duration and bitrate must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Video size: (bitrate in Mbps * duration in seconds) / 8 = MB
  const videoBytes = (bitrateMbps * 1000000 * duration) / 8;

  // Audio size: (bitrate in Kbps * duration in seconds) / 8 = KB, then to bytes
  const audioBytes = (audioBitrateKbps * 1000 * duration) / 8;

  const totalBytes = videoBytes + audioBytes;
  const totalMB = totalBytes / (1024 * 1024);
  const totalGB = totalBytes / (1024 * 1024 * 1024);

  let formatted: string;
  if (totalGB >= 1) {
    formatted = `${totalGB.toFixed(2)} GB`;
  } else {
    formatted = `${totalMB.toFixed(2)} MB`;
  }

  return {
    ok: true,
    value: {
      totalBytes: Math.round(totalBytes),
      totalMB: Math.round(totalMB * 100) / 100,
      totalGB: Math.round(totalGB * 1000) / 1000,
      videoBytes: Math.round(videoBytes),
      audioBytes: Math.round(audioBytes),
      formatted,
    },
  };
}

// Estimated bitrates for different resolutions and quality levels
export const BITRATE_PRESETS = {
  "720p": { low: 2, medium: 5, high: 8 },
  "1080p": { low: 4, medium: 8, high: 15 },
  "1440p": { low: 8, medium: 16, high: 24 },
  "4k": { low: 15, medium: 35, high: 68 },
  "8k": { low: 50, medium: 100, high: 200 },
};

export function durationToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToDuration(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { hours, minutes, seconds };
}
