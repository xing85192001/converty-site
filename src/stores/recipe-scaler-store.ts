"use client";

import { create } from "zustand";
import {
  type RecipeIngredient,
  type RecipeScaleResult,
  scaleRecipe,
} from "@/lib/converters/cooking/recipe-scaler";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface RecipeScalerState {
  // Input
  recipeName: string;
  originalServings: number;
  desiredServings: number;
  ingredients: RecipeIngredient[];

  // Result
  result: RecipeScaleResult | null;
  error: string | null;

  // Actions
  setRecipeName: (name: string) => void;
  setOriginalServings: (servings: number) => void;
  setDesiredServings: (servings: number) => void;
  addIngredient: () => void;
  updateIngredient: (id: string, updates: Partial<RecipeIngredient>) => void;
  removeIngredient: (id: string) => void;
  calculate: () => void;
  reset: () => void;
}

const createEmptyIngredient = (): RecipeIngredient => ({
  id: crypto.randomUUID(),
  name: "",
  amount: 0,
  unit: "g",
  type: "standard",
});

const initialState = {
  recipeName: "",
  originalServings: 4,
  desiredServings: 8,
  ingredients: [createEmptyIngredient()],
  result: null,
  error: null,
};

export const useRecipeScalerStore = create<RecipeScalerState>()(
  createUrlSyncMiddleware<RecipeScalerState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      recipeName: state.recipeName,
      originalServings: state.originalServings,
      desiredServings: state.desiredServings,
      // Note: ingredients array is complex, not synced to URL
    }),
  })((set, get) => {
    // Load initial values from URL params
    let loadedRecipeName = initialState.recipeName;
    let loadedOriginalServings = initialState.originalServings;
    let loadedDesiredServings = initialState.desiredServings;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedRecipeName = parseStringParam(
          urlParams.get("recipeName") ?? null,
          initialState.recipeName
        );
        loadedOriginalServings = parseNumberParam(
          urlParams.get("originalServings") ?? null,
          initialState.originalServings
        );
        loadedDesiredServings = parseNumberParam(
          urlParams.get("desiredServings") ?? null,
          initialState.desiredServings
        );
      }
    }

    return {
      recipeName: loadedRecipeName,
      originalServings: loadedOriginalServings,
      desiredServings: loadedDesiredServings,
      ingredients: [createEmptyIngredient()],
      result: null,
      error: null,

      setRecipeName: (name: string) => {
        set({ recipeName: name, error: null });
      },

      setOriginalServings: (servings: number) => {
        set({ originalServings: servings, error: null });
        get().calculate();
      },

      setDesiredServings: (servings: number) => {
        set({ desiredServings: servings, error: null });
        get().calculate();
      },

      addIngredient: () => {
        const { ingredients } = get();
        set({ ingredients: [...ingredients, createEmptyIngredient()] });
      },

      updateIngredient: (id: string, updates: Partial<RecipeIngredient>) => {
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
        const { recipeName, originalServings, desiredServings, ingredients } = get();

        // Filter out empty ingredients
        const validIngredients = ingredients.filter((ing) => ing.name && ing.amount > 0);

        if (validIngredients.length === 0) {
          set({ result: null, error: null });
          return;
        }

        const calcResult = scaleRecipe({
          recipeName: recipeName || "Untitled Recipe",
          originalServings,
          desiredServings,
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
