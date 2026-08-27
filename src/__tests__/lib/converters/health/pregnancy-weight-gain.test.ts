import { describe, expect, it } from "vitest";
import { calculatePregnancyWeightGain } from "@/lib/converters/health/pregnancy-weight-gain";

describe("calculatePregnancyWeightGain", () => {
  describe("null for invalid inputs", () => {
    it("returns null for prePregnancyWeight <= 0", () => {
      expect(
        calculatePregnancyWeightGain({
          prePregnancyWeight: 0,
          currentWeight: 65,
          height: 165,
          weeksPregnant: 20,
          twins: false,
        }).ok
      ).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(
        calculatePregnancyWeightGain({
          prePregnancyWeight: 60,
          currentWeight: 65,
          height: 0,
          weeksPregnant: 20,
          twins: false,
        }).ok
      ).toBe(false);
    });

    it("returns null for weeksPregnant > 42", () => {
      expect(
        calculatePregnancyWeightGain({
          prePregnancyWeight: 60,
          currentWeight: 65,
          height: 165,
          weeksPregnant: 43,
          twins: false,
        }).ok
      ).toBe(false);
    });
  });

  describe("normal BMI — recommended gain 11.3-15.9 kg", () => {
    it("normal BMI classification and recommended range", () => {
      // BMI = 60 / (1.65)^2 = 60 / 2.7225 ≈ 22.0 → normal
      const result = calculatePregnancyWeightGain({
        prePregnancyWeight: 60,
        currentWeight: 67,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bmiCategory).toBe("normal");
      expect((result as { ok: true; value: any }).value.recommendedGainMin).toBeCloseTo(11.3, 1);
      expect((result as { ok: true; value: any }).value.recommendedGainMax).toBeCloseTo(15.9, 1);
    });
  });

  describe("underweight BMI — higher gain range", () => {
    it("underweight BMI has higher recommended gain than normal", () => {
      // BMI = 45 / (1.65)^2 ≈ 16.5 → underweight
      const underweight = calculatePregnancyWeightGain({
        prePregnancyWeight: 45,
        currentWeight: 50,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      // BMI = 60 / (1.65)^2 ≈ 22.0 → normal
      const normal = calculatePregnancyWeightGain({
        prePregnancyWeight: 60,
        currentWeight: 67,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      expect(underweight.ok).toBe(true);
      expect(normal.ok).toBe(true);
      expect((underweight as { ok: true; value: any }).value.bmiCategory).toBe("underweight");
      expect((underweight as { ok: true; value: any }).value.recommendedGainMin).toBeGreaterThan(
        (normal as { ok: true; value: any }).value.recommendedGainMin
      );
    });
  });

  describe("overweight BMI — lower gain range", () => {
    it("overweight BMI has lower recommended gain than normal", () => {
      // BMI = 80 / (1.65)^2 ≈ 29.4 → overweight
      const overweight = calculatePregnancyWeightGain({
        prePregnancyWeight: 80,
        currentWeight: 85,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      const normal = calculatePregnancyWeightGain({
        prePregnancyWeight: 60,
        currentWeight: 67,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      expect(overweight.ok).toBe(true);
      expect(normal.ok).toBe(true);
      expect((overweight as { ok: true; value: any }).value.bmiCategory).toBe("overweight");
      expect((overweight as { ok: true; value: any }).value.recommendedGainMax).toBeLessThan(
        (normal as { ok: true; value: any }).value.recommendedGainMax
      );
    });
  });

  describe("current weight gain", () => {
    it("currentWeightGain = currentWeight - prePregnancyWeight", () => {
      const result = calculatePregnancyWeightGain({
        prePregnancyWeight: 60,
        currentWeight: 67,
        height: 165,
        weeksPregnant: 20,
        twins: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.currentWeightGain).toBeCloseTo(7, 1);
    });
  });
});
