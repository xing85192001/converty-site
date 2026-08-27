import type { CalculationResult } from "@/types";

export interface AutoLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  annualInterestRate: number;
  loanTermMonths: number;
  salesTaxRate: number;
}

export interface AutoLoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  salesTax: number;
  amortization: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateAutoLoan(input: AutoLoanInput): CalculationResult<AutoLoanResult> {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue,
    annualInterestRate,
    loanTermMonths,
    salesTaxRate,
  } = input;

  if (vehiclePrice <= 0 || loanTermMonths <= 0) {
    return {
      ok: false,
      error: "Vehicle price and loan term must be positive",
      code: "INVALID_INPUT",
    };
  }

  const salesTax = vehiclePrice * (salesTaxRate / 100);
  const totalVehicleCost = vehiclePrice + salesTax;
  const loanAmount = Math.max(0, totalVehicleCost - downPayment - tradeInValue);

  if (loanAmount === 0) {
    return {
      ok: true,
      value: {
        loanAmount: 0,
        monthlyPayment: 0,
        totalInterest: 0,
        totalCost: totalVehicleCost,
        salesTax,
        amortization: [],
      },
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTermMonths;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * (1 + monthlyRate) ** loanTermMonths) /
      ((1 + monthlyRate) ** loanTermMonths - 1);
  }

  const totalPaid = monthlyPayment * loanTermMonths;
  const totalInterest = totalPaid - loanAmount;
  const totalCost = totalVehicleCost + totalInterest;

  // Generate amortization schedule
  const amortization: AutoLoanResult["amortization"] = [];
  let balance = loanAmount;

  for (let month = 1; month <= loanTermMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    amortization.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return {
    ok: true,
    value: {
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalCost,
      salesTax,
      amortization,
    },
  };
}
