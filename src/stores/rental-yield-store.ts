"use client";

import { create } from "zustand";
import type { SupportedCurrency } from "@/lib/converters/realestate/types";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface RentalYieldStoreState {
  purchasePrice: number;
  annualRent: number;
  annualExpenses: number;
  transactionCostsPercent: number;
  currency: SupportedCurrency;
  includeMortgage: boolean;
  monthlyMortgagePayment: number;
  setPurchasePrice: (price: number) => void;
  setAnnualRent: (rent: number) => void;
  setAnnualExpenses: (expenses: number) => void;
  setTransactionCostsPercent: (percent: number) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setIncludeMortgage: (include: boolean) => void;
  setMonthlyMortgagePayment: (payment: number) => void;
  reset: () => void;
}

const SWISS_DEFAULTS = {
  purchasePrice: 800000,
  annualRent: 24000,
  annualExpenses: 4000,
  transactionCostsPercent: 4,
  currency: "CHF" as const,
  includeMortgage: false,
  monthlyMortgagePayment: 3500,
};

export const useRentalYieldStore = create<RentalYieldStoreState>()(
  createUrlSyncMiddleware<RentalYieldStoreState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      purchasePrice: state.purchasePrice,
      annualRent: state.annualRent,
      annualExpenses: state.annualExpenses,
      transactionCostsPercent: state.transactionCostsPercent,
      currency: state.currency,
      includeMortgage: state.includeMortgage,
      monthlyMortgagePayment: state.monthlyMortgagePayment,
    }),
  })((set) => {
    // Load from URL params
    type LoadedState = Omit<
      RentalYieldStoreState,
      | "setPurchasePrice"
      | "setAnnualRent"
      | "setAnnualExpenses"
      | "setTransactionCostsPercent"
      | "setCurrency"
      | "setIncludeMortgage"
      | "setMonthlyMortgagePayment"
      | "reset"
    >;
    const loaded: LoadedState = { ...SWISS_DEFAULTS };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loaded.purchasePrice = parseNumberParam(
          urlParams.get("purchasePrice") ?? null,
          SWISS_DEFAULTS.purchasePrice
        );
        loaded.annualRent = parseNumberParam(
          urlParams.get("annualRent") ?? null,
          SWISS_DEFAULTS.annualRent
        );
        loaded.annualExpenses = parseNumberParam(
          urlParams.get("annualExpenses") ?? null,
          SWISS_DEFAULTS.annualExpenses
        );
        loaded.transactionCostsPercent = parseNumberParam(
          urlParams.get("transactionCostsPercent") ?? null,
          SWISS_DEFAULTS.transactionCostsPercent
        );
        loaded.monthlyMortgagePayment = parseNumberParam(
          urlParams.get("monthlyMortgagePayment") ?? null,
          SWISS_DEFAULTS.monthlyMortgagePayment
        );

        const currencyParam = parseStringParam(urlParams.get("currency") ?? null, "");
        if (["CHF", "EUR"].includes(currencyParam)) {
          loaded.currency = currencyParam as SupportedCurrency;
        }

        const includeMortgageParam = parseStringParam(
          urlParams.get("includeMortgage") ?? null,
          "false"
        );
        loaded.includeMortgage = includeMortgageParam === "true";
      }
    }

    return {
      ...loaded,
      setPurchasePrice: (price: number) => set({ purchasePrice: price }),
      setAnnualRent: (rent: number) => set({ annualRent: rent }),
      setAnnualExpenses: (expenses: number) => set({ annualExpenses: expenses }),
      setTransactionCostsPercent: (percent: number) => set({ transactionCostsPercent: percent }),
      setCurrency: (currency: SupportedCurrency) => set({ currency }),
      setIncludeMortgage: (include: boolean) => set({ includeMortgage: include }),
      setMonthlyMortgagePayment: (payment: number) => set({ monthlyMortgagePayment: payment }),
      reset: () => set(SWISS_DEFAULTS),
    };
  })
);
