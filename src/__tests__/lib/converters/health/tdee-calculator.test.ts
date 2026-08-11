import { describe, expect, it } from "vitest";
import { calculateTdee } from "@/lib/converters/health/tdee-calculator";

describe("calculateTdee", () => {
  describe("null for invalid inputs", () => {
    it("returns null for age <= 0", () => {
      expect(
        calculateTdee({
          gender: "male",
          age: 0,
          weight: 70,
          height: 175,
          activityLevel: "sedentary",
          goal: "maintain",
        }).ok
      ).toBe(false);
    });

    it("returns null for weight <= 0", () => {
      expect(
        calculateTdee({
          gender: "male",
          age: 30,
          weight: 0,
          height: 175,
          activityLevel: "sedentary",
          goal: "maintain",
        }).ok
      ).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(
        calculateTdee({
          gender: "male",
          age: 30,
          weight: 70,
          height: 0,
          activityLevel: "sedentary",
          goal: "maintain",
        }).ok
      ).toBe(false);
    });
  });

  describe("TDEE = BMR × activity multiplier", () => {
    it.each([
      ["sedentary", 1.2],
      ["light", 1.375],
      ["moderate", 1.55],
      ["active", 1.725],
      ["veryActive", 1.9],
    ])("activity level %s uses multiplier %s", (activityLevel, multiplier) => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "veryActive",
        goal: "maintain",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.tdee).toBeCloseTo(
        (result as { ok: true; value: any }).value.bmr * multiplier,
        1
      );
      expect((result as { ok: true; value: any }).value.activityMultiplier).toBe(multiplier);
    });
  });

  describe("goal adjustments", () => {
    it("lose goal: targetCalories = tdee - 500", () => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        goal: "lose",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.targetCalories).toBeCloseTo(
        (result as { ok: true; value: any }).value.tdee - 500,
        0
      );
      expect((result as { ok: true; value: any }).value.weeklyChange).toBe(-0.5);
    });

    it("gain goal: targetCalories = tdee + 500", () => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        goal: "gain",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.targetCalories).toBeCloseTo(
        (result as { ok: true; value: any }).value.tdee + 500,
        0
      );
      expect((result as { ok: true; value: any }).value.weeklyChange).toBe(0.5);
    });

    it("maintain goal: targetCalories = tdee", () => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        goal: "maintain",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.targetCalories).toBeCloseTo(
        (result as { ok: true; value: any }).value.tdee,
        0
      );
      expect((result as { ok: true; value: any }).value.weeklyChange).toBe(0);
    });
  });

  describe("macro output", () => {
    it("protein = weight × 2 grams", () => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        goal: "maintain",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.proteinGrams).toBe(140); // 70 × 2
    });

    it("fat grams = 25% of targetCalories / 9", () => {
      const result = calculateTdee({
        gender: "male",
        age: 30,
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        goal: "maintain",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fatGrams).toBeCloseTo(
        ((result as { ok: true; value: any }).value.targetCalories * 0.25) / 9,
        1
      );
    });
  });
});
