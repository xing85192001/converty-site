import { describe, expect, it } from "vitest";
import { calculateAge } from "@/lib/converters/datetime/age";

// Note: calculateAge uses `new Date()` internally for "today" reference,
// so we test structural properties and zodiac info that don't depend on today's date.

describe("calculateAge", () => {
  it("returns ok: false for missing birthDate", () => {
    const result = calculateAge({ birthDate: "" });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for invalid birthDate string", () => {
    const result = calculateAge({ birthDate: "not-a-date" });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for future birth date", () => {
    const result = calculateAge({ birthDate: "2099-01-01" });
    expect(result.ok).toBe(false);
  });

  it("returns ok: true for valid past birth date", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
  });

  it("returns positive years for a 1990 birth year", () => {
    const result = calculateAge({ birthDate: "1990-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.years).toBeGreaterThan(30);
    }
  });

  it("includes totalDays as a positive number", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalDays).toBeGreaterThan(0);
    }
  });

  it("includes totalWeeks derived from totalDays", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalWeeks).toBeGreaterThan(0);
      expect(result.value.totalWeeks).toBe(Math.floor(result.value.totalDays / 7));
    }
  });

  it("includes zodiacSign for January 15 (capricorn)", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.zodiacSign).toBe("capricorn");
    }
  });

  it("includes zodiacSign for June 15 (gemini)", () => {
    const result = calculateAge({ birthDate: "2000-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.zodiacSign).toBe("gemini");
    }
  });

  it("includes chineseZodiac for year 2000 (dragon)", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.chineseZodiac).toBe("dragon");
    }
  });

  it("includes nextBirthday with a date", () => {
    const result = calculateAge({ birthDate: "2000-01-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nextBirthday).toBeDefined();
      expect(result.value.nextBirthday.date).toBeInstanceOf(Date);
      expect(result.value.nextBirthday.daysUntil).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns months between 0 and 11", () => {
    const result = calculateAge({ birthDate: "1990-06-15" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.months).toBeGreaterThanOrEqual(0);
      expect(result.value.months).toBeLessThanOrEqual(11);
    }
  });
});
