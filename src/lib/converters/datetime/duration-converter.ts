/**
 * Duration Converter
 * Converts between time units (seconds, minutes, hours, days, weeks, months, years)
 */

import type { CalculationResult } from "@/types";

export type DurationUnit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";

export interface DurationConverterInput {
  value: string;
  unit: DurationUnit;
}

export interface DurationConverterResult {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
  timeComponents: Array<{
    count: number;
    unitKey: "year" | "month" | "week" | "day" | "hour" | "minute" | "second";
  }>;
}

// Conversion factors to seconds
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2629746; // Average: 365.25 / 12 days
const SECONDS_PER_YEAR = 31556952; // 365.25 days

const UNIT_TO_SECONDS: Record<DurationUnit, number> = {
  seconds: 1,
  minutes: SECONDS_PER_MINUTE,
  hours: SECONDS_PER_HOUR,
  days: SECONDS_PER_DAY,
  weeks: SECONDS_PER_WEEK,
  months: SECONDS_PER_MONTH,
  years: SECONDS_PER_YEAR,
};

export const DURATION_UNITS: { id: DurationUnit; label: string }[] = [
  { id: "seconds", label: "s" },
  { id: "minutes", label: "min" },
  { id: "hours", label: "h" },
  { id: "days", label: "d" },
  { id: "weeks", label: "wk" },
  { id: "months", label: "mo" },
  { id: "years", label: "yr" },
];

function getTimeComponents(totalSeconds: number): Array<{
  count: number;
  unitKey: "year" | "month" | "week" | "day" | "hour" | "minute" | "second";
}> {
  if (totalSeconds === 0) {
    return [{ count: 0, unitKey: "second" }];
  }

  const isNegative = totalSeconds < 0;
  let remaining = Math.abs(totalSeconds);

  const years = Math.floor(remaining / SECONDS_PER_YEAR);
  remaining %= SECONDS_PER_YEAR;

  const months = Math.floor(remaining / SECONDS_PER_MONTH);
  remaining %= SECONDS_PER_MONTH;

  const weeks = Math.floor(remaining / SECONDS_PER_WEEK);
  remaining %= SECONDS_PER_WEEK;

  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining %= SECONDS_PER_DAY;

  const hours = Math.floor(remaining / SECONDS_PER_HOUR);
  remaining %= SECONDS_PER_HOUR;

  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE);
  const seconds = Math.round(remaining % SECONDS_PER_MINUTE);

  const components: Array<{
    count: number;
    unitKey: "year" | "month" | "week" | "day" | "hour" | "minute" | "second";
  }> = [];

  if (years > 0) components.push({ count: isNegative ? -years : years, unitKey: "year" });
  if (months > 0) components.push({ count: months, unitKey: "month" });
  if (weeks > 0) components.push({ count: weeks, unitKey: "week" });
  if (days > 0) components.push({ count: days, unitKey: "day" });
  if (hours > 0) components.push({ count: hours, unitKey: "hour" });
  if (minutes > 0) components.push({ count: minutes, unitKey: "minute" });
  if (seconds > 0) components.push({ count: seconds, unitKey: "second" });

  return components;
}

export function convertDuration(
  input: DurationConverterInput
): CalculationResult<DurationConverterResult> {
  const numValue = Number.parseFloat(input.value);

  if (Number.isNaN(numValue)) {
    return { ok: false, error: "Invalid numeric value", code: "INVALID_INPUT" };
  }

  // Convert input to seconds
  const totalSeconds = numValue * UNIT_TO_SECONDS[input.unit];

  return {
    ok: true,
    value: {
      seconds: totalSeconds,
      minutes: totalSeconds / SECONDS_PER_MINUTE,
      hours: totalSeconds / SECONDS_PER_HOUR,
      days: totalSeconds / SECONDS_PER_DAY,
      weeks: totalSeconds / SECONDS_PER_WEEK,
      months: totalSeconds / SECONDS_PER_MONTH,
      years: totalSeconds / SECONDS_PER_YEAR,
      timeComponents: getTimeComponents(totalSeconds),
    },
  };
}
