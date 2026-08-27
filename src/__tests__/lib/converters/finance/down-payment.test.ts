import { describe, expect, it } from "vitest";
import { calculateDownPayment } from "@/lib/converters/finance/down-payment";

describe("calculateDownPayment", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero home price", () => {
      const result = calculateDownPayment({
        homePrice: 0,
        downPaymentPercent: 20,
        savingsGoalMonths: 24,
        currentSavings: 0,
        annualReturnRate: 4,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero savings goal months", () => {
      const result = calculateDownPayment({
        homePrice: 300000,
        downPaymentPercent: 20,
        savingsGoalMonths: 0,
        currentSavings: 0,
        annualReturnRate: 4,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("down payment calculation", () => {
    it("$300,000 at 20% → downPaymentAmount = $60,000", () => {
      const result = calculateDownPayment({
        homePrice: 300000,
        downPaymentPercent: 20,
        savingsGoalMonths: 36,
        currentSavings: 0,
        annualReturnRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.downPaymentAmount).toBeCloseTo(60000, 0);
      }
    });

    it("$300,000 at 3.5% → downPaymentAmount = $10,500", () => {
      const result = calculateDownPayment({
        homePrice: 300000,
        downPaymentPercent: 3.5,
        savingsGoalMonths: 36,
        currentSavings: 0,
        annualReturnRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.downPaymentAmount).toBeCloseTo(10500, 0);
      }
    });

    it("loanAmount = homePrice - downPaymentAmount", () => {
      const result = calculateDownPayment({
        homePrice: 400000,
        downPaymentPercent: 20,
        savingsGoalMonths: 24,
        currentSavings: 0,
        annualReturnRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loanAmount).toBeCloseTo(320000, 0);
      }
    });

    it("when current savings meets goal → returns zero monthly contribution needed", () => {
      const result = calculateDownPayment({
        homePrice: 100000,
        downPaymentPercent: 20,
        savingsGoalMonths: 24,
        currentSavings: 20000, // already at goal
        annualReturnRate: 4,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyContribution).toBe(0);
        expect(result.value.amountNeeded).toBe(0);
      }
    });

    it("monthly contribution is positive when savings are needed", () => {
      const result = calculateDownPayment({
        homePrice: 300000,
        downPaymentPercent: 20,
        savingsGoalMonths: 24,
        currentSavings: 0,
        annualReturnRate: 4,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyContribution).toBeGreaterThan(0);
      }
    });
  });
});
