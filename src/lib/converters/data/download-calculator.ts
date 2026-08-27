import type { CalculationResult } from "@/types";

export interface FileSizeUnit {
  id: string;
  bytes: number;
}

// Unit names are translated in UI components using i18n
// See data.units.* keys in translation files
export const FILE_SIZE_UNITS: FileSizeUnit[] = [
  { id: "B", bytes: 1 },
  { id: "KB", bytes: 1024 },
  { id: "MB", bytes: 1024 * 1024 },
  { id: "GB", bytes: 1024 * 1024 * 1024 },
  { id: "TB", bytes: 1024 * 1024 * 1024 * 1024 },
];

export interface BandwidthSpeedUnit {
  id: string;
  bitsPerSecond: number;
}

export const SPEED_UNITS: BandwidthSpeedUnit[] = [
  { id: "kbps", bitsPerSecond: 1000 },
  { id: "mbps", bitsPerSecond: 1000000 },
  { id: "gbps", bitsPerSecond: 1000000000 },
  { id: "KBps", bitsPerSecond: 8000 },
  { id: "MBps", bitsPerSecond: 8000000 },
];

export interface DownloadTimeResult {
  totalSeconds: number;
  formatted: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function calculateDownloadTime(
  fileSize: number,
  fileSizeUnit: string,
  bandwidth: number,
  bandwidthUnit: string
): CalculationResult<DownloadTimeResult> {
  if (fileSize <= 0 || bandwidth <= 0) {
    return {
      ok: false,
      error: "File size and bandwidth must be positive",
      code: "INVALID_INPUT",
    };
  }

  const sizeUnit = FILE_SIZE_UNITS.find((u) => u.id === fileSizeUnit);
  const speedUnit = SPEED_UNITS.find((u) => u.id === bandwidthUnit);

  if (!sizeUnit || !speedUnit) {
    return {
      ok: false,
      error: "Invalid file size unit or bandwidth unit",
      code: "INVALID_INPUT",
    };
  }

  const totalBytes = fileSize * sizeUnit.bytes;
  const totalBits = totalBytes * 8;
  const bitsPerSecond = bandwidth * speedUnit.bitsPerSecond;

  const totalSeconds = totalBits / bitsPerSecond;

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  let formatted = "";
  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
  formatted += `${seconds}s`;

  return {
    ok: true,
    value: {
      totalSeconds,
      formatted: formatted.trim(),
      days,
      hours,
      minutes,
      seconds,
    },
  };
}

// Common bandwidth presets
// Network type names are translated in UI components using i18n
// See data.networks.* keys in translation files
export const BANDWIDTH_PRESETS = [
  { key: "mobile_3g", speed: 3, unit: "mbps" },
  { key: "mobile_4g", speed: 25, unit: "mbps" },
  { key: "mobile_5g", speed: 100, unit: "mbps" },
  { key: "broadband_basic", speed: 25, unit: "mbps" },
  { key: "broadband_fast", speed: 100, unit: "mbps" },
  { key: "fiber_gigabit", speed: 1, unit: "gbps" },
];

// Common file size presets
// File sample names are translated in UI components using i18n
// See data.fileSamples.* keys in translation files
export const FILE_SIZE_PRESETS = [
  { key: "song_mp3", size: 5, unit: "MB" },
  { key: "photo_hd", size: 10, unit: "MB" },
  { key: "movie_hd", size: 4, unit: "GB" },
  { key: "movie_4k", size: 20, unit: "GB" },
  { key: "game", size: 50, unit: "GB" },
  { key: "os_image", size: 5, unit: "GB" },
];
