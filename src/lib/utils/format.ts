/**
 * Format a number with specified decimal places and locale
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    locale?: string;
    notation?: "standard" | "compact" | "scientific" | "engineering";
    unit?: string;
  } = {}
): string {
  const { decimals = 2, locale = "en-US", notation = "standard", unit } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    notation,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format bytes using SI units (1000-based)
 */
export function formatBytesSI(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1000;
  const sizes = ["B", "kB", "MB", "GB", "TB", "PB", "EB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format bits per second to human-readable string
 */
export function formatBitrate(bitsPerSecond: number, decimals = 2): string {
  if (bitsPerSecond === 0) return "0 bps";

  const k = 1000;
  const sizes = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
  const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k));

  return `${parseFloat((bitsPerSecond / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format hertz to human-readable string
 */
export function formatFrequency(hz: number, decimals = 2): string {
  if (hz === 0) return "0 Hz";

  if (hz >= 1e9) return `${(hz / 1e9).toFixed(decimals)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(decimals)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(decimals)} kHz`;
  return `${hz.toFixed(decimals)} Hz`;
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
