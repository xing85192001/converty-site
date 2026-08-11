import { describe, expect, it } from "vitest";
import { calculateProtein } from "@/lib/converters/health/protein-calculator";

describe("calculateProtein", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(
        calculateProtein({ weight: 0, goal: "sedentary", activityLevel: "sedentary" }).ok
      ).toBe(false);
    });
  });

  describe("sedentary goal — 0.8g/kg adjusted for sedentary multiplier", () => {
    it("70kg sedentary adult gets ~50-63g protein range", () => {
      // sedentary goal: 0.8-1.0 g/kg × 0.9 (sedentary multiplier) = 0.72-0.90 g/kg
      // min = 70 × 0.72 = 50.4, max = 70 × 0.90 = 63
      const result = calculateProtein({
        weight: 70,
        goal: "sedentary",
        activityLevel: "sedentary",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dailyProteinMin).toBeCloseTo(50.4, 0);
      expect((result as { ok: true; value: any }).value.dailyProteinMax).toBeCloseTo(63, 0);
    });
  });

  describe("muscleGain goal — higher protein than sedentary", () => {
    it("muscle gain 70kg gives more protein than sedentary 70kg", () => {
      const sedentary = calculateProtein({
        weight: 70,
        goal: "sedentary",
        activityLevel: "sedentary",
      });
      const muscle = calculateProtein({
        weight: 70,
        goal: "muscleGain",
        activityLevel: "active",
      });
      expect(sedentary.ok).toBe(true);
      expect(muscle.ok).toBe(true);
      expect((muscle as { ok: true; value: any }).value.dailyProteinMin).toBeGreaterThan(
        (sedentary as { ok: true; value: any }).value.dailyProteinMin
      );
    });
  });

  describe("different activity levels give different ranges", () => {
    it("veryActive has higher protein than sedentary for same goal", () => {
      const sedentary = calculateProtein({
        weight: 70,
        goal: "maintenance",
        activityLevel: "sedentary",
      });
      const veryActive = calculateProtein({
        weight: 70,
        goal: "maintenance",
        activityLevel: "veryActive",
      });
      expect(sedentary.ok).toBe(true);
      expect(veryActive.ok).toBe(true);
      expect((veryActive as { ok: true; value: any }).value.dailyProteinMin).toBeGreaterThan(
        (sedentary as { ok: true; value: any }).value.dailyProteinMin
      );
    });
  });

  describe("per meal distribution", () => {
    it("returns protein per meal for 3, 4, 5, 6 meals", () => {
      const result = calculateProtein({
        weight: 70,
        goal: "maintenance",
        activityLevel: "moderate",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.perMeal.meals3).toBeGreaterThan(
        (result as { ok: true; value: any }).value.perMeal.meals6
      );
      expect((result as { ok: true; value: any }).value.perMeal.meals3).toBeCloseTo(
        (result as { ok: true; value: any }).value.dailyProteinOptimal / 3,
        2
      );
    });
  });

  describe("food sources", () => {
    it("returns food sources array with serving calculations", () => {
      const result = calculateProtein({
        weight: 70,
        goal: "maintenance",
        activityLevel: "moderate",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.foodSources.length).toBeGreaterThan(0);
      expect(
        (result as { ok: true; value: any }).value.foodSources[0].servingsNeeded
      ).toBeGreaterThan(0);
    });
  });
});
