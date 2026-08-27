import { describe, expect, it } from "vitest";
import { calculateRetirement401k } from "@/lib/converters/finance/retirement-401k";

describe("calculateRetirement401k", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false when currentAge >= retirementAge", () => {
      const result = calculateRetirement401k({
        currentAge: 65,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 3,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when currentAge < 18", () => {
      const result = calculateRetirement401k({
        currentAge: 17,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 3,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false when retirementAge > 75", () => {
      const result = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 76,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 3,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic 401k growth calculation", () => {
    it("contributes for correct number of years", () => {
      const result = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.yearsToRetirement).toBe(35);
      }
    });

    it("totalAtRetirement exceeds totalContributions + totalEmployerMatch (growth occurred)", () => {
      const result = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalAtRetirement).toBeGreaterThan(
          result.value.totalContributions + result.value.totalEmployerMatch
        );
      }
    });

    it("totalGrowth is positive", () => {
      const result = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 50000,
        annualContribution: 15000,
        employerMatch: 50,
        employerMatchLimit: 6,
        annualReturnRate: 6,
        annualSalaryGrowth: 2,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalGrowth).toBeGreaterThan(0);
      }
    });

    it("monthlyInRetirement is positive", () => {
      const result = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthlyInRetirement).toBeGreaterThan(0);
      }
    });
  });

  describe("employer match", () => {
    it("employer match increases total contributions", () => {
      const withMatch = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 100,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 0,
      });
      const noMatch = calculateRetirement401k({
        currentAge: 30,
        retirementAge: 65,
        currentBalance: 0,
        annualContribution: 10000,
        employerMatch: 0,
        employerMatchLimit: 3,
        annualReturnRate: 7,
        annualSalaryGrowth: 0,
      });
      expect(withMatch.ok).toBe(true);
      expect(noMatch.ok).toBe(true);
      if (withMatch.ok && noMatch.ok) {
        expect(withMatch.value.totalEmployerMatch).toBeGreaterThan(0);
        expect(withMatch.value.totalAtRetirement).toBeGreaterThan(noMatch.value.totalAtRetirement);
      }
    });
  });
});
