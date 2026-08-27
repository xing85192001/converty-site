import type { SupportedCurrency } from "@/components/converter/currency-selector";
import benchmarks from "@/lib/data/real-estate-benchmarks.json";
import type { CalculationResult } from "@/types";

export interface SwissMortgageInput {
  propertyPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number; // years (typically 15, 20, or 25)
  interestRate: number; // annual percentage
  currency: SupportedCurrency;
  startDate: string;
  // Swiss-specific
  includeAmortization: boolean; // 2nd pillar requirement
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

export interface SwissMortgageResult {
  // Loan details
  loanAmount: number;
  ltv: number; // Loan-to-value percentage
  currency: SupportedCurrency;

  // Monthly payments
  monthlyPayment: number;
  monthlyInterest: number;
  monthlyPrincipal: number;

  // Totals
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;

  // Amortization
  amortizationSchedule: AmortizationEntry[];
  yearlyBreakdown: {
    year: number;
    principal: number;
    interest: number;
    balance: number;
  }[];

  // Swiss context
  meetsSwissRequirements: boolean;
  warnings: string[];
  affordabilityCheck: {
    monthlyHousingCost: number;
    requiredGrossIncome: number;
  };
}

/**
 * Swiss mortgage regulations from benchmarks
 */
const SWISS_REGS = benchmarks.swissMarket.regulations;

/**
 * Calculate Swiss mortgage with regulatory checks
 */
export function calculateSwissMortgage(
  input: SwissMortgageInput
): CalculationResult<SwissMortgageResult> {
  const { propertyPrice, downPayment, loanTerm, interestRate, currency, startDate } = input;

  // Validation
  if (propertyPrice <= 0 || loanTerm <= 0 || interestRate < 0) {
    return {
      ok: false,
      error: "Property price and loan term must be positive; interest rate must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  const loanAmount = propertyPrice - downPayment;
  if (loanAmount <= 0) {
    return {
      ok: false,
      error: "Loan amount must be positive (down payment must be less than property price)",
      code: "INVALID_INPUT",
    };
  }

  const ltv = (loanAmount / propertyPrice) * 100;
  const downPaymentPercent = (downPayment / propertyPrice) * 100;

  // Calculate monthly payment (PMT formula)
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment =
      (loanAmount * (monthlyRate * (1 + monthlyRate) ** numberOfPayments)) /
      ((1 + monthlyRate) ** numberOfPayments - 1);
  }

  // Generate amortization schedule
  const amortizationSchedule: AmortizationEntry[] = [];
  let balance = loanAmount;
  let totalPrincipal = 0;
  let totalInterest = 0;

  const start = startDate ? new Date(startDate) : new Date();

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalPrincipal += principalPayment;
    totalInterest += interestPayment;

    const paymentDate = new Date(start);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    amortizationSchedule.push({
      month,
      year: paymentDate.getFullYear(),
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
    });
  }

  // Generate yearly breakdown
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
      principal: Math.round(data.principal * 100) / 100,
      interest: Math.round(data.interest * 100) / 100,
      balance: Math.round(data.balance * 100) / 100,
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate payoff date
  const payoffDate = new Date(start);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

  // Swiss regulatory checks
  const warnings: string[] = [];
  let meetsSwissRequirements = true;

  if (downPaymentPercent < SWISS_REGS.minDownPayment) {
    warnings.push("warnings.minDownPayment");
    meetsSwissRequirements = false;
  }

  if (ltv > SWISS_REGS.maxLoanToValue) {
    warnings.push("warnings.maxLtv");
    meetsSwissRequirements = false;
  }

  // Affordability check (housing costs should be < 33% of gross income)
  // Using imputed rate of 5% for stress test (Swiss standard)
  const stressTestRate = 0.05;
  const monthlyStressPayment =
    (loanAmount * ((stressTestRate / 12) * (1 + stressTestRate / 12) ** numberOfPayments)) /
    ((1 + stressTestRate / 12) ** numberOfPayments - 1);
  const monthlyHousingCost = monthlyStressPayment;
  const requiredGrossIncome = (monthlyHousingCost / 0.33) * 12;

  return {
    ok: true,
    value: {
      loanAmount: Math.round(loanAmount * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      currency,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      monthlyInterest: Math.round((amortizationSchedule[0]?.interest || 0) * 100) / 100,
      monthlyPrincipal: Math.round((amortizationSchedule[0]?.principal || 0) * 100) / 100,
      totalPayments: Math.round(monthlyPayment * numberOfPayments * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round((loanAmount + totalInterest) * 100) / 100,
      payoffDate: payoffDate.toISOString().split("T")[0],
      amortizationSchedule,
      yearlyBreakdown,
      meetsSwissRequirements,
      warnings,
      affordabilityCheck: {
        monthlyHousingCost: Math.round(monthlyHousingCost * 100) / 100,
        requiredGrossIncome: Math.round(requiredGrossIncome * 100) / 100,
      },
    },
  };
}

/**
 * Get Swiss mortgage rate presets
 */
export function getSwissMortgageRates(): {
  fixed5y: number;
  fixed10y: number;
  fixed15y: number;
  saron: number;
} {
  return {
    fixed5y: benchmarks.swissMarket.mortgageRates.fixed5Year,
    fixed10y: benchmarks.swissMarket.mortgageRates.fixed10Year,
    fixed15y: benchmarks.swissMarket.mortgageRates.fixed15Year,
    saron: benchmarks.swissMarket.mortgageRates.saron,
  };
}

/**
 * Get Swiss loan term options
 */
export function getSwissLoanTerms(): number[] {
  return [10, 15, 20, 25];
}
