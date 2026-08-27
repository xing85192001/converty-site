"use client";

import { create } from "zustand";
import type {
  PropertyCondition,
  PropertyType,
  SwissRegion,
} from "@/lib/converters/realestate/property-valuation";
import type { SupportedCurrency } from "@/lib/converters/realestate/types";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface PropertyValuationStoreState {
  propertyType: PropertyType;
  region: SwissRegion;
  size: number;
  rooms: number;
  constructionYear: number;
  condition: PropertyCondition;
  features: string[];
  currency: SupportedCurrency;
  setPropertyType: (type: PropertyType) => void;
  setRegion: (region: SwissRegion) => void;
  setSize: (size: number) => void;
  setRooms: (rooms: number) => void;
  setConstructionYear: (year: number) => void;
  setCondition: (condition: PropertyCondition) => void;
  toggleFeature: (featureId: string) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  reset: () => void;
}

const SWISS_DEFAULTS = {
  propertyType: "apartment" as const,
  region: "zurich" as const,
  size: 100,
  rooms: 4,
  constructionYear: 2015,
  condition: "good" as const,
  features: [] as string[],
  currency: "CHF" as const,
};

export const usePropertyValuationStore = create<PropertyValuationStoreState>()(
  createUrlSyncMiddleware<PropertyValuationStoreState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      propertyType: state.propertyType,
      region: state.region,
      size: state.size,
      rooms: state.rooms,
      constructionYear: state.constructionYear,
      condition: state.condition,
      features: state.features.join(","),
      currency: state.currency,
    }),
  })((set) => {
    // Load from URL params
    type LoadedState = Omit<
      PropertyValuationStoreState,
      | "setPropertyType"
      | "setRegion"
      | "setSize"
      | "setRooms"
      | "setConstructionYear"
      | "setCondition"
      | "toggleFeature"
      | "setCurrency"
      | "reset"
    >;
    const loaded: LoadedState = { ...SWISS_DEFAULTS };

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const propertyTypeParam = parseStringParam(urlParams.get("propertyType") ?? null, "");
        if (["apartment", "house", "commercial"].includes(propertyTypeParam)) {
          loaded.propertyType = propertyTypeParam as PropertyType;
        }

        const regionParam = parseStringParam(urlParams.get("region") ?? null, "");
        if (
          [
            "zurich",
            "geneva",
            "bern",
            "basel",
            "lausanne",
            "lucerne",
            "zug",
            "national_average",
          ].includes(regionParam)
        ) {
          loaded.region = regionParam as SwissRegion;
        }

        loaded.size = parseNumberParam(urlParams.get("size") ?? null, SWISS_DEFAULTS.size);
        loaded.rooms = parseNumberParam(urlParams.get("rooms") ?? null, SWISS_DEFAULTS.rooms);
        loaded.constructionYear = parseNumberParam(
          urlParams.get("constructionYear") ?? null,
          SWISS_DEFAULTS.constructionYear
        );

        const conditionParam = parseStringParam(urlParams.get("condition") ?? null, "");
        if (["poor", "fair", "good", "very_good", "excellent"].includes(conditionParam)) {
          loaded.condition = conditionParam as PropertyCondition;
        }

        const currencyParam = parseStringParam(urlParams.get("currency") ?? null, "");
        if (["CHF", "EUR"].includes(currencyParam)) {
          loaded.currency = currencyParam as SupportedCurrency;
        }

        const featuresParam = parseStringParam(urlParams.get("features") ?? null, "");
        if (featuresParam) {
          loaded.features = featuresParam.split(",");
        }
      }
    }

    return {
      ...loaded,
      setPropertyType: (type: PropertyType) => set({ propertyType: type }),
      setRegion: (region: SwissRegion) => set({ region }),
      setSize: (size: number) => set({ size }),
      setRooms: (rooms: number) => set({ rooms }),
      setConstructionYear: (year: number) => set({ constructionYear: year }),
      setCondition: (condition: PropertyCondition) => set({ condition }),
      toggleFeature: (featureId: string) =>
        set((state) => ({
          features: state.features.includes(featureId)
            ? state.features.filter((id) => id !== featureId)
            : [...state.features, featureId],
        })),
      setCurrency: (currency: SupportedCurrency) => set({ currency }),
      reset: () => set(SWISS_DEFAULTS),
    };
  })
);
