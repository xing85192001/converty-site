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
  steps: string[];
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
  steps: string[];
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
  steps: string[];
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

  const steps: string[] = [];

  // Calculate sales tax
  const taxRate = includeVAT ? salesTaxRate : 0;
  const salesTax = vehiclePrice * (taxRate / 100);
  const totalVehicleCost = vehiclePrice + salesTax;

  steps.push(`Vehicle price: ${formatCurrency(vehiclePrice, currency)}`);
  if (includeVAT) {
    steps.push(`Sales tax (${salesTaxRate}%): ${formatCurrency(salesTax, currency)}`);
    steps.push(`Total vehicle cost: ${formatCurrency(totalVehicleCost, currency)}`);
  }

  // Calculate loan amount
  const loanAmount = Math.max(0, totalVehicleCost - downPayment - tradeInValue);

  steps.push(`Down payment: ${formatCurrency(downPayment, currency)}`);
  if (tradeInValue > 0) {
    steps.push(`Trade-in value: ${formatCurrency(tradeInValue, currency)}`);
  }
  steps.push(`Loan amount: ${formatCurrency(loanAmount, currency)}`);

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

  steps.push(
    `Interest rate: ${annualInterestRate}% APR (${(monthlyRate * 100).toFixed(4)}% monthly)`
  );
  steps.push(`Loan term: ${loanTermMonths} months`);
  steps.push(`Monthly payment (PMT formula): ${formatCurrency(monthlyPayment, currency)}`);

  // Calculate totals
  const totalPayments = monthlyPayment * loanTermMonths;
  const totalInterest = totalPayments - loanAmount;
  const totalCost = totalVehicleCost + totalInterest;

  steps.push(`Total payments: ${formatCurrency(totalPayments, currency)}`);
  steps.push(`Total interest: ${formatCurrency(totalInterest, currency)}`);
  steps.push(`Total cost (vehicle + interest): ${formatCurrency(totalCost, currency)}`);

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

  const steps: string[] = [];

  // Calculate sales tax
  const taxRate = includeVAT ? salesTaxRate : 0;
  const salesTax = vehiclePrice * (taxRate / 100);

  // Capitalized cost = Vehicle price + tax - down payment - trade-in
  const capitalizedCost = vehiclePrice + salesTax - downPayment - tradeInValue;

  steps.push(`Vehicle price: ${formatCurrency(vehiclePrice, currency)}`);
  if (includeVAT) {
    steps.push(`Sales tax (${salesTaxRate}%): ${formatCurrency(salesTax, currency)}`);
  }
  steps.push(`Down payment: ${formatCurrency(downPayment, currency)}`);
  if (tradeInValue > 0) {
    steps.push(`Trade-in value: ${formatCurrency(tradeInValue, currency)}`);
  }
  steps.push(`Capitalized cost: ${formatCurrency(capitalizedCost, currency)}`);

  // Residual value
  const residualValue = vehiclePrice * (residualPercent / 100);
  steps.push(`Residual value (${residualPercent}%): ${formatCurrency(residualValue, currency)}`);

  // Depreciation (per month)
  const depreciationTotal = capitalizedCost - residualValue;
  const depreciation = depreciationTotal / leaseTermMonths;
  steps.push(
    `Depreciation: (${formatCurrency(capitalizedCost, currency)} - ${formatCurrency(residualValue, currency)}) / ${leaseTermMonths} = ${formatCurrency(depreciation, currency)}/month`
  );

  // Finance charge (per month)
  const financeCharge = (capitalizedCost + residualValue) * moneyFactor;
  steps.push(
    `Finance charge: (${formatCurrency(capitalizedCost, currency)} + ${formatCurrency(residualValue, currency)}) × ${moneyFactor} = ${formatCurrency(financeCharge, currency)}/month`
  );

  // Monthly payment
  const monthlyPayment = depreciation + financeCharge;
  steps.push(
    `Monthly payment: ${formatCurrency(depreciation, currency)} + ${formatCurrency(financeCharge, currency)} = ${formatCurrency(monthlyPayment, currency)}`
  );

  // Total payments
  const totalPayments = monthlyPayment * leaseTermMonths + downPayment;
  const totalCost = totalPayments;
  steps.push(`Total lease cost: ${formatCurrency(totalCost, currency)}`);

  // Convert money factor to APR
  const equivalentAPR = moneyFactor * 2400;
  steps.push(`Money factor ${moneyFactor} = ${equivalentAPR.toFixed(2)}% APR equivalent`);

  // Km limits
  const totalKmLimit = annualKmLimit * (leaseTermMonths / 12);
  steps.push(
    `Km limit: ${annualKmLimit.toLocaleString()} km/year (${totalKmLimit.toLocaleString()} km total)`
  );
  steps.push(`Excess km charge: ${formatCurrency(excessKmCharge, currency)}/km`);

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

  const steps: string[] = [];

  const monthlyDifference = loan.monthlyPayment - lease.monthlyPayment;
  const totalCostDifference = loan.totalCost - lease.totalCost;

  steps.push(`Loan monthly payment: ${loan.formatted.monthlyPayment}`);
  steps.push(`Lease monthly payment: ${lease.formatted.monthlyPayment}`);
  steps.push(
    `Monthly difference: ${formatCurrency(Math.abs(monthlyDifference), loan.currency)} (${monthlyDifference > 0 ? "lease is lower" : "loan is lower"})`
  );

  steps.push(`Loan total cost: ${loan.formatted.totalCost}`);
  steps.push(`Lease total cost: ${lease.formatted.totalCost}`);
  steps.push(
    `Total cost difference: ${formatCurrency(Math.abs(totalCostDifference), loan.currency)}`
  );

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

  steps.push(`Recommendation: ${recommendation}`);

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
