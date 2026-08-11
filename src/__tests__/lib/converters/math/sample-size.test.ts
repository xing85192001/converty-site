import { describe, expect, it } from "vitest";
import { calculateSampleSize } from "@/lib/converters/math/sample-size";

describe("calculateSampleSize", () => {
  describe("proportion mode", () => {
    it("confidence=95%, margin=5% gives ~385 for unknown proportion", () => {
      const result = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.05,
        populationProportion: 0.5,
      });
      expect(result.ok).toBe(true);
      // Standard result for 95%, 5% margin, p=0.5
      expect((result as { ok: true; value: any }).value.sampleSize).toBeGreaterThanOrEqual(384);
      expect((result as { ok: true; value: any }).value.sampleSize).toBeLessThanOrEqual(386);
    });

    it("confidence=99% gives larger sample than 95%", () => {
      const result95 = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.05,
      });
      const result99 = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 99,
        marginOfError: 0.05,
      });
      expect(result95.ok).toBe(true);
      expect(result99.ok).toBe(true);
      expect((result99 as { ok: true; value: any }).value.sampleSize).toBeGreaterThan(
        (result95 as { ok: true; value: any }).value.sampleSize
      );
    });

    it("smaller margin of error requires larger sample", () => {
      const result5 = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.05,
      });
      const result3 = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.03,
      });
      expect(result5.ok).toBe(true);
      expect(result3.ok).toBe(true);
      expect((result3 as { ok: true; value: any }).value.sampleSize).toBeGreaterThan(
        (result5 as { ok: true; value: any }).value.sampleSize
      );
    });

    it("applies finite population correction when populationSize given", () => {
      const result = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.05,
        populationSize: 500,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.finiteCorrected).toBeDefined();
      expect((result as { ok: true; value: any }).value.finiteCorrected!).toBeLessThan(385); // smaller due to finite correction
    });
  });

  describe("mean mode", () => {
    it("calculates sample size for a mean estimate", () => {
      const result = calculateSampleSize({
        mode: "mean",
        confidenceLevel: 95,
        marginOfError: 0.5,
        standardDeviation: 2,
      });
      expect(result.ok).toBe(true);
      // n = (1.96 * 2 / 0.5)^2 = (7.84)^2 ≈ 61.5 → 62
      expect((result as { ok: true; value: any }).value.sampleSize).toBeGreaterThanOrEqual(61);
      expect((result as { ok: true; value: any }).value.sampleSize).toBeLessThanOrEqual(63);
    });

    it("returns null when standardDeviation is 0", () => {
      const result = calculateSampleSize({
        mode: "mean",
        confidenceLevel: 95,
        marginOfError: 5,
        standardDeviation: 0,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when standardDeviation is missing", () => {
      const result = calculateSampleSize({
        mode: "mean",
        confidenceLevel: 95,
        marginOfError: 5,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("fromMarginOfError mode", () => {
    it("calculates margin of error from sample size", () => {
      const result = calculateSampleSize({
        mode: "fromMarginOfError",
        sampleSize: 400,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(true);
      // For n=400, p=0.5: E = 1.96 * sqrt(0.5*0.5/400) = 1.96 * 0.025 ≈ 0.049
      expect((result as { ok: true; value: any }).value.marginOfError).toBeCloseTo(0.049, 2);
    });

    it("returns null for sampleSize <= 0", () => {
      const result = calculateSampleSize({
        mode: "fromMarginOfError",
        sampleSize: 0,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for missing sampleSize", () => {
      const result = calculateSampleSize({
        mode: "fromMarginOfError",
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("validation", () => {
    it("returns null for marginOfError = 0", () => {
      const result = calculateSampleSize({
        mode: "proportion",
        marginOfError: 0,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for marginOfError >= 1", () => {
      const result = calculateSampleSize({
        mode: "proportion",
        marginOfError: 1,
        confidenceLevel: 95,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("result structure", () => {
    it("includes required fields", () => {
      const result = calculateSampleSize({
        mode: "proportion",
        confidenceLevel: 95,
        marginOfError: 0.05,
      });
      expect(result.ok).toBe(true);
      const value = (result as { ok: true; value: any }).value;
      expect(value).toHaveProperty("sampleSize");
      expect(value).toHaveProperty("marginOfError");
      expect(value).toHaveProperty("confidenceLevel");
      expect(value).toHaveProperty("zScore");
      expect(value).toHaveProperty("formula");
      expect(value).toHaveProperty("steps");
      expect(value).toHaveProperty("interpretation");
      expect(value.steps.length).toBeGreaterThan(0);
    });
  });
});
