import { describe, expect, it } from "vitest";
import { calculateMacros } from "@/lib/converters/health/macro-calculator";

describe("calculateMacros", () => {
  describe("null for invalid inputs", () => {
    it("returns null for calories <= 0", () => {
      expect(calculateMacros({ calories: 0, goal: "maintenance" }).ok).toBe(false);
    });
  });

  describe("maintenance goal (30/40/30 split)", () => {
    it("calculates macros for 2000kcal maintenance", () => {
      const result = calculateMacros({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      // protein: 30% = 600kcal / 4 = 150g
      expect((result as { ok: true; value: any }).value.proteinGrams).toBeCloseTo(150, 1);
      // carbs: 40% = 800kcal / 4 = 200g
      expect((result as { ok: true; value: any }).value.carbsGrams).toBeCloseTo(200, 1);
      // fat: 30% = 600kcal / 9 ≈ 66.67g
      expect((result as { ok: true; value: any }).value.fatGrams).toBeCloseTo(66.67, 1);
    });
  });

  describe("macro calorie totals", () => {
    it("protein + carb + fat calories sum to total calories", () => {
      const result = calculateMacros({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      const total =
        (result as { ok: true; value: any }).value.proteinCalories +
        (result as { ok: true; value: any }).value.carbsCalories +
        (result as { ok: true; value: any }).value.fatCalories;
      expect(total).toBeCloseTo(2000, 0);
    });
  });

  describe("macro percentages sum to 100", () => {
    it.each(["maintenance", "cutting", "bulking", "keto", "highProtein"] as const)(
      "goal %s percentages sum to 100",
      (goal) => {
        const result = calculateMacros({ calories: 2000, goal });
        expect(result.ok).toBe(true);
        const total =
          (result as { ok: true; value: any }).value.proteinPercent +
          (result as { ok: true; value: any }).value.carbsPercent +
          (result as { ok: true; value: any }).value.fatPercent;
        expect(total).toBe(100);
      }
    );
  });

  describe("keto goal minimizes carbs", () => {
    it("keto has lowest carb percentage", () => {
      const keto = calculateMacros({ calories: 2000, goal: "keto" });
      const maintenance = calculateMacros({ calories: 2000, goal: "maintenance" });
      expect(keto.ok).toBe(true);
      expect(maintenance.ok).toBe(true);
      expect((keto as { ok: true; value: any }).value.carbsPercent).toBeLessThan(
        (maintenance as { ok: true; value: any }).value.carbsPercent
      );
    });
  });

  describe("meals breakdown", () => {
    it("returns breakdown for 3, 4, 5, 6 meals", () => {
      const result = calculateMacros({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mealsBreakdown.length).toBe(4);
      expect((result as { ok: true; value: any }).value.mealsBreakdown[0].meals).toBe(3);
      expect((result as { ok: true; value: any }).value.mealsBreakdown[3].meals).toBe(6);
    });

    it("protein per meal decreases as meal count increases", () => {
      const result = calculateMacros({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      const threeM = (result as { ok: true; value: any }).value.mealsBreakdown.find(
        (m: { meals: number; protein: number }) => m.meals === 3
      )!.protein;
      const sixM = (result as { ok: true; value: any }).value.mealsBreakdown.find(
        (m: { meals: number; protein: number }) => m.meals === 6
      )!.protein;
      expect(sixM).toBeLessThan(threeM);
    });
  });
});
