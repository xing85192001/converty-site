import { describe, expect, it } from "vitest";
import { calculateCorpulence, compareToBMI } from "@/lib/converters/health/corpulence";

describe("calculateCorpulence", () => {
  describe("null for invalid inputs", () => {
    it("returns null for height <= 0", () => {
      expect(calculateCorpulence(70, 0).ok).toBe(false);
    });

    it("returns null for weight <= 0", () => {
      expect(calculateCorpulence(0, 175).ok).toBe(false);
    });
  });

  describe("corpulence index calculation", () => {
    it("calculates index for 70kg / 175cm", () => {
      // CI = 70 / (1.75)^3 = 70 / 5.359375 ≈ 13.06
      const result = calculateCorpulence(70, 175);
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.corpulenceIndex).toBeCloseTo(13.06, 1);
    });

    it("returns 'normal' category for healthy weight person", () => {
      const result = calculateCorpulence(70, 175);
      expect(result.ok).toBe(true);
      // CI ~13.06 is in the 'normal' range (13-14)
      expect((result as { ok: true; value: any }).value.categoryKey).toBe("normal");
    });

    it("returns 'underweight' for very light person", () => {
      // CI = 45 / (1.80)^3 = 45 / 5.832 ≈ 7.71 < 11 → underweight
      const result = calculateCorpulence(45, 180);
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.categoryKey).toBe("underweight");
    });

    it("returns 'obese' for very heavy person", () => {
      // CI = 120 / (1.70)^3 = 120 / 4.913 ≈ 24.4 > 17 → obese
      const result = calculateCorpulence(120, 170);
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.categoryKey).toBe("obese");
    });
  });

  describe("imperial unit conversion", () => {
    it("supports imperial units", () => {
      // Equivalent of ~70kg / 175cm
      const result = calculateCorpulence(154, 69, "imperial");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.corpulenceIndex).toBeGreaterThan(0);
    });
  });
});

describe("compareToBMI", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(compareToBMI(0, 175).ok).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(compareToBMI(70, 0).ok).toBe(false);
    });
  });

  describe("BMI vs CI comparison", () => {
    it("returns both bmi and ci values", () => {
      const result = compareToBMI(70, 175);
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bmi).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.ci).toBeGreaterThan(0);
    });

    it("returns a comparison key", () => {
      const result = compareToBMI(70, 175);
      expect(result.ok).toBe(true);
      expect(["similar", "ciHigher", "ciLower"]).toContain(
        (result as { ok: true; value: any }).value.comparisonKey
      );
    });
  });
});
