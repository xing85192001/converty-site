import type { CalculationResult } from "@/types";

export interface BandwidthUnit {
  id: string;
  name: string;
  bitsPerSecond: number;
}

export const BANDWIDTH_UNITS: BandwidthUnit[] = [
  // Bits per second
  { id: "bps", name: "bps", bitsPerSecond: 1 },
  { id: "kbps", name: "Kbps", bitsPerSecond: 1000 },
  { id: "mbps", name: "Mbps", bitsPerSecond: 1000000 },
  { id: "gbps", name: "Gbps", bitsPerSecond: 1000000000 },
  // Bytes per second
  { id: "Bps", name: "B/s", bitsPerSecond: 8 },
  { id: "KBps", name: "KB/s", bitsPerSecond: 8000 },
  { id: "MBps", name: "MB/s", bitsPerSecond: 8000000 },
  { id: "GBps", name: "GB/s", bitsPerSecond: 8000000000 },
];

export interface BandwidthConversion {
  unit: string;
  value: number;
  formatted: string;
}

export interface BandwidthResult {
  bitsPerSecond: number;
  conversions: BandwidthConversion[];
  perDay: {
    GB: number;
    TB: number;
  };
  perWeek: {
    GB: number;
    TB: number;
  };
  perMonth: {
    GB: number;
    TB: number;
  };
}

export function convertBandwidth(
  value: number,
  fromUnit: string
): CalculationResult<BandwidthResult> {
  if (value <= 0) {
    return {
      ok: false,
      error: "Value must be positive",
      code: "INVALID_INPUT",
    };
  }

  const sourceUnit = BANDWIDTH_UNITS.find((u) => u.id === fromUnit);
  if (!sourceUnit) {
    return {
      ok: false,
      error: `Unknown bandwidth unit: ${fromUnit}`,
      code: "INVALID_INPUT",
    };
  }

  const bitsPerSecond = value * sourceUnit.bitsPerSecond;
  const bytesPerSecond = bitsPerSecond / 8;

  // Calculate conversions to all units
  const conversions: BandwidthConversion[] = BANDWIDTH_UNITS.map((unit) => {
    const converted = bitsPerSecond / unit.bitsPerSecond;
    return {
      unit: unit.name,
      value: converted,
      formatted: formatNumber(converted),
    };
  });

  // Time-based calculations
  const secondsPerDay = 86400;
  const secondsPerWeek = 604800;
  const secondsPerMonth = 2592000; // 30 days

  const bytesPerDay = bytesPerSecond * secondsPerDay;
  const bytesPerWeek = bytesPerSecond * secondsPerWeek;
  const bytesPerMonth = bytesPerSecond * secondsPerMonth;

  const GB = 1024 * 1024 * 1024;
  const TB = 1024 * 1024 * 1024 * 1024;

  return {
    ok: true,
    value: {
      bitsPerSecond,
      conversions,
      perDay: {
        GB: bytesPerDay / GB,
        TB: bytesPerDay / TB,
      },
      perWeek: {
        GB: bytesPerWeek / GB,
        TB: bytesPerWeek / TB,
      },
      perMonth: {
        GB: bytesPerMonth / GB,
        TB: bytesPerMonth / TB,
      },
    },
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return num.toExponential(2);
  }
  if (num >= 1000) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (num >= 1) {
    return num.toFixed(2);
  }
  if (num >= 0.01) {
    return num.toFixed(4);
  }
  return num.toExponential(2);
}
