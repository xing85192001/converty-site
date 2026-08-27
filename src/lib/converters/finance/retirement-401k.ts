import type { CalculationResult } from "@/types";

export interface Retirement401kInput {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualContribution: number;
  employerMatch: number;
  employerMatchLimit: number;
  annualReturnRate: number;
  annualSalaryGrowth: number;
}

export interface Retirement401kResult {
  totalAtRetirement: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalGrowth: number;
  yearsToRetirement: number;
  monthlyInRetirement: number;
  projections: Array<{
    age: number;
    balance: number;
    contributions: number;
    employerMatch: number;
    growth: number;
  }>;
}

export function calculateRetirement401k(
  input: Retirement401kInput
): CalculationResult<Retirement401kResult> {
  const {
    currentAge,
    retirementAge,
    currentBalance,
    annualContribution,
    employerMatch,
    employerMatchLimit,
    annualReturnRate,
    annualSalaryGrowth,
  } = input;

  if (currentAge >= retirementAge || currentAge < 18 || retirementAge > 75) {
    return {
      ok: false,
      error:
        "Current age must be 18+, retirement age must be greater than current age and at most 75",
      code: "INVALID_INPUT",
    };
  }

  const yearsToRetirement = retirementAge - currentAge;
  const returnRate = annualReturnRate / 100;
  const salaryGrowthRate = annualSalaryGrowth / 100;
  const matchRate = employerMatch / 100;
  const matchLimitRate = employerMatchLimit / 100;

  let balance = currentBalance;
  let totalContributions = 0;
  let totalEmployerMatch = 0;
  let currentContribution = annualContribution;
  const projections: Retirement401kResult["projections"] = [];

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Calculate employer match (limited by match limit)
    const matchableAmount = Math.min(currentContribution, currentContribution * matchLimitRate);
    const yearEmployerMatch = matchableAmount * matchRate;

    // Add contributions
    balance += currentContribution + yearEmployerMatch;
    totalContributions += currentContribution;
    totalEmployerMatch += yearEmployerMatch;

    // Apply growth
    const growth = balance * returnRate;
    balance += growth;

    // Store projection for key years
    const age = currentAge + year;
    if (year % 5 === 0 || year === yearsToRetirement || year <= 3) {
      projections.push({
        age,
        balance,
        contributions: totalContributions,
        employerMatch: totalEmployerMatch,
        growth: balance - currentBalance - totalContributions - totalEmployerMatch,
      });
    }

    // Increase contribution with salary growth
    currentContribution *= 1 + salaryGrowthRate;
  }

  // Estimate monthly income in retirement (4% withdrawal rule, 30-year retirement)
  const monthlyInRetirement = (balance * 0.04) / 12;

  return {
    ok: true,
    value: {
      totalAtRetirement: balance,
      totalContributions,
      totalEmployerMatch,
      totalGrowth: balance - currentBalance - totalContributions - totalEmployerMatch,
      yearsToRetirement,
      monthlyInRetirement,
      projections,
    },
  };
}
