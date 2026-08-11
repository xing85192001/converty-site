"use client";

import { create } from "zustand";
import { calculateHash, type HashAlgorithm, type HashResult } from "@/lib/converters/crypto/hash";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

export interface HashCalculatorState {
  // Input
  text: string;
  algorithm: HashAlgorithm;

  // Result
  result: HashResult | null;
  isCalculating: boolean;
  error: string | null;

  // Actions
  setText: (value: string) => void;
  setAlgorithm: (algorithm: HashAlgorithm) => void;
  calculate: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  text: "",
  algorithm: "SHA-256" as HashAlgorithm,
  result: null,
  isCalculating: false,
  error: null,
};

export const useHashCalculatorStore = create<HashCalculatorState>()(
  createUrlSyncMiddleware<HashCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      text: state.text,
      algorithm: state.algorithm,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedText = initialState.text;
    let loadedAlgorithm = initialState.algorithm;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedText = parseStringParam(urlParams.get("text") ?? null, initialState.text);
        const algoParam = parseStringParam(
          urlParams.get("algorithm") ?? null,
          initialState.algorithm
        );
        if (["MD5", "SHA-1", "SHA-256", "SHA-512"].includes(algoParam)) {
          loadedAlgorithm = algoParam as HashAlgorithm;
        }
      }
    }

    return {
      text: loadedText,
      algorithm: loadedAlgorithm,
      result: null,
      isCalculating: false,
      error: null,

      setText: (value: string) => {
        set({ text: value, error: null });
        // Auto-calculate when text changes
        if (value) {
          setTimeout(() => {
            get().calculate();
          }, 0);
        } else {
          set({ result: null });
        }
      },

      setAlgorithm: (algorithm: HashAlgorithm) => {
        set({ algorithm, error: null });
        // Re-calculate if text exists
        const { text } = get();
        if (text) {
          setTimeout(() => {
            get().calculate();
          }, 0);
        }
      },

      calculate: async () => {
        const { text, algorithm } = get();
        if (!text) {
          set({ result: null, error: null });
          return;
        }

        set({ isCalculating: true, error: null });

        try {
          const calcResult = await calculateHash(text, algorithm);
          if (calcResult.ok) {
            set({ result: calcResult.value, isCalculating: false });
          } else {
            set({ result: null, isCalculating: false, error: calcResult.error });
          }
        } catch (err) {
          set({
            result: null,
            isCalculating: false,
            error: err instanceof Error ? err.message : "Hash calculation failed",
          });
        }
      },

      reset: () => set({ ...initialState, result: null }),
    };
  })
);
