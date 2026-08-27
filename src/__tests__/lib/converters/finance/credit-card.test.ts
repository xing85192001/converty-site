import { describe, expect, it } from "vitest";
import { calculateCreditCard } from "@/lib/converters/finance/credit-card";

describe("calculateCreditCard", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero balance", () => {
      const result = calculateCreditCard({
        balance: 0,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 25,
        additionalPayment: 0,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when payment does not cover interest", () => {
      // Very small fixed minimum with high balance/rate so interest > payment
      const result = calculateCreditCard({
        balance: 100000,
        annualInterestRate: 24,
        minimumPaymentPercent: 0,
        minimumPaymentFixed: 1, // Only $1 fixed, monthly interest ≈ $2000
        additionalPayment: 0,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic credit card payoff calculation", () => {
    it("$5,000 balance at 20% APR with $100 min payment → takes many months to pay off", () => {
      const result = calculateCreditCard({
        balance: 5000,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 100,
        additionalPayment: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthsToPayoff).toBeGreaterThan(24);
      }
    });

    it("total interest is positive for nonzero rate", () => {
      const result = calculateCreditCard({
        balance: 5000,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 100,
        additionalPayment: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalInterest).toBeGreaterThan(0);
      }
    });

    it("paying more than minimum → shorter payoff time", () => {
      const minimal = calculateCreditCard({
        balance: 5000,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 100,
        additionalPayment: 0,
      });
      const extra = calculateCreditCard({
        balance: 5000,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 100,
        additionalPayment: 200,
      });
      expect(minimal.ok).toBe(true);
      expect(extra.ok).toBe(true);
      if (minimal.ok && extra.ok) {
        expect(extra.value.monthsToPayoff).toBeLessThan(minimal.value.monthsToPayoff);
      }
    });

    it("schedule has entries equal to monthsToPayoff", () => {
      const result = calculateCreditCard({
        balance: 2000,
        annualInterestRate: 18,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 50,
        additionalPayment: 150,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schedule).toHaveLength(result.value.monthsToPayoff);
      }
    });
  });

  describe("target months calculation", () => {
    it("provides paymentForTarget when targetMonths given", () => {
      const result = calculateCreditCard({
        balance: 5000,
        annualInterestRate: 20,
        minimumPaymentPercent: 2,
        minimumPaymentFixed: 100,
        additionalPayment: 0,
        targetMonths: 24,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.paymentForTarget).toBeDefined();
        expect(result.value.paymentForTarget!).toBeGreaterThan(0);
      }
    });
  });
});
