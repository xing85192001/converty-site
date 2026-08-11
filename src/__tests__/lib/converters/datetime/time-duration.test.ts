import { describe, expect, it } from "vitest";
import { calculateTimeDuration } from "@/lib/converters/datetime/time-duration";

describe("calculateTimeDuration", () => {
  it("returns ok: false for missing startDate", () => {
    const result = calculateTimeDuration({
      startDate: "",
      startTime: "10:00",
      endDate: "2024-06-15",
      endTime: "12:00",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for missing startTime", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "",
      endDate: "2024-06-15",
      endTime: "12:00",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false when end is before start", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "12:00",
      endDate: "2024-06-15",
      endTime: "10:00",
    });
    expect(result.ok).toBe(false);
  });

  it("calculates 2 hours from 10:00 to 12:00 on same day", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "10:00",
      endDate: "2024-06-15",
      endTime: "12:00",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBe(2);
      expect(result.value.hours).toBe(2);
      expect(result.value.minutes).toBe(0);
      expect(result.value.totalSeconds).toBe(7200);
    }
  });

  it("calculates 1 day duration", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "12:00",
      endDate: "2024-06-16",
      endTime: "12:00",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBe(1);
      expect(result.value.days).toBe(1);
    }
  });

  it("calculates duration spanning multiple components", () => {
    const result = calculateTimeDuration({
      startDate: "2024-01-01",
      startTime: "00:00",
      endDate: "2024-06-15",
      endTime: "12:30",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.months).toBeGreaterThan(0);
      expect(result.value.totalDays).toBeGreaterThan(150);
    }
  });

  it("calculates seconds correctly for 1h1m1s", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "10:00:00",
      endDate: "2024-06-15",
      endTime: "11:01:01",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalSeconds).toBe(3661);
      expect(result.value.hours).toBe(1);
      expect(result.value.minutes).toBe(1);
      expect(result.value.seconds).toBe(1);
    }
  });

  it("returns timeComponents array with non-zero values", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "10:00",
      endDate: "2024-06-15",
      endTime: "12:00",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.timeComponents.length).toBeGreaterThan(0);
      expect(result.value.timeComponents[0].unitKey).toBe("hour");
      expect(result.value.timeComponents[0].count).toBe(2);
    }
  });

  it("returns 0 seconds for identical start and end", () => {
    const result = calculateTimeDuration({
      startDate: "2024-06-15",
      startTime: "10:00",
      endDate: "2024-06-15",
      endTime: "10:00",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalSeconds).toBe(0);
    }
  });
});
