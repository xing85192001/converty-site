import type { CalculationResult } from "@/types";

export interface InflationInput {
  amount: number;
  inflationRate: number;
  years: number;
}

export interface InflationResult {
  futureValue: number;
  purchasingPowerLoss: number;
  purchasingPowerLossPercent: number;
  equivalentPastValue: number;
  yearlyBreakdown: Array<{
    year: number;
    value: number;
    cumulativeLoss: number;
  }>;
}

export function calculateInflation(input: InflationInput): CalculationResult<InflationResult> {
  const { amount, inflationRate, years } = input;

  if (amount <= 0 || inflationRate < 0 || years < 0 || years > 100) {
    return {
      ok: false,
      error: "Amount must be positive, inflation rate non-negative, years between 0 and 100",
      code: "INVALID_INPUT",
    };
  }

  const rate = inflationRate / 100;
  const futureValue = amount * (1 + rate) ** years;
  const purchasingPowerLoss = futureValue - amount;
  const purchasingPowerLossPercent = (purchasingPowerLoss / amount) * 100;
  const equivalentPastValue = amount / (1 + rate) ** years;

  const yearlyBreakdown: InflationResult["yearlyBreakdown"] = [];
  for (let year = 1; year <= years; year++) {
    const value = amount * (1 + rate) ** year;
    yearlyBreakdown.push({
      year,
      value: Math.round(value * 100) / 100,
      cumulativeLoss: Math.round((value - amount) * 100) / 100,
    });
  }

  return {
    ok: true,
    value: {
      futureValue: Math.round(futureValue * 100) / 100,
      purchasingPowerLoss: Math.round(purchasingPowerLoss * 100) / 100,
      purchasingPowerLossPercent: Math.round(purchasingPowerLossPercent * 100) / 100,
      equivalentPastValue: Math.round(equivalentPastValue * 100) / 100,
      yearlyBreakdown,
    },
  };
}
