import { describe, expect, it } from "vitest";
import { calculateLeanBodyMass } from "@/lib/converters/health/lean-body-mass";

describe("calculateLeanBodyMass", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(calculateLeanBodyMass({ gender: "male", weight: 0, height: 175 }).ok).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(calculateLeanBodyMass({ gender: "male", weight: 70, height: 0 }).ok).toBe(false);
    });
  });

  describe("male LBM calculation", () => {
    it("calculates Boer formula for male 70kg/175cm", () => {
      // Boer male: 0.407 × 70 + 0.267 × 175 - 19.2 = 28.49 + 46.725 - 19.2 = 56.015
      const result = calculateLeanBodyMass({ gender: "male", weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.boerFormula).toBeCloseTo(56.015, 1);
    });

    it("male LBM is positive and less than body weight", () => {
      const result = calculateLeanBodyMass({ gender: "male", weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.average).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.average).toBeLessThan(70);
    });
  });

  describe("female LBM calculation", () => {
    it("calculates Boer formula for female 60kg/165cm", () => {
      // Boer female: 0.252 × 60 + 0.473 × 165 - 48.3 = 15.12 + 78.045 - 48.3 = 44.865
      const result = calculateLeanBodyMass({ gender: "female", weight: 60, height: 165 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.boerFormula).toBeCloseTo(44.865, 1);
    });

    it("male LBM higher than female for same weight/height", () => {
      const male = calculateLeanBodyMass({ gender: "male", weight: 70, height: 170 });
      const female = calculateLeanBodyMass({ gender: "female", weight: 70, height: 170 });
      expect(male.ok).toBe(true);
      expect(female.ok).toBe(true);
      expect((male as { ok: true; value: any }).value.boerFormula).toBeGreaterThan(
        (female as { ok: true; value: any }).value.boerFormula
      );
    });
  });

  describe("result structure", () => {
    it("fatMass = weight - average", () => {
      const result = calculateLeanBodyMass({ gender: "male", weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fatMassEstimate).toBeCloseTo(
        70 - (result as { ok: true; value: any }).value.average,
        2
      );
    });

    it("bodyFatPercentEstimate is positive", () => {
      const result = calculateLeanBodyMass({ gender: "male", weight: 80, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercentEstimate).toBeGreaterThan(0);
    });
  });
});
