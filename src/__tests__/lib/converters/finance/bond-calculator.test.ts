import { describe, expect, it } from "vitest";
import { calculateBond } from "@/lib/converters/finance/bond-calculator";

describe("calculateBond", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero face value", () => {
      const result = calculateBond({
        faceValue: 0,
        couponRate: 5,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero yearsToMaturity", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 0,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("par bond (coupon = market rate)", () => {
    it("par bond: price ≈ face value when couponRate equals marketRate", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bondPrice).toBeCloseTo(1000, 0);
      }
    });

    it("par bond: isPremium is false", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isPremium).toBe(false);
      }
    });
  });

  describe("discount bond (coupon < market rate)", () => {
    it("discount bond: price < face value when couponRate < marketRate", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 3,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bondPrice).toBeLessThan(1000);
      }
    });

    it("discount bond: isPremium is false", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 3,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isPremium).toBe(false);
      }
    });
  });

  describe("premium bond (coupon > market rate)", () => {
    it("premium bond: price > face value when couponRate > marketRate", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 7,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bondPrice).toBeGreaterThan(1000);
      }
    });

    it("premium bond: isPremium is true", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 7,
        yearsToMaturity: 10,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isPremium).toBe(true);
      }
    });
  });

  describe("coupon payment", () => {
    it("annual coupon = faceValue × couponRate", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 5,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.couponPayment).toBeCloseTo(50, 2);
      }
    });

    it("schedule length matches yearsToMaturity", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 5,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schedule).toHaveLength(5);
      }
    });

    it("last schedule entry includes face value principal payment", () => {
      const result = calculateBond({
        faceValue: 1000,
        couponRate: 5,
        yearsToMaturity: 5,
        paymentFrequency: 1,
        marketRate: 5,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const lastEntry = result.value.schedule[result.value.schedule.length - 1];
        expect(lastEntry.principalPayment).toBe(1000);
      }
    });
  });
});
