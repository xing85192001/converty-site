import { describe, expect, it } from "vitest";
import { calculateTargetHeartRate } from "@/lib/converters/health/target-heart-rate";

describe("calculateTargetHeartRate", () => {
  describe("null for invalid inputs", () => {
    it("returns null for age <= 0", () => {
      expect(calculateTargetHeartRate({ age: 0 }).ok).toBe(false);
    });

    it("returns null for age > 120", () => {
      expect(calculateTargetHeartRate({ age: 121 }).ok).toBe(false);
    });
  });

  describe("max heart rate — Tanaka formula (208 - 0.7 × age)", () => {
    it("calculates max HR for age 30", () => {
      // Tanaka: 208 - 0.7 × 30 = 208 - 21 = 187
      const result = calculateTargetHeartRate({ age: 30 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.maxHeartRate).toBe(187);
    });

    it("older person has lower max heart rate", () => {
      const young = calculateTargetHeartRate({ age: 25 });
      const old = calculateTargetHeartRate({ age: 60 });
      expect(young.ok).toBe(true);
      expect(old.ok).toBe(true);
      expect((old as { ok: true; value: any }).value.maxHeartRate).toBeLessThan(
        (young as { ok: true; value: any }).value.maxHeartRate
      );
    });
  });

  describe("heart rate zones without resting HR", () => {
    it("returns 5 zones", () => {
      const result = calculateTargetHeartRate({ age: 30 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.zones.length).toBe(5);
    });

    it("fat burning zone is 60-70% of max HR", () => {
      const result = calculateTargetHeartRate({ age: 30 });
      expect(result.ok).toBe(true);
      const maxHR = 187; // Tanaka for age 30
      expect((result as { ok: true; value: any }).value.fatBurningZone.min).toBe(
        Math.round(maxHR * 0.6)
      );
      expect((result as { ok: true; value: any }).value.fatBurningZone.max).toBe(
        Math.round(maxHR * 0.7)
      );
    });

    it("zones are in ascending order of intensity", () => {
      const result = calculateTargetHeartRate({ age: 30 });
      expect(result.ok).toBe(true);
      for (let i = 1; i < (result as { ok: true; value: any }).value.zones.length; i++) {
        expect((result as { ok: true; value: any }).value.zones[i].minBpm).toBeGreaterThanOrEqual(
          (result as { ok: true; value: any }).value.zones[i - 1].minBpm
        );
      }
    });
  });

  describe("Karvonen method with resting HR", () => {
    it("calculates heart rate reserve when resting HR provided", () => {
      // HRR = 187 - 60 = 127
      const result = calculateTargetHeartRate({ age: 30, restingHeartRate: 60 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.heartRateReserve).toBe(127);
    });

    it("fat burning zone with Karvonen is different from simple percentage", () => {
      const simple = calculateTargetHeartRate({ age: 30 });
      const karvonen = calculateTargetHeartRate({ age: 30, restingHeartRate: 60 });
      expect(simple.ok).toBe(true);
      expect(karvonen.ok).toBe(true);
      // Karvonen adds resting HR back, so min > simple percentage alone
      expect((karvonen as { ok: true; value: any }).value.fatBurningZone.min).toBeGreaterThan(
        (simple as { ok: true; value: any }).value.fatBurningZone.min
      );
    });
  });
});
