/**
 * Network latency converter
 *
 * Converts ping/latency values between time units (seconds, milliseconds,
 * microseconds, nanoseconds) and provides educational context about latency
 * categories and typical use cases.
 *
 * Features:
 * - Unit conversion with high precision (nanosecond base)
 * - Latency category classification (ultra-low to high)
 * - Typical use case identification (same rack to satellite)
 * - Smart value formatting based on magnitude
 */

import type { CalculationResult } from "@/types";

/**
 * Latency time unit definition
 */
export interface LatencyUnit {
  /** Unique identifier for the unit */
  id: string;

  /** Human-readable name */
  name: string;

  /** Standard abbreviation */
  abbreviation: string;

  /** Conversion factor to nanoseconds (base unit) */
  nanoseconds: number;
}

/**
 * Available latency units with conversion factors
 *
 * Uses nanoseconds as the base unit for precision in all conversions.
 * Note: "us" is used as the id (ASCII) but should be displayed as "μs" (Unicode) in UI.
 */
export const LATENCY_UNITS: LatencyUnit[] = [
  { id: "s", name: "Seconds", abbreviation: "s", nanoseconds: 1e9 },
  { id: "ms", name: "Milliseconds", abbreviation: "ms", nanoseconds: 1e6 },
  { id: "us", name: "Microseconds", abbreviation: "us", nanoseconds: 1e3 },
  { id: "ns", name: "Nanoseconds", abbreviation: "ns", nanoseconds: 1 },
];

/**
 * Single latency conversion result
 */
export interface LatencyConversion {
  /** Target unit */
  unit: LatencyUnit;

  /** Converted numeric value */
  value: number;

  /** Formatted string representation */
  formatted: string;
}

/**
 * Complete latency conversion result
 */
export interface LatencyResult {
  /** Base value in nanoseconds */
  nanoseconds: number;

  /** Conversions to all supported units */
  conversions: LatencyConversion[];

  /** Latency category based on millisecond value */
  category: "ultraLow" | "low" | "moderate" | "high";

  /** Translation key for typical use case description */
  typicalUseCase: string;
}

/**
 * Categorize latency based on millisecond value
 *
 * Categories:
 * - Ultra-low (< 1ms): Same datacenter, sub-millisecond response
 * - Low (1-20ms): Same region, excellent performance
 * - Moderate (20-100ms): Cross-region, acceptable performance
 * - High (> 100ms): Intercontinental, satellite, or congested
 *
 * @param nanoseconds - Latency in nanoseconds
 * @returns Latency category
 */
function categorizeLatency(nanoseconds: number): "ultraLow" | "low" | "moderate" | "high" {
  const milliseconds = nanoseconds / 1e6;

  if (milliseconds < 1) return "ultraLow";
  if (milliseconds < 20) return "low";
  if (milliseconds < 100) return "moderate";
  return "high";
}

/**
 * Get typical use case for latency value
 *
 * Returns translation key for typical network scenario based on latency.
 *
 * Use cases:
 * - < 1μs: Same rack in datacenter
 * - < 500μs: Same datacenter, different rack
 * - < 5ms: Same city/region
 * - < 50ms: Cross-country (same continent)
 * - < 150ms: Cross-ocean (different continent)
 * - ≥ 150ms: Satellite or heavily congested network
 *
 * @param nanoseconds - Latency in nanoseconds
 * @returns Translation key for use case
 */
function getTypicalUseCase(nanoseconds: number): string {
  const milliseconds = nanoseconds / 1e6;

  if (milliseconds < 0.001) return "sameRack";
  if (milliseconds < 0.5) return "sameDatacenter";
  if (milliseconds < 5) return "sameRegion";
  if (milliseconds < 50) return "crossCountry";
  if (milliseconds < 150) return "crossOcean";
  return "satellite";
}

/**
 * Format latency value with appropriate precision
 *
 * Formatting rules:
 * - Very large values (≥ 1M): Scientific notation (e.g., "1.23e+6")
 * - Large values (≥ 1000): Locale string with commas (e.g., "1,234.56")
 * - Medium values (≥ 1): Fixed 2 decimals (e.g., "123.45")
 * - Small values (≥ 0.01): Fixed 4 decimals (e.g., "0.1234")
 * - Very small values (< 0.01): Scientific notation (e.g., "1.23e-5")
 *
 * @param value - Numeric value to format
 * @returns Formatted string
 */
function formatLatencyValue(value: number): string {
  if (value >= 1000000) return value.toExponential(2);
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toExponential(2);
}

/**
 * Convert latency value between time units
 *
 * Converts a latency value from one time unit to all supported units,
 * and provides context about the latency category and typical use case.
 *
 * @param value - Input latency value (must be positive)
 * @param fromUnit - Source unit ID (s, ms, us, ns)
 * @returns Complete conversion result with all units, category, and use case
 * @returns null if value is invalid (≤ 0) or unit is not found
 *
 * @example
 * // Convert 100 milliseconds
 * convertLatency(100, "ms")
 * // Returns: {
 * //   nanoseconds: 100000000,
 * //   conversions: [
 * //     { unit: {...}, value: 0.1, formatted: "0.10" },      // seconds
 * //     { unit: {...}, value: 100, formatted: "100.00" },    // milliseconds
 * //     { unit: {...}, value: 100000, formatted: "100,000" }, // microseconds
 * //     { unit: {...}, value: 100000000, formatted: "1.00e+8" } // nanoseconds
 * //   ],
 * //   category: "high",
 * //   typicalUseCase: "satellite"
 * // }
 */
export function convertLatency(value: number, fromUnit: string): CalculationResult<LatencyResult> {
  // Validate positive value
  if (value <= 0) {
    return { ok: false, error: "Value must be positive", code: "INVALID_INPUT" };
  }

  // Find source unit
  const sourceUnit = LATENCY_UNITS.find((u) => u.id === fromUnit);
  if (!sourceUnit) {
    return { ok: false, error: `Unknown unit: ${fromUnit}`, code: "INVALID_INPUT" };
  }

  // Convert to base unit (nanoseconds)
  const nanoseconds = value * sourceUnit.nanoseconds;

  // Convert to all units
  const conversions: LatencyConversion[] = LATENCY_UNITS.map((unit) => {
    const converted = nanoseconds / unit.nanoseconds;
    return {
      unit,
      value: converted,
      formatted: formatLatencyValue(converted),
    };
  });

  return {
    ok: true,
    value: {
      nanoseconds,
      conversions,
      category: categorizeLatency(nanoseconds),
      typicalUseCase: getTypicalUseCase(nanoseconds),
    },
  };
}
