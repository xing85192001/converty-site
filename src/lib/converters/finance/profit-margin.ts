import type { CalculationResult } from "@/types";

export interface ProfitMarginInput {
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses?: number;
  taxes?: number;
}

export interface ProfitMarginResult {
  grossProfit: number;
  grossMargin: number;
  operatingProfit?: number;
  operatingMargin?: number;
  netProfit?: number;
  netMargin?: number;
  markup: number;
}

export function calculateProfitMargin(
  input: ProfitMarginInput
): CalculationResult<ProfitMarginResult> {
  const { revenue, costOfGoodsSold, operatingExpenses, taxes } = input;

  if (revenue <= 0 || costOfGoodsSold < 0) {
    return {
      ok: false,
      error: "Revenue must be positive and cost of goods sold non-negative",
      code: "INVALID_INPUT",
    };
  }

  const grossProfit = revenue - costOfGoodsSold;
  const grossMargin = (grossProfit / revenue) * 100;
  const markup = costOfGoodsSold > 0 ? (grossProfit / costOfGoodsSold) * 100 : 0;

  let operatingProfit: number | undefined;
  let operatingMargin: number | undefined;
  let netProfit: number | undefined;
  let netMargin: number | undefined;

  if (operatingExpenses !== undefined) {
    operatingProfit = grossProfit - operatingExpenses;
    operatingMargin = (operatingProfit / revenue) * 100;

    if (taxes !== undefined) {
      netProfit = operatingProfit - taxes;
      netMargin = (netProfit / revenue) * 100;
    }
  }

  return {
    ok: true,
    value: {
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: Math.round(grossMargin * 100) / 100,
      operatingProfit:
        operatingProfit !== undefined ? Math.round(operatingProfit * 100) / 100 : undefined,
      operatingMargin:
        operatingMargin !== undefined ? Math.round(operatingMargin * 100) / 100 : undefined,
      netProfit: netProfit !== undefined ? Math.round(netProfit * 100) / 100 : undefined,
      netMargin: netMargin !== undefined ? Math.round(netMargin * 100) / 100 : undefined,
      markup: Math.round(markup * 100) / 100,
    },
  };
}
