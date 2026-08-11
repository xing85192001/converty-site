import { describe, expect, it } from "vitest";
import { calculateTimeZone, getTimezoneOptions } from "@/lib/converters/datetime/time-zone";

describe("getTimezoneOptions", () => {
  it("returns an array with at least one timezone", () => {
    const options = getTimezoneOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("each option has value, label, and region properties", () => {
    const options = getTimezoneOptions();
    const first = options[0];
    expect(first).toHaveProperty("value");
    expect(first).toHaveProperty("label");
    expect(first).toHaveProperty("region");
  });

  it("contains at least one America timezone option", () => {
    const options = getTimezoneOptions();
    const america = options.find((o) => o.value.startsWith("America/"));
    expect(america).toBeDefined();
  });
});

describe("calculateTimeZone", () => {
  it("returns ok: false for missing dateTime", () => {
    const result = calculateTimeZone({
      dateTime: "",
      fromTimezone: "UTC",
      toTimezone: "America/New_York",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for missing fromTimezone", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "",
      toTimezone: "UTC",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for missing toTimezone", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "",
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: true for UTC to UTC", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(result.ok).toBe(true);
  });

  it("returns convertedDateTime as a Date object", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedDateTime).toBeInstanceOf(Date);
    }
  });

  it("returns formattedDate and formattedTime strings", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.value.formattedDate).toBe("string");
      expect(result.value.formattedDate.length).toBeGreaterThan(0);
      expect(typeof result.value.formattedTime).toBe("string");
      expect(result.value.formattedTime.length).toBeGreaterThan(0);
    }
  });

  it("offset is 0 minutes for UTC to UTC", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.offsetMinutes).toBe(0);
    }
  });

  it("UTC to America/New_York has negative offset (UTC-4 or UTC-5 depending on DST)", () => {
    const result = calculateTimeZone({
      dateTime: "2024-06-15T12:00",
      fromTimezone: "UTC",
      toTimezone: "America/New_York",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // New York is UTC-4 in summer (EDT), UTC-5 in winter (EST)
      expect(result.value.offsetMinutes).toBeLessThan(0);
    }
  });
});
