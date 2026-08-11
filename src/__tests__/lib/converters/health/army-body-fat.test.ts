import { describe, expect, it } from "vitest";
import { calculateArmyBodyFat } from "@/lib/converters/health/army-body-fat";

describe("calculateArmyBodyFat", () => {
  describe("null for invalid inputs", () => {
    it("returns null for height <= 0", () => {
      expect(
        calculateArmyBodyFat({ gender: "male", age: 25, height: 0, neck: 38, waist: 80 }).ok
      ).toBe(false);
    });

    it("returns null for neck <= 0", () => {
      expect(
        calculateArmyBodyFat({ gender: "male", age: 25, height: 175, neck: 0, waist: 80 }).ok
      ).toBe(false);
    });

    it("returns null for waist <= 0", () => {
      expect(
        calculateArmyBodyFat({ gender: "male", age: 25, height: 175, neck: 38, waist: 0 }).ok
      ).toBe(false);
    });

    it("returns null for age <= 0", () => {
      expect(
        calculateArmyBodyFat({ gender: "male", age: 0, height: 175, neck: 38, waist: 80 }).ok
      ).toBe(false);
    });

    it("returns null for female without hip", () => {
      expect(
        calculateArmyBodyFat({ gender: "female", age: 25, height: 165, neck: 33, waist: 70 }).ok
      ).toBe(false);
    });
  });

  describe("male calculation", () => {
    it("calculates body fat for a male with valid inputs", () => {
      const result = calculateArmyBodyFat({
        gender: "male",
        age: 25,
        height: 175,
        neck: 38,
        waist: 80,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeLessThan(50);
    });

    it("returns maxAllowedPercent 22 for male age 25 (21-27 range)", () => {
      const result = calculateArmyBodyFat({
        gender: "male",
        age: 25,
        height: 175,
        neck: 38,
        waist: 80,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.maxAllowedPercent).toBe(22);
    });

    it("passes standard for male with low body fat", () => {
      const result = calculateArmyBodyFat({
        gender: "male",
        age: 25,
        height: 180,
        neck: 40,
        waist: 78,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.armyCategory).toBeDefined();
    });
  });

  describe("female calculation", () => {
    it("calculates body fat for a female with valid inputs", () => {
      const result = calculateArmyBodyFat({
        gender: "female",
        age: 25,
        height: 165,
        neck: 33,
        waist: 70,
        hip: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeLessThan(50);
    });

    it("returns maxAllowedPercent 32 for female age 25 (21-27 range)", () => {
      const result = calculateArmyBodyFat({
        gender: "female",
        age: 25,
        height: 165,
        neck: 33,
        waist: 70,
        hip: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.maxAllowedPercent).toBe(32);
    });
  });

  describe("result structure", () => {
    it("returns all required fields", () => {
      const result = calculateArmyBodyFat({
        gender: "male",
        age: 30,
        height: 175,
        neck: 38,
        waist: 85,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.bodyFatPercent).toBeDefined();
      expect((result as { ok: true; value: any }).value.maxAllowedPercent).toBeDefined();
      expect((result as { ok: true; value: any }).value.passesStandard).toBeDefined();
      expect((result as { ok: true; value: any }).value.category).toBeDefined();
      expect((result as { ok: true; value: any }).value.armyCategory).toMatch(/^(pass|tape|fail)$/);
    });
  });
});
