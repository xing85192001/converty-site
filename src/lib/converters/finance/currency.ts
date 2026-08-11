import type { CalculationResult } from "@/types";

// Common exchange rates (static, for demo purposes)
// In a real app, these would come from an API
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
  KRW: 1320.5,
  SGD: 1.34,
  HKD: 7.82,
  SEK: 10.42,
  NOK: 10.58,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.65,
  RUB: 89.5,
};

// Currency names are now translated in UI components using i18n
// See calculator.finance.currencies.* keys in translation files

export interface CurrencyInput {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface CurrencyResult {
  convertedAmount: number;
  exchangeRate: number;
  inverseRate: number;
  fromCurrency: string;
  toCurrency: string;
}

export function convertCurrency(input: CurrencyInput): CalculationResult<CurrencyResult> {
  const { amount, fromCurrency, toCurrency } = input;

  if (amount < 0) {
    return { ok: false, error: "Amount must be non-negative", code: "INVALID_INPUT" };
  }

  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  if (!fromRate || !toRate) {
    return { ok: false, error: "Unknown currency code", code: "INVALID_INPUT" };
  }

  // Convert to USD first, then to target currency
  const amountInUsd = amount / fromRate;
  const convertedAmount = amountInUsd * toRate;
  const exchangeRate = toRate / fromRate;
  const inverseRate = fromRate / toRate;

  return {
    ok: true,
    value: {
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      exchangeRate: Math.round(exchangeRate * 10000) / 10000,
      inverseRate: Math.round(inverseRate * 10000) / 10000,
      fromCurrency,
      toCurrency,
    },
  };
}

export function getAvailableCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES);
}
