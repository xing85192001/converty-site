import type { CalculationResult } from "@/types";

export interface IraInput {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualContribution: number;
  annualReturnRate: number;
  iraType: "traditional" | "roth";
  taxBracket: number;
  retirementTaxBracket: number;
}

export interface IraResult {
  totalAtRetirement: number;
  totalContributions: number;
  totalGrowth: number;
  taxSavingsNow: number;
  taxInRetirement: number;
  effectiveValue: number;
  monthlyInRetirement: number;
  projections: Array<{
    age: number;
    balance: number;
    contributions: number;
    growth: number;
  }>;
}

export function calculateIra(input: IraInput): CalculationResult<IraResult> {
  const {
    currentAge,
    retirementAge,
    currentBalance,
    annualContribution,
    annualReturnRate,
    iraType,
    taxBracket,
    retirementTaxBracket,
  } = input;

  if (currentAge >= retirementAge || currentAge < 18 || retirementAge > 75) {
    return {
      ok: false,
      error:
        "Current age must be 18+, retirement age must be greater than current age and at most 75",
      code: "INVALID_INPUT",
    };
  }

  // IRA contribution limits (2024: $7,000, $8,000 if 50+)
  const contributionLimit = currentAge >= 50 ? 8000 : 7000;
  const effectiveContribution = Math.min(annualContribution, contributionLimit);

  const yearsToRetirement = retirementAge - currentAge;
  const returnRate = annualReturnRate / 100;
  const currentTaxRate = taxBracket / 100;
  const retirementTaxRate = retirementTaxBracket / 100;

  let balance = currentBalance;
  let totalContributions = 0;
  const projections: IraResult["projections"] = [];

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Add contribution
    balance += effectiveContribution;
    totalContributions += effectiveContribution;

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
        growth: balance - currentBalance - totalContributions,
      });
    }
  }

  const totalGrowth = balance - currentBalance - totalContributions;

  // Calculate tax implications
  let taxSavingsNow: number;
  let taxInRetirement: number;
  let effectiveValue: number;

  if (iraType === "traditional") {
    // Traditional IRA: Tax deduction now, taxed on withdrawal
    taxSavingsNow = totalContributions * currentTaxRate;
    taxInRetirement = balance * retirementTaxRate;
    effectiveValue = balance * (1 - retirementTaxRate);
  } else {
    // Roth IRA: No deduction now, tax-free withdrawal
    taxSavingsNow = 0;
    taxInRetirement = 0;
    effectiveValue = balance; // Already paid taxes on contributions
  }

  // Monthly income in retirement (4% withdrawal rule)
  const monthlyInRetirement =
    iraType === "traditional"
      ? (balance * 0.04 * (1 - retirementTaxRate)) / 12
      : (balance * 0.04) / 12;

  return {
    ok: true,
    value: {
      totalAtRetirement: balance,
      totalContributions,
      totalGrowth,
      taxSavingsNow,
      taxInRetirement,
      effectiveValue,
      monthlyInRetirement,
      projections,
    },
  };
}
