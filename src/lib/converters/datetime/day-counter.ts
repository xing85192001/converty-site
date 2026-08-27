import type { CalculationResult } from "@/types";

export interface DayCounterInput {
  startDate: string;
  endDate: string;
  includeEndDate: boolean;
}

export interface DayCounterResult {
  totalDays: number;
  businessDays: number;
  weekendDays: number;
  weeks: number;
  remainingDays: number;
  months: number;
  formattedDuration: string;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export function calculateDayCounter(input: DayCounterInput): CalculationResult<DayCounterResult> {
  if (!input.startDate || !input.endDate) {
    return { ok: false, error: "Start date and end date are required", code: "INVALID_INPUT" };
  }

  let startDate = new Date(input.startDate);
  let endDate = new Date(input.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, error: "Invalid date format", code: "INVALID_INPUT" };
  }

  // Swap if end is before start
  if (endDate < startDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  // Calculate total days
  const diffMs = endDate.getTime() - startDate.getTime();
  let totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Include end date if specified
  if (input.includeEndDate) {
    totalDays += 1;
  }

  // Calculate business days and weekend days
  const countEnd = new Date(endDate);
  if (!input.includeEndDate) {
    countEnd.setDate(countEnd.getDate() - 1);
  }

  const businessDays = countBusinessDays(startDate, countEnd);
  const weekendDays = totalDays - businessDays;

  // Calculate weeks and remaining days
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Calculate approximate months
  const months = Math.floor(totalDays / 30.44); // Average days per month

  // Format duration
  const parts: string[] = [];
  if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
  if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`);
  if (parts.length === 0) parts.push("0 days");

  return {
    ok: true,
    value: {
      totalDays,
      businessDays,
      weekendDays,
      weeks,
      remainingDays,
      months,
      formattedDuration: parts.join(" and "),
    },
  };
}
