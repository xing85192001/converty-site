import type { CalculationResult } from "@/types";

export type TimeOperation = "add" | "subtract";

export interface TimeInput {
  startTime: string;
  operation: TimeOperation;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface TimeResult {
  resultTime: string;
  formatted12h: string;
  formatted24h: string;
  totalSeconds: number;
  crossesMidnight: boolean;
  dayChange: number;
  period: "AM" | "PM";
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

function formatTime24h(hours: number, minutes: number, seconds: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatTime12h(hours: number, minutes: number, seconds: number): string {
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function calculateTime(input: TimeInput): CalculationResult<TimeResult> {
  if (!input.startTime) {
    return { ok: false, error: "Start time is required", code: "INVALID_INPUT" };
  }

  const startTime = parseTime(input.startTime);
  if (!startTime) {
    return { ok: false, error: "Invalid time format", code: "INVALID_INPUT" };
  }

  const addHours = Number.parseInt(input.hours, 10) || 0;
  const addMinutes = Number.parseInt(input.minutes, 10) || 0;
  const addSeconds = Number.parseInt(input.seconds, 10) || 0;

  const multiplier = input.operation === "add" ? 1 : -1;

  // Convert everything to seconds
  const startTotalSeconds = startTime.hours * 3600 + startTime.minutes * 60 + startTime.seconds;
  const changeSeconds = (addHours * 3600 + addMinutes * 60 + addSeconds) * multiplier;
  let resultTotalSeconds = startTotalSeconds + changeSeconds;

  // Calculate day change
  const secondsInDay = 24 * 60 * 60;
  let dayChange = 0;

  while (resultTotalSeconds < 0) {
    resultTotalSeconds += secondsInDay;
    dayChange--;
  }
  while (resultTotalSeconds >= secondsInDay) {
    resultTotalSeconds -= secondsInDay;
    dayChange++;
  }

  // Convert back to hours, minutes, seconds
  const resultHours = Math.floor(resultTotalSeconds / 3600);
  const resultMinutes = Math.floor((resultTotalSeconds % 3600) / 60);
  const resultSeconds = resultTotalSeconds % 60;

  return {
    ok: true,
    value: {
      resultTime: formatTime24h(resultHours, resultMinutes, resultSeconds),
      formatted12h: formatTime12h(resultHours, resultMinutes, resultSeconds),
      formatted24h: formatTime24h(resultHours, resultMinutes, resultSeconds),
      totalSeconds: resultTotalSeconds,
      crossesMidnight: dayChange !== 0,
      dayChange,
      period: resultHours >= 12 ? "PM" : "AM",
    },
  };
}
