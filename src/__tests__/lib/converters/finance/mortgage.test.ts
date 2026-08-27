import { describe, expect, it } from "vitest";
import { calculateMortgage } from "@/lib/converters/finance/mortgage";

describe("calculateMortgage", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero home price", () => {
      const result = calculateMortgage({
        homePrice: 0,
        downPayment: 0,
        downPaymentPercent: 20,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero loan term", () => {
      const result = calculateMortgage({
        homePrice: 300000,
        downPayment: 60000,
        downPaymentPercent: 20,
        loanTerm: 0,
        interestRate: 6,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when down payment >= home price (no loan needed)", () => {
      const result = calculateMortgage({
        homePrice: 300000,
        downPayment: 300000,
        downPaymentPercent: 100,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("standard 30-year mortgage", () => {
    it("$300,000 at 6% for 30 years → monthly P&I ≈ $1,799", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // $300,000 loan at 6% for 30 years
        expect(result.value.monthlyPrincipalInterest).toBeCloseTo(1799, 0);
      }
    });

    it("amortization schedule has 360 entries for 30-year mortgage", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amortizationSchedule).toHaveLength(360);
      }
    });

    it("first month interest > last month interest", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const schedule = result.value.amortizationSchedule;
        expect(schedule[0].interest).toBeGreaterThan(schedule[359].interest);
      }
    });

    it("total paid > loan amount (interest paid over life)", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalPayments).toBeGreaterThan(300000);
      }
    });

    it("totalInterest is positive", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 0,
        homeInsurance: 0,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalInterest).toBeGreaterThan(0);
      }
    });
  });

  describe("taxes and insurance included", () => {
    it("totalMonthlyPayment includes property tax and insurance", () => {
      const result = calculateMortgage({
        homePrice: 360000,
        downPayment: 60000,
        downPaymentPercent: 16.67,
        loanTerm: 30,
        interestRate: 6,
        propertyTax: 3600,
        homeInsurance: 1200,
        pmi: 0,
        hoaFees: 0,
        startDate: "2024-01-01",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Monthly tax = 300, insurance = 100 → total > P&I alone
        expect(result.value.totalMonthlyPayment).toBeGreaterThan(
          result.value.monthlyPrincipalInterest
        );
      }
    });
  });
});
