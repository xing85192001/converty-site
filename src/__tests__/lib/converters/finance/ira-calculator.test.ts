import { describe, expect, it } from "vitest";
import { calculateIra } from "@/lib/converters/finance/ira-calculator";

describe("calculateIra", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false when currentAge >= retirementAge", () => {
      const result = calculateIra({
        currentAge: 65,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when currentAge < 18", () => {
      const result = calculateIra({
        currentAge: 17,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when retirementAge > 75", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 76,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("IRA growth calculation", () => {
    it("30yo contributing $6,000/yr at 7% for 35 years → balance well above $500,000", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 35 years of contributions at 7% should accumulate substantially
        expect(result.value.totalAtRetirement).toBeGreaterThan(500000);
      }
    });

    it("totalGrowth = totalAtRetirement - currentBalance - totalContributions", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 10000,
        annualContribution: 5000,
        annualReturnRate: 6,
        iraType: "roth",
        taxBracket: 22,
        retirementTaxBracket: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalGrowth).toBeCloseTo(
          result.value.totalAtRetirement - 10000 - result.value.totalContributions,
          0
        );
      }
    });

    it("projections array is non-empty", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.projections.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Traditional vs Roth IRA", () => {
    it("traditional IRA has taxSavingsNow > 0", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "traditional",
        taxBracket: 22,
        retirementTaxBracket: 20,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.taxSavingsNow).toBeGreaterThan(0);
      }
    });

    it("Roth IRA has taxSavingsNow = 0 (no deduction)", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "roth",
        taxBracket: 22,
        retirementTaxBracket: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.taxSavingsNow).toBe(0);
      }
    });

    it("Roth IRA effectiveValue = totalAtRetirement (tax-free)", () => {
      const result = calculateIra({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 6000,
        annualReturnRate: 7,
        iraType: "roth",
        taxBracket: 22,
        retirementTaxBracket: 15,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.effectiveValue).toBeCloseTo(result.value.totalAtRetirement, 0);
      }
    });
  });
});
