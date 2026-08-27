import { describe, expect, it } from "vitest";
import { calculateBmr } from "@/lib/converters/health/bmr-calculator";

describe("calculateBmr", () => {
  describe("null for invalid inputs", () => {
    it("returns null for age <= 0", () => {
      expect(calculateBmr({ gender: "male", age: 0, weight: 70, height: 175 }).ok).toBe(false);
    });

    it("returns null for weight <= 0", () => {
      expect(calculateBmr({ gender: "male", age: 30, weight: 0, height: 175 }).ok).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(calculateBmr({ gender: "male", age: 30, weight: 70, height: 0 }).ok).toBe(false);
    });
  });

  describe("male BMR formulas", () => {
    it("calculates Mifflin-St Jeor for male 70kg/175cm/30yo", () => {
      // Mifflin male: (10 × 70) + (6.25 × 175) - (5 × 30) + 5
      //             = 700 + 1093.75 - 150 + 5 = 1648.75
      const result = calculateBmr({ gender: "male", age: 30, weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mifflinStJeor).toBeCloseTo(1648.75, 1);
    });

    it("calculates Harris-Benedict for male 70kg/175cm/30yo", () => {
      // HB male: 88.362 + (13.397 × 70) + (4.799 × 175) - (5.677 × 30)
      //        = 88.362 + 937.79 + 839.825 - 170.31 = 1695.667
      const result = calculateBmr({ gender: "male", age: 30, weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.harrisBenedict).toBeCloseTo(1695.667, 1);
    });
  });

  describe("female BMR formulas", () => {
    it("calculates Mifflin-St Jeor for female 60kg/165cm/30yo", () => {
      // Mifflin female: (10 × 60) + (6.25 × 165) - (5 × 30) - 161
      //               = 600 + 1031.25 - 150 - 161 = 1320.25
      const result = calculateBmr({ gender: "female", age: 30, weight: 60, height: 165 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mifflinStJeor).toBeCloseTo(1320.25, 1);
    });

    it("female BMR is lower than male with same weight/height/age", () => {
      const male = calculateBmr({ gender: "male", age: 30, weight: 70, height: 175 });
      const female = calculateBmr({ gender: "female", age: 30, weight: 70, height: 175 });
      expect(male.ok).toBe(true);
      expect(female.ok).toBe(true);
      expect((female as { ok: true; value: any }).value.mifflinStJeor).toBeLessThan(
        (male as { ok: true; value: any }).value.mifflinStJeor
      );
    });
  });

  describe("activity level multipliers", () => {
    it.each([
      ["sedentary", 1.2],
      ["lightActivity", 1.375],
      ["moderateActivity", 1.55],
      ["veryActive", 1.725],
      ["extraActive", 1.9],
    ])("activity level %s uses multiplier %s × average", (field, multiplier) => {
      const result = calculateBmr({ gender: "male", age: 30, weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      const avg = (result as { ok: true; value: any }).value.average;
      expect((result as { ok: true; value: any }).value[field as keyof typeof result]).toBeCloseTo(
        avg * multiplier,
        1
      );
    });
  });
});
