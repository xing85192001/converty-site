import { describe, expect, it } from "vitest";
import { calculateRetirement } from "@/lib/converters/finance/retirement";

describe("calculateRetirement", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false when retirementAge <= currentAge", () => {
      const result = calculateRetirement({
        currentAge: 65,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when lifeExpectancy <= retirementAge", () => {
      const result = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 65,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative expected return", () => {
      const result = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: -1,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("retirement accumulation", () => {
    it("starting with $0 contributing $500/month at 7% for 30 years → large balance", () => {
      const result = calculateRetirement({
        currentAge: 30,
        retirementAge: 60,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 0,
        lifeExpectancy: 90,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 30 years of $500/month at 7% should accumulate well above $400k
        expect(result.value.retirementSavings).toBeGreaterThan(400000);
      }
    });

    it("higher monthly contribution → higher retirement savings", () => {
      const low = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 300,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      const high = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 1000,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      if (low.ok && high.ok) {
        expect(high.value.retirementSavings).toBeGreaterThan(low.value.retirementSavings);
      }
    });

    it("projections array contains accumulation phase entries", () => {
      const result = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const accumulation = result.value.projections.filter((p) => p.phase === "accumulation");
        expect(accumulation.length).toBeGreaterThan(0);
      }
    });

    it("yearsInRetirement = lifeExpectancy - retirementAge", () => {
      const result = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedReturn: 7,
        inflationRate: 3,
        desiredAnnualIncome: 60000,
        socialSecurityBenefit: 1500,
        lifeExpectancy: 90,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.yearsInRetirement).toBe(25);
      }
    });
  });
});
