import type { CalculationResult } from "@/types";

export interface HomeEquityInput {
  homeValue: number;
  mortgageBalance: number;
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
  isHELOC: boolean; // HELOC vs Home Equity Loan
  drawPeriodYears?: number; // for HELOC
}

export interface HomeEquityResult {
  availableEquity: number;
  loanToValue: number; // LTV ratio
  combinedLTV: number; // CLTV ratio
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  interestOnlyPayment?: number; // for HELOC draw period
  amortization: Array<{
    year: number;
    principalPaid: number;
    interestPaid: number;
    endBalance: number;
  }>;
}

export function calculateHomeEquity(input: HomeEquityInput): CalculationResult<HomeEquityResult> {
  const {
    homeValue,
    mortgageBalance,
    loanAmount,
    annualInterestRate,
    loanTermYears,
    isHELOC,
    drawPeriodYears = 10,
  } = input;

  if (homeValue <= 0 || loanAmount <= 0 || loanTermYears <= 0) {
    return {
      ok: false,
      error: "Home value, loan amount, and loan term must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Calculate equity
  const maxLTV = 0.85; // Most lenders allow up to 85% CLTV
  const availableEquity = Math.max(0, homeValue * maxLTV - mortgageBalance);

  // Calculate LTV ratios
  const loanToValue = (mortgageBalance / homeValue) * 100;
  const combinedLTV = ((mortgageBalance + loanAmount) / homeValue) * 100;

  const monthlyRate = annualInterestRate / 100 / 12;
  const loanTermMonths = loanTermYears * 12;

  // For HELOC: interest-only payment during draw period
  const interestOnlyPayment = isHELOC ? loanAmount * monthlyRate : undefined;

  // Calculate monthly payment (principal + interest)
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTermMonths;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * (1 + monthlyRate) ** loanTermMonths) /
      ((1 + monthlyRate) ** loanTermMonths - 1);
  }

  // Total interest calculation
  let totalInterest: number;
  if (isHELOC && interestOnlyPayment) {
    // HELOC: interest-only during draw period, then amortizing
    const drawPeriodMonths = drawPeriodYears * 12;
    const drawPeriodInterest = interestOnlyPayment * drawPeriodMonths;
    const repaymentInterest = monthlyPayment * loanTermMonths - loanAmount;
    totalInterest = drawPeriodInterest + repaymentInterest;
  } else {
    totalInterest = monthlyPayment * loanTermMonths - loanAmount;
  }

  const totalCost = loanAmount + totalInterest;

  // Generate yearly amortization schedule
  const amortization: HomeEquityResult["amortization"] = [];
  let balance = loanAmount;

  for (let year = 1; year <= loanTermYears; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      balance = Math.max(0, balance - principalPayment);
      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;
    }

    amortization.push({
      year,
      principalPaid: yearlyPrincipal,
      interestPaid: yearlyInterest,
      endBalance: balance,
    });
  }

  return {
    ok: true,
    value: {
      availableEquity,
      loanToValue,
      combinedLTV,
      monthlyPayment,
      totalInterest,
      totalCost,
      interestOnlyPayment,
      amortization,
    },
  };
}
