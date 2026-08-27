import type { SupportedCurrency } from "./types";

export interface RentalYieldInput {
  purchasePrice: number;
  annualRent: number;
  annualExpenses: number;
  transactionCostsPercent: number;
  currency: SupportedCurrency;
  includeMortgage: boolean;
  monthlyMortgagePayment: number;
}

export interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  grm: number;
  capRate: number;
  monthlyGrossIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalInvestment: number;
  transactionCosts: number;
  netOperatingIncome: number;
  marketAverage: number;
  comparisonToMarket: "above" | "below" | "average";
  comparisonPercent: number;
  rating: "excellent" | "good" | "fair" | "poor";
  yearsToBreakEven: number;
  currency: SupportedCurrency;
}

export function calculateRentalYield(input: RentalYieldInput): RentalYieldResult {
  const {
    purchasePrice,
    annualRent,
    annualExpenses,
    transactionCostsPercent,
    currency,
    includeMortgage,
    monthlyMortgagePayment,
  } = input;

  // Calculate transaction costs
  const transactionCosts = purchasePrice * (transactionCostsPercent / 100);
  const totalInvestment = purchasePrice + transactionCosts;

  // Monthly calculations
  const monthlyGrossIncome = annualRent / 12;
  const monthlyExpenses = annualExpenses / 12;
  const mortgagePayment = includeMortgage ? monthlyMortgagePayment : 0;
  const monthlyCashFlow = monthlyGrossIncome - monthlyExpenses - mortgagePayment;

  // Annual calculations
  const annualCashFlow = monthlyCashFlow * 12;
  const netOperatingIncome = annualRent - annualExpenses;

  // Yield calculations
  const grossYield = (annualRent / purchasePrice) * 100;
  const netYield = (netOperatingIncome / totalInvestment) * 100;
  const capRate = (netOperatingIncome / purchasePrice) * 100;

  // Gross Rent Multiplier
  const grm = purchasePrice / annualRent;

  // Break-even calculation (years to recover investment)
  const yearsToBreakEven = monthlyCashFlow > 0 ? totalInvestment / (monthlyCashFlow * 12) : 999;

  // Market comparison (Swiss average: 2.92%)
  const marketAverage = 2.92;
  const comparisonPercent = netYield - marketAverage;
  const comparisonToMarket: "above" | "below" | "average" =
    Math.abs(comparisonPercent) < 0.1 ? "average" : comparisonPercent > 0 ? "above" : "below";

  // Investment rating based on net yield
  let rating: "excellent" | "good" | "fair" | "poor";
  if (netYield >= 4.5) {
    rating = "excellent";
  } else if (netYield >= 3.5) {
    rating = "good";
  } else if (netYield >= 2.5) {
    rating = "fair";
  } else {
    rating = "poor";
  }

  return {
    grossYield,
    netYield,
    grm,
    capRate,
    monthlyGrossIncome,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    totalInvestment,
    transactionCosts,
    netOperatingIncome,
    marketAverage,
    comparisonToMarket,
    comparisonPercent,
    rating,
    yearsToBreakEven,
    currency,
  };
}

export function getSwissBenchmarks() {
  return {
    averageYield: 2.92,
    goodYield: 3.5,
    excellentYield: 4.5,
    typicalTransactionCosts: 4,
    maxTransactionCosts: 6,
    minTransactionCosts: 3,
  };
}

export function getSwissCityYields() {
  return {
    zurich: { average: 2.45, range: "2.0-3.0%" },
    geneva: { average: 2.55, range: "2.0-3.2%" },
    bern: { average: 2.85, range: "2.3-3.5%" },
    basel: { average: 2.78, range: "2.2-3.3%" },
    lausanne: { average: 2.65, range: "2.1-3.2%" },
    lucerne: { average: 3.05, range: "2.5-3.8%" },
    zug: { average: 2.42, range: "1.9-3.0%" },
  };
}
