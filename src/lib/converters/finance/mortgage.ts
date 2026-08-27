import type { CalculationResult } from "@/types";

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number; // years
  interestRate: number; // annual percentage
  propertyTax: number; // annual
  homeInsurance: number; // annual
  pmi: number; // monthly private mortgage insurance
  hoaFees: number; // monthly
  startDate: string;
}

export interface AmortizationEntry {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalPrincipal: number;
  totalInterest: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  amortizationSchedule: AmortizationEntry[];
  yearlyBreakdown: {
    year: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export function calculateMortgage(input: MortgageInput): CalculationResult<MortgageResult> {
  const {
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    propertyTax,
    homeInsurance,
    pmi,
    hoaFees,
    startDate,
  } = input;

  if (homePrice <= 0 || loanTerm <= 0 || interestRate < 0) {
    return {
      ok: false,
      error: "Home price and loan term must be positive, interest rate must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  const loanAmount = homePrice - downPayment;
  if (loanAmount <= 0) {
    return {
      ok: false,
      error: "Loan amount must be positive (home price must exceed down payment)",
      code: "INVALID_INPUT",
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Calculate monthly principal and interest payment
  let monthlyPrincipalInterest: number;
  if (monthlyRate === 0) {
    monthlyPrincipalInterest = loanAmount / numberOfPayments;
  } else {
    monthlyPrincipalInterest =
      (loanAmount * (monthlyRate * (1 + monthlyRate) ** numberOfPayments)) /
      ((1 + monthlyRate) ** numberOfPayments - 1);
  }

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPmi = pmi;
  const monthlyHoa = hoaFees;

  const totalMonthlyPayment =
    monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + monthlyPmi + monthlyHoa;

  // Generate amortization schedule
  const amortizationSchedule: AmortizationEntry[] = [];
  let balance = loanAmount;
  let totalPrincipal = 0;
  let totalInterest = 0;

  const start = startDate ? new Date(startDate) : new Date();

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPrincipalInterest - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalPrincipal += principalPayment;
    totalInterest += interestPayment;

    const paymentDate = new Date(start);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    amortizationSchedule.push({
      month,
      year: paymentDate.getFullYear(),
      payment: monthlyPrincipalInterest,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      totalPrincipal,
      totalInterest,
    });
  }

  // Generate yearly breakdown for charts
  const yearlyMap = new Map<number, { principal: number; interest: number; balance: number }>();

  for (const entry of amortizationSchedule) {
    const existing = yearlyMap.get(entry.year);
    if (existing) {
      existing.principal += entry.principal;
      existing.interest += entry.interest;
      existing.balance = entry.balance;
    } else {
      yearlyMap.set(entry.year, {
        principal: entry.principal,
        interest: entry.interest,
        balance: entry.balance,
      });
    }
  }

  const yearlyBreakdown = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      ...data,
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate payoff date
  const payoffDate = new Date(start);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

  const totalPayments = monthlyPrincipalInterest * numberOfPayments;
  const totalCost =
    totalPayments +
    propertyTax * loanTerm +
    homeInsurance * loanTerm +
    pmi * numberOfPayments +
    hoaFees * numberOfPayments;

  return {
    ok: true,
    value: {
      loanAmount,
      monthlyPrincipalInterest: Math.round(monthlyPrincipalInterest * 100) / 100,
      monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
      monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
      monthlyPmi: Math.round(monthlyPmi * 100) / 100,
      monthlyHoa: Math.round(monthlyHoa * 100) / 100,
      totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      payoffDate: payoffDate.toISOString().split("T")[0],
      amortizationSchedule,
      yearlyBreakdown,
    },
  };
}
