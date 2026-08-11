import { describe, expect, it } from "vitest";
import { calculateBac } from "@/lib/converters/health/bac-calculator";

describe("calculateBac", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(
        calculateBac({
          gender: "male",
          weight: 0,
          drinks: 2,
          drinkType: "beer",
          hoursSinceDrinking: 0,
        }).ok
      ).toBe(false);
    });

    it("returns null for negative drinks", () => {
      expect(
        calculateBac({
          gender: "male",
          weight: 70,
          drinks: -1,
          drinkType: "beer",
          hoursSinceDrinking: 0,
        }).ok
      ).toBe(false);
    });
  });

  describe("male BAC calculation (Widmark factor 0.68)", () => {
    it("calculates positive BAC for 2 beers immediately after drinking", () => {
      const result = calculateBac({
        gender: "male",
        weight: 70,
        drinks: 2,
        drinkType: "beer",
        hoursSinceDrinking: 0,
      });
      expect(result.ok).toBe(true);
      // peakBac = (28 / (0.68 * 70000)) * 100 ≈ 0.0588%
      expect((result as { ok: true; value: any }).value.peakBac).toBeCloseTo(0.0588, 2);
      expect((result as { ok: true; value: any }).value.bac).toBeCloseTo(0.0588, 2);
    });

    it("calculates alcoholGrams correctly for 2 beers", () => {
      const result = calculateBac({
        gender: "male",
        weight: 70,
        drinks: 2,
        drinkType: "beer",
        hoursSinceDrinking: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.alcoholGrams).toBe(28); // 2 drinks × 14g
    });
  });

  describe("female BAC higher than male (Widmark factor 0.55)", () => {
    it("female has higher BAC than male with same inputs", () => {
      const baseInput = {
        drinks: 2,
        drinkType: "beer" as const,
        weight: 70,
        hoursSinceDrinking: 0,
      };
      const maleResult = calculateBac({ gender: "male", ...baseInput });
      const femaleResult = calculateBac({ gender: "female", ...baseInput });
      expect(maleResult.ok).toBe(true);
      expect(femaleResult.ok).toBe(true);
      expect((femaleResult as { ok: true; value: any }).value.bac).toBeGreaterThan(
        (maleResult as { ok: true; value: any }).value.bac
      );
    });
  });

  describe("BAC decreases over time", () => {
    it("BAC is lower after 2 hours", () => {
      const baseInput = {
        gender: "male" as const,
        weight: 70,
        drinks: 3,
        drinkType: "beer" as const,
      };
      const immediate = calculateBac({ ...baseInput, hoursSinceDrinking: 0 });
      const later = calculateBac({ ...baseInput, hoursSinceDrinking: 2 });
      expect(immediate.ok).toBe(true);
      expect(later.ok).toBe(true);
      expect((later as { ok: true; value: any }).value.bac).toBeLessThan(
        (immediate as { ok: true; value: any }).value.bac
      );
    });

    it("BAC reaches 0 when fully eliminated", () => {
      const result = calculateBac({
        gender: "male",
        weight: 70,
        drinks: 1,
        drinkType: "beer",
        hoursSinceDrinking: 10,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bac).toBe(0);
    });
  });

  describe("legal driving status", () => {
    it("legalToDrive is false when BAC >= 0.08%", () => {
      const result = calculateBac({
        gender: "female",
        weight: 55,
        drinks: 5,
        drinkType: "spirits",
        hoursSinceDrinking: 0,
      });
      expect(result.ok).toBe(true);
      if ((result as { ok: true; value: any }).value.bac >= 0.08) {
        expect((result as { ok: true; value: any }).value.legalToDrive).toBe(false);
      }
    });
  });
});
