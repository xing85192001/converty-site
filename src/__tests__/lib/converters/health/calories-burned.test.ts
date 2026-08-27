import { describe, expect, it } from "vitest";
import { calculateCaloriesBurned } from "@/lib/converters/health/calories-burned";

describe("calculateCaloriesBurned", () => {
  describe("null for invalid inputs", () => {
    it("returns null for duration <= 0", () => {
      expect(
        calculateCaloriesBurned({ weight: 70, activity: "running_5mph", duration: 0 }).ok
      ).toBe(false);
    });

    it("returns null for weight <= 0", () => {
      expect(
        calculateCaloriesBurned({ weight: 0, activity: "running_5mph", duration: 30 }).ok
      ).toBe(false);
    });

    it("returns null for unknown activity", () => {
      expect(
        calculateCaloriesBurned({ weight: 70, activity: "unknown_activity", duration: 30 }).ok
      ).toBe(false);
    });
  });

  describe("calorie calculation", () => {
    it("calculates calories burned for running at 5mph for 30 min / 70kg", () => {
      // running_5mph MET = 8.3
      // calories = 8.3 * 70 * (30/60) = 8.3 * 70 * 0.5 = 290.5
      const result = calculateCaloriesBurned({
        weight: 70,
        activity: "running_5mph",
        duration: 30,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.caloriesBurned).toBeCloseTo(290.5, 0);
    });

    it("calories burned > 200 for high-MET activity at 70kg for 30min", () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        activity: "running_5mph",
        duration: 30,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.caloriesBurned).toBeGreaterThan(200);
    });
  });

  describe("high-MET vs low-MET comparison", () => {
    it("high-MET activity burns more calories than low-MET for same duration/weight", () => {
      const low = calculateCaloriesBurned({
        weight: 70,
        activity: "walking_slow",
        duration: 30,
      });
      const high = calculateCaloriesBurned({
        weight: 70,
        activity: "running_6mph",
        duration: 30,
      });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      expect((high as { ok: true; value: any }).value.caloriesBurned).toBeGreaterThan(
        (low as { ok: true; value: any }).value.caloriesBurned
      );
    });
  });

  describe("result fields", () => {
    it("returns fat burned in grams", () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        activity: "cycling_moderate",
        duration: 45,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fatBurned).toBeGreaterThan(0);
    });

    it("returns MET value for the activity", () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        activity: "running_5mph",
        duration: 30,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.met).toBe(8.3);
    });
  });
});
