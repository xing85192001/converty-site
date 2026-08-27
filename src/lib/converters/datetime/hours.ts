import type { CalculationResult } from "@/types";

export interface HoursInput {
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
}

export interface HoursResult {
  totalHours: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  totalSeconds: number;
  formattedDuration: string;
}

function parseTime(timeStr: string): { hours: number; minutes: number; seconds: number } | null {
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;

  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  const seconds = parts[2] ? Number.parseInt(parts[2], 10) : 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

  return { hours, minutes, seconds };
}

export function calculateHours(input: HoursInput): CalculationResult<HoursResult> {
  if (!input.startTime || !input.endTime) {
    return { ok: false, error: "Start time and end time are required", code: "INVALID_INPUT" };
  }

  const startTime = parseTime(input.startTime);
  const endTime = parseTime(input.endTime);

  if (!startTime || !endTime) {
    return { ok: false, error: "Invalid time format", code: "INVALID_INPUT" };
  }

  let startDate: Date;
  let endDate: Date;

  if (input.startDate && input.endDate) {
    // If dates are provided, use full datetime calculation
    startDate = new Date(input.startDate);
    endDate = new Date(input.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { ok: false, error: "Invalid date format", code: "INVALID_INPUT" };
    }

    startDate.setHours(startTime.hours, startTime.minutes, startTime.seconds);
    endDate.setHours(endTime.hours, endTime.minutes, endTime.seconds);
  } else {
    // Time only - assume same day, end time is always after start
    const today = new Date();
    startDate = new Date(today);
    endDate = new Date(today);

    startDate.setHours(startTime.hours, startTime.minutes, startTime.seconds, 0);
    endDate.setHours(endTime.hours, endTime.minutes, endTime.seconds, 0);

    // If end time is before start time, assume next day
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
  }

  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 0) {
    return { ok: false, error: "End time must be after start time", code: "INVALID_INPUT" };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = diffMs / (1000 * 60 * 60);

  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format duration
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return {
    ok: true,
    value: {
      totalHours: Math.round(totalHours * 100) / 100,
      hours,
      minutes,
      seconds,
      totalMinutes,
      totalSeconds,
      formattedDuration: parts.join(" "),
    },
  };
}
