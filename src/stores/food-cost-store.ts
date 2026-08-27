"use client";

import { create } from "zustand";
import {
  type Currency,
  calculateFoodCost,
  type FoodCostResult,
  type IngredientCost,
} from "@/lib/converters/cooking/food-cost";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface FoodCostState {
  // Input
  recipeName: string;
  servings: number;
  currency: Currency;
  ingredients: IngredientCost[];

  // Result
  result: FoodCostResult | null;
  error: string | null;

  // Actions
  setRecipeName: (name: string) => void;
  setServings: (servings: number) => void;
  setCurrency: (currency: Currency) => void;
  addIngredient: () => void;
  updateIngredient: (id: string, updates: Partial<IngredientCost>) => void;
  removeIngredient: (id: string) => void;
  calculate: () => void;
  reset: () => void;
}

const createEmptyIngredient = (): IngredientCost => ({
  id: crypto.randomUUID(),
  name: "",
  costPerUnit: 0,
  unit: "kg",
  amountUsed: 0,
  amountUnit: "g",
});

const initialState = {
  recipeName: "",
  servings: 4,
  currency: "CHF" as Currency,
  ingredients: [createEmptyIngredient()],
  result: null,
  error: null,
};

export const useFoodCostStore = create<FoodCostState>()(
  createUrlSyncMiddleware<FoodCostState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      recipeName: state.recipeName,
      servings: state.servings,
      currency: state.currency,
      // Note: ingredients array is complex, not synced to URL
    }),
  })((set, get) => {
    // Load initial values from URL params
    let loadedRecipeName = initialState.recipeName;
    let loadedServings = initialState.servings;
    let loadedCurrency = initialState.currency;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedRecipeName = parseStringParam(
          urlParams.get("recipeName") ?? null,
          initialState.recipeName
        );
        loadedServings = parseNumberParam(urlParams.get("servings") ?? null, initialState.servings);
        const currencyParam = parseStringParam(
          urlParams.get("currency") ?? null,
          initialState.currency
        );
        if (["CHF", "EUR", "USD"].includes(currencyParam)) {
          loadedCurrency = currencyParam as Currency;
        }
      }
    }

    return {
      recipeName: loadedRecipeName,
      servings: loadedServings,
      currency: loadedCurrency,
      ingredients: [createEmptyIngredient()],
      result: null,
      error: null,

      setRecipeName: (name: string) => {
        set({ recipeName: name, error: null });
      },

      setServings: (servings: number) => {
        set({ servings, error: null });
        get().calculate();
      },

      setCurrency: (currency: Currency) => {
        set({ currency, error: null });
        get().calculate();
      },

      addIngredient: () => {
        const { ingredients } = get();
        set({ ingredients: [...ingredients, createEmptyIngredient()] });
      },

      updateIngredient: (id: string, updates: Partial<IngredientCost>) => {
        const { ingredients } = get();
        set({
          ingredients: ingredients.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing)),
          error: null,
        });
        // Auto-calculate when ingredient changes
        setTimeout(() => get().calculate(), 0);
      },

      removeIngredient: (id: string) => {
        const { ingredients } = get();
        if (ingredients.length <= 1) {
          // Keep at least one ingredient row
          set({ ingredients: [createEmptyIngredient()] });
        } else {
          set({ ingredients: ingredients.filter((ing) => ing.id !== id) });
        }
        get().calculate();
      },

      calculate: () => {
        const { recipeName, servings, currency, ingredients } = get();

        // Filter out empty ingredients
        const validIngredients = ingredients.filter(
          (ing) => ing.name && ing.costPerUnit > 0 && ing.amountUsed > 0
        );

        if (validIngredients.length === 0) {
          set({ result: null, error: null });
          return;
        }

        const calcResult = calculateFoodCost({
          recipeName: recipeName || "Untitled Recipe",
          servings,
          currency,
          ingredients: validIngredients,
        });
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () => set({ ...initialState, ingredients: [createEmptyIngredient()] }),
    };
  })
);
