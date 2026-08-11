"use client";

import { create } from "zustand";
import {
  calculateThroughput,
  type ThroughputResult,
} from "@/lib/converters/network/throughput-calculator";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

/**
 * Throughput calculator state interface
 */
export interface ThroughputCalculatorState {
  // Inputs
  dataSize: string;
  dataSizeUnit: string;
  transferTime: string;
  transferTimeUnit: string;

  // Result
  result: ThroughputResult | null;
  error: string | null;

  // Actions
  setDataSize: (value: string) => void;
  setDataSizeUnit: (unit: string) => void;
  setTransferTime: (value: string) => void;
  setTransferTimeUnit: (unit: string) => void;
  calculate: () => void;
  reset: () => void;
}

/**
 * Zustand store for throughput calculator with URL synchronization
 *
 * Features:
 * - URL state sync for shareability
 * - Auto-calculation on valid input detection
 * - Throughput calculation from data size and transfer time
 * - Speed comparisons to common network types
 */
export const useThroughputCalculatorStore = create<ThroughputCalculatorState>()(
  createUrlSyncMiddleware<ThroughputCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      dataSize: state.dataSize,
      dataSizeUnit: state.dataSizeUnit,
      transferTime: state.transferTime,
      transferTimeUnit: state.transferTimeUnit,
    }),
  })((set, get) => {
    // Load initial values from URL
    const params = getUrlParams();
    const initialDataSize = parseStringParam(params.get("dataSize") ?? null, "");
    const initialDataSizeUnit = parseStringParam(params.get("dataSizeUnit") ?? null, "MB");
    const initialTransferTime = parseStringParam(params.get("transferTime") ?? null, "");
    const initialTransferTimeUnit = parseStringParam(params.get("transferTimeUnit") ?? null, "s");

    // Helper to check if calculation should trigger
    const shouldCalculate = () => {
      const { dataSize, transferTime } = get();
      const sizeNum = Number.parseFloat(dataSize);
      const timeNum = Number.parseFloat(transferTime);
      return !Number.isNaN(sizeNum) && sizeNum > 0 && !Number.isNaN(timeNum) && timeNum > 0;
    };

    return {
      dataSize: initialDataSize,
      dataSizeUnit: initialDataSizeUnit,
      transferTime: initialTransferTime,
      transferTimeUnit: initialTransferTimeUnit,
      result: null,
      error: null,

      setDataSize: (dataSize: string) => {
        set({ dataSize, error: null });
        if (shouldCalculate()) {
          setTimeout(() => get().calculate(), 0);
        } else {
          set({ result: null });
        }
      },

      setDataSizeUnit: (dataSizeUnit: string) => {
        set({ dataSizeUnit });
        if (shouldCalculate()) {
          setTimeout(() => get().calculate(), 0);
        }
      },

      setTransferTime: (transferTime: string) => {
        set({ transferTime, error: null });
        if (shouldCalculate()) {
          setTimeout(() => get().calculate(), 0);
        } else {
          set({ result: null });
        }
      },

      setTransferTimeUnit: (transferTimeUnit: string) => {
        set({ transferTimeUnit });
        if (shouldCalculate()) {
          setTimeout(() => get().calculate(), 0);
        }
      },

      calculate: () => {
        const { dataSize, dataSizeUnit, transferTime, transferTimeUnit } = get();
        const sizeNum = Number.parseFloat(dataSize);
        const timeNum = Number.parseFloat(transferTime);

        if (Number.isNaN(sizeNum) || sizeNum <= 0 || Number.isNaN(timeNum) || timeNum <= 0) {
          set({ result: null, error: null });
          return;
        }

        const calcResult = calculateThroughput({
          dataSize: sizeNum,
          dataSizeUnit,
          transferTime: timeNum,
          transferTimeUnit,
        });
        if (calcResult.ok) {
          set({ result: calcResult.value, error: null });
        } else {
          set({ result: null, error: calcResult.error });
        }
      },

      reset: () =>
        set({
          dataSize: "",
          dataSizeUnit: "MB",
          transferTime: "",
          transferTimeUnit: "s",
          result: null,
          error: null,
        }),
    };
  })
);
