import { describe, expect, it } from "vitest";
import { calculatePeriod } from "@/lib/converters/health/period-calculator";

// Note: calculatePeriod internally uses new Date() for "today" — tests verify
// structural properties and cycle arithmetic rather than absolute date values.

describe("calculatePeriod", () => {
  describe("null for invalid inputs", () => {
    it("returns null for cycleLength < 21", () => {
      expect(
        calculatePeriod({ lastPeriodDate: "2024-01-01", cycleLength: 20, periodLength: 5 }).ok
      ).toBe(false);
    });

    it("returns null for cycleLength > 40", () => {
      expect(
        calculatePeriod({ lastPeriodDate: "2024-01-01", cycleLength: 41, periodLength: 5 }).ok
      ).toBe(false);
    });

    it("returns null for periodLength < 2", () => {
      expect(
        calculatePeriod({ lastPeriodDate: "2024-01-01", cycleLength: 28, periodLength: 1 }).ok
      ).toBe(false);
    });

    it("returns null for periodLength > 10", () => {
      expect(
        calculatePeriod({ lastPeriodDate: "2024-01-01", cycleLength: 28, periodLength: 11 }).ok
      ).toBe(false);
    });

    it("returns null for invalid date string", () => {
      expect(
        calculatePeriod({ lastPeriodDate: "not-a-date", cycleLength: 28, periodLength: 5 }).ok
      ).toBe(false);
    });
  });

  describe("upcoming periods", () => {
    it("returns 6 upcoming periods", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.upcomingPeriods.length).toBe(6);
    });

    it("upcoming periods are sequential with correct cycle spacing", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      // Period 2 should be ~28 days after period 1
      const p1Start = new Date(
        (result as { ok: true; value: any }).value.upcomingPeriods[0].startDate
      );
      const p2Start = new Date(
        (result as { ok: true; value: any }).value.upcomingPeriods[1].startDate
      );
      const diff = Math.round((p2Start.getTime() - p1Start.getTime()) / (1000 * 60 * 60 * 24));
      expect(diff).toBe(28);
    });
  });

  describe("cycle phases", () => {
    it("returns 4 cycle phases", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.cyclePhases.length).toBe(4);
    });

    it("cycle phases include menstrual and luteal", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      const phaseNames = (result as { ok: true; value: any }).value.cyclePhases.map(
        (p: { phase: string }) => p.phase
      );
      expect(phaseNames.some((n: string) => n.includes("menstrual"))).toBe(true);
      expect(phaseNames.some((n: string) => n.includes("luteal"))).toBe(true);
    });
  });

  describe("result structure", () => {
    it("returns nextPeriodDate, ovulationDate, fertileWindowStart, fertileWindowEnd", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.nextPeriodDate).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
      expect((result as { ok: true; value: any }).value.ovulationDate).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
      expect((result as { ok: true; value: any }).value.fertileWindowStart).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
      expect((result as { ok: true; value: any }).value.fertileWindowEnd).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
    });

    it("daysUntilNextPeriod is a non-negative number", () => {
      const result = calculatePeriod({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
        periodLength: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.daysUntilNextPeriod).toBeGreaterThanOrEqual(
        0
      );
    });
  });
});
