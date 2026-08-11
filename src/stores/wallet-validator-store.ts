"use client";

import { create } from "zustand";
import {
  validateWalletAddress,
  type WalletType,
  type WalletValidationResult,
} from "@/lib/converters/crypto/wallet-validator";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

export interface WalletValidatorState {
  // Input
  address: string;
  walletType: WalletType;

  // Result
  result: WalletValidationResult | null;
  error: string | null;

  // Actions
  setAddress: (value: string) => void;
  setWalletType: (walletType: WalletType) => void;
  validate: () => void;
  reset: () => void;
}

const initialState = {
  address: "",
  walletType: "BTC" as WalletType,
  result: null,
  error: null,
};

export const useWalletValidatorStore = create<WalletValidatorState>()(
  createUrlSyncMiddleware<WalletValidatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      address: state.address,
      walletType: state.walletType,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedAddress = initialState.address;
    let loadedWalletType = initialState.walletType;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedAddress = parseStringParam(urlParams.get("address") ?? null, initialState.address);
        const typeParam = parseStringParam(
          urlParams.get("walletType") ?? null,
          initialState.walletType
        );
        if (["BTC", "ETH", "LTC"].includes(typeParam)) {
          loadedWalletType = typeParam as WalletType;
        }
      }
    }

    return {
      address: loadedAddress,
      walletType: loadedWalletType,
      result: null,
      error: null,

      setAddress: (value: string) => {
        set({ address: value, error: null });
        // Auto-validate when address changes
        if (value.trim()) {
          // Use setTimeout to avoid synchronous validation during render
          setTimeout(() => {
            get().validate();
          }, 0);
        } else {
          set({ result: null });
        }
      },

      setWalletType: (walletType: WalletType) => {
        set({ walletType, error: null });
        // Re-validate if address exists
        const { address } = get();
        if (address.trim()) {
          setTimeout(() => {
            get().validate();
          }, 0);
        }
      },

      validate: () => {
        const { address, walletType } = get();
        if (!address.trim()) {
          set({ result: null, error: null });
          return;
        }

        const calcResult = validateWalletAddress(address, walletType);
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () => set({ ...initialState, result: null }),
    };
  })
);
