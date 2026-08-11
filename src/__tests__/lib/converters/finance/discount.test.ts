import { describe, expect, it } from "vitest";
import { calculateDiscount } from "@/lib/converters/finance/discount";

describe("calculateDiscount", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero original price", () => {
      const result = calculateDiscount({ originalPrice: 0, discountPercent: 20 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative original price", () => {
      const result = calculateDiscount({ originalPrice: -100, discountPercent: 20 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when no discount method provided", () => {
      const result = calculateDiscount({ originalPrice: 100 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for discount percent over 100", () => {
      const result = calculateDiscount({ originalPrice: 100, discountPercent: 150 });
      expect(result.ok).toBe(false);
    });
  });

  describe("discount by percentage", () => {
    it("$100 with 20% off → finalPrice = $80", () => {
      const result = calculateDiscount({ originalPrice: 100, discountPercent: 20 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalPrice).toBeCloseTo(80, 2);
      }
    });

    it("$100 with 0% → finalPrice = $100", () => {
      const result = calculateDiscount({ originalPrice: 100, discountPercent: 0 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalPrice).toBeCloseTo(100, 2);
      }
    });

    it("$100 with 100% → finalPrice = $0", () => {
      const result = calculateDiscount({ originalPrice: 100, discountPercent: 100 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalPrice).toBeCloseTo(0, 2);
      }
    });
  });

  describe("discount by amount", () => {
    it("$100 with $25 off → finalPrice = $75", () => {
      const result = calculateDiscount({ originalPrice: 100, discountAmount: 25 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalPrice).toBeCloseTo(75, 2);
        expect(result.value.discountPercent).toBeCloseTo(25, 2);
      }
    });
  });

  describe("discount by final price", () => {
    it("original $100, final $60 → discount = $40 (40%)", () => {
      const result = calculateDiscount({ originalPrice: 100, finalPrice: 60 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.discountAmount).toBeCloseTo(40, 2);
        expect(result.value.discountPercent).toBeCloseTo(40, 2);
      }
    });
  });

  describe("savings field", () => {
    it("savings equals discountAmount", () => {
      const result = calculateDiscount({ originalPrice: 200, discountPercent: 15 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.savings).toBeCloseTo(result.value.discountAmount, 2);
      }
    });
  });
});
