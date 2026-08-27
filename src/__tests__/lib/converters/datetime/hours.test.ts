import { describe, expect, it } from "vitest";
import { calculateHours } from "@/lib/converters/datetime/hours";

describe("calculateHours", () => {
  it("returns ok: false for missing startTime", () => {
    const result = calculateHours({ startTime: "", endTime: "10:00" });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for missing endTime", () => {
    const result = calculateHours({ startTime: "10:00", endTime: "" });
    expect(result.ok).toBe(false);
  });

  it("calculates 1.5 hours from 10:00 to 11:30", () => {
    const result = calculateHours({ startTime: "10:00", endTime: "11:30" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBe(1.5);
      expect(result.value.hours).toBe(1);
      expect(result.value.minutes).toBe(30);
    }
  });

  it("calculates 2.75 hours from 09:00 to 11:45", () => {
    const result = calculateHours({ startTime: "09:00", endTime: "11:45" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBeCloseTo(2.75, 2);
    }
  });

  it("handles end time before start time (assumes next day)", () => {
    const result = calculateHours({ startTime: "23:00", endTime: "01:00" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBeCloseTo(2, 2);
    }
  });

  it("returns formattedDuration string", () => {
    const result = calculateHours({ startTime: "10:00", endTime: "11:30" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.formattedDuration).toContain("1h");
      expect(result.value.formattedDuration).toContain("30m");
    }
  });

  it("calculates with explicit dates", () => {
    const result = calculateHours({
      startTime: "10:00",
      endTime: "12:00",
      startDate: "2024-06-15",
      endDate: "2024-06-15",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBe(2);
    }
  });

  it("calculates hours spanning days when dates are provided", () => {
    const result = calculateHours({
      startTime: "22:00",
      endTime: "02:00",
      startDate: "2024-06-15",
      endDate: "2024-06-16",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalHours).toBeCloseTo(4, 2);
    }
  });

  it("calculates total minutes correctly for 1h30m", () => {
    const result = calculateHours({ startTime: "10:00", endTime: "11:30" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalMinutes).toBe(90);
      expect(result.value.totalSeconds).toBe(5400);
    }
  });
});
