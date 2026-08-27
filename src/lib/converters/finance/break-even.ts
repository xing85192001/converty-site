import type { CalculationResult } from "@/types";

export interface BreakEvenInput {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
}

export interface BreakEvenResult {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  profitAtUnits?: Array<{
    units: number;
    revenue: number;
    totalCost: number;
    profit: number;
  }>;
}

export function calculateBreakEven(input: BreakEvenInput): CalculationResult<BreakEvenResult> {
  const { fixedCosts, variableCostPerUnit, pricePerUnit } = input;

  if (fixedCosts < 0 || variableCostPerUnit < 0 || pricePerUnit <= 0) {
    return {
      ok: false,
      error: "Fixed costs and variable costs must be non-negative, price must be positive",
      code: "INVALID_INPUT",
    };
  }

  const contributionMargin = pricePerUnit - variableCostPerUnit;

  if (contributionMargin <= 0) {
    return {
      ok: false,
      error: "Cannot break even: price does not cover variable costs",
      code: "INVALID_INPUT",
    };
  }

  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  const contributionMarginRatio = (contributionMargin / pricePerUnit) * 100;

  // Generate profit table at various unit levels
  const profitAtUnits: BreakEvenResult["profitAtUnits"] = [];
  const increments = [0.5, 0.75, 1, 1.25, 1.5, 2];

  for (const mult of increments) {
    const units = Math.round(breakEvenUnits * mult);
    const revenue = units * pricePerUnit;
    const totalCost = fixedCosts + units * variableCostPerUnit;
    const profit = revenue - totalCost;

    profitAtUnits.push({
      units,
      revenue: Math.round(revenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    });
  }

  return {
    ok: true,
    value: {
      breakEvenUnits: Math.round(breakEvenUnits * 100) / 100,
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      contributionMargin: Math.round(contributionMargin * 100) / 100,
      contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
      profitAtUnits,
    },
  };
}
