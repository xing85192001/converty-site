import { describe, expect, it } from "vitest";
import { calculateDayCounter } from "@/lib/converters/datetime/day-counter";

describe("calculateDayCounter", () => {
  it("returns ok: false for missing startDate", () => {
    const result = calculateDayCounter({
      startDate: "",
      endDate: "2024-01-05",
      includeEndDate: false,
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for missing endDate", () => {
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "",
      includeEndDate: false,
    });
    expect(result.ok).toBe(false);
  });

  it("counts 4 days between 2024-01-01 and 2024-01-05 (exclusive)", () => {
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "2024-01-05",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBe(4);
    }
  });

  it("counts 5 days between 2024-01-01 and 2024-01-05 (inclusive)", () => {
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "2024-01-05",
      includeEndDate: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBe(5);
    }
  });

  it("counts business days for Mon-Fri week (exclusive)", () => {
    // 2024-01-01 is Monday, 2024-01-05 is Friday
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "2024-01-05",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Mon, Tue, Wed, Thu = 4 business days (exclusive of Fri)
      expect(result.value.businessDays).toBe(4);
    }
  });

  it("swaps dates when end is before start", () => {
    const result = calculateDayCounter({
      startDate: "2024-01-05",
      endDate: "2024-01-01",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBe(4);
    }
  });

  it("calculates weeks and remaining days", () => {
    // 14 days = 2 weeks, 0 remaining
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "2024-01-15",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weeks).toBe(2);
      expect(result.value.remainingDays).toBe(0);
    }
  });

  it("returns 0 days for same start and end date (exclusive)", () => {
    const result = calculateDayCounter({
      startDate: "2024-06-15",
      endDate: "2024-06-15",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBe(0);
    }
  });

  it("returns formattedDuration string", () => {
    const result = calculateDayCounter({
      startDate: "2024-01-01",
      endDate: "2024-01-08",
      includeEndDate: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.formattedDuration).toContain("week");
    }
  });
});
