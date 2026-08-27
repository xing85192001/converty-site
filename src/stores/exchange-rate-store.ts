"use client";

import { create } from "zustand";
import {
  type CryptoCurrency,
  convertCrypto,
  type ExchangeRateResult,
  type FiatCurrency,
} from "@/lib/converters/crypto/exchange-rate";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface ExchangeRateState {
  // Input
  amount: string;
  crypto: CryptoCurrency;
  fiat: FiatCurrency;

  // Result
  result: ExchangeRateResult | null;
  error: string | null;

  // Actions
  setAmount: (value: string) => void;
  setCrypto: (crypto: CryptoCurrency) => void;
  setFiat: (fiat: FiatCurrency) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  amount: "1",
  crypto: "BTC" as CryptoCurrency,
  fiat: "CHF" as FiatCurrency,
  result: null,
  error: null,
};

export const useExchangeRateStore = create<ExchangeRateState>()(
  createUrlSyncMiddleware<ExchangeRateState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      amount: state.amount,
      crypto: state.crypto,
      fiat: state.fiat,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedAmount = initialState.amount;
    let loadedCrypto = initialState.crypto;
    let loadedFiat = initialState.fiat;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const amountParam = parseNumberParam(
          urlParams.get("amount") ?? null,
          parseFloat(initialState.amount)
        );
        if (amountParam > 0) {
          loadedAmount = String(amountParam);
        }

        const cryptoParam = parseStringParam(urlParams.get("crypto") ?? null, initialState.crypto);
        if (["BTC", "ETH", "LTC", "XRP", "DOGE", "ADA"].includes(cryptoParam)) {
          loadedCrypto = cryptoParam as CryptoCurrency;
        }

        const fiatParam = parseStringParam(urlParams.get("fiat") ?? null, initialState.fiat);
        if (["CHF", "EUR", "USD"].includes(fiatParam)) {
          loadedFiat = fiatParam as FiatCurrency;
        }
      }
    }

    // Calculate initial result if we have valid amount
    let initialResult: ExchangeRateResult | null = null;
    if (loadedAmount && parseFloat(loadedAmount) > 0) {
      try {
        initialResult = convertCrypto(parseFloat(loadedAmount), loadedCrypto, loadedFiat);
      } catch {
        // Ignore errors on initial load
      }
    }

    return {
      amount: loadedAmount,
      crypto: loadedCrypto,
      fiat: loadedFiat,
      result: initialResult,
      error: null,

      setAmount: (value: string) => {
        set({ amount: value, error: null });
        // Auto-calculate when amount changes
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setCrypto: (crypto: CryptoCurrency) => {
        set({ crypto, error: null });
        // Re-calculate with new crypto
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setFiat: (fiat: FiatCurrency) => {
        set({ fiat, error: null });
        // Re-calculate with new fiat
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      calculate: () => {
        const { amount, crypto, fiat } = get();
        const amountNum = parseFloat(amount);

        if (!amount || amountNum <= 0) {
          set({ result: null, error: null });
          return;
        }

        try {
          const result = convertCrypto(amountNum, crypto, fiat);
          set({ result, error: null });
        } catch (err) {
          set({
            result: null,
            error: err instanceof Error ? err.message : "Conversion failed",
          });
        }
      },

      reset: () => set({ ...initialState, result: null }),
    };
  })
);
