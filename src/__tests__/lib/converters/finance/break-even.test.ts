import { describe, expect, it } from "vitest";
import { calculateBreakEven } from "@/lib/converters/finance/break-even";

describe("calculateBreakEven", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false when price equals variable cost (zero contribution margin)", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 50,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when price is less than variable cost", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 60,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero price per unit", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 0,
        pricePerUnit: 0,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative fixed costs", () => {
      const result = calculateBreakEven({
        fixedCosts: -100,
        variableCostPerUnit: 30,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic break-even calculation", () => {
    it("fixed=10000, price=50, variable=30 → break-even=500 units", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 30,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.breakEvenUnits).toBeCloseTo(500, 0);
      }
    });

    it("higher fixed costs → more units needed to break even", () => {
      const low = calculateBreakEven({
        fixedCosts: 5000,
        variableCostPerUnit: 20,
        pricePerUnit: 50,
      });
      const high = calculateBreakEven({
        fixedCosts: 20000,
        variableCostPerUnit: 20,
        pricePerUnit: 50,
      });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      if (low.ok && high.ok) {
        expect(high.value.breakEvenUnits).toBeGreaterThan(low.value.breakEvenUnits);
      }
    });

    it("breakEvenRevenue = breakEvenUnits × pricePerUnit", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 30,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.breakEvenRevenue).toBeCloseTo(result.value.breakEvenUnits * 50, 0);
      }
    });

    it("contributionMargin = pricePerUnit - variableCostPerUnit", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 30,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.contributionMargin).toBeCloseTo(20, 2);
      }
    });

    it("profitAtUnits array is non-empty", () => {
      const result = calculateBreakEven({
        fixedCosts: 10000,
        variableCostPerUnit: 30,
        pricePerUnit: 50,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.profitAtUnits).toBeDefined();
        expect(result.value.profitAtUnits!.length).toBeGreaterThan(0);
      }
    });
  });
});
