import { describe, expect, it } from "vitest";
import { calculateRoi } from "@/lib/converters/finance/roi";

describe("calculateRoi", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero initial investment", () => {
      const result = calculateRoi({ initialInvestment: 0, finalValue: 1500 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative initial investment", () => {
      const result = calculateRoi({ initialInvestment: -100, finalValue: 1500 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative final value", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: -100 });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic ROI calculation", () => {
    it("gain=$1500, cost=$1000 → ROI = 50%", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 1500 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.roiPercent).toBeCloseTo(50, 2);
      }
    });

    it("profit = finalValue - initialInvestment", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 1500 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.profit).toBeCloseTo(500, 2);
      }
    });

    it("negative ROI for loss scenario (finalValue < initialInvestment)", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 700 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.roiPercent).toBeLessThan(0);
        expect(result.value.profit).toBeLessThan(0);
      }
    });

    it("zero profit when finalValue equals initialInvestment", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 1000 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.roiPercent).toBeCloseTo(0, 2);
      }
    });
  });

  describe("annualized ROI", () => {
    it("provides annualizedRoi when years provided", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 1500, years: 5 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.annualizedRoiPercent).toBeDefined();
        expect(result.value.annualizedRoiPercent!).toBeGreaterThan(0);
      }
    });

    it("annualized ROI is less than total ROI for multi-year period", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 2000, years: 5 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Total ROI = 100%, annualized should be ~14.87%
        expect(result.value.annualizedRoiPercent!).toBeLessThan(result.value.roiPercent);
      }
    });

    it("no annualizedRoi when years not provided", () => {
      const result = calculateRoi({ initialInvestment: 1000, finalValue: 1500 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.annualizedRoiPercent).toBeUndefined();
      }
    });
  });
});
