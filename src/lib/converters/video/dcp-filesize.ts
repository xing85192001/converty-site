import type { CalculationResult } from "@/types";

export interface DCPFilesizeResult {
  videoBytes: number;
  audioBytes: number;
  totalBytes: number;
  totalGB: number;
  formatted: string;
  videoBitrate: number;
  audioBitrate: number;
}

// DCP uses JPEG2000 for video and uncompressed PCM for audio
// Standard DCP bitrates: 250 Mbps for 2K, 500 Mbps for 4K

export function calculateDCPFilesize(
  durationMinutes: number,
  resolution: "2k" | "4k",
  _frameRate: number = 24,
  audioChannels: number = 6, // 5.1 surround
  audioSampleRate: number = 48000,
  audioBitDepth: number = 24
): CalculationResult<DCPFilesizeResult> {
  if (durationMinutes <= 0) {
    return {
      ok: false,
      error: "Duration must be positive",
      code: "INVALID_INPUT",
    };
  }

  const durationSeconds = durationMinutes * 60;

  // Video bitrate based on resolution
  const videoBitrateMbps = resolution === "4k" ? 500 : 250;
  const videoBytes = (videoBitrateMbps * 1000000 * durationSeconds) / 8;

  // Audio: uncompressed PCM
  // Bitrate = sampleRate × bitDepth × channels
  const audioBitrateKbps = (audioSampleRate * audioBitDepth * audioChannels) / 1000;
  const audioBytes = (audioBitrateKbps * 1000 * durationSeconds) / 8;

  const totalBytes = videoBytes + audioBytes;
  const totalGB = totalBytes / (1024 * 1024 * 1024);

  let formatted: string;
  if (totalGB >= 1000) {
    formatted = `${(totalGB / 1024).toFixed(2)} TB`;
  } else {
    formatted = `${totalGB.toFixed(2)} GB`;
  }

  return {
    ok: true,
    value: {
      videoBytes: Math.round(videoBytes),
      audioBytes: Math.round(audioBytes),
      totalBytes: Math.round(totalBytes),
      totalGB: Math.round(totalGB * 100) / 100,
      formatted,
      videoBitrate: videoBitrateMbps,
      audioBitrate: Math.round(audioBitrateKbps),
    },
  };
}

export const DCP_PRESETS = {
  shortFilm: { name: "Short Film", minutes: 15 },
  featureFilm: { name: "Feature Film", minutes: 120 },
  trailer: { name: "Trailer", minutes: 3 },
  commercial: { name: "Commercial", minutes: 1 },
};

export const AUDIO_CONFIGS = [
  { name: "Stereo", channels: 2 },
  { name: "5.1 Surround", channels: 6 },
  { name: "7.1 Surround", channels: 8 },
  { name: "Dolby Atmos (bed)", channels: 10 },
];
