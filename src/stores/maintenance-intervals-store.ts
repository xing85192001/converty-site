// src/stores/maintenance-intervals-store.ts
"use client";

import { create } from "zustand";
import {
  getDefaultLastServices,
  getServiceSchedule,
  type ServiceScheduleResult,
} from "@/lib/converters/automotive/maintenance-intervals";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export type OilType = "synthetic" | "conventional";

export interface LastServiceRecord {
  km: number | null;
  date: string | null; // ISO string for URL serialization
}

export interface MaintenanceIntervalsState {
  // Vehicle info
  currentOdometerKm: number;
  averageKmPerMonth: number;
  vehicleRegistrationYear: number;
  vehicleRegistrationMonth: number;
  oilType: OilType;

  // Last service records
  lastServices: Record<string, LastServiceRecord>;

  // Selected services to track
  selectedServices: string[];

  // Results
  result: ServiceScheduleResult | null;
  error: string | null;

  // Actions
  setCurrentOdometerKm: (value: number) => void;
  setAverageKmPerMonth: (value: number) => void;
  setVehicleRegistrationYear: (value: number) => void;
  setVehicleRegistrationMonth: (value: number) => void;
  setOilType: (value: OilType) => void;
  setLastServiceKm: (serviceId: string, km: number | null) => void;
  setLastServiceDate: (serviceId: string, date: string | null) => void;
  toggleService: (serviceId: string) => void;
  useDefaults: () => void;
  calculate: () => void;
  reset: () => void;
}

const currentYear = new Date().getFullYear();

// Default selected services (most common)
const defaultSelectedServices = [
  "oil_synthetic",
  "air_filter",
  "cabin_filter",
  "brake_fluid",
  "brake_pads_front",
  "tires",
];

const initialState = {
  currentOdometerKm: 50000,
  averageKmPerMonth: 1500,
  vehicleRegistrationYear: currentYear - 3,
  vehicleRegistrationMonth: 1,
  oilType: "synthetic" as OilType,
  lastServices: {} as Record<string, LastServiceRecord>,
  selectedServices: defaultSelectedServices,
  result: null,
  error: null,
};

export const useMaintenanceIntervalsStore = create<MaintenanceIntervalsState>()(
  createUrlSyncMiddleware<MaintenanceIntervalsState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      currentOdometerKm: state.currentOdometerKm,
      averageKmPerMonth: state.averageKmPerMonth,
      vehicleRegistrationYear: state.vehicleRegistrationYear,
      vehicleRegistrationMonth: state.vehicleRegistrationMonth,
      oilType: state.oilType,
    }),
  })((set, get) => {
    // Load initial values from URL params
    const loaded = { ...initialState };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loaded.currentOdometerKm = parseNumberParam(
          urlParams.get("currentOdometerKm") ?? null,
          initialState.currentOdometerKm
        );
        loaded.averageKmPerMonth = parseNumberParam(
          urlParams.get("averageKmPerMonth") ?? null,
          initialState.averageKmPerMonth
        );
        loaded.vehicleRegistrationYear = parseNumberParam(
          urlParams.get("vehicleRegistrationYear") ?? null,
          initialState.vehicleRegistrationYear
        );
        loaded.vehicleRegistrationMonth = parseNumberParam(
          urlParams.get("vehicleRegistrationMonth") ?? null,
          initialState.vehicleRegistrationMonth
        );

        const oilParam = parseStringParam(urlParams.get("oilType") ?? null, initialState.oilType);
        if (oilParam === "synthetic" || oilParam === "conventional") {
          loaded.oilType = oilParam;
        }
      }
    }

    return {
      ...loaded,

      setCurrentOdometerKm: (value: number) => {
        set({ currentOdometerKm: value, error: null });
        get().calculate();
      },

      setAverageKmPerMonth: (value: number) => {
        set({ averageKmPerMonth: value, error: null });
        get().calculate();
      },

      setVehicleRegistrationYear: (value: number) => {
        set({ vehicleRegistrationYear: value, error: null });
        get().calculate();
      },

      setVehicleRegistrationMonth: (value: number) => {
        set({ vehicleRegistrationMonth: value, error: null });
        get().calculate();
      },

      setOilType: (value: OilType) => {
        const { selectedServices } = get();
        // Swap oil service type in selected services
        const newSelected = selectedServices.map((s) => {
          if (s === "oil_synthetic")
            return value === "synthetic" ? "oil_synthetic" : "oil_conventional";
          if (s === "oil_conventional")
            return value === "conventional" ? "oil_conventional" : "oil_synthetic";
          return s;
        });
        set({ oilType: value, selectedServices: newSelected, error: null });
        get().calculate();
      },

      setLastServiceKm: (serviceId: string, km: number | null) => {
        const { lastServices } = get();
        set({
          lastServices: {
            ...lastServices,
            [serviceId]: { ...lastServices[serviceId], km },
          },
          error: null,
        });
        get().calculate();
      },

      setLastServiceDate: (serviceId: string, date: string | null) => {
        const { lastServices } = get();
        set({
          lastServices: {
            ...lastServices,
            [serviceId]: { ...lastServices[serviceId], date },
          },
          error: null,
        });
        get().calculate();
      },

      toggleService: (serviceId: string) => {
        const { selectedServices } = get();
        const newSelected = selectedServices.includes(serviceId)
          ? selectedServices.filter((s) => s !== serviceId)
          : [...selectedServices, serviceId];
        set({ selectedServices: newSelected, error: null });
        get().calculate();
      },

      useDefaults: () => {
        const { currentOdometerKm, vehicleRegistrationYear, vehicleRegistrationMonth } = get();
        const registrationDate = new Date(vehicleRegistrationYear, vehicleRegistrationMonth - 1, 1);
        const defaults = getDefaultLastServices(currentOdometerKm, registrationDate);

        // Convert to LastServiceRecord format
        const lastServices: Record<string, LastServiceRecord> = {};
        for (const [id, record] of Object.entries(defaults)) {
          lastServices[id] = {
            km: record.km,
            date: record.date ? record.date.toISOString().split("T")[0] : null,
          };
        }

        set({ lastServices, error: null });
        get().calculate();
      },

      calculate: () => {
        const state = get();

        try {
          const registrationDate = new Date(
            state.vehicleRegistrationYear,
            state.vehicleRegistrationMonth - 1,
            1
          );

          // Convert lastServices to Date objects
          const lastServicesWithDates: Record<string, { km: number | null; date: Date | null }> =
            {};
          for (const [id, record] of Object.entries(state.lastServices)) {
            lastServicesWithDates[id] = {
              km: record.km,
              date: record.date ? new Date(record.date) : null,
            };
          }

          const result = getServiceSchedule({
            currentOdometerKm: state.currentOdometerKm,
            averageKmPerMonth: state.averageKmPerMonth,
            vehicleRegistrationDate: registrationDate,
            lastServices: lastServicesWithDates,
            oilType: state.oilType,
          });

          // Filter to selected services
          result.services = result.services.filter((s) =>
            state.selectedServices.includes(s.service.id)
          );
          result.overdue = result.overdue.filter((s) =>
            state.selectedServices.includes(s.service.id)
          );
          result.dueSoon = result.dueSoon.filter((s) =>
            state.selectedServices.includes(s.service.id)
          );
          result.upcoming = result.upcoming.filter((s) =>
            state.selectedServices.includes(s.service.id)
          );
          result.overdueCount = result.overdue.length;
          result.dueSoonCount = result.dueSoon.length;
          result.totalServices = result.services.length;

          set({ result, error: null });
        } catch (err) {
          set({
            result: null,
            error: err instanceof Error ? err.message : "Calculation failed",
          });
        }
      },

      reset: () => set({ ...initialState }),
    };
  })
);
