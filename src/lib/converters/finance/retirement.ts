import type { CalculationResult } from "@/types";

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number; // annual percentage
  inflationRate: number; // annual percentage
  desiredAnnualIncome: number;
  socialSecurityBenefit: number; // monthly
  lifeExpectancy: number;
}

export interface YearlyProjection {
  age: number;
  year: number;
  savings: number;
  contribution: number;
  growth: number;
  phase: "accumulation" | "retirement";
  withdrawal?: number;
}

export interface RetirementResult {
  retirementSavings: number;
  inflationAdjustedSavings: number;
  yearsInRetirement: number;
  monthlyRetirementIncome: number;
  savingsGap: number;
  hasSufficientFunds: boolean;
  totalContributions: number;
  totalGrowth: number;
  projections: YearlyProjection[];
}

export function calculateRetirement(input: RetirementInput): CalculationResult<RetirementResult> {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedReturn,
    inflationRate,
    desiredAnnualIncome,
    socialSecurityBenefit,
    lifeExpectancy,
  } = input;

  if (
    currentAge < 0 ||
    retirementAge <= currentAge ||
    lifeExpectancy <= retirementAge ||
    expectedReturn < 0
  ) {
    return { ok: false, error: "Invalid age or return parameters", code: "INVALID_INPUT" };
  }

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const monthlyReturn = expectedReturn / 100 / 12;
  const annualInflation = inflationRate / 100;
  const annualContribution = monthlyContribution * 12;

  const projections: YearlyProjection[] = [];
  let savings = currentSavings;
  let totalContributions = 0;
  let totalGrowth = 0;
  const currentYear = new Date().getFullYear();

  // Accumulation phase
  for (let year = 0; year < yearsToRetirement; year++) {
    const age = currentAge + year;
    const startBalance = savings;

    // Monthly compounding with contributions
    for (let month = 0; month < 12; month++) {
      const growth = savings * monthlyReturn;
      totalGrowth += growth;
      savings += growth + monthlyContribution;
    }

    totalContributions += annualContribution;

    projections.push({
      age,
      year: currentYear + year,
      savings: Math.round(savings * 100) / 100,
      contribution: annualContribution,
      growth: Math.round((savings - startBalance - annualContribution) * 100) / 100,
      phase: "accumulation",
    });
  }

  const retirementSavings = savings;

  // Calculate inflation-adjusted values
  const inflationMultiplier = (1 + annualInflation) ** yearsToRetirement;
  const inflationAdjustedSavings = retirementSavings / inflationMultiplier;

  // Calculate required withdrawal rate
  const annualSocialSecurity = socialSecurityBenefit * 12;
  const neededFromSavings = desiredAnnualIncome - annualSocialSecurity;

  // Retirement phase with 4% rule consideration
  const safeWithdrawalRate = 0.04;
  const sustainableAnnualWithdrawal = retirementSavings * safeWithdrawalRate;
  const actualAnnualWithdrawal = Math.min(neededFromSavings, sustainableAnnualWithdrawal * 1.5);

  // Simulate retirement phase
  for (let year = 0; year < yearsInRetirement; year++) {
    const age = retirementAge + year;

    // Apply growth (reduced during retirement - more conservative)
    const retirementReturn = (expectedReturn * 0.7) / 100; // More conservative return
    const growth = savings * retirementReturn;
    totalGrowth += growth;

    // Apply withdrawal
    savings = Math.max(0, savings + growth - actualAnnualWithdrawal);

    projections.push({
      age,
      year: currentYear + yearsToRetirement + year,
      savings: Math.round(savings * 100) / 100,
      contribution: 0,
      growth: Math.round(growth * 100) / 100,
      phase: "retirement",
      withdrawal: Math.round(actualAnnualWithdrawal * 100) / 100,
    });

    if (savings <= 0) break;
  }

  // Calculate monthly retirement income
  const monthlyRetirementIncome = (actualAnnualWithdrawal + annualSocialSecurity) / 12;

  // Calculate savings gap
  const requiredSavings = neededFromSavings / safeWithdrawalRate;
  const savingsGap = Math.max(0, requiredSavings - retirementSavings);
  const hasSufficientFunds = savingsGap === 0;

  return {
    ok: true,
    value: {
      retirementSavings: Math.round(retirementSavings * 100) / 100,
      inflationAdjustedSavings: Math.round(inflationAdjustedSavings * 100) / 100,
      yearsInRetirement,
      monthlyRetirementIncome: Math.round(monthlyRetirementIncome * 100) / 100,
      savingsGap: Math.round(savingsGap * 100) / 100,
      hasSufficientFunds,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalGrowth: Math.round(totalGrowth * 100) / 100,
      projections,
    },
  };
}
