import { describe, expect, it } from "vitest";
import { calculateFatIntake } from "@/lib/converters/health/fat-intake-calculator";

describe("calculateFatIntake", () => {
  describe("null for invalid inputs", () => {
    it("returns null for calories <= 0", () => {
      expect(calculateFatIntake({ calories: 0, goal: "maintenance" }).ok).toBe(false);
    });
  });

  describe("maintenance goal calculation", () => {
    it("calculates fat grams for 2000kcal maintenance (30% fat)", () => {
      // 2000 * 0.30 / 9 ≈ 66.67g
      const result = calculateFatIntake({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dailyFatGrams).toBeCloseTo(66.67, 1);
      expect((result as { ok: true; value: any }).value.fatPercent).toBe(30);
    });
  });

  describe("keto goal maximizes fat", () => {
    it("keto gives 70% fat", () => {
      // 2000 * 0.70 / 9 ≈ 155.56g
      const result = calculateFatIntake({ calories: 2000, goal: "keto" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fatPercent).toBe(70);
      expect((result as { ok: true; value: any }).value.dailyFatGrams).toBeCloseTo(155.56, 1);
    });
  });

  describe("fat calorie calculations", () => {
    it("dailyFatCalories = dailyFatGrams × 9", () => {
      const result = calculateFatIntake({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dailyFatCalories).toBeCloseTo(
        (result as { ok: true; value: any }).value.dailyFatGrams * 9,
        1
      );
    });
  });

  describe("breakdown sums to 100%", () => {
    it("saturated + monounsaturated + polyunsaturated = 100%", () => {
      const result = calculateFatIntake({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      const total =
        (result as { ok: true; value: any }).value.breakdown.saturated.percent +
        (result as { ok: true; value: any }).value.breakdown.monounsaturated.percent +
        (result as { ok: true; value: any }).value.breakdown.polyunsaturated.percent;
      expect(total).toBe(100);
    });
  });

  describe("food source keys", () => {
    it("returns healthy, limit, and avoid food keys", () => {
      const result = calculateFatIntake({ calories: 2000, goal: "maintenance" });
      expect(result.ok).toBe(true);
      expect(
        (result as { ok: true; value: any }).value.foodSourceKeys.healthy.length
      ).toBeGreaterThan(0);
      expect(
        (result as { ok: true; value: any }).value.foodSourceKeys.limit.length
      ).toBeGreaterThan(0);
      expect(
        (result as { ok: true; value: any }).value.foodSourceKeys.avoid.length
      ).toBeGreaterThan(0);
    });
  });
});
