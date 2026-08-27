import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "@/lib/converters/finance/compound-interest";

describe("calculateCompoundInterest", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero years", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 0,
        compoundFrequency: "annually",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative principal", () => {
      const result = calculateCompoundInterest({
        principal: -100,
        interestRate: 5,
        years: 10,
        compoundFrequency: "annually",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative years", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: -1,
        compoundFrequency: "annually",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic compound interest calculation", () => {
    it("calculates 10% annually for 1 year: 1000 → 1100", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 10,
        years: 1,
        compoundFrequency: "annually",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalBalance).toBeCloseTo(1100, 0);
        expect(result.value.totalInterest).toBeCloseTo(100, 0);
      }
    });

    it("finalBalance exceeds principal", () => {
      const result = calculateCompoundInterest({
        principal: 5000,
        interestRate: 7,
        years: 10,
        compoundFrequency: "monthly",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalBalance).toBeGreaterThan(5000);
      }
    });

    it("totalInterest is positive for valid inputs", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 5,
        compoundFrequency: "monthly",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalInterest).toBeGreaterThan(0);
      }
    });
  });

  describe("yearly breakdown", () => {
    it("returns breakdown array with length matching years", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 3,
        compoundFrequency: "monthly",
        monthlyContribution: 100,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.yearlyBreakdown).toHaveLength(3);
      }
    });

    it("first breakdown entry has year = 1", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 3,
        compoundFrequency: "monthly",
        monthlyContribution: 100,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.yearlyBreakdown[0].year).toBe(1);
      }
    });

    it("yearly balance increases each year", () => {
      const result = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 3,
        compoundFrequency: "annually",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const balances = result.value.yearlyBreakdown.map((b) => b.balance);
        expect(balances[1]).toBeGreaterThan(balances[0]);
        expect(balances[2]).toBeGreaterThan(balances[1]);
      }
    });
  });

  describe("compounding frequencies", () => {
    it.each(["annually", "semi-annually", "quarterly", "monthly", "daily"] as const)(
      "handles %s compounding without error",
      (freq) => {
        const result = calculateCompoundInterest({
          principal: 1000,
          interestRate: 5,
          years: 1,
          compoundFrequency: freq,
          monthlyContribution: 0,
          contributionTiming: "end",
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.finalBalance).toBeGreaterThan(1000);
        }
      }
    );

    it("more frequent compounding yields higher balance", () => {
      const makeResult = (freq: "annually" | "monthly") =>
        calculateCompoundInterest({
          principal: 1000,
          interestRate: 10,
          years: 1,
          compoundFrequency: freq,
          monthlyContribution: 0,
          contributionTiming: "end",
        });
      const annual = makeResult("annually");
      const monthly = makeResult("monthly");
      expect(annual.ok).toBe(true);
      expect(monthly.ok).toBe(true);
      if (annual.ok && monthly.ok) {
        expect(monthly.value.finalBalance).toBeGreaterThan(annual.value.finalBalance);
      }
    });
  });

  describe("monthly contributions", () => {
    it("contributions increase the final balance", () => {
      const withoutContrib = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 5,
        compoundFrequency: "monthly",
        monthlyContribution: 0,
        contributionTiming: "end",
      });
      const withContrib = calculateCompoundInterest({
        principal: 1000,
        interestRate: 5,
        years: 5,
        compoundFrequency: "monthly",
        monthlyContribution: 100,
        contributionTiming: "end",
      });
      expect(withoutContrib.ok).toBe(true);
      expect(withContrib.ok).toBe(true);
      if (withoutContrib.ok && withContrib.ok) {
        expect(withContrib.value.finalBalance).toBeGreaterThan(withoutContrib.value.finalBalance);
      }
    });
  });
});
