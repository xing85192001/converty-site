import { describe, expect, it } from "vitest";
import { calculateInflation } from "@/lib/converters/finance/inflation";

describe("calculateInflation", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero amount", () => {
      const result = calculateInflation({ amount: 0, inflationRate: 3, years: 10 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative amount", () => {
      const result = calculateInflation({ amount: -100, inflationRate: 3, years: 10 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative years", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 3, years: -1 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for years > 100", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 3, years: 101 });
      expect(result.ok).toBe(false);
    });
  });

  describe("inflation calculation", () => {
    it("$100 at 3% for 10 years → futureValue ≈ $134", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 3, years: 10 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 100 * (1.03)^10 ≈ 134.39
        expect(result.value.futureValue).toBeCloseTo(134, 0);
      }
    });

    it("0% inflation → futureValue equals amount", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 0, years: 10 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.futureValue).toBeCloseTo(100, 2);
      }
    });

    it("higher inflation rate → larger future value", () => {
      const low = calculateInflation({ amount: 100, inflationRate: 2, years: 10 });
      const high = calculateInflation({ amount: 100, inflationRate: 5, years: 10 });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      if (low.ok && high.ok) {
        expect(high.value.futureValue).toBeGreaterThan(low.value.futureValue);
      }
    });

    it("purchasingPowerLoss is positive for positive inflation", () => {
      const result = calculateInflation({ amount: 1000, inflationRate: 3, years: 10 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.purchasingPowerLoss).toBeGreaterThan(0);
      }
    });

    it("yearlyBreakdown has correct number of entries", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 3, years: 5 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.yearlyBreakdown).toHaveLength(5);
      }
    });

    it("yearlyBreakdown values increase each year", () => {
      const result = calculateInflation({ amount: 100, inflationRate: 3, years: 3 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const values = result.value.yearlyBreakdown.map((e) => e.value);
        expect(values[1]).toBeGreaterThan(values[0]);
        expect(values[2]).toBeGreaterThan(values[1]);
      }
    });
  });
});
