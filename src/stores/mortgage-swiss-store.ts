// src/stores/mortgage-swiss-store.ts
"use client";

import { create } from "zustand";
import type { SupportedCurrency } from "@/components/converter/currency-selector";
import {
  calculateSwissMortgage,
  getSwissMortgageRates,
  type SwissMortgageInput,
  type SwissMortgageResult,
} from "@/lib/converters/realestate/mortgage-swiss";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface MortgageSwissState {
  // Input values
  propertyPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number;
  interestRate: number;
  currency: SupportedCurrency;
  startDate: string;
  includeAmortization: boolean;

  // Result
  result: SwissMortgageResult | null;
  error: string | null;

  // Actions
  setPropertyPrice: (value: number) => void;
  setDownPayment: (value: number) => void;
  setDownPaymentPercent: (value: number) => void;
  setLoanTerm: (value: number) => void;
  setInterestRate: (value: number) => void;
  setCurrency: (value: SupportedCurrency) => void;
  setStartDate: (value: string) => void;
  setIncludeAmortization: (value: boolean) => void;
  calculate: () => void;
  reset: () => void;
}

const rates = getSwissMortgageRates();

const initialState = {
  propertyPrice: 800000,
  downPayment: 160000,
  downPaymentPercent: 20,
  loanTerm: 25,
  interestRate: rates.fixed10y,
  currency: "CHF" as SupportedCurrency,
  startDate: new Date().toISOString().split("T")[0],
  includeAmortization: true,
  result: null,
  error: null,
};

export const useSwissMortgageStore = create<MortgageSwissState>()(
  createUrlSyncMiddleware<MortgageSwissState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      propertyPrice: state.propertyPrice,
      downPayment: state.downPayment,
      loanTerm: state.loanTerm,
      interestRate: state.interestRate,
      currency: state.currency,
    }),
  })((set, get) => {
    // Load from URL params
    const loaded = { ...initialState };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loaded.propertyPrice = parseNumberParam(
          urlParams.get("propertyPrice") ?? null,
          initialState.propertyPrice
        );
        loaded.downPayment = parseNumberParam(
          urlParams.get("downPayment") ?? null,
          initialState.downPayment
        );
        loaded.loanTerm = parseNumberParam(
          urlParams.get("loanTerm") ?? null,
          initialState.loanTerm
        );
        loaded.interestRate = parseNumberParam(
          urlParams.get("interestRate") ?? null,
          initialState.interestRate
        );

        const currencyParam = parseStringParam(
          urlParams.get("currency") ?? null,
          initialState.currency
        );
        if (["CHF", "EUR"].includes(currencyParam)) {
          loaded.currency = currencyParam as SupportedCurrency;
        }

        // Recalculate down payment percent
        if (loaded.propertyPrice > 0) {
          loaded.downPaymentPercent = (loaded.downPayment / loaded.propertyPrice) * 100;
        }
      }
    }

    return {
      ...loaded,

      setPropertyPrice: (value: number) => {
        const { downPaymentPercent } = get();
        const newDownPayment = (downPaymentPercent / 100) * value;
        set({ propertyPrice: value, downPayment: newDownPayment });
        setTimeout(() => get().calculate(), 0);
      },

      setDownPayment: (value: number) => {
        const { propertyPrice } = get();
        const percent = propertyPrice > 0 ? (value / propertyPrice) * 100 : 0;
        set({ downPayment: value, downPaymentPercent: percent });
        setTimeout(() => get().calculate(), 0);
      },

      setDownPaymentPercent: (value: number) => {
        const { propertyPrice } = get();
        const downPayment = (value / 100) * propertyPrice;
        set({ downPaymentPercent: value, downPayment });
        setTimeout(() => get().calculate(), 0);
      },

      setLoanTerm: (value: number) => {
        set({ loanTerm: value });
        setTimeout(() => get().calculate(), 0);
      },

      setInterestRate: (value: number) => {
        set({ interestRate: value });
        setTimeout(() => get().calculate(), 0);
      },

      setCurrency: (value: SupportedCurrency) => {
        set({ currency: value });
        setTimeout(() => get().calculate(), 0);
      },

      setStartDate: (value: string) => {
        set({ startDate: value });
        setTimeout(() => get().calculate(), 0);
      },

      setIncludeAmortization: (value: boolean) => {
        set({ includeAmortization: value });
        setTimeout(() => get().calculate(), 0);
      },

      calculate: () => {
        const state = get();
        const input: SwissMortgageInput = {
          propertyPrice: state.propertyPrice,
          downPayment: state.downPayment,
          downPaymentPercent: state.downPaymentPercent,
          loanTerm: state.loanTerm,
          interestRate: state.interestRate,
          currency: state.currency,
          startDate: state.startDate,
          includeAmortization: state.includeAmortization,
        };

        const calcResult = calculateSwissMortgage(input);
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () => set({ ...initialState }),
    };
  })
);
