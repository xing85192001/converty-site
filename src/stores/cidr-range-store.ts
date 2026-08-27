"use client";

import { create } from "zustand";
import {
  type CIDRRangeResult,
  calculateCIDRRange,
  checkIPInRange,
  type IPInRangeResult,
} from "@/lib/converters/network/cidr-range";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

/**
 * CIDR range calculator state interface
 */
export interface CIDRRangeState {
  // Inputs
  cidrInput: string;
  ipToCheck: string; // Optional IP to check if in range

  // Results
  rangeResult: CIDRRangeResult | null;
  checkResult: IPInRangeResult | null;
  error: string | null;

  // Actions
  setCIDRInput: (value: string) => void;
  setIPToCheck: (value: string) => void;
  calculateRange: () => void;
  checkIP: () => void;
  reset: () => void;
}

/**
 * Initial state for CIDR range calculator
 */
const initialState = {
  cidrInput: "",
  ipToCheck: "",
  rangeResult: null,
  checkResult: null,
  error: null,
};

/**
 * Zustand store for CIDR range calculator with URL synchronization
 *
 * Features:
 * - URL state sync for shareability
 * - Auto-calculation on complete CIDR input
 * - Auto-check when both CIDR and IP present
 * - IPv4 and IPv6 support
 */
export const useCIDRRangeStore = create<CIDRRangeState>()(
  createUrlSyncMiddleware<CIDRRangeState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      cidrInput: state.cidrInput,
      ipToCheck: state.ipToCheck,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedCidrInput = initialState.cidrInput;
    let loadedIpToCheck = initialState.ipToCheck;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedCidrInput = parseStringParam(
          urlParams.get("cidrInput") ?? null,
          initialState.cidrInput
        );
        loadedIpToCheck = parseStringParam(
          urlParams.get("ipToCheck") ?? null,
          initialState.ipToCheck
        );
      }
    }

    return {
      // Initialize with URL params if present
      cidrInput: loadedCidrInput,
      ipToCheck: loadedIpToCheck,
      rangeResult: null,
      checkResult: null,
      error: null,

      setCIDRInput: (value: string) => {
        set({ cidrInput: value, error: null });

        // Auto-calculate if input contains "/" (CIDR notation complete)
        if (value.includes("/") && value.split("/")[1]) {
          // Use setTimeout to ensure state is updated before calculation
          setTimeout(() => {
            get().calculateRange();

            // Also auto-check IP if ipToCheck is present
            const currentIpToCheck = get().ipToCheck;
            if (currentIpToCheck) {
              get().checkIP();
            }
          }, 0);
        }
      },

      setIPToCheck: (value: string) => {
        set({ ipToCheck: value, error: null });

        // Auto-check if both CIDR result exists and IP is provided
        const currentRangeResult = get().rangeResult;
        if (currentRangeResult && value) {
          // Use setTimeout to ensure state is updated before check
          setTimeout(() => {
            get().checkIP();
          }, 0);
        }
      },

      calculateRange: () => {
        const { cidrInput } = get();

        // Skip if no input
        if (!cidrInput) {
          set({ rangeResult: null, error: null });
          return;
        }

        try {
          // Calculate CIDR range
          const rangeResult = calculateCIDRRange(cidrInput);

          // Set result, clear error
          set({ rangeResult, error: null });
        } catch (err) {
          // Set error message, clear result
          set({
            rangeResult: null,
            checkResult: null,
            error: err instanceof Error ? err.message : "Invalid CIDR",
          });
        }
      },

      checkIP: () => {
        const { cidrInput, ipToCheck } = get();

        // Skip if either input is missing
        if (!cidrInput || !ipToCheck) {
          set({ checkResult: null });
          return;
        }

        try {
          // Check if IP is in range
          const checkResult = checkIPInRange(ipToCheck, cidrInput);

          // Set result, clear error
          set({ checkResult, error: null });
        } catch (err) {
          // Set error message, clear check result
          set({
            checkResult: null,
            error: err instanceof Error ? err.message : "Invalid IP or CIDR",
          });
        }
      },

      reset: () => {
        set({
          ...initialState,
          rangeResult: null,
          checkResult: null,
        });
      },
    };
  })
);
