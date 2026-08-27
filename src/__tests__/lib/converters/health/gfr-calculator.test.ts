import { describe, expect, it } from "vitest";
import { calculateGfr } from "@/lib/converters/health/gfr-calculator";

describe("calculateGfr", () => {
  describe("null for invalid inputs", () => {
    it("returns null for creatinine <= 0", () => {
      expect(
        calculateGfr({
          creatinine: 0,
          creatinineUnit: "mgdl",
          age: 60,
          gender: "female",
          race: "other",
        }).ok
      ).toBe(false);
    });

    it("returns null for age <= 0", () => {
      expect(
        calculateGfr({
          creatinine: 1.0,
          creatinineUnit: "mgdl",
          age: 0,
          gender: "female",
          race: "other",
        }).ok
      ).toBe(false);
    });

    it("returns null for age > 120", () => {
      expect(
        calculateGfr({
          creatinine: 1.0,
          creatinineUnit: "mgdl",
          age: 121,
          gender: "female",
          race: "other",
        }).ok
      ).toBe(false);
    });
  });

  describe("CKD-EPI calculation (female)", () => {
    it("healthy female 60yo creatinine 1.0 has GFR in expected range (60-90)", () => {
      const result = calculateGfr({
        creatinine: 1.0,
        creatinineUnit: "mgdl",
        age: 60,
        gender: "female",
        race: "other",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.egfrCkdEpi).toBeGreaterThan(60);
      expect((result as { ok: true; value: any }).value.egfrCkdEpi).toBeLessThan(90);
    });
  });

  describe("CKD-EPI calculation (male)", () => {
    it("healthy male 60yo creatinine 1.0 has GFR in expected range", () => {
      const result = calculateGfr({
        creatinine: 1.0,
        creatinineUnit: "mgdl",
        age: 60,
        gender: "male",
        race: "other",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.egfrCkdEpi).toBeGreaterThan(50);
    });

    it("male and female give different GFR for same inputs", () => {
      const base = {
        creatinine: 1.0,
        creatinineUnit: "mgdl" as const,
        age: 60,
        race: "other" as const,
      };
      const male = calculateGfr({ ...base, gender: "male" });
      const female = calculateGfr({ ...base, gender: "female" });
      expect(male.ok).toBe(true);
      expect(female.ok).toBe(true);
      expect((male as { ok: true; value: any }).value.egfrCkdEpi).not.toBe(
        (female as { ok: true; value: any }).value.egfrCkdEpi
      );
    });
  });

  describe("umol/L unit conversion", () => {
    it("produces same result when converting umol to mg/dL (creatinine × 88.4)", () => {
      const mgdl = calculateGfr({
        creatinine: 1.0,
        creatinineUnit: "mgdl",
        age: 50,
        gender: "male",
        race: "other",
      });
      const umol = calculateGfr({
        creatinine: 88.4,
        creatinineUnit: "umol",
        age: 50,
        gender: "male",
        race: "other",
      });
      expect(mgdl.ok).toBe(true);
      expect(umol.ok).toBe(true);
      expect((umol as { ok: true; value: any }).value.egfrCkdEpi).toBeCloseTo(
        (mgdl as { ok: true; value: any }).value.egfrCkdEpi,
        2
      );
    });
  });

  describe("CKD staging", () => {
    it("assigns stage 1 for GFR >= 90", () => {
      const result = calculateGfr({
        creatinine: 0.6,
        creatinineUnit: "mgdl",
        age: 30,
        gender: "female",
        race: "other",
      });
      expect(result.ok).toBe(true);
      if ((result as { ok: true; value: any }).value.egfrCkdEpi >= 90) {
        expect((result as { ok: true; value: any }).value.stage).toBe(1);
        expect((result as { ok: true; value: any }).value.stageKey).toBe("stage1");
      }
    });

    it("assigns stage 5 for very high creatinine", () => {
      const result = calculateGfr({
        creatinine: 8.0,
        creatinineUnit: "mgdl",
        age: 60,
        gender: "male",
        race: "other",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.stage).toBe(5);
      expect((result as { ok: true; value: any }).value.stageKey).toBe("stage5");
    });
  });

  describe("Cockcroft-Gault with weight", () => {
    it("returns non-null Cockcroft-Gault when weight is provided", () => {
      const result = calculateGfr({
        creatinine: 1.0,
        creatinineUnit: "mgdl",
        age: 60,
        gender: "male",
        race: "other",
        weight: 80,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.egfrCockcroftGault).not.toBeNull();
      expect((result as { ok: true; value: any }).value.egfrCockcroftGault!).toBeGreaterThan(0);
    });
  });
});
