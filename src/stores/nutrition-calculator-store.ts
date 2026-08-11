"use client";

import { create } from "zustand";
import {
  calculateNutrition,
  type NutritionResult,
  type SelectedFood,
} from "@/lib/converters/cooking/nutrition-calculator";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";

export interface NutritionCalculatorState {
  // Input
  selectedFoods: SelectedFood[];
  searchQuery: string;

  // Result
  result: NutritionResult | null;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  addFood: (foodId: string) => void;
  updateFoodServings: (id: string, servings: number) => void;
  removeFood: (id: string) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  selectedFoods: [] as SelectedFood[],
  searchQuery: "",
  result: null,
  error: null,
};

export const useNutritionCalculatorStore = create<NutritionCalculatorState>()(
  createUrlSyncMiddleware<NutritionCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: () => ({
      // Don't sync complex arrays to URL - too complex for URL params
    }),
  })((set, get) => ({
    ...initialState,

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    addFood: (foodId: string) => {
      const { selectedFoods } = get();
      const newFood: SelectedFood = {
        id: crypto.randomUUID(),
        foodId,
        servings: 1, // Default 100g
      };
      set({ selectedFoods: [...selectedFoods, newFood], searchQuery: "" });
      get().calculate();
    },

    updateFoodServings: (id: string, servings: number) => {
      const { selectedFoods } = get();
      set({
        selectedFoods: selectedFoods.map((f) => (f.id === id ? { ...f, servings } : f)),
        error: null,
      });
      get().calculate();
    },

    removeFood: (id: string) => {
      const { selectedFoods } = get();
      set({ selectedFoods: selectedFoods.filter((f) => f.id !== id) });
      get().calculate();
    },

    calculate: () => {
      const { selectedFoods } = get();

      if (selectedFoods.length === 0) {
        set({ result: null, error: null });
        return;
      }

      const calcResult = calculateNutrition({ selectedFoods });
      if (calcResult.ok) {
        set({ result: calcResult.value, error: null });
      } else {
        set({ result: null, error: calcResult.error });
      }
    },

    reset: () => set({ ...initialState }),
  }))
);
