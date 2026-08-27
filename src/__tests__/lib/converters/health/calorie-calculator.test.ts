import { describe, expect, it } from "vitest";
import { calculateCalories } from "@/lib/converters/health/calorie-calculator";

describe("calculateCalories", () => {
  describe("null for invalid inputs", () => {
    it("returns null for age <= 0", () => {
      expect(
        calculateCalories({
          gender: "male",
          age: 0,
          weight: 70,
          height: 175,
          activityLevel: "sedentary",
          targetWeight: 70,
          weeksToGoal: 12,
        }).ok
      ).toBe(false);
    });

    it("returns null for weeksToGoal <= 0", () => {
      expect(
        calculateCalories({
          gender: "male",
          age: 30,
          weight: 70,
          height: 175,
          activityLevel: "sedentary",
          targetWeight: 70,
          weeksToGoal: 0,
        }).ok
      ).toBe(false);
    });
  });

  describe("maintenance calories", () => {
    it("calculates maintenance calories for sedentary male", () => {
      // Mifflin male: 10*70 + 6.25*175 - 5*30 + 5 = 1648.75
      // Sedentary: 1648.75 × 1.2 = 1978.5
      const result = calculateCalories({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "sedentary",
        targetWeight: 70,
        weeksToGoal: 12,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.maintenanceCalories).toBeCloseTo(1978.5, 0);
    });
  });

  describe("cutting gives fewer calories", () => {
    it("cutting target weight produces fewer calories than maintenance", () => {
      const base = {
        gender: "male" as const,
        age: 30,
        weight: 80,
        height: 175,
        activityLevel: "moderate" as const,
        weeksToGoal: 12,
      };
      const maintenance = calculateCalories({ ...base, targetWeight: 80 });
      const cutting = calculateCalories({ ...base, targetWeight: 70 });
      expect(maintenance.ok).toBe(true);
      expect(cutting.ok).toBe(true);
      expect((cutting as { ok: true; value: any }).value.targetCalories).toBeLessThan(
        (maintenance as { ok: true; value: any }).value.targetCalories
      );
    });
  });

  describe("macro output", () => {
    it("returns protein, carb and fat grams", () => {
      const result = calculateCalories({
        gender: "female",
        age: 25,
        weight: 60,
        height: 165,
        activityLevel: "light",
        targetWeight: 58,
        weeksToGoal: 8,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.proteinGrams).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.carbsGrams).toBeGreaterThanOrEqual(0);
      expect((result as { ok: true; value: any }).value.fatGrams).toBeGreaterThan(0);
    });

    it("returns a projected date string", () => {
      const result = calculateCalories({
        gender: "male",
        age: 30,
        weight: 80,
        height: 175,
        activityLevel: "moderate",
        targetWeight: 75,
        weeksToGoal: 10,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.projectedDate).toBeTruthy();
      expect(typeof (result as { ok: true; value: any }).value.projectedDate).toBe("string");
    });
  });
});
