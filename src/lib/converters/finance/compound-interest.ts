import type { CalculationResult } from "@/types";

export type CompoundFrequency = "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";

export interface CompoundInterestInput {
  principal: number;
  interestRate: number; // annual percentage
  years: number;
  compoundFrequency: CompoundFrequency;
  monthlyContribution: number;
  contributionTiming: "beginning" | "end";
}

export interface YearlyBreakdown {
  year: number;
  principal: number;
  contributions: number;
  interest: number;
  balance: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  effectiveAnnualRate: number;
  yearlyBreakdown: YearlyBreakdown[];
}

const getCompoundingPeriods = (frequency: CompoundFrequency): number => {
  switch (frequency) {
    case "annually":
      return 1;
    case "semi-annually":
      return 2;
    case "quarterly":
      return 4;
    case "monthly":
      return 12;
    case "daily":
      return 365;
  }
};

export function calculateCompoundInterest(
  input: CompoundInterestInput
): CalculationResult<CompoundInterestResult> {
  const {
    principal,
    interestRate,
    years,
    compoundFrequency,
    monthlyContribution,
    contributionTiming,
  } = input;

  if (principal < 0 || interestRate < 0 || years <= 0) {
    return {
      ok: false,
      error: "Principal and interest rate must be non-negative, years must be positive",
      code: "INVALID_INPUT",
    };
  }

  const n = getCompoundingPeriods(compoundFrequency);
  const r = interestRate / 100;
  const ratePerPeriod = r / n;
  const periodsPerYear = n;

  // Calculate effective annual rate
  const effectiveAnnualRate = (1 + r / n) ** n - 1;

  const yearlyBreakdown: YearlyBreakdown[] = [];

  let balance = principal;
  let totalContributions = 0;

  for (let year = 1; year <= years; year++) {
    const yearContributions = monthlyContribution * 12;
    totalContributions += yearContributions;

    // Calculate balance month by month for accuracy
    for (let month = 1; month <= 12; month++) {
      if (contributionTiming === "beginning") {
        balance += monthlyContribution;
      }

      // Apply compound interest based on frequency
      // Use fractional exponentiation so non-monthly frequencies (annual, daily, etc.)
      // accumulate the correct pro-rated interest each month
      const periodsThisMonth = periodsPerYear / 12;
      balance *= (1 + ratePerPeriod) ** periodsThisMonth;

      if (contributionTiming === "end") {
        balance += monthlyContribution;
      }
    }

    yearlyBreakdown.push({
      year,
      principal,
      contributions: totalContributions,
      interest: balance - principal - totalContributions,
      balance: Math.round(balance * 100) / 100,
    });
  }

  const finalBalance = balance;
  const totalInterest = finalBalance - principal - totalContributions;

  return {
    ok: true,
    value: {
      finalBalance: Math.round(finalBalance * 100) / 100,
      totalPrincipal: principal,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      effectiveAnnualRate: Math.round(effectiveAnnualRate * 10000) / 100, // as percentage
      yearlyBreakdown,
    },
  };
}

export const COMPOUND_FREQUENCIES: CompoundFrequency[] = [
  "annually",
  "semi-annually",
  "quarterly",
  "monthly",
  "daily",
];
