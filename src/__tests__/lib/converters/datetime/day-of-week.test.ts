import { describe, expect, it } from "vitest";
import { calculateDayOfWeek } from "@/lib/converters/datetime/day-of-week";

describe("calculateDayOfWeek", () => {
  it("returns ok: false for empty date", () => {
    const result = calculateDayOfWeek({ date: "" });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for invalid date", () => {
    const result = calculateDayOfWeek({ date: "not-a-date" });
    expect(result.ok).toBe(false);
  });

  it("2024-01-01 is a Monday", () => {
    const result = calculateDayOfWeek({ date: "2024-01-01" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfWeekKey).toBe("monday");
      expect(result.value.dayNumber).toBe(1);
      expect(result.value.isWeekend).toBe(false);
    }
  });

  it("2024-06-15 is a Saturday", () => {
    const result = calculateDayOfWeek({ date: "2024-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfWeekKey).toBe("saturday");
      expect(result.value.isWeekend).toBe(true);
    }
  });

  it("2024-06-16 is a Sunday (weekend)", () => {
    const result = calculateDayOfWeek({ date: "2024-06-16" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfWeekKey).toBe("sunday");
      expect(result.value.isWeekend).toBe(true);
    }
  });

  it("2024-06-14 is a Friday (not weekend)", () => {
    const result = calculateDayOfWeek({ date: "2024-06-14" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfWeekKey).toBe("friday");
      expect(result.value.isWeekend).toBe(false);
    }
  });

  it("returns dayOfYear between 1 and 366", () => {
    const result = calculateDayOfWeek({ date: "2024-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfYear).toBeGreaterThanOrEqual(1);
      expect(result.value.dayOfYear).toBeLessThanOrEqual(366);
    }
  });

  it("returns weekNumber between 1 and 53", () => {
    const result = calculateDayOfWeek({ date: "2024-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weekNumber).toBeGreaterThanOrEqual(1);
      expect(result.value.weekNumber).toBeLessThanOrEqual(53);
    }
  });

  it("returns quarter between 1 and 4", () => {
    const result = calculateDayOfWeek({ date: "2024-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.quarter).toBe(2); // June is Q2
    }
  });

  it("2024-01-01 is in Q1", () => {
    const result = calculateDayOfWeek({ date: "2024-01-01" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.quarter).toBe(1);
    }
  });

  it("2024-12-31 is in Q4", () => {
    const result = calculateDayOfWeek({ date: "2024-12-31" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.quarter).toBe(4);
    }
  });
});
