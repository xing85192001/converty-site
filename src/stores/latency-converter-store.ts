"use client";

import { create } from "zustand";
import { convertLatency, type LatencyResult } from "@/lib/converters/network/latency-converter";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

/**
 * Latency converter state interface
 */
export interface LatencyConverterState {
  // Input
  value: string;
  unit: string;

  // Result
  result: LatencyResult | null;
  error: string | null;

  // Actions
  setValue: (value: string) => void;
  setUnit: (unit: string) => void;
  calculate: () => void;
  reset: () => void;
}

/**
 * Zustand store for latency converter with URL synchronization
 *
 * Features:
 * - URL state sync for shareability
 * - Auto-calculation on valid input detection
 * - Latency unit conversion (s, ms, μs, ns)
 * - Latency category and use case classification
 */
export const useLatencyConverterStore = create<LatencyConverterState>()(
  createUrlSyncMiddleware<LatencyConverterState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      value: state.value,
      unit: state.unit,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    const params = getUrlParams();
    const initialValue = parseStringParam(params.get("value") ?? null, "");
    const initialUnit = parseStringParam(params.get("unit") ?? null, "ms");

    return {
      // Initialize with URL params or defaults
      value: initialValue,
      unit: initialUnit,
      result: null,
      error: null,

      setValue: (value: string) => {
        set({ value, error: null });

        // Auto-calculate on valid input
        const numValue = Number.parseFloat(value);
        if (!Number.isNaN(numValue) && numValue > 0) {
          setTimeout(() => get().calculate(), 0);
        } else {
          set({ result: null });
        }
      },

      setUnit: (unit: string) => {
        set({ unit });

        // Re-calculate if value exists
        const { value } = get();
        if (value) {
          setTimeout(() => get().calculate(), 0);
        }
      },

      calculate: () => {
        const { value, unit } = get();
        const numValue = Number.parseFloat(value);

        if (Number.isNaN(numValue) || numValue <= 0) {
          set({ result: null, error: null });
          return;
        }

        const calcResult = convertLatency(numValue, unit);
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () => set({ value: "", unit: "ms", result: null, error: null }),
    };
  })
);
