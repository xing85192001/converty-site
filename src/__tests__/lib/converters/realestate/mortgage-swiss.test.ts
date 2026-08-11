import { describe, expect, it } from "vitest";
import {
  calculateSwissMortgage,
  getSwissLoanTerms,
  getSwissMortgageRates,
} from "@/lib/converters/realestate/mortgage-swiss";

const BASE_INPUT = {
  propertyPrice: 800_000,
  downPayment: 160_000, // 20% down payment
  downPaymentPercent: 20,
  loanTerm: 20,
  interestRate: 2.5,
  currency: "CHF" as const,
  startDate: "2026-01-01",
  includeAmortization: true,
};

describe("calculateSwissMortgage", () => {
  describe("invalid inputs return error", () => {
    it("returns error for propertyPrice of 0", () => {
      const result = calculateSwissMortgage({ ...BASE_INPUT, propertyPrice: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for loanTerm of 0", () => {
      const result = calculateSwissMortgage({ ...BASE_INPUT, loanTerm: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error when loanAmount is 0 (downPayment equals propertyPrice)", () => {
      const result = calculateSwissMortgage({
        ...BASE_INPUT,
        downPayment: 800_000,
        propertyPrice: 800_000,
      });
      expect(result.ok).toBe(false);
    });

    it("returns error when downPayment exceeds propertyPrice", () => {
      const result = calculateSwissMortgage({
        ...BASE_INPUT,
        downPayment: 900_000,
        propertyPrice: 800_000,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic CHF 800,000 property at 80% LTV", () => {
    it("returns ok result", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("loanAmount equals propertyPrice minus downPayment", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.loanAmount).toBeCloseTo(640_000, 0);
    });

    it("LTV is approximately 80%", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.ltv).toBeCloseTo(80, 1);
    });

    it("monthlyPayment is positive", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.monthlyPayment).toBeGreaterThan(0);
    });

    it("totalPayments equals monthlyPayment * loanTerm * 12", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalPayments).toBeCloseTo(result.value.monthlyPayment * 20 * 12, 0);
    });

    it("totalCost equals loanAmount plus totalInterest", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalCost).toBeCloseTo(
        result.value.loanAmount + result.value.totalInterest,
        0
      );
    });
  });

  describe("amortization schedule", () => {
    it("amortizationSchedule has 240 entries for 20-year term", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.amortizationSchedule).toHaveLength(240);
    });

    it("first amortization entry has month 1", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.amortizationSchedule[0].month).toBe(1);
    });

    it("balance decreases over time", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const first = result.value.amortizationSchedule[0].balance;
      const last = result.value.amortizationSchedule[239].balance;
      expect(last).toBeLessThan(first);
    });

    it("yearlyBreakdown is non-empty", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.yearlyBreakdown.length).toBeGreaterThan(0);
    });
  });

  describe("Swiss regulatory requirements", () => {
    it("20% down payment meets Swiss requirements", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.meetsSwissRequirements).toBe(true);
    });

    it("low down payment fails Swiss requirements", () => {
      // Less than 20% down payment
      const result = calculateSwissMortgage({
        ...BASE_INPUT,
        downPayment: 40_000, // 5%
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.meetsSwissRequirements).toBe(false);
    });

    it("affordabilityCheck has monthlyHousingCost", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.affordabilityCheck.monthlyHousingCost).toBeGreaterThan(0);
    });

    it("affordabilityCheck has requiredGrossIncome", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.affordabilityCheck.requiredGrossIncome).toBeGreaterThan(0);
    });
  });

  describe("interest rate comparison", () => {
    it("higher interest rate produces higher monthly payment", () => {
      const low = calculateSwissMortgage({ ...BASE_INPUT, interestRate: 1.5 });
      const high = calculateSwissMortgage({ ...BASE_INPUT, interestRate: 4.0 });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      if (!low.ok || !high.ok) return;
      expect(high.value.monthlyPayment).toBeGreaterThan(low.value.monthlyPayment);
    });

    it("zero interest rate uses simple division", () => {
      const result = calculateSwissMortgage({ ...BASE_INPUT, interestRate: 0 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.monthlyPayment).toBeCloseTo(640_000 / (20 * 12), 0);
    });
  });

  describe("payoff date", () => {
    it("payoffDate is a date string", () => {
      const result = calculateSwissMortgage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.payoffDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe("getSwissMortgageRates", () => {
  it("returns object with fixed5y, fixed10y, fixed15y, saron", () => {
    const rates = getSwissMortgageRates();
    expect(rates.fixed5y).toBeGreaterThan(0);
    expect(rates.fixed10y).toBeGreaterThan(0);
    expect(rates.fixed15y).toBeGreaterThan(0);
    expect(rates.saron).toBeGreaterThanOrEqual(0);
  });
});

describe("getSwissLoanTerms", () => {
  it("returns array of loan terms including 20", () => {
    const terms = getSwissLoanTerms();
    expect(terms).toContain(20);
    expect(terms.length).toBeGreaterThan(0);
  });
});
