import type { CalculationResult } from "@/types";

export interface DownPaymentInput {
  homePrice: number;
  downPaymentPercent: number;
  savingsGoalMonths: number;
  currentSavings: number;
  annualReturnRate: number;
}

export interface DownPaymentResult {
  downPaymentAmount: number;
  amountNeeded: number;
  monthlyContribution: number;
  totalContributions: number;
  interestEarned: number;
  loanAmount: number;
  projections: Array<{
    month: number;
    contribution: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateDownPayment(
  input: DownPaymentInput
): CalculationResult<DownPaymentResult> {
  const { homePrice, downPaymentPercent, savingsGoalMonths, currentSavings, annualReturnRate } =
    input;

  if (homePrice <= 0 || downPaymentPercent < 0 || savingsGoalMonths <= 0) {
    return {
      ok: false,
      error:
        "Home price and savings months must be positive, down payment percent must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  const downPaymentAmount = homePrice * (downPaymentPercent / 100);
  const amountNeeded = Math.max(0, downPaymentAmount - currentSavings);
  const loanAmount = homePrice - downPaymentAmount;

  if (amountNeeded === 0) {
    return {
      ok: true,
      value: {
        downPaymentAmount,
        amountNeeded: 0,
        monthlyContribution: 0,
        totalContributions: 0,
        interestEarned: 0,
        loanAmount,
        projections: [],
      },
    };
  }

  const monthlyRate = annualReturnRate / 100 / 12;

  // Calculate required monthly contribution
  let monthlyContribution: number;
  if (monthlyRate === 0) {
    monthlyContribution = amountNeeded / savingsGoalMonths;
  } else {
    // Future Value of Annuity formula solved for payment
    // FV = PMT * ((1 + r)^n - 1) / r
    // PMT = FV * r / ((1 + r)^n - 1)
    const fvFactor = ((1 + monthlyRate) ** savingsGoalMonths - 1) / monthlyRate;
    monthlyContribution = amountNeeded / fvFactor;
  }

  // Generate monthly projections
  const projections: DownPaymentResult["projections"] = [];
  let balance = currentSavings;
  let totalInterest = 0;

  for (let month = 1; month <= savingsGoalMonths; month++) {
    const interestEarned = balance * monthlyRate;
    balance += monthlyContribution + interestEarned;
    totalInterest += interestEarned;

    // Show yearly or key milestones
    if (month % 12 === 0 || month === savingsGoalMonths || month <= 3) {
      projections.push({
        month,
        contribution: monthlyContribution,
        interest: interestEarned,
        balance,
      });
    }
  }

  const totalContributions = monthlyContribution * savingsGoalMonths;

  return {
    ok: true,
    value: {
      downPaymentAmount,
      amountNeeded,
      monthlyContribution,
      totalContributions,
      interestEarned: totalInterest,
      loanAmount,
      projections,
    },
  };
}
