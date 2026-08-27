/**
 * Supported currencies for Swiss/European context
 */
export type Currency = "CHF" | "EUR";

/**
 * Fuel types with typical densities and costs
 */
export type FuelType = "petrol_95" | "petrol_98" | "diesel" | "electric";

/**
 * Efficiency rating thresholds (L/100km for combustion engines)
 */
export type EfficiencyRating = "excellent" | "good" | "average" | "poor";

/**
 * Get efficiency rating based on L/100km consumption
 */
export function getEfficiencyRating(lPer100km: number): EfficiencyRating {
  if (lPer100km <= 5) return "excellent";
  if (lPer100km <= 7) return "good";
  if (lPer100km <= 9) return "average";
  return "poor";
}

/**
 * Get rating description
 */
export function getRatingDescription(rating: EfficiencyRating): string {
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

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Fuel type display names
 */
export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  petrol_95: "Petrol 95",
  petrol_98: "Petrol 98",
  diesel: "Diesel",
  electric: "Electric (kWh)",
};
