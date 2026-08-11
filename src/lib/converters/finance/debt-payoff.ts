import type { CalculationResult } from "@/types";

export interface DebtPayoffInput {
  totalDebt: number;
  interestRate: number;
  minimumPayment: number;
  extraPayment: number;
}

export interface DebtPayoffResult {
  monthsToPayoff: number;
  yearsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  monthsSaved: number;
  interestSaved: number;
  monthlyPayment: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateDebtPayoff(input: DebtPayoffInput): CalculationResult<DebtPayoffResult> {
  const { totalDebt, interestRate, minimumPayment, extraPayment } = input;

  if (totalDebt <= 0 || minimumPayment <= 0) {
    return {
      ok: false,
      error: "Total debt and minimum payment must be positive",
      code: "INVALID_INPUT",
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = minimumPayment + extraPayment;

  // Check if payment is enough to cover interest
  const monthlyInterest = totalDebt * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return {
      ok: false,
      error: "Payment is not enough to cover monthly interest",
      code: "INVALID_INPUT",
    };
  }

  // Calculate payoff with extra payments
  let balance = totalDebt;
  let totalInterest = 0;
  const schedule: DebtPayoffResult["schedule"] = [];
  let month = 0;

  while (balance > 0 && month < 600) {
    month++;
    const interestPayment = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interestPayment);
    const principalPayment = payment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interestPayment;

    schedule.push({
      month,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  const monthsToPayoff = month;
  const totalPaid = totalDebt + totalInterest;

  // Calculate without extra payments for comparison
  let balanceNoExtra = totalDebt;
  let totalInterestNoExtra = 0;
  let monthsNoExtra = 0;

  while (balanceNoExtra > 0 && monthsNoExtra < 600) {
    monthsNoExtra++;
    const interestPayment = balanceNoExtra * monthlyRate;
    const principalPayment = Math.min(minimumPayment - interestPayment, balanceNoExtra);
    if (principalPayment <= 0) break;
    balanceNoExtra = Math.max(0, balanceNoExtra - principalPayment);
    totalInterestNoExtra += interestPayment;
  }

  return {
    ok: true,
    value: {
      monthsToPayoff,
      yearsToPayoff: monthsToPayoff / 12,
      totalInterest,
      totalPaid,
      monthsSaved: extraPayment > 0 ? monthsNoExtra - monthsToPayoff : 0,
      interestSaved: extraPayment > 0 ? totalInterestNoExtra - totalInterest : 0,
      monthlyPayment,
      schedule,
    },
  };
}
