import { describe, expect, it } from "vitest";
import { calculateStandardDeviation } from "@/lib/converters/math/standard-deviation";

describe("calculateStandardDeviation", () => {
  const testData = [2, 4, 4, 4, 5, 5, 7, 9]; // classic dataset

  describe("population standard deviation", () => {
    it("calculates population std dev of classic dataset = 2.0", () => {
      const result = calculateStandardDeviation({
        numbers: testData,
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.standardDeviation).toBeCloseTo(2.0, 5);
    });

    it("calculates population variance = 4.0", () => {
      const result = calculateStandardDeviation({
        numbers: testData,
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.variance).toBeCloseTo(4.0, 5);
    });

    it("uses population formula σ", () => {
      const result = calculateStandardDeviation({
        numbers: testData,
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.formula).toContain("N");
    });
  });

  describe("sample standard deviation", () => {
    it("calculates sample std dev of classic dataset ≈ 2.138", () => {
      const result = calculateStandardDeviation({
        numbers: testData,
        isPopulation: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.standardDeviation).toBeCloseTo(2.138, 2);
    });

    it("sample variance uses n-1 denominator", () => {
      const result = calculateStandardDeviation({
        numbers: [2, 4, 4, 4, 5, 5, 7, 9],
        isPopulation: false,
      });
      expect(result.ok).toBe(true);
      // variance = (sum of squared deviations) / (n-1)
      // with n=8, sum of sq. dev = 32, variance = 32/7 ≈ 4.571
      expect((result as { ok: true; value: any }).value.variance).toBeCloseTo(32 / 7, 4);
    });

    it("uses sample formula s", () => {
      const result = calculateStandardDeviation({
        numbers: testData,
        isPopulation: false,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.formula).toContain("n-1");
    });

    it("returns null for empty array", () => {
      const result = calculateStandardDeviation({ numbers: [], isPopulation: false });
      expect(result.ok).toBe(false);
    });

    it("returns null for sample with n<2", () => {
      const result = calculateStandardDeviation({ numbers: [5], isPopulation: false });
      expect(result.ok).toBe(false);
    });
  });

  describe("population with n=1", () => {
    it("allows population std dev for single value (= 0)", () => {
      const result = calculateStandardDeviation({ numbers: [5], isPopulation: true });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.standardDeviation).toBe(0);
    });
  });

  describe("basic statistics", () => {
    it("calculates mean correctly", () => {
      const result = calculateStandardDeviation({
        numbers: [1, 2, 3, 4, 5],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mean).toBe(3);
    });

    it("calculates count correctly", () => {
      const result = calculateStandardDeviation({
        numbers: [1, 2, 3],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.count).toBe(3);
    });

    it("calculates sum correctly", () => {
      const result = calculateStandardDeviation({
        numbers: [1, 2, 3, 4],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sum).toBe(10);
    });
  });

  describe("deviations", () => {
    it("includes deviations for each value", () => {
      const result = calculateStandardDeviation({
        numbers: [1, 3],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.deviations.length).toBe(2);
      expect((result as { ok: true; value: any }).value.deviations[0].value).toBe(1);
      expect((result as { ok: true; value: any }).value.deviations[0].deviation).toBe(-1);
      expect((result as { ok: true; value: any }).value.deviations[0].squaredDeviation).toBe(1);
    });
  });

  describe("z-scores", () => {
    it("calculates z-scores for each value", () => {
      const result = calculateStandardDeviation({
        numbers: [2, 4, 6],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.zScores.length).toBe(3);
      // mean = 4, std ≈ 1.633
      // z for 2 = (2-4)/1.633 ≈ -1.22
      const zFirst = (result as { ok: true; value: any }).value.zScores[0].zScore;
      expect(Math.abs(zFirst)).toBeGreaterThan(0);
    });

    it("z-scores sum to approximately 0", () => {
      const result = calculateStandardDeviation({
        numbers: [1, 2, 3, 4, 5],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      const zSum = (result as { ok: true; value: any }).value.zScores.reduce(
        (a: number, z: { zScore: number }) => a + z.zScore,
        0
      );
      expect(zSum).toBeCloseTo(0, 10);
    });
  });

  describe("coefficient of variation", () => {
    it("calculates coefficient of variation", () => {
      const result = calculateStandardDeviation({
        numbers: [10, 20, 30],
        isPopulation: true,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.coefficientOfVariation).toBeGreaterThan(0);
    });
  });
});
