import type { CalculationResult } from "@/types";
import { type Currency, type EfficiencyRating, formatCurrency, getEfficiencyRating } from "./types";

export type CalculationMode = "consumption" | "tripPlanning" | "comparison";

export interface FuelEfficiencyInput {
  mode: CalculationMode;

  // For consumption calculation
  distanceKm?: number;
  fuelLiters?: number;

  // For trip planning
  tripDistanceKm?: number;
  consumptionLPer100km?: number;

  // For comparison
  vehicle1LPer100km?: number;
  vehicle2LPer100km?: number;
  comparisonDistanceKm?: number;

  // Common inputs
  fuelPricePerLiter?: number;
  currency?: Currency;
  annualDistanceKm?: number;
}

export interface FuelEfficiencyResult {
  mode: CalculationMode;

  // Primary results
  lPer100km: number;
  kmPerL: number;
  mpgUS: number;
  mpgUK: number;

  // Efficiency rating
  rating: EfficiencyRating;
  ratingDescription: string;

  // Cost calculations (if fuel price provided)
  costPer100km?: number;
  costPerKm?: number;
  annualCost?: number;

  // Trip planning results
  tripFuelNeeded?: number;
  tripCost?: number;

  // Comparison results
  savingsPer100km?: number;
  annualSavings?: number;
  moreEfficientVehicle?: 1 | 2;

  // Calculation steps
  steps: string[];

  // Formatted outputs
  formatted: {
    lPer100km: string;
    kmPerL: string;
    mpgUS: string;
    mpgUK: string;
    costPer100km?: string;
    annualCost?: string;
    tripFuelNeeded?: string;
    tripCost?: string;
    savingsPer100km?: string;
    annualSavings?: string;
  };
}

// Conversion constants
const MPG_US_CONSTANT = 235.214583;
const MPG_UK_CONSTANT = 282.481053;

/**
 * Convert L/100km to km/L
 */
export function lPer100kmToKmPerL(lPer100km: number): number {
  if (lPer100km <= 0) return 0;
  return 100 / lPer100km;
}

/**
 * Convert L/100km to MPG (US)
 */
export function lPer100kmToMpgUS(lPer100km: number): number {
  if (lPer100km <= 0) return 0;
  return MPG_US_CONSTANT / lPer100km;
}

/**
 * Convert L/100km to MPG (UK)
 */
export function lPer100kmToMpgUK(lPer100km: number): number {
  if (lPer100km <= 0) return 0;
  return MPG_UK_CONSTANT / lPer100km;
}

/**
 * Calculate fuel consumption from distance and fuel used
 */
export function calculateConsumption(distanceKm: number, fuelLiters: number): number {
  if (distanceKm <= 0 || fuelLiters <= 0) return 0;
  return (fuelLiters / distanceKm) * 100;
}

/**
 * Main fuel efficiency calculation function
 */
export function calculateFuelEfficiency(
  input: FuelEfficiencyInput
): CalculationResult<FuelEfficiencyResult> {
  const {
    mode,
    distanceKm,
    fuelLiters,
    tripDistanceKm,
    consumptionLPer100km,
    vehicle1LPer100km,
    vehicle2LPer100km,
    comparisonDistanceKm,
    fuelPricePerLiter,
    currency = "CHF",
    annualDistanceKm,
  } = input;

  const steps: string[] = [];
  let lPer100km = 0;

  // Calculate base consumption based on mode
  switch (mode) {
    case "consumption":
      if (!distanceKm || !fuelLiters || distanceKm <= 0 || fuelLiters <= 0) {
        return {
          ok: false,
          error: "Distance and fuel amount must be greater than zero",
          code: "INVALID_INPUT",
        };
      }
      lPer100km = calculateConsumption(distanceKm, fuelLiters);
      steps.push(`Consumption = (${fuelLiters} L / ${distanceKm} km) × 100`);
      steps.push(`Consumption = ${lPer100km.toFixed(2)} L/100km`);
      break;

    case "tripPlanning":
      if (!consumptionLPer100km || consumptionLPer100km <= 0) {
        return { ok: false, error: "Consumption must be greater than zero", code: "INVALID_INPUT" };
      }
      lPer100km = consumptionLPer100km;
      steps.push(`Using consumption: ${lPer100km.toFixed(2)} L/100km`);
      break;

    case "comparison":
      if (
        !vehicle1LPer100km ||
        !vehicle2LPer100km ||
        vehicle1LPer100km <= 0 ||
        vehicle2LPer100km <= 0
      ) {
        return {
          ok: false,
          error: "Both vehicle consumption values must be greater than zero",
          code: "INVALID_INPUT",
        };
      }
      lPer100km = vehicle1LPer100km; // Use vehicle 1 as reference
      steps.push(`Vehicle 1: ${vehicle1LPer100km.toFixed(2)} L/100km`);
      steps.push(`Vehicle 2: ${vehicle2LPer100km.toFixed(2)} L/100km`);
      break;
  }

  // Calculate conversions
  const kmPerL = lPer100kmToKmPerL(lPer100km);
  const mpgUS = lPer100kmToMpgUS(lPer100km);
  const mpgUK = lPer100kmToMpgUK(lPer100km);

  steps.push(`km/L = 100 / ${lPer100km.toFixed(2)} = ${kmPerL.toFixed(2)}`);
  steps.push(`MPG (US) = 235.21 / ${lPer100km.toFixed(2)} = ${mpgUS.toFixed(1)}`);
  steps.push(`MPG (UK) = 282.48 / ${lPer100km.toFixed(2)} = ${mpgUK.toFixed(1)}`);

  // Get efficiency rating
  const rating = getEfficiencyRating(lPer100km);
  const ratingDescription = getRatingDescriptionLocalized(rating);

  // Build result object
  const result: FuelEfficiencyResult = {
    mode,
    lPer100km,
    kmPerL,
    mpgUS,
    mpgUK,
    rating,
    ratingDescription,
    steps,
    formatted: {
      lPer100km: `${lPer100km.toFixed(2)} L/100km`,
      kmPerL: `${kmPerL.toFixed(2)} km/L`,
      mpgUS: `${mpgUS.toFixed(1)} MPG (US)`,
      mpgUK: `${mpgUK.toFixed(1)} MPG (UK)`,
    },
  };

  // Cost calculations
  if (fuelPricePerLiter && fuelPricePerLiter > 0) {
    const costPer100km = lPer100km * fuelPricePerLiter;
    const costPerKm = costPer100km / 100;

    result.costPer100km = costPer100km;
    result.costPerKm = costPerKm;
    result.formatted.costPer100km = formatCurrency(costPer100km, currency);

    steps.push(
      `Cost per 100km = ${lPer100km.toFixed(2)} × ${currency} ${fuelPricePerLiter.toFixed(2)} = ${formatCurrency(costPer100km, currency)}`
    );

    // Annual cost
    if (annualDistanceKm && annualDistanceKm > 0) {
      const annualCost = (annualDistanceKm / 100) * costPer100km;
      result.annualCost = annualCost;
      result.formatted.annualCost = formatCurrency(annualCost, currency);
      steps.push(
        `Annual cost = (${annualDistanceKm} km / 100) × ${formatCurrency(costPer100km, currency)} = ${formatCurrency(annualCost, currency)}`
      );
    }
  }

  // Trip planning
  if (mode === "tripPlanning" && tripDistanceKm && tripDistanceKm > 0) {
    const tripFuelNeeded = (tripDistanceKm / 100) * lPer100km;
    result.tripFuelNeeded = tripFuelNeeded;
    result.formatted.tripFuelNeeded = `${tripFuelNeeded.toFixed(2)} L`;
    steps.push(
      `Trip fuel = (${tripDistanceKm} km / 100) × ${lPer100km.toFixed(2)} = ${tripFuelNeeded.toFixed(2)} L`
    );

    if (fuelPricePerLiter && fuelPricePerLiter > 0) {
      const tripCost = tripFuelNeeded * fuelPricePerLiter;
      result.tripCost = tripCost;
      result.formatted.tripCost = formatCurrency(tripCost, currency);
      steps.push(
        `Trip cost = ${tripFuelNeeded.toFixed(2)} × ${currency} ${fuelPricePerLiter.toFixed(2)} = ${formatCurrency(tripCost, currency)}`
      );
    }
  }

  // Comparison
  if (mode === "comparison" && vehicle1LPer100km && vehicle2LPer100km) {
    const savingsPer100km = Math.abs(vehicle1LPer100km - vehicle2LPer100km);
    result.moreEfficientVehicle = vehicle1LPer100km <= vehicle2LPer100km ? 1 : 2;

    if (fuelPricePerLiter && fuelPricePerLiter > 0) {
      const savingsCostPer100km = savingsPer100km * fuelPricePerLiter;
      result.savingsPer100km = savingsCostPer100km;
      result.formatted.savingsPer100km = formatCurrency(savingsCostPer100km, currency);
      steps.push(
        `Savings per 100km = ${savingsPer100km.toFixed(2)} L × ${currency} ${fuelPricePerLiter.toFixed(2)} = ${formatCurrency(savingsCostPer100km, currency)}`
      );

      const compareDistance = comparisonDistanceKm || annualDistanceKm || 15000;
      const annualSavings = (compareDistance / 100) * savingsCostPer100km;
      result.annualSavings = annualSavings;
      result.formatted.annualSavings = formatCurrency(annualSavings, currency);
      steps.push(
        `Annual savings (${compareDistance} km) = ${formatCurrency(annualSavings, currency)}`
      );
    }
  }

  return { ok: true, value: result };
}

/**
 * Get rating description (for internal use)
 */
function getRatingDescriptionLocalized(rating: EfficiencyRating): string {
  switch (rating) {
    case "excellent":
      return "Excellent (<5 L/100km)";
    case "good":
      return "Good (5-7 L/100km)";
    case "average":
      return "Average (7-9 L/100km)";
    case "poor":
      return "Poor (>9 L/100km)";
  }
}
