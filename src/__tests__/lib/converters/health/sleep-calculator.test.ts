import { describe, expect, it } from "vitest";
import { calculateSleep } from "@/lib/converters/health/sleep-calculator";

// Note: calculateSleep uses new Date() internally only for time formatting (hour formatting),
// not for any calculation logic. Results are structurally deterministic for a given age.

describe("calculateSleep", () => {
  describe("null for invalid inputs", () => {
    it("returns null for age <= 0", () => {
      expect(calculateSleep({ mode: "bedTime", targetTime: "22:00", age: 0 }).ok).toBe(false);
    });

    it("returns null for age > 120", () => {
      expect(calculateSleep({ mode: "bedTime", targetTime: "22:00", age: 121 }).ok).toBe(false);
    });

    it("returns null for invalid time format", () => {
      expect(calculateSleep({ mode: "bedTime", targetTime: "not-a-time", age: 30 }).ok).toBe(false);
    });
  });

  describe("recommended hours by age", () => {
    it.each([
      [30, { min: 7, max: 9 }], // Adult (18-64)
      [70, { min: 7, max: 8 }], // Senior (65+)
      [15, { min: 8, max: 10 }], // Teen (13-17)
      [10, { min: 9, max: 11 }], // Child (6-12)
    ])("age %i gets recommended hours min=%i max=%i", (age, expected) => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "22:00", age });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.recommendedHours.min).toBe(expected.min);
      expect((result as { ok: true; value: any }).value.recommendedHours.max).toBe(expected.max);
    });
  });

  describe("sleep cycle times", () => {
    it("returns 4 cycle time entries (4, 5, 6, 7 cycles)", () => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "23:00", age: 30 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.cycleTimes.length).toBe(4);
      const cycles = (result as { ok: true; value: any }).value.cycleTimes.map(
        (c: { cycles: number }) => c.cycles
      );
      expect(cycles).toContain(4);
      expect(cycles).toContain(5);
      expect(cycles).toContain(6);
      expect(cycles).toContain(7);
    });

    it("5 and 6 cycle entries have optimal quality", () => {
      const result = calculateSleep({ mode: "wakeTime", targetTime: "07:00", age: 30 });
      expect(result.ok).toBe(true);
      const optimal = (result as { ok: true; value: any }).value.cycleTimes.filter(
        (c: { quality: string; cycles: number }) => c.quality === "optimal"
      );
      const cycleNums = optimal.map((c: { cycles: number }) => c.cycles);
      expect(cycleNums).toContain(5);
      expect(cycleNums).toContain(6);
    });

    it("4-cycle entry has fair quality", () => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "23:00", age: 30 });
      expect(result.ok).toBe(true);
      const fair = (result as { ok: true; value: any }).value.cycleTimes.find(
        (c: { cycles: number }) => c.cycles === 4
      );
      expect(fair?.quality).toBe("fair");
    });
  });

  describe("duration strings", () => {
    it("each cycle time has a duration string", () => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "22:00", age: 30 });
      expect(result.ok).toBe(true);
      for (const ct of (result as { ok: true; value: any }).value.cycleTimes) {
        expect(ct.duration).toMatch(/\d+h \d+m/);
      }
    });
  });

  describe("sleep tips and stages", () => {
    it("returns tip keys array", () => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "22:00", age: 30 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.tips.length).toBeGreaterThan(0);
    });

    it("returns 4 sleep stages", () => {
      const result = calculateSleep({ mode: "bedTime", targetTime: "22:00", age: 30 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sleepStages.length).toBe(4);
    });
  });
});
