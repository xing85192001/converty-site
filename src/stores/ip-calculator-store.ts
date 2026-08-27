"use client";

import { create } from "zustand";
import { classifyIPAddress, type IPClassification } from "@/lib/converters/network/ip-classifier";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

/**
 * IP calculator state interface
 */
export interface IPCalculatorState {
  // Input
  ipInput: string;

  // Result
  result: IPClassification | null;
  error: string | null;

  // Actions
  setIPInput: (value: string) => void;
  calculate: () => void;
  reset: () => void;
}

/**
 * Initial state for IP calculator
 */
const initialState = {
  ipInput: "",
  result: null,
  error: null,
};

/**
 * Zustand store for IP calculator with URL synchronization
 *
 * Features:
 * - URL state sync for shareability
 * - Auto-calculation on valid IP detection
 * - IPv4 and IPv6 support
 * - IP class detection (A-E for IPv4)
 * - Public/private/special range identification
 */
export const useIPCalculatorStore = create<IPCalculatorState>()(
  createUrlSyncMiddleware<IPCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      ipInput: state.ipInput,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedIpInput = initialState.ipInput;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedIpInput = parseStringParam(urlParams.get("ipInput") ?? null, initialState.ipInput);
      }
    }

    return {
      // Initialize with URL params if present
      ipInput: loadedIpInput,
      result: null,
      error: null,

      setIPInput: (value: string) => {
        set({ ipInput: value, error: null });

        // Auto-calculate if input looks like a valid IP
        // Use setTimeout to ensure state is updated before calculation
        if (value.trim()) {
          setTimeout(() => {
            get().calculate();
          }, 0);
        } else {
          // Clear result if input is empty
          set({ result: null });
        }
      },

      calculate: () => {
        const { ipInput } = get();

        // Skip if no input
        if (!ipInput.trim()) {
          set({ result: null, error: null });
          return;
        }

        try {
          // Classify IP address
          const result = classifyIPAddress(ipInput.trim());

          // Set result, clear error
          set({ result, error: null });
        } catch (err) {
          // Set error message, clear result
          set({
            result: null,
            error: err instanceof Error ? err.message : "Invalid IP address",
          });
        }
      },

      reset: () => {
        set({
          ...initialState,
          result: null,
        });
      },
    };
  })
);
