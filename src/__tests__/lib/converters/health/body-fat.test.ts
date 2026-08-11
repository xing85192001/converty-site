import { describe, expect, it } from "vitest";
import { calculateBodyFat } from "@/lib/converters/health/body-fat";

describe("calculateBodyFat", () => {
  describe("null for invalid inputs", () => {
    it("returns null for weight <= 0", () => {
      expect(
        calculateBodyFat({
          gender: "male",
          age: 25,
          weight: 0,
          height: 175,
          neck: 38,
          waist: 80,
        }).ok
      ).toBe(false);
    });

    it("returns null for height <= 0", () => {
      expect(
        calculateBodyFat({
          gender: "male",
          age: 25,
          weight: 70,
          height: 0,
          neck: 38,
          waist: 80,
        }).ok
      ).toBe(false);
    });

    it("returns null for neck <= 0", () => {
      expect(
        calculateBodyFat({
          gender: "male",
          age: 25,
          weight: 70,
          height: 175,
          neck: 0,
          waist: 80,
        }).ok
      ).toBe(false);
    });

    it("returns null for female without hip", () => {
      expect(
        calculateBodyFat({
          gender: "female",
          age: 25,
          weight: 60,
          height: 165,
          neck: 33,
          waist: 70,
        }).ok
      ).toBe(false);
    });
  });

  describe("male Navy method calculation", () => {
    it("calculates body fat for a male", () => {
      const result = calculateBodyFat({
        gender: "male",
        age: 25,
        weight: 80,
        height: 175,
        neck: 38,
        waist: 85,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeLessThanOrEqual(60);
    });

    it("returns fat mass and lean mass that sum to weight", () => {
      const result = calculateBodyFat({
        gender: "male",
        age: 30,
        weight: 80,
        height: 175,
        neck: 38,
        waist: 85,
      });
      expect(result.ok).toBe(true);
      expect(
        (result as { ok: true; value: any }).value.fatMass +
          (result as { ok: true; value: any }).value.leanMass
      ).toBeCloseTo(80, 2);
    });

    it("returns category for male", () => {
      const result = calculateBodyFat({
        gender: "male",
        age: 25,
        weight: 75,
        height: 175,
        neck: 38,
        waist: 80,
      });
      expect(result.ok).toBe(true);
      expect(["essential", "athletes", "fitness", "average", "obese"]).toContain(
        (result as { ok: true; value: any }).value.category
      );
    });
  });

  describe("female Navy method calculation", () => {
    it("calculates body fat for a female", () => {
      const result = calculateBodyFat({
        gender: "female",
        age: 25,
        weight: 60,
        height: 165,
        neck: 33,
        waist: 70,
        hip: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeLessThanOrEqual(60);
    });

    it("idealBodyFatMin/Max differ for male vs female", () => {
      const maleResult = calculateBodyFat({
        gender: "male",
        age: 25,
        weight: 75,
        height: 175,
        neck: 38,
        waist: 80,
      });
      const femaleResult = calculateBodyFat({
        gender: "female",
        age: 25,
        weight: 60,
        height: 165,
        neck: 33,
        waist: 70,
        hip: 95,
      });
      expect(maleResult.ok).toBe(true);
      expect(femaleResult.ok).toBe(true);
      expect((femaleResult as { ok: true; value: any }).value.idealBodyFatMin).toBeGreaterThan(
        (maleResult as { ok: true; value: any }).value.idealBodyFatMin
      );
    });
  });
});
