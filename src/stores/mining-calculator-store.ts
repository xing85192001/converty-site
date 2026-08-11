"use client";

import { create } from "zustand";
import {
  calculateMiningProfitability,
  type FiatCurrency,
  type HashRateUnit,
  type MiningResult,
} from "@/lib/converters/crypto/mining-profitability";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface MiningCalculatorState {
  // Input
  hashRate: string;
  hashRateUnit: HashRateUnit;
  powerWatts: string;
  electricityCost: string;
  currency: FiatCurrency;
  hardwareCost: string;

  // Result
  result: MiningResult | null;
  error: string | null;

  // Actions
  setHashRate: (value: string) => void;
  setHashRateUnit: (unit: HashRateUnit) => void;
  setPowerWatts: (value: string) => void;
  setElectricityCost: (value: string) => void;
  setCurrency: (currency: FiatCurrency) => void;
  setHardwareCost: (value: string) => void;
  applyPreset: (hashRate: number, hashRateUnit: HashRateUnit, powerWatts: number) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  hashRate: "100",
  hashRateUnit: "TH/s" as HashRateUnit,
  powerWatts: "3000",
  electricityCost: "0.27", // Swiss default
  currency: "CHF" as FiatCurrency,
  hardwareCost: "",
  result: null,
  error: null,
};

export const useMiningCalculatorStore = create<MiningCalculatorState>()(
  createUrlSyncMiddleware<MiningCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      hashRate: state.hashRate,
      hashRateUnit: state.hashRateUnit,
      powerWatts: state.powerWatts,
      electricityCost: state.electricityCost,
      currency: state.currency,
      hardwareCost: state.hardwareCost,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedHashRate = initialState.hashRate;
    let loadedHashRateUnit = initialState.hashRateUnit;
    let loadedPowerWatts = initialState.powerWatts;
    let loadedElectricityCost = initialState.electricityCost;
    let loadedCurrency = initialState.currency;
    let loadedHardwareCost = initialState.hardwareCost;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const hashRateParam = parseNumberParam(
          urlParams.get("hashRate") ?? null,
          parseFloat(initialState.hashRate)
        );
        if (hashRateParam > 0) {
          loadedHashRate = String(hashRateParam);
        }

        const hashRateUnitParam = parseStringParam(
          urlParams.get("hashRateUnit") ?? null,
          initialState.hashRateUnit
        );
        if (["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s"].includes(hashRateUnitParam)) {
          loadedHashRateUnit = hashRateUnitParam as HashRateUnit;
        }

        const powerWattsParam = parseNumberParam(
          urlParams.get("powerWatts") ?? null,
          parseFloat(initialState.powerWatts)
        );
        if (powerWattsParam > 0) {
          loadedPowerWatts = String(powerWattsParam);
        }

        const electricityCostParam = parseNumberParam(
          urlParams.get("electricityCost") ?? null,
          parseFloat(initialState.electricityCost)
        );
        if (electricityCostParam >= 0) {
          loadedElectricityCost = String(electricityCostParam);
        }

        const currencyParam = parseStringParam(
          urlParams.get("currency") ?? null,
          initialState.currency
        );
        if (["CHF", "EUR", "USD"].includes(currencyParam)) {
          loadedCurrency = currencyParam as FiatCurrency;
        }

        const hardwareCostParam = parseNumberParam(urlParams.get("hardwareCost") ?? null, 0);
        if (hardwareCostParam > 0) {
          loadedHardwareCost = String(hardwareCostParam);
        }
      }
    }

    // Calculate initial result if we have valid inputs
    let initialResult: MiningResult | null = null;
    const hashRateNum = parseFloat(loadedHashRate);
    const powerWattsNum = parseFloat(loadedPowerWatts);
    const electricityCostNum = parseFloat(loadedElectricityCost);
    const hardwareCostNum = loadedHardwareCost ? parseFloat(loadedHardwareCost) : undefined;

    if (hashRateNum > 0 && powerWattsNum > 0 && electricityCostNum >= 0) {
      const initCalcResult = calculateMiningProfitability({
        hashRate: hashRateNum,
        hashRateUnit: loadedHashRateUnit,
        powerWatts: powerWattsNum,
        electricityCost: electricityCostNum,
        currency: loadedCurrency,
        hardwareCost: hardwareCostNum,
      });
      if (initCalcResult.ok) {
        initialResult = initCalcResult.value;
      }
    }

    return {
      hashRate: loadedHashRate,
      hashRateUnit: loadedHashRateUnit,
      powerWatts: loadedPowerWatts,
      electricityCost: loadedElectricityCost,
      currency: loadedCurrency,
      hardwareCost: loadedHardwareCost,
      result: initialResult,
      error: null,

      setHashRate: (value: string) => {
        set({ hashRate: value, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setHashRateUnit: (unit: HashRateUnit) => {
        set({ hashRateUnit: unit, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setPowerWatts: (value: string) => {
        set({ powerWatts: value, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setElectricityCost: (value: string) => {
        set({ electricityCost: value, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setCurrency: (currency: FiatCurrency) => {
        set({ currency, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      setHardwareCost: (value: string) => {
        set({ hardwareCost: value, error: null });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      applyPreset: (hashRate: number, hashRateUnit: HashRateUnit, powerWatts: number) => {
        set({
          hashRate: String(hashRate),
          hashRateUnit,
          powerWatts: String(powerWatts),
          error: null,
        });
        setTimeout(() => {
          get().calculate();
        }, 0);
      },

      calculate: () => {
        const { hashRate, hashRateUnit, powerWatts, electricityCost, currency, hardwareCost } =
          get();

        const hashRateNum = parseFloat(hashRate);
        const powerWattsNum = parseFloat(powerWatts);
        const electricityCostNum = parseFloat(electricityCost);
        const hardwareCostNum = hardwareCost ? parseFloat(hardwareCost) : undefined;

        if (!hashRate || hashRateNum <= 0 || !powerWatts || powerWattsNum <= 0) {
          set({ result: null, error: null });
          return;
        }

        if (electricityCostNum < 0) {
          set({ result: null, error: "Electricity cost cannot be negative" });
          return;
        }

        const calcResult = calculateMiningProfitability({
          hashRate: hashRateNum,
          hashRateUnit,
          powerWatts: powerWattsNum,
          electricityCost: electricityCostNum,
          currency,
          hardwareCost: hardwareCostNum,
        });
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () => set({ ...initialState, result: null }),
    };
  })
);
