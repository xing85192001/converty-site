import { describe, expect, it } from "vitest";
import { calculateDueDate } from "@/lib/converters/health/pregnancy-due-date";

// Note: calculateDueDate uses new Date() for "today" when computing currentWeeks/daysRemaining.
// Tests verify arithmetic-deterministic fields (dueDate, conceptionDate, milestones).

describe("calculateDueDate", () => {
  describe("null for invalid inputs", () => {
    it("returns null for invalid date string", () => {
      expect(calculateDueDate({ calculationMethod: "lmp", date: "not-a-date" }).ok).toBe(false);
    });
  });

  describe("LMP method — Naegele's rule (standard 28-day cycle)", () => {
    it("calculates due date as LMP + 280 days", () => {
      // LMP 2024-01-01 + 280 days = 2024-10-07 (2024 is a leap year: 29 days in Feb)
      const result = calculateDueDate({ calculationMethod: "lmp", date: "2024-01-01" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dueDate).toBe("2024-10-07");
    });

    it("conception date is LMP + 14 days", () => {
      const result = calculateDueDate({ calculationMethod: "lmp", date: "2024-01-01" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.conceptionDate).toBe("2024-01-15");
    });
  });

  describe("conception method", () => {
    it("due date is conception + 266 days", () => {
      // 2024-01-01 + 266 days = 2024-09-23 (UTC-consistent: Jan 30+Feb 29+Mar 31+Apr 30+May 31+Jun 30+Jul 31+Aug 31+Sep 23 = 266)
      const result = calculateDueDate({ calculationMethod: "conception", date: "2024-01-01" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dueDate).toBe("2024-09-23");
    });
  });

  describe("milestones", () => {
    it("returns 11 milestone entries", () => {
      const result = calculateDueDate({ calculationMethod: "lmp", date: "2024-01-01" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.milestones.length).toBe(11);
    });

    it("milestone at week 40 has the due date", () => {
      const result = calculateDueDate({ calculationMethod: "lmp", date: "2024-01-01" });
      expect(result.ok).toBe(true);
      const week40 = (result as { ok: true; value: any }).value.milestones.find(
        (m: { week: number; date: string }) => m.week === 40
      );
      expect(week40).toBeDefined();
      // Milestone week 40 = LMP + 40×7 = 2024-01-01 + 280 = 2024-10-07 (2024 is a leap year)
      expect(week40?.date).toBe("2024-10-07");
    });
  });

  describe("cycleLength adjustment", () => {
    it("longer cycle shifts due date later", () => {
      const standard = calculateDueDate({ calculationMethod: "lmp", date: "2024-01-01" });
      const longCycle = calculateDueDate({
        calculationMethod: "lmp",
        date: "2024-01-01",
        cycleLength: 35,
      });
      expect(standard.ok).toBe(true);
      expect(longCycle.ok).toBe(true);
      expect(
        (longCycle as { ok: true; value: any }).value.dueDate >
          (standard as { ok: true; value: any }).value.dueDate
      ).toBe(true);
    });
  });
});
