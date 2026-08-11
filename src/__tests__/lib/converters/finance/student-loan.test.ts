import { describe, expect, it } from "vitest";
import { calculateStudentLoan } from "@/lib/converters/finance/student-loan";

describe("calculateStudentLoan", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero loan amount", () => {
      const result = calculateStudentLoan({
        loanAmount: 0,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: true,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero loan term years", () => {
      const result = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 0,
        gracePeriodMonths: 6,
        interestCapitalized: true,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("standard repayment", () => {
    it("$30,000 at 5% over 10 years → monthly payment ≈ $318", () => {
      const result = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 0,
        interestCapitalized: false,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyPayment).toBeCloseTo(318, 0);
      }
    });

    it("totalCost > loanAmount (interest was paid)", () => {
      const result = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 0,
        interestCapitalized: false,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalCost).toBeGreaterThan(30000);
      }
    });

    it("amortization schedule has 10 yearly entries", () => {
      const result = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 0,
        interestCapitalized: false,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amortization).toHaveLength(10);
      }
    });
  });

  describe("grace period", () => {
    it("grace period interest is non-zero for nonzero rate and months", () => {
      const result = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: false,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.gracePeriodInterest).toBeGreaterThan(0);
      }
    });

    it("capitalized interest increases principalAfterGrace", () => {
      const capitalized = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: true,
      });
      const notCapitalized = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: false,
      });
      expect(capitalized.ok).toBe(true);
      expect(notCapitalized.ok).toBe(true);
      if (capitalized.ok && notCapitalized.ok) {
        expect(capitalized.value.principalAfterGrace).toBeGreaterThan(
          notCapitalized.value.principalAfterGrace
        );
      }
    });

    it("capitalized interest → higher monthly payment", () => {
      const capitalized = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: true,
      });
      const notCapitalized = calculateStudentLoan({
        loanAmount: 30000,
        annualInterestRate: 5,
        loanTermYears: 10,
        gracePeriodMonths: 6,
        interestCapitalized: false,
      });
      expect(capitalized.ok).toBe(true);
      expect(notCapitalized.ok).toBe(true);
      if (capitalized.ok && notCapitalized.ok) {
        expect(capitalized.value.monthlyPayment).toBeGreaterThan(
          notCapitalized.value.monthlyPayment
        );
      }
    });
  });

  describe("zero interest rate", () => {
    it("zero interest → monthlyPayment = loanAmount / (loanTermYears × 12)", () => {
      const result = calculateStudentLoan({
        loanAmount: 24000,
        annualInterestRate: 0,
        loanTermYears: 10,
        gracePeriodMonths: 0,
        interestCapitalized: false,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyPayment).toBeCloseTo(200, 2);
      }
    });
  });
});
