import { describe, expect, it } from "vitest";
import { calculateHealthyWeight } from "@/lib/converters/health/healthy-weight-calculator";

describe("calculateHealthyWeight", () => {
  describe("null for invalid inputs", () => {
    it("returns null for height <= 0", () => {
      expect(calculateHealthyWeight({ height: 0, age: 30, gender: "male" }).ok).toBe(false);
    });

    it("returns null for age <= 0", () => {
      expect(calculateHealthyWeight({ height: 175, age: 0, gender: "male" }).ok).toBe(false);
    });

    it("returns null for age > 120", () => {
      expect(calculateHealthyWeight({ height: 175, age: 121, gender: "male" }).ok).toBe(false);
    });
  });

  describe("BMI-based weight range for 175cm", () => {
    it("returns healthy weight range based on BMI 18.5-24.9 for 175cm", () => {
      // heightM = 1.75, min = 18.5 × 1.75² = 18.5 × 3.0625 ≈ 56.66kg
      // max = 24.9 × 3.0625 ≈ 76.26kg
      const result = calculateHealthyWeight({ height: 175, age: 30, gender: "male" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bmiBasedRange.min).toBeCloseTo(56.66, 0);
      expect((result as { ok: true; value: any }).value.bmiBasedRange.max).toBeCloseTo(76.26, 0);
    });
  });

  describe("ideal weight differs by gender", () => {
    it("male ideal weight is higher than female for same height", () => {
      const male = calculateHealthyWeight({ height: 170, age: 30, gender: "male" });
      const female = calculateHealthyWeight({ height: 170, age: 30, gender: "female" });
      expect(male.ok).toBe(true);
      expect(female.ok).toBe(true);
      expect((male as { ok: true; value: any }).value.idealWeight).toBeGreaterThan(
        (female as { ok: true; value: any }).value.idealWeight
      );
    });
  });

  describe("frame size adjustments", () => {
    it("small frame has lower adjusted range than large frame", () => {
      const small = calculateHealthyWeight({
        height: 175,
        age: 30,
        gender: "male",
        frameSize: "small",
      });
      const large = calculateHealthyWeight({
        height: 175,
        age: 30,
        gender: "male",
        frameSize: "large",
      });
      expect(small.ok).toBe(true);
      expect(large.ok).toBe(true);
      expect((large as { ok: true; value: any }).value.adjustedRange.max).toBeGreaterThan(
        (small as { ok: true; value: any }).value.adjustedRange.max
      );
    });
  });

  describe("weight categories", () => {
    it("returns weight categories array with all BMI ranges", () => {
      const result = calculateHealthyWeight({ height: 175, age: 30, gender: "male" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.weightCategories.length).toBe(7);
      const keys = (result as { ok: true; value: any }).value.weightCategories.map(
        (c: { categoryKey: string }) => c.categoryKey
      );
      expect(keys).toContain("normal");
      expect(keys).toContain("underweight");
      expect(keys).toContain("obeseClassI");
    });
  });
});
