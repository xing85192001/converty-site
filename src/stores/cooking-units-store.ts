"use client";

import { create } from "zustand";
import { type CookingUnitResult, convertCookingUnit } from "@/lib/converters/cooking/cooking-units";
import type { CookingUnit } from "@/lib/converters/cooking/types";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface CookingUnitsState {
  // Input
  amount: number;
  fromUnit: CookingUnit;
  toUnit: CookingUnit;
  ingredientId: string;

  // Result
  result: CookingUnitResult | null;
  error: string | null;

  // Actions
  setAmount: (value: number) => void;
  setFromUnit: (unit: CookingUnit) => void;
  setToUnit: (unit: CookingUnit) => void;
  setIngredientId: (id: string) => void;
  swapUnits: () => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  amount: 1,
  fromUnit: "ml" as CookingUnit, // Metric first
  toUnit: "cup" as CookingUnit,
  ingredientId: "",
  result: null,
  error: null,
};

const VALID_UNITS: CookingUnit[] = [
  "ml",
  "l",
  "cup",
  "tbsp",
  "tsp",
  "fl-oz",
  "g",
  "kg",
  "oz",
  "lb",
];

export const useCookingUnitsStore = create<CookingUnitsState>()(
  createUrlSyncMiddleware<CookingUnitsState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      amount: state.amount,
      fromUnit: state.fromUnit,
      toUnit: state.toUnit,
      ingredientId: state.ingredientId,
    }),
  })((set, get) => {
    // Load initial values from URL params
    let loadedAmount = initialState.amount;
    let loadedFromUnit = initialState.fromUnit;
    let loadedToUnit = initialState.toUnit;
    let loadedIngredientId = initialState.ingredientId;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedAmount = parseNumberParam(urlParams.get("amount") ?? null, initialState.amount);

        const fromParam = parseStringParam(
          urlParams.get("fromUnit") ?? null,
          initialState.fromUnit
        );
        if (VALID_UNITS.includes(fromParam as CookingUnit)) {
          loadedFromUnit = fromParam as CookingUnit;
        }

        const toParam = parseStringParam(urlParams.get("toUnit") ?? null, initialState.toUnit);
        if (VALID_UNITS.includes(toParam as CookingUnit)) {
          loadedToUnit = toParam as CookingUnit;
        }

        loadedIngredientId = parseStringParam(
          urlParams.get("ingredientId") ?? null,
          initialState.ingredientId
        );
      }
    }

    return {
      amount: loadedAmount,
      fromUnit: loadedFromUnit,
      toUnit: loadedToUnit,
      ingredientId: loadedIngredientId,
      result: null,
      error: null,

      setAmount: (value: number) => {
        set({ amount: value, error: null });
        get().calculate();
      },

      setFromUnit: (unit: CookingUnit) => {
        set({ fromUnit: unit, error: null });
        get().calculate();
      },

      setToUnit: (unit: CookingUnit) => {
        set({ toUnit: unit, error: null });
        get().calculate();
      },

      setIngredientId: (id: string) => {
        set({ ingredientId: id, error: null });
        get().calculate();
      },

      swapUnits: () => {
        const { fromUnit, toUnit } = get();
        set({ fromUnit: toUnit, toUnit: fromUnit, error: null });
        get().calculate();
      },

      calculate: () => {
        const { amount, fromUnit, toUnit, ingredientId } = get();

        const calcResult = convertCookingUnit({
          amount,
          fromUnit,
          toUnit,
          ingredientId: ingredientId || undefined,
        });
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
