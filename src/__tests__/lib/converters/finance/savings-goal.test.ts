import { describe, expect, it } from "vitest";
import { calculateSavingsGoal } from "@/lib/converters/finance/savings-goal";

describe("calculateSavingsGoal", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero goal amount", () => {
      const result = calculateSavingsGoal({
        goalAmount: 0,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 4,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative goal amount", () => {
      const result = calculateSavingsGoal({
        goalAmount: -1000,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 4,
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative monthly contribution", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: -100,
        annualInterestRate: 4,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("already at goal", () => {
    it("when currentSavings >= goalAmount → monthsToGoal = 0", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 10000,
        monthlyContribution: 500,
        annualInterestRate: 4,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthsToGoal).toBe(0);
        expect(result.value.goalReachable).toBe(true);
      }
    });
  });

  describe("savings goal calculation", () => {
    it("saving $500/month at 4% APY for $10,000 goal → fewer months than $10k/500=20", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 4,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.goalReachable).toBe(true);
        // Interest helps → fewer months than 10000/500 = 20
        expect(result.value.monthsToGoal).toBeLessThanOrEqual(20);
      }
    });

    it("with zero interest → exactly 20 months for $10k at $500/month", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.monthsToGoal).toBe(20);
      }
    });

    it("totalContributions = monthlyContribution × monthsToGoal", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalContributions).toBeCloseTo(500 * result.value.monthsToGoal, 0);
      }
    });

    it("totalInterestEarned = 0 for zero interest rate", () => {
      const result = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 500,
        annualInterestRate: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalInterestEarned).toBeCloseTo(0, 2);
      }
    });

    it("interest reduces months needed to reach goal", () => {
      const withInterest = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 400,
        annualInterestRate: 5,
      });
      const noInterest = calculateSavingsGoal({
        goalAmount: 10000,
        currentSavings: 0,
        monthlyContribution: 400,
        annualInterestRate: 0,
      });
      expect(withInterest.ok).toBe(true);
      expect(noInterest.ok).toBe(true);
      if (withInterest.ok && noInterest.ok) {
        expect(withInterest.value.monthsToGoal).toBeLessThan(noInterest.value.monthsToGoal);
      }
    });
  });
});
