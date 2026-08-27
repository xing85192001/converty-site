"use client";

import { create } from "zustand";
import type { Currency } from "@/lib/converters/automotive/types";
import {
  aprToMoneyFactor,
  calculateVehicleLease,
  calculateVehicleLoan,
  compareFinancingOptions,
  DEFAULT_RATES,
  type FinancingComparisonResult,
  SWISS_VAT_RATE,
  type VehicleLeaseResult,
  type VehicleLoanResult,
} from "@/lib/converters/automotive/vehicle-financing";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import {
  getUrlParams,
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from "@/lib/utils/url-params";

export type FinancingMode = "loan" | "lease" | "compare";

export interface VehicleFinancingState {
  // Mode
  mode: FinancingMode;

  // Common inputs
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  currency: Currency;
  includeVAT: boolean;
  salesTaxRate: number;

  // Loan inputs
  loanInterestRate: number;
  loanTermMonths: number;

  // Lease inputs
  leaseTermMonths: number;
  residualPercent: number;
  leaseAPR: number;
  annualKmLimit: number;
  excessKmCharge: number;

  // Results
  loanResult: VehicleLoanResult | null;
  leaseResult: VehicleLeaseResult | null;
  comparisonResult: FinancingComparisonResult | null;
  error: string | null;

  // Actions
  setMode: (mode: FinancingMode) => void;
  setVehiclePrice: (value: number) => void;
  setDownPayment: (value: number) => void;
  setTradeInValue: (value: number) => void;
  setCurrency: (currency: Currency) => void;
  setIncludeVAT: (value: boolean) => void;
  setSalesTaxRate: (value: number) => void;
  setLoanInterestRate: (value: number) => void;
  setLoanTermMonths: (value: number) => void;
  setLeaseTermMonths: (value: number) => void;
  setResidualPercent: (value: number) => void;
  setLeaseAPR: (value: number) => void;
  setAnnualKmLimit: (value: number) => void;
  setExcessKmCharge: (value: number) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  mode: "loan" as FinancingMode,
  vehiclePrice: 40000,
  downPayment: 5000,
  tradeInValue: 0,
  currency: "CHF" as Currency,
  includeVAT: true,
  salesTaxRate: SWISS_VAT_RATE,
  loanInterestRate: DEFAULT_RATES.loanAPR,
  loanTermMonths: 48,
  leaseTermMonths: 36,
  residualPercent: DEFAULT_RATES.residual3Year,
  leaseAPR: 3.5,
  annualKmLimit: 15000,
  excessKmCharge: 0.15,
  loanResult: null,
  leaseResult: null,
  comparisonResult: null,
  error: null,
};

const VALID_MODES: FinancingMode[] = ["loan", "lease", "compare"];
const VALID_CURRENCIES: Currency[] = ["CHF", "EUR"];

export const useVehicleFinancingStore = create<VehicleFinancingState>()(
  createUrlSyncMiddleware<VehicleFinancingState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      mode: state.mode,
      vehiclePrice: state.vehiclePrice,
      downPayment: state.downPayment,
      tradeInValue: state.tradeInValue,
      currency: state.currency,
      includeVAT: state.includeVAT,
      loanInterestRate: state.loanInterestRate,
      loanTermMonths: state.loanTermMonths,
      leaseTermMonths: state.leaseTermMonths,
      residualPercent: state.residualPercent,
      leaseAPR: state.leaseAPR,
    }),
  })((set, get) => {
    // Load initial values from URL params
    const loaded = { ...initialState };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const modeParam = parseStringParam(urlParams.get("mode") ?? null, initialState.mode);
        if (VALID_MODES.includes(modeParam as FinancingMode)) {
          loaded.mode = modeParam as FinancingMode;
        }

        const currencyParam = parseStringParam(
          urlParams.get("currency") ?? null,
          initialState.currency
        );
        if (VALID_CURRENCIES.includes(currencyParam as Currency)) {
          loaded.currency = currencyParam as Currency;
        }

        loaded.vehiclePrice = parseNumberParam(
          urlParams.get("vehiclePrice") ?? null,
          initialState.vehiclePrice
        );
        loaded.downPayment = parseNumberParam(
          urlParams.get("downPayment") ?? null,
          initialState.downPayment
        );
        loaded.tradeInValue = parseNumberParam(
          urlParams.get("tradeInValue") ?? null,
          initialState.tradeInValue
        );
        loaded.includeVAT = parseBooleanParam(
          urlParams.get("includeVAT") ?? null,
          initialState.includeVAT
        );
        loaded.loanInterestRate = parseNumberParam(
          urlParams.get("loanInterestRate") ?? null,
          initialState.loanInterestRate
        );
        loaded.loanTermMonths = parseNumberParam(
          urlParams.get("loanTermMonths") ?? null,
          initialState.loanTermMonths
        );
        loaded.leaseTermMonths = parseNumberParam(
          urlParams.get("leaseTermMonths") ?? null,
          initialState.leaseTermMonths
        );
        loaded.residualPercent = parseNumberParam(
          urlParams.get("residualPercent") ?? null,
          initialState.residualPercent
        );
        loaded.leaseAPR = parseNumberParam(
          urlParams.get("leaseAPR") ?? null,
          initialState.leaseAPR
        );
      }
    }

    return {
      ...loaded,

      setMode: (mode: FinancingMode) => {
        set({ mode, error: null });
        get().calculate();
      },

      setVehiclePrice: (value: number) => {
        set({ vehiclePrice: value, error: null });
        get().calculate();
      },

      setDownPayment: (value: number) => {
        set({ downPayment: value, error: null });
        get().calculate();
      },

      setTradeInValue: (value: number) => {
        set({ tradeInValue: value, error: null });
        get().calculate();
      },

      setCurrency: (currency: Currency) => {
        // Adjust excess km charge for currency
        const excessKmCharge = currency === "CHF" ? 0.15 : 0.12;
        set({ currency, excessKmCharge, error: null });
        get().calculate();
      },

      setIncludeVAT: (value: boolean) => {
        set({ includeVAT: value, error: null });
        get().calculate();
      },

      setSalesTaxRate: (value: number) => {
        set({ salesTaxRate: value, error: null });
        get().calculate();
      },

      setLoanInterestRate: (value: number) => {
        set({ loanInterestRate: value, error: null });
        get().calculate();
      },

      setLoanTermMonths: (value: number) => {
        set({ loanTermMonths: value, error: null });
        get().calculate();
      },

      setLeaseTermMonths: (value: number) => {
        // Adjust residual based on lease term
        let residualPercent: number;
        if (value <= 36) residualPercent = 50;
        else if (value <= 48) residualPercent = 40;
        else residualPercent = 35;

        set({ leaseTermMonths: value, residualPercent, error: null });
        get().calculate();
      },

      setResidualPercent: (value: number) => {
        set({ residualPercent: value, error: null });
        get().calculate();
      },

      setLeaseAPR: (value: number) => {
        set({ leaseAPR: value, error: null });
        get().calculate();
      },

      setAnnualKmLimit: (value: number) => {
        set({ annualKmLimit: value, error: null });
        get().calculate();
      },

      setExcessKmCharge: (value: number) => {
        set({ excessKmCharge: value, error: null });
        get().calculate();
      },

      calculate: () => {
        const state = get();

        const loanInput = {
          vehiclePrice: state.vehiclePrice,
          downPayment: state.downPayment,
          tradeInValue: state.tradeInValue,
          annualInterestRate: state.loanInterestRate,
          loanTermMonths: state.loanTermMonths,
          salesTaxRate: state.salesTaxRate,
          currency: state.currency,
          includeVAT: state.includeVAT,
        };

        const leaseInput = {
          vehiclePrice: state.vehiclePrice,
          downPayment: state.downPayment,
          tradeInValue: state.tradeInValue,
          leaseTermMonths: state.leaseTermMonths,
          residualPercent: state.residualPercent,
          moneyFactor: aprToMoneyFactor(state.leaseAPR),
          annualKmLimit: state.annualKmLimit,
          excessKmCharge: state.excessKmCharge,
          salesTaxRate: state.salesTaxRate,
          currency: state.currency,
          includeVAT: state.includeVAT,
        };

        switch (state.mode) {
          case "loan": {
            const loanCalcResult = calculateVehicleLoan(loanInput);
            if (loanCalcResult.ok) {
              set({
                loanResult: loanCalcResult.value,
                leaseResult: null,
                comparisonResult: null,
                error: null,
              });
            } else {
              set({ error: loanCalcResult.error });
            }
            break;
          }
          case "lease": {
            const leaseCalcResult = calculateVehicleLease(leaseInput);
            if (leaseCalcResult.ok) {
              set({
                loanResult: null,
                leaseResult: leaseCalcResult.value,
                comparisonResult: null,
                error: null,
              });
            } else {
              set({ error: leaseCalcResult.error });
            }
            break;
          }
          case "compare": {
            const comparisonCalcResult = compareFinancingOptions(loanInput, leaseInput);
            if (comparisonCalcResult.ok) {
              set({
                loanResult: comparisonCalcResult.value.loan,
                leaseResult: comparisonCalcResult.value.lease,
                comparisonResult: comparisonCalcResult.value,
                error: null,
              });
            } else {
              set({ error: comparisonCalcResult.error });
            }
            break;
          }
        }
      },

      reset: () => set({ ...initialState }),
    };
  })
);
