/**
 * Cryptocurrency Exchange Rate Calculator
 *
 * Converts between cryptocurrencies and fiat currencies using build-time fetched prices
 */

import cryptoPrices from "@/lib/data/crypto-prices.json";

export type CryptoCurrency = "BTC" | "ETH" | "LTC" | "XRP" | "DOGE" | "ADA";
export type FiatCurrency = "CHF" | "EUR" | "USD";

export interface CryptoInfo {
  id: CryptoCurrency;
  coinGeckoId: string;
  name: string;
  symbol: string;
}

export interface FiatInfo {
  id: FiatCurrency;
  name: string;
  symbol: string;
}

export interface ExchangeRateResult {
  amount: number;
  crypto: CryptoCurrency;
  fiat: FiatCurrency;
  rate: number; // 1 crypto = rate fiat
  convertedAmount: number;
  inverseRate: number; // 1 fiat = inverseRate crypto
  lastUpdated: string;
  source: string;
}

export const CRYPTO_CURRENCIES: CryptoInfo[] = [
  { id: "BTC", coinGeckoId: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ETH", coinGeckoId: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "LTC", coinGeckoId: "litecoin", name: "Litecoin", symbol: "LTC" },
  { id: "XRP", coinGeckoId: "ripple", name: "Ripple", symbol: "XRP" },
  { id: "DOGE", coinGeckoId: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  { id: "ADA", coinGeckoId: "cardano", name: "Cardano", symbol: "ADA" },
];

export const FIAT_CURRENCIES: FiatInfo[] = [
  { id: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "USD", name: "US Dollar", symbol: "$" },
];

/**
 * Convert cryptocurrency amount to fiat currency
 */
export function convertCrypto(
  amount: number,
  crypto: CryptoCurrency,
  fiat: FiatCurrency
): ExchangeRateResult {
  const cryptoInfo = CRYPTO_CURRENCIES.find((c) => c.id === crypto);
  if (!cryptoInfo) {
    throw new Error(`Unknown cryptocurrency: ${crypto}`);
  }

  const fiatLower = fiat.toLowerCase() as "chf" | "eur" | "usd";
  const coinGeckoId = cryptoInfo.coinGeckoId as keyof typeof cryptoPrices.prices;

  const rate = cryptoPrices.prices[coinGeckoId][fiatLower];
  if (!rate) {
    throw new Error(`Price not available for ${crypto} in ${fiat}`);
  }

  const convertedAmount = amount * rate;
  const inverseRate = 1 / rate;

  return {
    amount,
    crypto,
    fiat,
    rate,
    convertedAmount,
    inverseRate,
    lastUpdated: cryptoPrices.timestamp,
    source: cryptoPrices.source,
  };
}

/**
 * Convert fiat currency to cryptocurrency
 */
export function convertFiatToCrypto(
  amount: number,
  fiat: FiatCurrency,
  crypto: CryptoCurrency
): ExchangeRateResult {
  const cryptoInfo = CRYPTO_CURRENCIES.find((c) => c.id === crypto);
  if (!cryptoInfo) {
    throw new Error(`Unknown cryptocurrency: ${crypto}`);
  }

  const fiatLower = fiat.toLowerCase() as "chf" | "eur" | "usd";
  const coinGeckoId = cryptoInfo.coinGeckoId as keyof typeof cryptoPrices.prices;

  const rate = cryptoPrices.prices[coinGeckoId][fiatLower];
  if (!rate) {
    throw new Error(`Price not available for ${crypto} in ${fiat}`);
  }

  const convertedAmount = amount / rate;
  const inverseRate = 1 / rate;

  return {
    amount,
    crypto,
    fiat,
    rate,
    convertedAmount,
    inverseRate,
    lastUpdated: cryptoPrices.timestamp,
    source: cryptoPrices.source,
  };
}

/**
 * Format currency amount based on type
 */
export function formatCurrency(amount: number, currency: CryptoCurrency | FiatCurrency): string {
  const isFiat = ["CHF", "EUR", "USD"].includes(currency);

  if (isFiat) {
    // Fiat: 2 decimal places with locale formatting
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Crypto: adaptive decimal places based on value
  if (amount === 0) {
    return "0";
  }

  if (amount >= 1) {
    // >= 1: up to 4 decimal places
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  if (amount >= 0.01) {
    // 0.01 - 1: up to 6 decimal places
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  }

  // < 0.01: up to 8 decimal places
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  });
}

/**
 * Check if price data is stale (older than 24 hours)
 */
export function isPriceStale(): boolean {
  const timestamp = new Date(cryptoPrices.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24;
}

/**
 * Get age of price data in hours
 */
export function getPriceAge(): number {
  const timestamp = new Date(cryptoPrices.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  return Math.round(hoursDiff * 10) / 10; // Round to 1 decimal place
}
