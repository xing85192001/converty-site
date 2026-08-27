import type { CalculationResult } from "@/types";

export interface TimeDurationInput {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface TimeDurationResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  timeComponents: Array<{
    count: number;
    unitKey: "year" | "month" | "day" | "hour" | "minute" | "second";
  }>;
}

export function calculateTimeDuration(
  input: TimeDurationInput
): CalculationResult<TimeDurationResult> {
  if (!input.startDate || !input.startTime || !input.endDate || !input.endTime) {
    return { ok: false, error: "Start and end date/time are required", code: "INVALID_INPUT" };
  }

  const startDateTime = new Date(`${input.startDate}T${input.startTime}`);
  const endDateTime = new Date(`${input.endDate}T${input.endTime}`);

  if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
    return { ok: false, error: "Invalid date or time format", code: "INVALID_INPUT" };
  }

  // Ensure end is after start
  if (endDateTime < startDateTime) {
    return {
      ok: false,
      error: "End date/time must be after start date/time",
      code: "INVALID_INPUT",
    };
  }

  const diffMs = endDateTime.getTime() - startDateTime.getTime();

  // Calculate totals
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Calculate individual components
  let years = endDateTime.getFullYear() - startDateTime.getFullYear();
  let months = endDateTime.getMonth() - startDateTime.getMonth();
  let days = endDateTime.getDate() - startDateTime.getDate();
  let hours = endDateTime.getHours() - startDateTime.getHours();
  let minutes = endDateTime.getMinutes() - startDateTime.getMinutes();
  let seconds = endDateTime.getSeconds() - startDateTime.getSeconds();

  // Handle negative values
  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    // Get days in previous month
    const prevMonth = new Date(endDateTime.getFullYear(), endDateTime.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  // Build time components array
  const timeComponents: Array<{
    count: number;
    unitKey: "year" | "month" | "day" | "hour" | "minute" | "second";
  }> = [];
  if (years > 0) timeComponents.push({ count: years, unitKey: "year" });
  if (months > 0) timeComponents.push({ count: months, unitKey: "month" });
  if (days > 0) timeComponents.push({ count: days, unitKey: "day" });
  if (hours > 0) timeComponents.push({ count: hours, unitKey: "hour" });
  if (minutes > 0) timeComponents.push({ count: minutes, unitKey: "minute" });
  if (seconds > 0 || timeComponents.length === 0)
    timeComponents.push({ count: seconds, unitKey: "second" });

  return {
    ok: true,
    value: {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      timeComponents,
    },
  };
}
