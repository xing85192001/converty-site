import { describe, expect, it } from "vitest";
import { calculateOvulation } from "@/lib/converters/health/ovulation-calculator";

describe("calculateOvulation", () => {
  describe("null for invalid inputs", () => {
    it("returns null for cycleLength < 21", () => {
      expect(calculateOvulation({ lastPeriodDate: "2024-01-01", cycleLength: 20 }).ok).toBe(false);
    });

    it("returns null for cycleLength > 40", () => {
      expect(calculateOvulation({ lastPeriodDate: "2024-01-01", cycleLength: 41 }).ok).toBe(false);
    });

    it("returns null for invalid date string", () => {
      expect(calculateOvulation({ lastPeriodDate: "not-a-date", cycleLength: 28 }).ok).toBe(false);
    });
  });

  describe("28-day cycle starting 2024-01-01", () => {
    it("ovulation occurs on day 14 of cycle (2024-01-15)", () => {
      // Ovulation = LMP + (cycleLength - 14) = 2024-01-01 + 14 days = 2024-01-15
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.ovulationDate).toBe("2024-01-15");
    });

    it("fertile window starts 5 days before ovulation (2024-01-10)", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fertileWindowStart).toBe("2024-01-10");
    });

    it("fertile window ends 1 day after ovulation (2024-01-16)", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fertileWindowEnd).toBe("2024-01-16");
    });

    it("next period is 28 days after LMP (2024-01-29)", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.nextPeriodDate).toBe("2024-01-29");
    });
  });

  describe("fertile window details", () => {
    it("fertile window contains 7 entries (-5 to +1 from ovulation)", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fertileWindow.length).toBe(7);
    });

    it("ovulation day has peak fertility", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      const peakDay = (result as { ok: true; value: any }).value.fertileWindow.find(
        (d: { fertility: string; date: string }) => d.fertility === "peak"
      );
      expect(peakDay).toBeDefined();
      expect(peakDay?.date).toBe("2024-01-15");
    });
  });

  describe("upcoming cycles", () => {
    it("returns 6 upcoming cycles", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.upcomingCycles.length).toBe(6);
    });

    it("first upcoming cycle starts 28 days after LMP", () => {
      const result = calculateOvulation({
        lastPeriodDate: "2024-01-01",
        cycleLength: 28,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.upcomingCycles[0].periodStart).toBe(
        "2024-01-29"
      );
    });
  });
});
