import { describe, expect, it } from "vitest";
import { calculatePersonalLoan } from "@/lib/converters/finance/personal-loan";

describe("calculatePersonalLoan", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero loan amount", () => {
      const result = calculatePersonalLoan({
        loanAmount: 0,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 1,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero loan term months", () => {
      const result = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 0,
        originationFee: 1,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic personal loan calculation", () => {
    it("monthly payment is positive for standard loan", () => {
      const result = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyPayment).toBeGreaterThan(0);
      }
    });

    it("$10,000 at 10% APR for 36 months → monthly payment ≈ $323", () => {
      const result = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyPayment).toBeCloseTo(323, 0);
      }
    });

    it("totalInterest is positive for nonzero rate", () => {
      const result = calculatePersonalLoan({
        loanAmount: 15000,
        annualInterestRate: 8,
        loanTermMonths: 48,
        originationFee: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalInterest).toBeGreaterThan(0);
      }
    });

    it("origination fee increases totalCost", () => {
      const withFee = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 2,
      });
      const withoutFee = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 0,
      });
      expect(withFee.ok).toBe(true);
      expect(withoutFee.ok).toBe(true);
      if (withFee.ok && withoutFee.ok) {
        expect(withFee.value.totalCost).toBeGreaterThan(withoutFee.value.totalCost);
      }
    });

    it("APR includes origination fee effect", () => {
      const withFee = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 3,
      });
      expect(withFee.ok).toBe(true);
      if (withFee.ok) {
        // APR with fee should be higher than stated rate
        expect(withFee.value.apr).toBeGreaterThan(10);
      }
    });

    it("amortization schedule has correct number of entries", () => {
      const result = calculatePersonalLoan({
        loanAmount: 10000,
        annualInterestRate: 10,
        loanTermMonths: 36,
        originationFee: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amortization).toHaveLength(36);
      }
    });
  });
});
