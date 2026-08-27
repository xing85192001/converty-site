"use client";

import { create } from "zustand";
import {
  type BBCreditResult,
  calculateBBCredits,
  type FCSpeed,
} from "@/lib/converters/network/bb-credit-calculator";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseStringParam } from "@/lib/utils/url-params";

export interface BBCreditCalculatorState {
  // Inputs
  distanceKm: string;
  speedGbps: string;
  portId: string;

  // Result
  result: BBCreditResult | null;
  error: string | null;

  // Actions
  setDistanceKm: (value: string) => void;
  setSpeedGbps: (value: string) => void;
  setPortId: (value: string) => void;
  calculate: () => void;
  reset: () => void;
}

export const useBBCreditCalculatorStore = create<BBCreditCalculatorState>()(
  createUrlSyncMiddleware<BBCreditCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      distanceKm: state.distanceKm,
      speedGbps: state.speedGbps,
      portId: state.portId,
    }),
  })((set, get) => {
    const params = getUrlParams();
    const initialDistanceKm = parseStringParam(params.get("distanceKm") ?? null, "10");
    const initialSpeedGbps = parseStringParam(params.get("speedGbps") ?? null, "16");
    const initialPortId = parseStringParam(params.get("portId") ?? null, "1/1");

    const runCalculate = (distanceKm: string, speedGbps: string, portId: string) => {
      const distance = Number.parseFloat(distanceKm);
      const speed = Number.parseInt(speedGbps, 10);

      if (Number.isNaN(distance) || distance <= 0 || Number.isNaN(speed) || speed <= 0) {
        set({ result: null, error: null });
        return;
      }

      const calcResult = calculateBBCredits({
        distanceKm: distance,
        speedGbps: speed as FCSpeed,
        portId: portId.trim() || "1/1",
      });
      if (calcResult.ok) {
        set({ result: calcResult.value, error: null });
      } else {
        set({ result: null, error: calcResult.error });
      }
    };

    // Calculate on initial load if params are present
    const initialResult = (() => {
      const distance = Number.parseFloat(initialDistanceKm);
      const speed = Number.parseInt(initialSpeedGbps, 10);
      if (!Number.isNaN(distance) && distance > 0 && !Number.isNaN(speed) && speed > 0) {
        const calcResult = calculateBBCredits({
          distanceKm: distance,
          speedGbps: speed as FCSpeed,
          portId: initialPortId.trim() || "1/1",
        });
        return calcResult.ok ? calcResult.value : null;
      }
      return null;
    })();

    return {
      distanceKm: initialDistanceKm,
      speedGbps: initialSpeedGbps,
      portId: initialPortId,
      result: initialResult,
      error: null,

      setDistanceKm: (value: string) => {
        set({ distanceKm: value, error: null });
        setTimeout(() => {
          const { speedGbps, portId } = get();
          runCalculate(value, speedGbps, portId);
        }, 0);
      },

      setSpeedGbps: (value: string) => {
        set({ speedGbps: value, error: null });
        setTimeout(() => {
          const { distanceKm, portId } = get();
          runCalculate(distanceKm, value, portId);
        }, 0);
      },

      setPortId: (value: string) => {
        set({ portId: value });
        setTimeout(() => {
          const { distanceKm, speedGbps } = get();
          runCalculate(distanceKm, speedGbps, value);
        }, 0);
      },

      calculate: () => {
        const { distanceKm, speedGbps, portId } = get();
        runCalculate(distanceKm, speedGbps, portId);
      },

      reset: () => {
        set({ distanceKm: "10", speedGbps: "16", portId: "1/1", result: null, error: null });
        setTimeout(() => runCalculate("10", "16", "1/1"), 0);
      },
    };
  })
);
