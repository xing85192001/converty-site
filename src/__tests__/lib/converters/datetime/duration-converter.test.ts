import { describe, expect, it } from "vitest";
import { convertDuration } from "@/lib/converters/datetime/duration-converter";

describe("convertDuration", () => {
  it("returns ok: false for non-numeric value", () => {
    const result = convertDuration({ value: "abc", unit: "seconds" });
    expect(result.ok).toBe(false);
  });

  it("converts 3600 seconds to 1 hour", () => {
    const result = convertDuration({ value: "3600", unit: "seconds" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hours).toBe(1);
      expect(result.value.minutes).toBe(60);
      expect(result.value.days).toBeCloseTo(1 / 24, 4);
    }
  });

  it("converts 0 seconds to all zeros", () => {
    const result = convertDuration({ value: "0", unit: "seconds" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seconds).toBe(0);
      expect(result.value.minutes).toBe(0);
      expect(result.value.hours).toBe(0);
    }
  });

  it("converts 1 hour to 3600 seconds", () => {
    const result = convertDuration({ value: "1", unit: "hours" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seconds).toBe(3600);
      expect(result.value.minutes).toBe(60);
    }
  });

  it("converts 1 day to 24 hours and 86400 seconds", () => {
    const result = convertDuration({ value: "1", unit: "days" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hours).toBe(24);
      expect(result.value.seconds).toBe(86400);
    }
  });

  it("converts 1 minute to 60 seconds", () => {
    const result = convertDuration({ value: "1", unit: "minutes" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seconds).toBe(60);
    }
  });

  it("includes timeComponents for 3661 seconds (1h 1m 1s)", () => {
    const result = convertDuration({ value: "3661", unit: "seconds" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const hourComponent = result.value.timeComponents.find((c) => c.unitKey === "hour");
      const minuteComponent = result.value.timeComponents.find((c) => c.unitKey === "minute");
      const secondComponent = result.value.timeComponents.find((c) => c.unitKey === "second");
      expect(hourComponent).toBeDefined();
      expect(hourComponent!.count).toBe(1);
      expect(minuteComponent).toBeDefined();
      expect(minuteComponent!.count).toBe(1);
      expect(secondComponent).toBeDefined();
      expect(secondComponent!.count).toBe(1);
    }
  });

  it("timeComponents for 0 seconds returns [{ count: 0, unitKey: 'second' }]", () => {
    const result = convertDuration({ value: "0", unit: "seconds" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.timeComponents).toHaveLength(1);
      expect(result.value.timeComponents[0]).toEqual({ count: 0, unitKey: "second" });
    }
  });

  it("converts 1 week to 7 days", () => {
    const result = convertDuration({ value: "1", unit: "weeks" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.days).toBe(7);
    }
  });
});
