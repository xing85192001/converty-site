import type { CalculationResult } from "@/types";
import type { DayOfWeekKey } from "./day-of-week";

export type DateOperation = "add" | "subtract";

export interface DateInput {
  startDate: string;
  operation: DateOperation;
  years: string;
  months: string;
  weeks: string;
  days: string;
}

export interface DateResult {
  resultDate: Date;
  formattedDate: string;
  dayOfWeekKey: DayOfWeekKey;
  daysFromStart: number;
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

export function calculateDate(input: DateInput): CalculationResult<DateResult> {
  if (!input.startDate) {
    return { ok: false, error: "Start date is required", code: "INVALID_INPUT" };
  }

  const startDate = new Date(input.startDate);
  if (Number.isNaN(startDate.getTime())) {
    return { ok: false, error: "Invalid date format", code: "INVALID_INPUT" };
  }

  const years = Number.parseInt(input.years, 10) || 0;
  const months = Number.parseInt(input.months, 10) || 0;
  const weeks = Number.parseInt(input.weeks, 10) || 0;
  const days = Number.parseInt(input.days, 10) || 0;

  const multiplier = input.operation === "add" ? 1 : -1;

  const resultDate = new Date(startDate);
  resultDate.setFullYear(resultDate.getFullYear() + years * multiplier);
  resultDate.setMonth(resultDate.getMonth() + months * multiplier);
  resultDate.setDate(resultDate.getDate() + (weeks * 7 + days) * multiplier);

  const daysFromStart = Math.round(
    (resultDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    ok: true,
    value: {
      resultDate,
      formattedDate: resultDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dayOfWeekKey: DAY_OF_WEEK_KEYS[resultDate.getDay()],
      daysFromStart: Math.abs(daysFromStart),
    },
  };
}
