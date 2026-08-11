import type { CalculationResult } from "@/types";

export interface TipInput {
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
}

export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  tipPerPerson: number;
  totalPerPerson: number;
}

export function calculateTip(input: TipInput): CalculationResult<TipResult> {
  const { billAmount, tipPercentage, numberOfPeople } = input;

  if (billAmount < 0 || tipPercentage < 0 || numberOfPeople < 1) {
    return {
      ok: false,
      error: "Bill amount and tip percentage must be non-negative, number of people at least 1",
      code: "INVALID_INPUT",
    };
  }

  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + tipAmount;
  const tipPerPerson = tipAmount / numberOfPeople;
  const totalPerPerson = totalAmount / numberOfPeople;

  return {
    ok: true,
    value: {
      tipAmount: Math.round(tipAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      tipPerPerson: Math.round(tipPerPerson * 100) / 100,
      totalPerPerson: Math.round(totalPerPerson * 100) / 100,
    },
  };
}
