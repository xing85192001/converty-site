import type { SupportedCurrency } from "./types";

export type PropertyType = "apartment" | "house" | "commercial";
export type PropertyCondition = "poor" | "fair" | "good" | "very_good" | "excellent";
export type SwissRegion =
  | "zurich"
  | "geneva"
  | "bern"
  | "basel"
  | "lausanne"
  | "lucerne"
  | "zug"
  | "national_average";

export interface PropertyFeature {
  id: string;
  bonus: number;
}

export interface PropertyValuationInput {
  propertyType: PropertyType;
  region: SwissRegion;
  size: number;
  rooms: number;
  constructionYear: number;
  condition: PropertyCondition;
  features: string[];
  currency: SupportedCurrency;
}

export interface PropertyValuationResult {
  estimatedValue: number;
  minValue: number;
  maxValue: number;
  pricePerM2: number;
  baseValue: number;
  ageAdjustment: number;
  conditionAdjustment: number;
  featureBonus: number;
  totalAdjustments: number;
  regionPricePerM2: number;
  regionName: string;
  confidence: "low" | "medium" | "high";
  currency: SupportedCurrency;
  vsRegionalAverage: number;
}

export const PROPERTY_FEATURES: PropertyFeature[] = [
  { id: "balcony", bonus: 15000 },
  { id: "terrace", bonus: 25000 },
  { id: "garden", bonus: 40000 },
  { id: "parking", bonus: 30000 },
  { id: "garage", bonus: 50000 },
  { id: "elevator", bonus: 20000 },
  { id: "renovated", bonus: 35000 },
  { id: "view", bonus: 30000 },
  { id: "quiet", bonus: 20000 },
  { id: "modern_kitchen", bonus: 25000 },
  { id: "fireplace", bonus: 15000 },
];

const CONDITION_MULTIPLIERS: Record<PropertyCondition, number> = {
  poor: 0.75,
  fair: 0.9,
  good: 1.0,
  very_good: 1.1,
  excellent: 1.2,
};

const REGION_PRICES: Record<SwissRegion, Record<PropertyType, number>> = {
  zurich: {
    apartment: 12500,
    house: 14000,
    commercial: 13500,
  },
  geneva: {
    apartment: 11800,
    house: 13200,
    commercial: 12800,
  },
  bern: {
    apartment: 8500,
    house: 9800,
    commercial: 9000,
  },
  basel: {
    apartment: 9200,
    house: 10500,
    commercial: 9800,
  },
  lausanne: {
    apartment: 9800,
    house: 11200,
    commercial: 10500,
  },
  lucerne: {
    apartment: 8800,
    house: 10000,
    commercial: 9200,
  },
  zug: {
    apartment: 10500,
    house: 12000,
    commercial: 11200,
  },
  national_average: {
    apartment: 9500,
    house: 10800,
    commercial: 10000,
  },
};

function getAgeAdjustmentMultiplier(constructionYear: number): number {
  const age = new Date().getFullYear() - constructionYear;

  if (age < 5) return 1.1;
  if (age < 15) return 1.05;
  if (age < 30) return 1.0;
  if (age < 50) return 0.95;
  if (age < 80) return 0.9;
  return 0.85;
}

export function calculatePropertyValuation(input: PropertyValuationInput): PropertyValuationResult {
  const { propertyType, region, size, rooms, constructionYear, condition, features, currency } =
    input;

  // Get regional base price per m²
  const regionPricePerM2 = REGION_PRICES[region][propertyType];

  // Calculate base value
  const baseValue = regionPricePerM2 * size;

  // Age adjustment
  const ageMultiplier = getAgeAdjustmentMultiplier(constructionYear);
  const ageAdjustment = baseValue * (ageMultiplier - 1);

  // Condition adjustment
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  const conditionAdjustment = baseValue * (conditionMultiplier - 1);

  // Feature bonuses (capped at 20% of base value)
  const featureBonus = Math.min(
    features.reduce((total, featureId) => {
      const feature = PROPERTY_FEATURES.find((f) => f.id === featureId);
      return total + (feature ? feature.bonus : 0);
    }, 0),
    baseValue * 0.2
  );

  // Total adjustments and estimated value
  const totalAdjustments = ageAdjustment + conditionAdjustment + featureBonus;
  const estimatedValue = baseValue + totalAdjustments;

  // Price per m² (adjusted)
  const pricePerM2 = estimatedValue / size;

  // Value range (±15%)
  const minValue = estimatedValue * 0.85;
  const maxValue = estimatedValue * 1.15;

  // Comparison to regional average
  const nationalAverageValue =
    REGION_PRICES.national_average[propertyType] * size +
    REGION_PRICES.national_average[propertyType] * size * (ageMultiplier - 1) +
    REGION_PRICES.national_average[propertyType] * size * (conditionMultiplier - 1);
  const vsRegionalAverage = ((estimatedValue - nationalAverageValue) / nationalAverageValue) * 100;

  // Confidence level
  let confidence: "low" | "medium" | "high" = "medium";
  if (size >= 50 && rooms >= 2 && constructionYear > 1950) {
    confidence = "high";
  } else if (size < 30 || rooms < 1 || constructionYear < 1950) {
    confidence = "low";
  }

  // Get region name
  const regionNames: Record<SwissRegion, string> = {
    zurich: "Zurich",
    geneva: "Geneva",
    bern: "Bern",
    basel: "Basel",
    lausanne: "Lausanne",
    lucerne: "Lucerne",
    zug: "Zug",
    national_average: "National Average",
  };

  return {
    estimatedValue,
    minValue,
    maxValue,
    pricePerM2,
    baseValue,
    ageAdjustment,
    conditionAdjustment,
    featureBonus,
    totalAdjustments,
    regionPricePerM2,
    regionName: regionNames[region],
    confidence,
    currency,
    vsRegionalAverage,
  };
}

export function getPropertyTypes(): PropertyType[] {
  return ["apartment", "house", "commercial"];
}

export function getConditions(): PropertyCondition[] {
  return ["poor", "fair", "good", "very_good", "excellent"];
}

export function getSwissRegions(): SwissRegion[] {
  return ["zurich", "geneva", "bern", "basel", "lausanne", "lucerne", "zug", "national_average"];
}
