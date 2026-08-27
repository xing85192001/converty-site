import type { CalculationResult } from "@/types";

export type DayOfWeekKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface DayOfWeekInput {
  date: string;
}

export interface DayOfWeekResult {
  dayOfWeekKey: DayOfWeekKey;
  dayNumber: number;
  isWeekend: boolean;
  weekNumber: number;
  dayOfYear: number;
  daysLeftInYear: number;
  quarter: number;
}

const DAY_OF_WEEK_KEYS: DayOfWeekKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDaysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

export function calculateDayOfWeek(input: DayOfWeekInput): CalculationResult<DayOfWeekResult> {
  if (!input.date) {
    return { ok: false, error: "Date is required", code: "INVALID_INPUT" };
  }

  const date = new Date(input.date);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Invalid date format", code: "INVALID_INPUT" };
  }

  const dayNumber = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const daysInYear = getDaysInYear(date.getFullYear());

  return {
    ok: true,
    value: {
      dayOfWeekKey: DAY_OF_WEEK_KEYS[dayNumber],
      dayNumber,
      isWeekend: dayNumber === 0 || dayNumber === 6,
      weekNumber: getWeekNumber(date),
      dayOfYear,
      daysLeftInYear: daysInYear - dayOfYear,
      quarter: Math.ceil((date.getMonth() + 1) / 3),
    },
  };
}
