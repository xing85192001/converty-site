import { describe, expect, it } from "vitest";
import { calculateBMI } from "@/lib/converters/health/bmi";

describe("calculateBMI", () => {
  describe("BMI categories (metric)", () => {
    it.each([
      [
        "underweight",
        { weight: 45, weightUnit: "kg" as const, height: 175, heightUnit: "cm" as const },
        "underweight",
      ],
      [
        "normal",
        { weight: 70, weightUnit: "kg" as const, height: 175, heightUnit: "cm" as const },
        "normal",
      ],
      [
        "overweight",
        { weight: 85, weightUnit: "kg" as const, height: 175, heightUnit: "cm" as const },
        "overweight",
      ],
      [
        "obese class 1",
        { weight: 100, weightUnit: "kg" as const, height: 175, heightUnit: "cm" as const },
        "obese-1",
      ],
    ])("%s classification", (_, input, expectedCategory) => {
      const result = calculateBMI(input);
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.category).toBe(expectedCategory);
    });
  });

  describe("metric BMI values", () => {
    it("calculates BMI for 70kg at 175cm", () => {
      // 70 / (1.75^2) = 22.857 → rounded to 22.9
      const result = calculateBMI({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bmi).toBeCloseTo(22.9, 1);
    });
  });

  describe("imperial unit conversion", () => {
    it("converts lb/in to metric before calculating", () => {
      // 154 lb = 69.85 kg, 69 in = 175.26 cm → BMI ≈ 22.7
      const result = calculateBMI({ weight: 154, weightUnit: "lb", height: 69, heightUnit: "in" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bmi).toBeCloseTo(22.7, 1);
    });
  });

  describe("null returns for invalid input", () => {
    it("returns null for zero weight", () => {
      expect(calculateBMI({ weight: 0, weightUnit: "kg", height: 175, heightUnit: "cm" }).ok).toBe(
        false
      );
    });

    it("returns null for zero height", () => {
      expect(calculateBMI({ weight: 70, weightUnit: "kg", height: 0, heightUnit: "cm" }).ok).toBe(
        false
      );
    });

    it("returns null for negative weight", () => {
      expect(calculateBMI({ weight: -1, weightUnit: "kg", height: 175, heightUnit: "cm" }).ok).toBe(
        false
      );
    });

    it("returns null for negative height", () => {
      expect(calculateBMI({ weight: 70, weightUnit: "kg", height: -1, heightUnit: "cm" }).ok).toBe(
        false
      );
    });
  });

  describe("healthy weight range", () => {
    it("includes a healthy weight range with min and max", () => {
      const result = calculateBMI({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm" });
      expect((result as { ok: true; value: any }).value.healthyWeightRange).toBeDefined();
      expect((result as { ok: true; value: any }).value.healthyWeightRange.min).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.healthyWeightRange.max).toBeGreaterThan(
        (result as { ok: true; value: any }).value.healthyWeightRange.min
      );
    });
  });
});
