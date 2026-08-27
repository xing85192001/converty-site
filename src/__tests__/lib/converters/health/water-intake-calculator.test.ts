import { describe, expect, it } from "vitest";
import { calculateWaterIntake } from "@/lib/converters/health/water-intake-calculator";

describe("calculateWaterIntake", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(
        calculateWaterIntake({
          weight: 0,
          activityLevel: "sedentary",
          climate: "temperate",
          pregnant: false,
          breastfeeding: false,
        }).ok
      ).toBe(false);
    });
  });

  describe("base water needs — 33ml/kg", () => {
    it("70kg sedentary temperate → ~2310ml/day", () => {
      // base = 70 × 33 = 2310ml
      const result = calculateWaterIntake({
        weight: 70,
        activityLevel: "sedentary",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dailyIntakeMl).toBe(2310);
      expect((result as { ok: true; value: any }).value.dailyIntakeLiters).toBeCloseTo(2.31, 2);
    });

    it("90kg gives proportionally more water than 70kg", () => {
      const base = {
        activityLevel: "sedentary" as const,
        climate: "temperate" as const,
        pregnant: false,
        breastfeeding: false,
      };
      const lighter = calculateWaterIntake({ weight: 70, ...base });
      const heavier = calculateWaterIntake({ weight: 90, ...base });
      expect(lighter.ok).toBe(true);
      expect(heavier.ok).toBe(true);
      expect((heavier as { ok: true; value: any }).value.dailyIntakeMl).toBeGreaterThan(
        (lighter as { ok: true; value: any }).value.dailyIntakeMl
      );
      // Proportional: 90/70 × 2310 ≈ 2970
      expect((heavier as { ok: true; value: any }).value.dailyIntakeMl).toBe(90 * 33);
    });
  });

  describe("activity level additions", () => {
    it("athlete adds 1000ml over sedentary", () => {
      const sedentary = calculateWaterIntake({
        weight: 70,
        activityLevel: "sedentary",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      const athlete = calculateWaterIntake({
        weight: 70,
        activityLevel: "athlete",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      expect(sedentary.ok).toBe(true);
      expect(athlete.ok).toBe(true);
      expect(
        (athlete as { ok: true; value: any }).value.dailyIntakeMl -
          (sedentary as { ok: true; value: any }).value.dailyIntakeMl
      ).toBe(1000);
    });
  });

  describe("climate additions", () => {
    it("hot climate adds 500ml over temperate", () => {
      const base = {
        weight: 70,
        activityLevel: "sedentary" as const,
        pregnant: false,
        breastfeeding: false,
      };
      const temperate = calculateWaterIntake({ ...base, climate: "temperate" });
      const hot = calculateWaterIntake({ ...base, climate: "hot" });
      expect(temperate.ok).toBe(true);
      expect(hot.ok).toBe(true);
      expect(
        (hot as { ok: true; value: any }).value.dailyIntakeMl -
          (temperate as { ok: true; value: any }).value.dailyIntakeMl
      ).toBe(500);
    });
  });

  describe("special conditions", () => {
    it("pregnancy adds 300ml", () => {
      const base = {
        weight: 65,
        activityLevel: "light" as const,
        climate: "temperate" as const,
        breastfeeding: false,
      };
      const normal = calculateWaterIntake({ ...base, pregnant: false });
      const pregnant = calculateWaterIntake({ ...base, pregnant: true });
      expect(normal.ok).toBe(true);
      expect(pregnant.ok).toBe(true);
      expect(
        (pregnant as { ok: true; value: any }).value.dailyIntakeMl -
          (normal as { ok: true; value: any }).value.dailyIntakeMl
      ).toBe(300);
    });
  });

  describe("result fields", () => {
    it("returns oz and cups conversions", () => {
      const result = calculateWaterIntake({
        weight: 70,
        activityLevel: "moderate",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dailyIntakeOz).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.dailyIntakeCups).toBeGreaterThan(0);
    });

    it("returns schedule with 8 time slots", () => {
      const result = calculateWaterIntake({
        weight: 70,
        activityLevel: "sedentary",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.schedule.length).toBe(8);
    });

    it("schedule cumulative at last slot equals dailyIntakeMl", () => {
      const result = calculateWaterIntake({
        weight: 70,
        activityLevel: "sedentary",
        climate: "temperate",
        pregnant: false,
        breastfeeding: false,
      });
      expect(result.ok).toBe(true);
      const lastSlot = (result as { ok: true; value: any }).value.schedule[
        (result as { ok: true; value: any }).value.schedule.length - 1
      ];
      expect(lastSlot.cumulative).toBe((result as { ok: true; value: any }).value.dailyIntakeMl);
    });
  });
});
