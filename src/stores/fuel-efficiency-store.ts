"use client";

import { create } from "zustand";
import {
  type CalculationMode,
  calculateFuelEfficiency,
  type FuelEfficiencyInput,
  type FuelEfficiencyResult,
} from "@/lib/converters/automotive/fuel-efficiency";
import type { Currency } from "@/lib/converters/automotive/types";
import swissFuelPrices from "@/lib/data/swiss-fuel-prices.json";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface FuelEfficiencyState {
  // Input
  mode: CalculationMode;
  distanceKm: number;
  fuelLiters: number;
  tripDistanceKm: number;
  consumptionLPer100km: number;
  vehicle1LPer100km: number;
  vehicle2LPer100km: number;
  comparisonDistanceKm: number;
  fuelPricePerLiter: number;
  currency: Currency;
  annualDistanceKm: number;

  // Result
  result: FuelEfficiencyResult | null;
  error: string | null;

  // Actions
  setMode: (mode: CalculationMode) => void;
  setDistanceKm: (value: number) => void;
  setFuelLiters: (value: number) => void;
  setTripDistanceKm: (value: number) => void;
  setConsumptionLPer100km: (value: number) => void;
  setVehicle1LPer100km: (value: number) => void;
  setVehicle2LPer100km: (value: number) => void;
  setComparisonDistanceKm: (value: number) => void;
  setFuelPricePerLiter: (value: number) => void;
  setCurrency: (currency: Currency) => void;
  setAnnualDistanceKm: (value: number) => void;
  calculate: () => void;
  reset: () => void;
}

const defaultFuelPrice = swissFuelPrices.prices.CHF.petrol_95;

const initialState = {
  mode: "consumption" as CalculationMode,
  distanceKm: 500,
  fuelLiters: 40,
  tripDistanceKm: 300,
  consumptionLPer100km: 7.5,
  vehicle1LPer100km: 8,
  vehicle2LPer100km: 6,
  comparisonDistanceKm: 15000,
  fuelPricePerLiter: defaultFuelPrice,
  currency: "CHF" as Currency,
  annualDistanceKm: 15000,
  result: null,
  error: null,
};

const VALID_MODES: CalculationMode[] = ["consumption", "tripPlanning", "comparison"];
const VALID_CURRENCIES: Currency[] = ["CHF", "EUR"];

export const useFuelEfficiencyStore = create<FuelEfficiencyState>()(
  createUrlSyncMiddleware<FuelEfficiencyState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      mode: state.mode,
      distanceKm: state.distanceKm,
      fuelLiters: state.fuelLiters,
      tripDistanceKm: state.tripDistanceKm,
      consumptionLPer100km: state.consumptionLPer100km,
      vehicle1LPer100km: state.vehicle1LPer100km,
      vehicle2LPer100km: state.vehicle2LPer100km,
      fuelPricePerLiter: state.fuelPricePerLiter,
      currency: state.currency,
      annualDistanceKm: state.annualDistanceKm,
    }),
  })((set, get) => {
    // Load initial values from URL params
    const loaded = { ...initialState };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const modeParam = parseStringParam(urlParams.get("mode") ?? null, initialState.mode);
        if (VALID_MODES.includes(modeParam as CalculationMode)) {
          loaded.mode = modeParam as CalculationMode;
        }

        const currencyParam = parseStringParam(
          urlParams.get("currency") ?? null,
          initialState.currency
        );
        if (VALID_CURRENCIES.includes(currencyParam as Currency)) {
          loaded.currency = currencyParam as Currency;
        }

        loaded.distanceKm = parseNumberParam(
          urlParams.get("distanceKm") ?? null,
          initialState.distanceKm
        );
        loaded.fuelLiters = parseNumberParam(
          urlParams.get("fuelLiters") ?? null,
          initialState.fuelLiters
        );
        loaded.tripDistanceKm = parseNumberParam(
          urlParams.get("tripDistanceKm") ?? null,
          initialState.tripDistanceKm
        );
        loaded.consumptionLPer100km = parseNumberParam(
          urlParams.get("consumptionLPer100km") ?? null,
          initialState.consumptionLPer100km
        );
        loaded.vehicle1LPer100km = parseNumberParam(
          urlParams.get("vehicle1LPer100km") ?? null,
          initialState.vehicle1LPer100km
        );
        loaded.vehicle2LPer100km = parseNumberParam(
          urlParams.get("vehicle2LPer100km") ?? null,
          initialState.vehicle2LPer100km
        );
        loaded.fuelPricePerLiter = parseNumberParam(
          urlParams.get("fuelPricePerLiter") ?? null,
          initialState.fuelPricePerLiter
        );
        loaded.annualDistanceKm = parseNumberParam(
          urlParams.get("annualDistanceKm") ?? null,
          initialState.annualDistanceKm
        );
      }
    }

    return {
      ...loaded,

      setMode: (mode: CalculationMode) => {
        set({ mode, error: null });
        get().calculate();
      },

      setDistanceKm: (value: number) => {
        set({ distanceKm: value, error: null });
        get().calculate();
      },

      setFuelLiters: (value: number) => {
        set({ fuelLiters: value, error: null });
        get().calculate();
      },

      setTripDistanceKm: (value: number) => {
        set({ tripDistanceKm: value, error: null });
        get().calculate();
      },

      setConsumptionLPer100km: (value: number) => {
        set({ consumptionLPer100km: value, error: null });
        get().calculate();
      },

      setVehicle1LPer100km: (value: number) => {
        set({ vehicle1LPer100km: value, error: null });
        get().calculate();
      },

      setVehicle2LPer100km: (value: number) => {
        set({ vehicle2LPer100km: value, error: null });
        get().calculate();
      },

      setComparisonDistanceKm: (value: number) => {
        set({ comparisonDistanceKm: value, error: null });
        get().calculate();
      },

      setFuelPricePerLiter: (value: number) => {
        set({ fuelPricePerLiter: value, error: null });
        get().calculate();
      },

      setCurrency: (currency: Currency) => {
        // Update fuel price to match new currency
        const prices = swissFuelPrices.prices[currency];
        set({
          currency,
          fuelPricePerLiter: prices.petrol_95,
          error: null,
        });
        get().calculate();
      },

      setAnnualDistanceKm: (value: number) => {
        set({ annualDistanceKm: value, error: null });
        get().calculate();
      },

      calculate: () => {
        const state = get();

        const input: FuelEfficiencyInput = {
          mode: state.mode,
          distanceKm: state.distanceKm,
          fuelLiters: state.fuelLiters,
          tripDistanceKm: state.tripDistanceKm,
          consumptionLPer100km: state.consumptionLPer100km,
          vehicle1LPer100km: state.vehicle1LPer100km,
          vehicle2LPer100km: state.vehicle2LPer100km,
          comparisonDistanceKm: state.comparisonDistanceKm,
          fuelPricePerLiter: state.fuelPricePerLiter,
          currency: state.currency,
          annualDistanceKm: state.annualDistanceKm,
        };

        const calcResult = calculateFuelEfficiency(input);
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
