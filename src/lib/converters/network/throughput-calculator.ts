import { BANDWIDTH_UNITS } from "@/lib/converters/data/bandwidth";
import { FILE_SIZE_UNITS } from "@/lib/converters/data/download-calculator";
import type { CalculationResult } from "@/types";

/**
 * Time unit for transfer duration
 */
export interface TimeUnit {
  id: string;
  name: string;
  abbreviation: string;
  seconds: number;
}

/**
 * Available time units for transfer calculations
 */
export const TIME_UNITS: TimeUnit[] = [
  { id: "ms", name: "Milliseconds", abbreviation: "ms", seconds: 0.001 },
  { id: "s", name: "Seconds", abbreviation: "s", seconds: 1 },
  { id: "min", name: "Minutes", abbreviation: "min", seconds: 60 },
  { id: "hr", name: "Hours", abbreviation: "hr", seconds: 3600 },
];

/**
 * Input parameters for throughput calculation
 */
export interface ThroughputInput {
  dataSize: number;
  dataSizeUnit: string;
  transferTime: number;
  transferTimeUnit: string;
}

/**
 * Single throughput conversion to a specific unit
 */
export interface ThroughputConversion {
  unit: string;
  value: number;
  formatted: string;
}

/**
 * Result of throughput calculation
 */
export interface ThroughputResult {
  bitsPerSecond: number;
  bytesPerSecond: number;
  conversions: ThroughputConversion[];
  steps: string[];
  comparison: string; // Key for translation
  comparisonRatio: number;
}

/**
 * Reference speeds for comparison
 */
const SPEED_REFERENCES = [
  { key: "dial-up", name: "Dial-up", bps: 56_000 },
  { key: "dsl", name: "DSL", bps: 5_000_000 },
  { key: "3g", name: "3G Mobile", bps: 3_000_000 },
  { key: "4g", name: "4G LTE", bps: 25_000_000 },
  { key: "cable", name: "Cable", bps: 100_000_000 },
  { key: "5g", name: "5G", bps: 100_000_000 },
  { key: "fiber", name: "Gigabit Fiber", bps: 1_000_000_000 },
  { key: "10g", name: "10 Gigabit", bps: 10_000_000_000 },
];

/**
 * Find the closest reference speed for comparison
 */
function getSpeedComparison(bps: number): { key: string; ratio: number } {
  // Find closest reference
  const sorted = [...SPEED_REFERENCES].sort(
    (a, b) => Math.abs(a.bps - bps) - Math.abs(b.bps - bps)
  );
  const closest = sorted[0];
  const ratio = bps / closest.bps;
  return { key: closest.key, ratio };
}

/**
 * Format number for display based on magnitude
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return num.toExponential(2);
  if (num >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toExponential(2);
}

/**
 * Calculate network throughput from data size and transfer time
 *
 * @param input - Data size, time, and their units
 * @returns Throughput in various units with speed comparison, or null if invalid
 *
 * @example
 * ```typescript
 * const result = calculateThroughput({
 *   dataSize: 100,
 *   dataSizeUnit: "MB",
 *   transferTime: 10,
 *   transferTimeUnit: "s"
 * });
 * // Returns ~80 Mbps (10 MB/s)
 * ```
 */
export function calculateThroughput(input: ThroughputInput): CalculationResult<ThroughputResult> {
  const { dataSize, dataSizeUnit, transferTime, transferTimeUnit } = input;

  if (dataSize <= 0 || transferTime <= 0) {
    return {
      ok: false,
      error: "Data size and transfer time must be positive",
      code: "INVALID_INPUT",
    };
  }

  const sizeUnit = FILE_SIZE_UNITS.find((u) => u.id === dataSizeUnit);
  const timeUnit = TIME_UNITS.find((u) => u.id === transferTimeUnit);

  if (!sizeUnit) {
    return { ok: false, error: `Unknown data size unit: ${dataSizeUnit}`, code: "INVALID_INPUT" };
  }
  if (!timeUnit) {
    return { ok: false, error: `Unknown time unit: ${transferTimeUnit}`, code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  // Convert to bytes
  const totalBytes = dataSize * sizeUnit.bytes;
  steps.push(`dataSize: ${dataSize} ${dataSizeUnit} = ${totalBytes.toLocaleString()} bytes`);

  // Convert time to seconds
  const timeInSeconds = transferTime * timeUnit.seconds;
  steps.push(`transferTime: ${transferTime} ${transferTimeUnit} = ${timeInSeconds} seconds`);

  // Calculate throughput
  const bytesPerSecond = totalBytes / timeInSeconds;
  const bitsPerSecond = bytesPerSecond * 8;
  steps.push(
    `throughput: ${totalBytes.toLocaleString()} bytes / ${timeInSeconds} s = ${formatNumber(bytesPerSecond)} B/s`
  );
  steps.push(`           = ${formatNumber(bitsPerSecond)} bits/second`);

  // Convert to all bandwidth units
  const conversions: ThroughputConversion[] = BANDWIDTH_UNITS.map((unit) => ({
    unit: unit.name,
    value: bitsPerSecond / unit.bitsPerSecond,
    formatted: formatNumber(bitsPerSecond / unit.bitsPerSecond),
  }));

  // Get speed comparison
  const { key, ratio } = getSpeedComparison(bitsPerSecond);

  return {
    ok: true,
    value: {
      bitsPerSecond,
      bytesPerSecond,
      conversions,
      steps,
      comparison: key,
      comparisonRatio: ratio,
    },
  };
}
