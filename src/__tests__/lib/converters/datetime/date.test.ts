import { describe, expect, it } from "vitest";
import { calculateDate } from "@/lib/converters/datetime/date";

describe("calculateDate", () => {
  it("returns ok: false for missing startDate", () => {
    const result = calculateDate({
      startDate: "",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for invalid startDate", () => {
    const result = calculateDate({
      startDate: "not-a-date",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(false);
  });

  it("adds 1 day to 2024-01-01 → 2024-01-02", () => {
    const result = calculateDate({
      startDate: "2024-01-01",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const resultDate = result.value.resultDate;
      expect(resultDate.getFullYear()).toBe(2024);
      expect(resultDate.getMonth()).toBe(0); // January = 0
      expect(resultDate.getDate()).toBe(2);
    }
  });

  it("adds 1 week to 2024-06-15", () => {
    const result = calculateDate({
      startDate: "2024-06-15",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "1",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.daysFromStart).toBe(7);
    }
  });

  it("subtracts 1 month from 2024-06-15 → May 2024", () => {
    const result = calculateDate({
      startDate: "2024-06-15",
      operation: "subtract",
      years: "0",
      months: "1",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resultDate.getMonth()).toBe(4); // May = 4
    }
  });

  it("adds 1 year to 2024-01-01 → 2025-01-01", () => {
    const result = calculateDate({
      startDate: "2024-01-01",
      operation: "add",
      years: "1",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resultDate.getFullYear()).toBe(2025);
      // 2024 is a leap year (366 days), so 2024-01-01 + 1 year = 366 days difference
      expect(result.value.daysFromStart).toBe(366);
    }
  });

  it("adds 0 to date returns same date with 0 daysFromStart", () => {
    const result = calculateDate({
      startDate: "2024-06-15",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.daysFromStart).toBe(0);
    }
  });

  it("returns dayOfWeekKey for 2024-01-01 (monday)", () => {
    const result = calculateDate({
      startDate: "2024-01-01",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dayOfWeekKey).toBe("monday");
    }
  });

  it("returns formattedDate string", () => {
    const result = calculateDate({
      startDate: "2024-06-15",
      operation: "add",
      years: "0",
      months: "0",
      weeks: "0",
      days: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.formattedDate).toContain("2024");
    }
  });
});
