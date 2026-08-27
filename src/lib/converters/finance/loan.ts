import type { CalculationResult } from "@/types";

export interface LoanInput {
  loanAmount: number;
  interestRate: number; // annual percentage
  loanTerm: number; // months
  startDate: string;
}

export interface PaymentEntry {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: string;
  effectiveRate: number;
  schedule: PaymentEntry[];
  yearlyTotals: {
    year: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export function calculateLoan(input: LoanInput): CalculationResult<LoanResult> {
  const { loanAmount, interestRate, loanTerm, startDate } = input;

  if (loanAmount <= 0 || interestRate < 0 || loanTerm <= 0) {
    return {
      ok: false,
      error: "Loan amount and term must be positive, interest rate must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  const monthlyRate = interestRate / 100 / 12;

  // Calculate monthly payment
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTerm;
  } else {
    monthlyPayment =
      (loanAmount * (monthlyRate * (1 + monthlyRate) ** loanTerm)) /
      ((1 + monthlyRate) ** loanTerm - 1);
  }

  // Generate payment schedule
  const schedule: PaymentEntry[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  const start = startDate ? new Date(startDate) : new Date();

  for (let month = 1; month <= loanTerm; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interestPayment;

    const paymentDate = new Date(start);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      month,
      date: paymentDate.toISOString().split("T")[0],
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  // Calculate yearly totals
  const yearlyMap = new Map<number, { principal: number; interest: number; balance: number }>();

  for (const entry of schedule) {
    const year = new Date(entry.date).getFullYear();
    const existing = yearlyMap.get(year);
    if (existing) {
      existing.principal += entry.principal;
      existing.interest += entry.interest;
      existing.balance = entry.balance;
    } else {
      yearlyMap.set(year, {
        principal: entry.principal,
        interest: entry.interest,
        balance: entry.balance,
      });
    }
  }

  const yearlyTotals = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      principal: Math.round(data.principal * 100) / 100,
      interest: Math.round(data.interest * 100) / 100,
      balance: Math.round(data.balance * 100) / 100,
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate payoff date
  const payoffDate = new Date(start);
  payoffDate.setMonth(payoffDate.getMonth() + loanTerm);

  // Calculate effective annual rate
  const effectiveRate = (1 + monthlyRate) ** 12 - 1;

  const totalPayment = monthlyPayment * loanTerm;

  return {
    ok: true,
    value: {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      payoffDate: payoffDate.toISOString().split("T")[0],
      effectiveRate: Math.round(effectiveRate * 10000) / 100,
      schedule,
      yearlyTotals,
    },
  };
}
