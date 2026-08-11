import { describe, expect, it } from "vitest";
import { calculateConfidenceInterval } from "@/lib/converters/math/confidence-interval";

describe("calculateConfidenceInterval", () => {
  describe("mean mode", () => {
    it("calculates 95% CI for known values (large sample)", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 100,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.pointEstimate).toBe(50);
      expect((result as { ok: true; value: any }).value.lowerBound).toBeLessThan(50);
      expect((result as { ok: true; value: any }).value.upperBound).toBeGreaterThan(50);
      // 95% CI: 50 ± 1.96 * (10/√100) = 50 ± 1.96
      expect((result as { ok: true; value: any }).value.lowerBound).toBeCloseTo(48.04, 1);
      expect((result as { ok: true; value: any }).value.upperBound).toBeCloseTo(51.96, 1);
    });

    it("calculates 99% CI with larger margin of error", () => {
      const result95 = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 100,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      const result99 = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 100,
        standardDeviation: 10,
        confidenceLevel: 99,
      });
      expect(result95.ok).toBe(true);
      expect(result99.ok).toBe(true);
      expect((result99 as { ok: true; value: any }).value.marginOfError).toBeGreaterThan(
        (result95 as { ok: true; value: any }).value.marginOfError
      );
    });

    it("lower < mean < upper", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 75,
        sampleSize: 50,
        standardDeviation: 15,
        confidenceLevel: 90,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.lowerBound).toBeLessThan(75);
      expect((result as { ok: true; value: any }).value.upperBound).toBeGreaterThan(75);
    });

    it("uses t-distribution for small samples (n < 30)", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 20,
        sampleSize: 10,
        standardDeviation: 5,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.formula).toContain("t");
      expect((result as { ok: true; value: any }).value.criticalValue).toBeGreaterThan(1.96); // t > z for same confidence level
    });

    it("returns null for n=0", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 0,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for negative n", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: -1,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when standardDeviation is 0", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 100,
        standardDeviation: 0,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when sampleMean is undefined", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleSize: 100,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("proportion mode", () => {
    it("calculates CI for a proportion", () => {
      const result = calculateConfidenceInterval({
        mode: "proportion",
        successes: 60,
        sampleSize: 100,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.pointEstimate).toBeCloseTo(0.6, 4);
      expect((result as { ok: true; value: any }).value.lowerBound).toBeLessThan(0.6);
      expect((result as { ok: true; value: any }).value.upperBound).toBeGreaterThan(0.6);
    });

    it("returns null when successes > sampleSize", () => {
      const result = calculateConfidenceInterval({
        mode: "proportion",
        successes: 110,
        sampleSize: 100,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when successes is negative", () => {
      const result = calculateConfidenceInterval({
        mode: "proportion",
        successes: -1,
        sampleSize: 100,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("includes proportion interpretation", () => {
      const result = calculateConfidenceInterval({
        mode: "proportion",
        successes: 50,
        sampleSize: 100,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.interpretation).toContain("proportion");
    });
  });

  describe("difference mode", () => {
    it("calculates CI for difference of means", () => {
      const result = calculateConfidenceInterval({
        mode: "difference",
        sampleMean: 80,
        sampleSize: 50,
        standardDeviation: 10,
        sampleMean2: 70,
        sampleSize2: 50,
        standardDeviation2: 12,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.pointEstimate).toBeCloseTo(10, 4);
    });

    it("returns null when required fields are missing", () => {
      const result = calculateConfidenceInterval({
        mode: "difference",
        sampleMean: 80,
        sampleSize: 50,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("result structure", () => {
    it("includes all required fields", () => {
      const result = calculateConfidenceInterval({
        mode: "mean",
        sampleMean: 50,
        sampleSize: 100,
        standardDeviation: 10,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      const value = (result as { ok: true; value: any }).value;
      expect(value).toHaveProperty("lowerBound");
      expect(value).toHaveProperty("upperBound");
      expect(value).toHaveProperty("marginOfError");
      expect(value).toHaveProperty("criticalValue");
      expect(value).toHaveProperty("standardError");
      expect(value).toHaveProperty("formula");
      expect(value).toHaveProperty("steps");
      expect(value).toHaveProperty("interpretation");
      expect(value.steps.length).toBeGreaterThan(0);
    });
  });
});
