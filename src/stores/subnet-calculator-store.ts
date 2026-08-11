"use client";

import { create } from "zustand";
import { parseIPInput } from "@/lib/converters/network/ip-parser";
import { calculateSubnet } from "@/lib/converters/network/subnet-calculator";
import { divideSubnet } from "@/lib/converters/network/subnetting";
import { aggregateNetworks } from "@/lib/converters/network/supernetting";
import type {
  CalculatorMode,
  DivisionCount,
  SubnetDivision,
  SubnetResult,
  SupernetPayload,
} from "@/lib/converters/network/types";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

/**
 * Subnet calculator state interface
 */
export interface SubnetCalculatorState {
  // Inputs
  ipInput: string;
  subnetMask: string;

  // Results
  result: SubnetResult | null;
  error: string | null;

  // Mode switching
  mode: CalculatorMode;

  // Subnetting state
  divisionCount: DivisionCount;
  subnetDivision: SubnetDivision | null;

  // Supernetting state
  networksInput: string; // Textarea input for multiple networks
  supernetResult: SupernetPayload | null;

  // Actions
  setIPInput: (value: string) => void;
  setSubnetMask: (value: string) => void;
  calculate: () => void;
  reset: () => void;

  // Mode action
  setMode: (mode: CalculatorMode) => void;

  // Subnetting actions
  setDivisionCount: (count: DivisionCount) => void;
  performDivision: () => void;

  // Supernetting actions
  setNetworksInput: (value: string) => void;
  performAggregation: () => void;
}

/**
 * Initial state for subnet calculator
 */
const initialState = {
  ipInput: "",
  subnetMask: "",
  result: null,
  error: null,
  mode: "basic" as CalculatorMode,
  divisionCount: 2 as DivisionCount,
  subnetDivision: null,
  networksInput: "",
  supernetResult: null,
};

/**
 * Zustand store for subnet calculator with URL synchronization
 *
 * Features:
 * - URL state sync for shareability
 * - Auto-calculation on complete input
 * - Support for CIDR notation (192.168.1.0/24) and subnet mask notation
 * - IPv4 and IPv6 support
 */
export const useSubnetCalculatorStore = create<SubnetCalculatorState>()(
  createUrlSyncMiddleware<SubnetCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      ipInput: state.ipInput,
      subnetMask: state.subnetMask,
      mode: state.mode,
      divisionCount: state.divisionCount,
      networksInput: state.networksInput,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedIpInput = initialState.ipInput;
    let loadedSubnetMask = initialState.subnetMask;
    let loadedMode = initialState.mode;
    let loadedDivisionCount = initialState.divisionCount;
    let loadedNetworksInput = initialState.networksInput;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedIpInput = parseStringParam(urlParams.get("ipInput") ?? null, initialState.ipInput);
        loadedSubnetMask = parseStringParam(
          urlParams.get("subnetMask") ?? null,
          initialState.subnetMask
        );
        loadedMode = parseStringParam(
          urlParams.get("mode") ?? null,
          initialState.mode
        ) as CalculatorMode;
        loadedDivisionCount = parseNumberParam(
          urlParams.get("divisionCount") ?? null,
          initialState.divisionCount
        ) as DivisionCount;
        loadedNetworksInput = parseStringParam(
          urlParams.get("networksInput") ?? null,
          initialState.networksInput
        );
      }
    }

    return {
      // Initialize with URL params if present
      ipInput: loadedIpInput,
      subnetMask: loadedSubnetMask,
      result: null,
      error: null,
      mode: loadedMode,
      divisionCount: loadedDivisionCount,
      subnetDivision: null,
      networksInput: loadedNetworksInput,
      supernetResult: null,

      setIPInput: (value: string) => {
        set({ ipInput: value, error: null });

        // Auto-calculate if input contains "/" (CIDR notation complete)
        if (value.includes("/") && value.split("/")[1]) {
          // Use setTimeout to ensure state is updated before calculation
          setTimeout(() => {
            get().calculate();
          }, 0);
        }
      },

      setSubnetMask: (value: string) => {
        set({ subnetMask: value, error: null });

        // Auto-calculate if both ipInput and subnetMask present
        const currentIpInput = get().ipInput;
        if (currentIpInput && value) {
          // Use setTimeout to ensure state is updated before calculation
          setTimeout(() => {
            get().calculate();
          }, 0);
        }
      },

      calculate: () => {
        const { ipInput, subnetMask } = get();

        // Skip if no input
        if (!ipInput) {
          set({ result: null, error: null });
          return;
        }

        try {
          // Parse input (handles both CIDR and subnet mask notation)
          const parsed = parseIPInput(ipInput, subnetMask || undefined);

          // Calculate subnet
          const result = calculateSubnet(parsed.ipAddress, parsed.cidr);

          // Set result, clear error
          set({ result, error: null });
        } catch (err) {
          // Set error message, clear result
          set({
            result: null,
            error: err instanceof Error ? err.message : "Invalid input",
          });
        }
      },

      reset: () => {
        set({
          ...initialState,
          // Clear all results
          result: null,
          subnetDivision: null,
          supernetResult: null,
        });
      },

      setMode: (mode: CalculatorMode) => {
        set({ mode, error: null });
      },

      setDivisionCount: (count: DivisionCount) => {
        set({ divisionCount: count, error: null });
      },

      performDivision: () => {
        const { result, divisionCount } = get();

        // Need a basic calculation result first
        if (!result) {
          set({ error: "Calculate a subnet first", subnetDivision: null });
          return;
        }

        try {
          const division = divideSubnet(result.networkAddress, result.cidr, divisionCount);
          set({ subnetDivision: division, error: null });
        } catch (err) {
          set({
            subnetDivision: null,
            error: err instanceof Error ? err.message : "Division failed",
          });
        }
      },

      setNetworksInput: (value: string) => {
        set({ networksInput: value, error: null });
      },

      performAggregation: () => {
        const { networksInput } = get();

        if (!networksInput.trim()) {
          set({ error: "Enter networks to aggregate", supernetResult: null });
          return;
        }

        // Parse textarea input: split by newlines, commas, or semicolons
        const networks = networksInput
          .split(/[\n,;]+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (networks.length < 2) {
          set({ error: "Enter at least 2 networks", supernetResult: null });
          return;
        }

        const result = aggregateNetworks(networks);

        if (result.ok) {
          set({ supernetResult: result.value, error: null });
        } else {
          set({
            supernetResult: null,
            error: result.error || "Aggregation failed",
          });
        }
      },
    };
  })
);
