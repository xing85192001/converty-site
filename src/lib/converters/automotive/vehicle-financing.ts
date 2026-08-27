import type { CalcStep, TextStep } from "@/lib/calc-step";
import { textStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import { type Currency, formatCurrency } from "./types";

/**
 * Swiss VAT rate for new vehicles
 */
export const SWISS_VAT_RATE = 7.7;

/**
 * Default financing rates for Switzerland
 */
export const DEFAULT_RATES = {
  loanAPR: 3.9,
  leaseMoneyFactor: 0.00145, // Approximately 3.5% APR
  residual3Year: 50,
  residual4Year: 40,
};

/**
 * Loan calculation input
 */
export interface VehicleLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  annualInterestRate: number;
  loanTermMonths: number;
  salesTaxRate: number;
  currency: Currency;
  includeVAT: boolean;
}

/**
 * Loan calculation result
 */
export interface VehicleLoanResult {
  // Loan details
  vehiclePrice: number;
  salesTax: number;
  totalVehicleCost: number;
  downPayment: number;
  tradeInValue: number;
  loanAmount: number;

  // Payment calculations
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;

  // Amortization
  amortization: AmortizationEntry[];

  // Formatted outputs
  formatted: {
    vehiclePrice: string;
    salesTax: string;
    totalVehicleCost: string;
    loanAmount: string;
    monthlyPayment: string;
    totalPayments: string;
    totalInterest: string;
    totalCost: string;
  };

  currency: Currency;
  steps: CalcStep[];
}

/**
 * Amortization schedule entry
 */
export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Lease calculation input
 */
export interface VehicleLeaseInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  leaseTermMonths: number;
  residualPercent: number;
  moneyFactor: number; // Or calculate from APR
  annualKmLimit: number;
  excessKmCharge: number;
  salesTaxRate: number;
  currency: Currency;
  includeVAT: boolean;
}

/**
 * Lease calculation result
 */
export interface VehicleLeaseResult {
  // Lease details
  vehiclePrice: number;
  salesTax: number;
  capitalizedCost: number;
  residualValue: number;
  residualPercent: number;

  // Payment calculations
  depreciation: number;
  financeCharge: number;
  monthlyPayment: number;
  totalPayments: number;
  totalCost: number;

  // Km limits
  annualKmLimit: number;
  totalKmLimit: number;
  excessKmCharge: number;

  // Money factor to APR
  equivalentAPR: number;

  // Formatted outputs
  formatted: {
    vehiclePrice: string;
    capitalizedCost: string;
    residualValue: string;
    depreciation: string;
    financeCharge: string;
    monthlyPayment: string;
    totalPayments: string;
    totalCost: string;
  };

  currency: Currency;
  steps: CalcStep[];
}

/**
 * Comparison result
 */
export interface FinancingComparisonResult {
  loan: VehicleLoanResult;
  lease: VehicleLeaseResult;

  // Comparison metrics
  loanMonthlyPayment: number;
  leaseMonthlyPayment: number;
  monthlyDifference: number;

  loanTotalCost: number;
  leaseTotalCost: number;
  totalCostDifference: number;

  // Recommendations
  lowerMonthlyPayment: "loan" | "lease";
  lowerTotalCost: "loan" | "lease";
  recommendation: string;

  currency: Currency;
  steps: CalcStep[];
}

/**
 * Calculate PMT (monthly payment) for a loan
 * PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 */
function calculatePMT(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) {
    return principal / months;
  }
  const factor = (1 + monthlyRate) ** months;
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Calculate vehicle loan
 */
export function calculateVehicleLoan(
  input: VehicleLoanInput
): CalculationResult<VehicleLoanResult> {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue,
    annualInterestRate,
    loanTermMonths,
    salesTaxRate,
    currency,
    includeVAT,
  } = input;

  // Validate inputs
  if (vehiclePrice <= 0 || loanTermMonths <= 0) {
    return {
      ok: false,
      error: "Vehicle price and loan term must be greater than zero",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];

  // Calculate sales tax
  const taxRate = includeVAT ? salesTaxRate : 0;
  const salesTax = vehiclePrice * (taxRate / 100);
  const totalVehicleCost = vehiclePrice + salesTax;

  steps.push({ key: "vehiclePrice", params: { value: formatCurrency(vehiclePrice, currency) } });
  if (includeVAT) {
    steps.push({
      key: "salesTax",
      params: { rate: salesTaxRate, value: formatCurrency(salesTax, currency) },
    });
    steps.push({
      key: "totalVehicleCost",
      params: { value: formatCurrency(totalVehicleCost, currency) },
    });
  }

  // Calculate loan amount
  const loanAmount = Math.max(0, totalVehicleCost - downPayment - tradeInValue);

  steps.push({ key: "downPayment", params: { value: formatCurrency(downPayment, currency) } });
  if (tradeInValue > 0) {
    steps.push({ key: "tradeInValue", params: { value: formatCurrency(tradeInValue, currency) } });
  }
  steps.push({ key: "loanAmount", params: { value: formatCurrency(loanAmount, currency) } });

  if (loanAmount === 0) {
    return {
      ok: true,
      value: {
        vehiclePrice,
        salesTax,
        totalVehicleCost,
        downPayment,
        tradeInValue,
        loanAmount: 0,
        monthlyPayment: 0,
        totalPayments: 0,
        totalInterest: 0,
        totalCost: totalVehicleCost,
        amortization: [],
        formatted: {
          vehiclePrice: formatCurrency(vehiclePrice, currency),
          salesTax: formatCurrency(salesTax, currency),
          totalVehicleCost: formatCurrency(totalVehicleCost, currency),
          loanAmount: formatCurrency(0, currency),
          monthlyPayment: formatCurrency(0, currency),
          totalPayments: formatCurrency(0, currency),
          totalInterest: formatCurrency(0, currency),
          totalCost: formatCurrency(totalVehicleCost, currency),
        },
        currency,
        steps,
      },
    };
  }

  // Calculate monthly payment using PMT formula
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyPayment = calculatePMT(loanAmount, monthlyRate, loanTermMonths);

  steps.push({
    key: "interestRate",
    params: { apr: annualInterestRate, monthly: (monthlyRate * 100).toFixed(4) },
  });
  steps.push({ key: "loanTerm", params: { months: loanTermMonths } });
  steps.push({
    key: "monthlyPayment",
    params: { value: formatCurrency(monthlyPayment, currency) },
  });

  // Calculate totals
  const totalPayments = monthlyPayment * loanTermMonths;
  const totalInterest = totalPayments - loanAmount;
  const totalCost = totalVehicleCost + totalInterest;

  steps.push({ key: "totalPayments", params: { value: formatCurrency(totalPayments, currency) } });
  steps.push({ key: "totalInterest", params: { value: formatCurrency(totalInterest, currency) } });
  steps.push({ key: "totalCost", params: { value: formatCurrency(totalCost, currency) } });

  // Generate amortization schedule
  const amortization: AmortizationEntry[] = [];
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
      vehiclePrice,
      salesTax,
      totalVehicleCost,
      downPayment,
      tradeInValue,
      loanAmount,
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalCost,
      amortization,
      formatted: {
        vehiclePrice: formatCurrency(vehiclePrice, currency),
        salesTax: formatCurrency(salesTax, currency),
        totalVehicleCost: formatCurrency(totalVehicleCost, currency),
        loanAmount: formatCurrency(loanAmount, currency),
        monthlyPayment: formatCurrency(monthlyPayment, currency),
        totalPayments: formatCurrency(totalPayments, currency),
        totalInterest: formatCurrency(totalInterest, currency),
        totalCost: formatCurrency(totalCost, currency),
      },
      currency,
      steps,
    },
  };
}

/**
 * Calculate vehicle lease
 * Monthly Lease Payment = (Depreciation + Finance Charge) / Months
 * Depreciation = (Capitalized Cost - Residual Value) / Lease Term
 * Finance Charge = (Capitalized Cost + Residual Value) × Money Factor
 */
export function calculateVehicleLease(
  input: VehicleLeaseInput
): CalculationResult<VehicleLeaseResult> {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue,
    leaseTermMonths,
    residualPercent,
    moneyFactor,
    annualKmLimit,
    excessKmCharge,
    salesTaxRate,
    currency,
    includeVAT,
  } = input;

  // Validate inputs
  if (vehiclePrice <= 0 || leaseTermMonths <= 0 || residualPercent < 0 || residualPercent > 100) {
    return {
      ok: false,
      error: "Vehicle price, lease term must be positive and residual percent between 0 and 100",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];

  // Calculate sales tax
  const taxRate = includeVAT ? salesTaxRate : 0;
  const salesTax = vehiclePrice * (taxRate / 100);

  // Capitalized cost = Vehicle price + tax - down payment - trade-in
  const capitalizedCost = vehiclePrice + salesTax - downPayment - tradeInValue;

  steps.push({ key: "vehiclePrice", params: { value: formatCurrency(vehiclePrice, currency) } });
  if (includeVAT) {
    steps.push({
      key: "salesTax",
      params: { rate: salesTaxRate, value: formatCurrency(salesTax, currency) },
    });
  }
  steps.push({ key: "downPayment", params: { value: formatCurrency(downPayment, currency) } });
  if (tradeInValue > 0) {
    steps.push({ key: "tradeInValue", params: { value: formatCurrency(tradeInValue, currency) } });
  }
  steps.push({
    key: "capitalizedCost",
    params: { value: formatCurrency(capitalizedCost, currency) },
  });

  // Residual value
  const residualValue = vehiclePrice * (residualPercent / 100);
  steps.push({
    key: "residualValue",
    params: { percent: residualPercent, value: formatCurrency(residualValue, currency) },
  });

  // Depreciation (per month)
  const depreciationTotal = capitalizedCost - residualValue;
  const depreciation = depreciationTotal / leaseTermMonths;
  steps.push({
    key: "depreciation",
    params: {
      capCost: formatCurrency(capitalizedCost, currency),
      residual: formatCurrency(residualValue, currency),
      months: leaseTermMonths,
      result: formatCurrency(depreciation, currency),
    },
  });

  // Finance charge (per month)
  const financeCharge = (capitalizedCost + residualValue) * moneyFactor;
  steps.push({
    key: "financeCharge",
    params: {
      capCost: formatCurrency(capitalizedCost, currency),
      residual: formatCurrency(residualValue, currency),
      moneyFactor,
      result: formatCurrency(financeCharge, currency),
    },
  });

  // Monthly payment
  const monthlyPayment = depreciation + financeCharge;
  steps.push({
    key: "monthlyPayment",
    params: {
      depreciation: formatCurrency(depreciation, currency),
      financeCharge: formatCurrency(financeCharge, currency),
      result: formatCurrency(monthlyPayment, currency),
    },
  });

  // Total payments
  const totalPayments = monthlyPayment * leaseTermMonths + downPayment;
  const totalCost = totalPayments;
  steps.push({ key: "totalLeaseCost", params: { value: formatCurrency(totalCost, currency) } });

  // Convert money factor to APR
  const equivalentAPR = moneyFactor * 2400;
  steps.push({
    key: "moneyFactorToAPR",
    params: { moneyFactor, apr: equivalentAPR.toFixed(2) },
  });

  // Km limits
  const totalKmLimit = annualKmLimit * (leaseTermMonths / 12);
  steps.push({
    key: "kmLimit",
    params: { annual: annualKmLimit.toLocaleString(), total: totalKmLimit.toLocaleString() },
  });
  steps.push({
    key: "excessKmCharge",
    params: { value: formatCurrency(excessKmCharge, currency) },
  });

  return {
    ok: true,
    value: {
      vehiclePrice,
      salesTax,
      capitalizedCost,
      residualValue,
      residualPercent,
      depreciation,
      financeCharge,
      monthlyPayment,
      totalPayments,
      totalCost,
      annualKmLimit,
      totalKmLimit,
      excessKmCharge,
      equivalentAPR,
      formatted: {
        vehiclePrice: formatCurrency(vehiclePrice, currency),
        capitalizedCost: formatCurrency(capitalizedCost, currency),
        residualValue: formatCurrency(residualValue, currency),
        depreciation: formatCurrency(depreciation, currency),
        financeCharge: formatCurrency(financeCharge, currency),
        monthlyPayment: formatCurrency(monthlyPayment, currency),
        totalPayments: formatCurrency(totalPayments, currency),
        totalCost: formatCurrency(totalCost, currency),
      },
      currency,
      steps,
    },
  };
}

/**
 * Compare loan vs lease options
 */
export function compareFinancingOptions(
  loanInput: VehicleLoanInput,
  leaseInput: VehicleLeaseInput
): CalculationResult<FinancingComparisonResult> {
  const loanResult = calculateVehicleLoan(loanInput);
  const leaseResult = calculateVehicleLease(leaseInput);

  if (!loanResult.ok) {
    return { ok: false, error: `Loan: ${loanResult.error}`, code: "INVALID_INPUT" };
  }
  if (!leaseResult.ok) {
    return { ok: false, error: `Lease: ${leaseResult.error}`, code: "INVALID_INPUT" };
  }

  const loan = loanResult.value;
  const lease = leaseResult.value;

  const steps: CalcStep[] = [];

  const monthlyDifference = loan.monthlyPayment - lease.monthlyPayment;
  const totalCostDifference = loan.totalCost - lease.totalCost;

  steps.push({ key: "loanMonthlyPayment", params: { value: loan.formatted.monthlyPayment } });
  steps.push({ key: "leaseMonthlyPayment", params: { value: lease.formatted.monthlyPayment } });
  steps.push({
    key: "monthlyDifference",
    params: {
      value: formatCurrency(Math.abs(monthlyDifference), loan.currency),
      lower: monthlyDifference > 0 ? "lease" : "loan",
    },
  });

  steps.push({ key: "loanTotalCost", params: { value: loan.formatted.totalCost } });
  steps.push({ key: "leaseTotalCost", params: { value: lease.formatted.totalCost } });
  steps.push({
    key: "totalCostDifference",
    params: { value: formatCurrency(Math.abs(totalCostDifference), loan.currency) },
  });

  const lowerMonthlyPayment = loan.monthlyPayment <= lease.monthlyPayment ? "loan" : "lease";
  const lowerTotalCost = loan.totalCost <= lease.totalCost ? "loan" : "lease";

  let recommendation: string;
  if (lowerMonthlyPayment === lowerTotalCost) {
    recommendation =
      lowerMonthlyPayment === "loan"
        ? "Loan is better for both monthly payment and total cost"
        : "Lease has lower monthly payment but consider total cost over time";
  } else {
    recommendation = `Lease has lower monthly payment, but loan has lower total cost if you keep the vehicle`;
  }

  steps.push({ key: "recommendation", params: { value: recommendation } });

  return {
    ok: true,
    value: {
      loan,
      lease,
      loanMonthlyPayment: loan.monthlyPayment,
      leaseMonthlyPayment: lease.monthlyPayment,
      monthlyDifference,
      loanTotalCost: loan.totalCost,
      leaseTotalCost: lease.totalCost,
      totalCostDifference,
      lowerMonthlyPayment,
      lowerTotalCost,
      recommendation,
      currency: loan.currency,
      steps,
    },
  };
}

/**
 * Convert APR to money factor
 */
export function aprToMoneyFactor(apr: number): number {
  return apr / 2400;
}

/**
 * Convert money factor to APR
 */
export function moneyFactorToAPR(moneyFactor: number): number {
  return moneyFactor * 2400;
}
