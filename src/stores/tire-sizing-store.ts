"use client";

import { create } from "zustand";
import {
  calculateTireDimensions,
  compareTireSizes,
  type TireComparisonResult,
  type TireDimensionsResult,
  type TireSizeComponents,
} from "@/lib/converters/automotive/tire-sizing";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import {
  getUrlParams,
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from "@/lib/utils/url-params";

export type InputMode = "notation" | "manual";

export interface TireSizingState {
  // Input mode
  inputMode: InputMode;

  // Notation input
  tire1Notation: string;
  tire2Notation: string;

  // Manual input (tire 1)
  tire1Width: number;
  tire1AspectRatio: number;
  tire1RimDiameter: number;
  tire1LoadIndex: string;
  tire1SpeedRating: string;

  // Manual input (tire 2)
  tire2Width: number;
  tire2AspectRatio: number;
  tire2RimDiameter: number;

  // Comparison mode
  compareMode: boolean;

  // Results
  tire1Result: TireDimensionsResult | null;
  tire2Result: TireDimensionsResult | null;
  comparisonResult: TireComparisonResult | null;
  error: string | null;

  // Actions
  setInputMode: (mode: InputMode) => void;
  setTire1Notation: (notation: string) => void;
  setTire2Notation: (notation: string) => void;
  setTire1Width: (value: number) => void;
  setTire1AspectRatio: (value: number) => void;
  setTire1RimDiameter: (value: number) => void;
  setTire1LoadIndex: (value: string) => void;
  setTire1SpeedRating: (value: string) => void;
  setTire2Width: (value: number) => void;
  setTire2AspectRatio: (value: number) => void;
  setTire2RimDiameter: (value: number) => void;
  setCompareMode: (enabled: boolean) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  inputMode: "notation" as InputMode,
  tire1Notation: "205/55R16",
  tire2Notation: "215/60R16",
  tire1Width: 205,
  tire1AspectRatio: 55,
  tire1RimDiameter: 16,
  tire1LoadIndex: "91",
  tire1SpeedRating: "V",
  tire2Width: 215,
  tire2AspectRatio: 60,
  tire2RimDiameter: 16,
  compareMode: false,
  tire1Result: null,
  tire2Result: null,
  comparisonResult: null,
  error: null,
};

export const useTireSizingStore = create<TireSizingState>()(
  createUrlSyncMiddleware<TireSizingState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      inputMode: state.inputMode,
      tire1Notation: state.tire1Notation,
      tire2Notation: state.tire2Notation,
      tire1Width: state.tire1Width,
      tire1AspectRatio: state.tire1AspectRatio,
      tire1RimDiameter: state.tire1RimDiameter,
      tire1LoadIndex: state.tire1LoadIndex,
      tire1SpeedRating: state.tire1SpeedRating,
      compareMode: state.compareMode,
    }),
  })((set, get) => {
    // Load initial values from URL params
    const loaded = { ...initialState };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const modeParam = parseStringParam(
          urlParams.get("inputMode") ?? null,
          initialState.inputMode
        );
        if (modeParam === "notation" || modeParam === "manual") {
          loaded.inputMode = modeParam;
        }

        loaded.tire1Notation = parseStringParam(
          urlParams.get("tire1Notation") ?? null,
          initialState.tire1Notation
        );
        loaded.tire2Notation = parseStringParam(
          urlParams.get("tire2Notation") ?? null,
          initialState.tire2Notation
        );
        loaded.tire1Width = parseNumberParam(
          urlParams.get("tire1Width") ?? null,
          initialState.tire1Width
        );
        loaded.tire1AspectRatio = parseNumberParam(
          urlParams.get("tire1AspectRatio") ?? null,
          initialState.tire1AspectRatio
        );
        loaded.tire1RimDiameter = parseNumberParam(
          urlParams.get("tire1RimDiameter") ?? null,
          initialState.tire1RimDiameter
        );
        loaded.tire1LoadIndex = parseStringParam(
          urlParams.get("tire1LoadIndex") ?? null,
          initialState.tire1LoadIndex
        );
        loaded.tire1SpeedRating = parseStringParam(
          urlParams.get("tire1SpeedRating") ?? null,
          initialState.tire1SpeedRating
        );
        loaded.compareMode = parseBooleanParam(
          urlParams.get("compareMode") ?? null,
          initialState.compareMode
        );
      }
    }

    return {
      ...loaded,

      setInputMode: (mode: InputMode) => {
        set({ inputMode: mode, error: null });
        get().calculate();
      },

      setTire1Notation: (notation: string) => {
        set({ tire1Notation: notation, error: null });
        get().calculate();
      },

      setTire2Notation: (notation: string) => {
        set({ tire2Notation: notation, error: null });
        get().calculate();
      },

      setTire1Width: (value: number) => {
        set({ tire1Width: value, error: null });
        get().calculate();
      },

      setTire1AspectRatio: (value: number) => {
        set({ tire1AspectRatio: value, error: null });
        get().calculate();
      },

      setTire1RimDiameter: (value: number) => {
        set({ tire1RimDiameter: value, error: null });
        get().calculate();
      },

      setTire1LoadIndex: (value: string) => {
        set({ tire1LoadIndex: value, error: null });
        get().calculate();
      },

      setTire1SpeedRating: (value: string) => {
        set({ tire1SpeedRating: value, error: null });
        get().calculate();
      },

      setTire2Width: (value: number) => {
        set({ tire2Width: value, error: null });
        get().calculate();
      },

      setTire2AspectRatio: (value: number) => {
        set({ tire2AspectRatio: value, error: null });
        get().calculate();
      },

      setTire2RimDiameter: (value: number) => {
        set({ tire2RimDiameter: value, error: null });
        get().calculate();
      },

      setCompareMode: (enabled: boolean) => {
        set({ compareMode: enabled, error: null });
        get().calculate();
      },

      calculate: () => {
        const state = get();

        let tire1Input: TireSizeComponents | string;

        if (state.inputMode === "notation") {
          tire1Input = state.tire1Notation;
        } else {
          tire1Input = {
            width: state.tire1Width,
            aspectRatio: state.tire1AspectRatio,
            construction: "R" as const,
            rimDiameter: state.tire1RimDiameter,
            loadIndex: state.tire1LoadIndex ? parseInt(state.tire1LoadIndex, 10) : undefined,
            speedRating: state.tire1SpeedRating || undefined,
            notation: `${state.tire1Width}/${state.tire1AspectRatio}R${state.tire1RimDiameter}`,
          };
        }

        const tire1CalcResult = calculateTireDimensions(tire1Input);

        if (!tire1CalcResult.ok) {
          set({
            tire1Result: null,
            tire2Result: null,
            comparisonResult: null,
            error: "Invalid tire size format. Use format: 205/55R16 or 205/55R16 91V",
          });
          return;
        }

        set({ tire1Result: tire1CalcResult.value, error: null });

        // Comparison mode
        if (state.compareMode) {
          const comparisonCalcResult = compareTireSizes(tire1Input, state.tire2Notation);

          if (!comparisonCalcResult.ok) {
            set({
              tire2Result: null,
              comparisonResult: null,
              error: "Invalid comparison tire size. Use format: 205/55R16",
            });
            return;
          }

          set({
            tire2Result: comparisonCalcResult.value.tire2,
            comparisonResult: comparisonCalcResult.value,
            error: null,
          });
        } else {
          set({
            tire2Result: null,
            comparisonResult: null,
          });
        }
      },

      reset: () => set({ ...initialState }),
    };
  })
);
