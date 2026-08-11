/**
 * Bitcoin Mining Profitability Calculator
 *
 * Calculates mining profits based on hash rate, power consumption, and electricity cost
 * using build-time fetched network data
 */

import miningData from "@/lib/data/mining-data.json";
import type { CalculationResult } from "@/types";

export type HashRateUnit = "H/s" | "KH/s" | "MH/s" | "GH/s" | "TH/s" | "PH/s";
export type FiatCurrency = "CHF" | "EUR" | "USD";

export interface MinerPreset {
  name: string;
  hashRate: number;
  hashRateUnit: HashRateUnit;
  powerWatts: number;
}

export interface MiningInput {
  hashRate: number;
  hashRateUnit: HashRateUnit;
  powerWatts: number;
  electricityCost: number; // per kWh in selected currency
  currency: FiatCurrency;
  hardwareCost?: number; // optional hardware cost for ROI calculation
}

export interface MiningResult {
  // Revenue (before costs)
  revenuePerDay: number;
  revenuePerMonth: number;
  revenuePerYear: number;

  // Electricity costs
  electricityCostPerDay: number;
  electricityCostPerMonth: number;
  electricityCostPerYear: number;

  // Profit (revenue - electricity)
  profitPerDay: number;
  profitPerMonth: number;
  profitPerYear: number;

  // BTC amounts
  btcPerDay: number;
  btcPerMonth: number;
  btcPerYear: number;

  // ROI calculation (if hardware cost provided)
  roiDays: number | null;
  roiMonths: number | null;
  breakEvenDate: string | null;

  // Status
  isProfitable: boolean;

  // Context
  currency: FiatCurrency;
  btcPrice: number;
  networkDifficulty: number;
  blockReward: number;
}

// Hash rate unit conversion factors (to H/s)
const HASH_RATE_MULTIPLIERS: Record<HashRateUnit, number> = {
  "H/s": 1,
  "KH/s": 1000,
  "MH/s": 1000000,
  "GH/s": 1000000000,
  "TH/s": 1000000000000,
  "PH/s": 1000000000000000,
};

export const HASH_RATE_UNITS: HashRateUnit[] = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s"];

export const MINER_PRESETS: MinerPreset[] = [
  {
    name: "Antminer S19 Pro",
    hashRate: 110,
    hashRateUnit: "TH/s",
    powerWatts: 3250,
  },
  {
    name: "Antminer S19j Pro",
    hashRate: 104,
    hashRateUnit: "TH/s",
    powerWatts: 3068,
  },
  {
    name: "Antminer S19 XP",
    hashRate: 140,
    hashRateUnit: "TH/s",
    powerWatts: 3010,
  },
  {
    name: "Whatsminer M30S++",
    hashRate: 112,
    hashRateUnit: "TH/s",
    powerWatts: 3472,
  },
];

// Typical electricity costs by region (per kWh)
export const ELECTRICITY_COSTS: Record<string, { chf: number; eur: number; usd: number }> = {
  switzerland: { chf: 0.27, eur: 0.29, usd: 0.32 },
  germany: { chf: 0.36, eur: 0.39, usd: 0.43 },
  france: { chf: 0.19, eur: 0.21, usd: 0.23 },
  usa: { chf: 0.12, eur: 0.13, usd: 0.14 },
  china: { chf: 0.07, eur: 0.08, usd: 0.09 },
};

/**
 * Calculate Bitcoin mining profitability
 */
export function calculateMiningProfitability(input: MiningInput): CalculationResult<MiningResult> {
  if (input.hashRate <= 0 || input.powerWatts <= 0 || input.electricityCost < 0) {
    return {
      ok: false,
      error: "Hash rate and power must be positive; electricity cost must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  // Convert hash rate to H/s
  const hashRateHS = input.hashRate * HASH_RATE_MULTIPLIERS[input.hashRateUnit];

  // Convert network hash rate from TH/s to H/s
  const networkHashRateHS = miningData.networkHashRate * HASH_RATE_MULTIPLIERS["TH/s"];

  // Get BTC price in selected currency
  const currencyLower = input.currency.toLowerCase() as "chf" | "eur" | "usd";
  const btcPrice = miningData.btcPrice[currencyLower];

  // Calculate BTC mined per day
  // Formula: (MinerHashRate / NetworkHashRate) * BlocksPerDay * BlockReward
  const hashRateShare = hashRateHS / networkHashRateHS;
  const btcPerDay = hashRateShare * miningData.blocksPerDay * miningData.blockReward;
  const btcPerMonth = btcPerDay * 30;
  const btcPerYear = btcPerDay * 365;

  // Calculate revenue (BTC * Price)
  const revenuePerDay = btcPerDay * btcPrice;
  const revenuePerMonth = btcPerMonth * btcPrice;
  const revenuePerYear = btcPerYear * btcPrice;

  // Calculate electricity cost
  // Formula: (PowerWatts / 1000) * 24 hours * ElectricityCostPerKWh
  const electricityCostPerDay = (input.powerWatts / 1000) * 24 * input.electricityCost;
  const electricityCostPerMonth = electricityCostPerDay * 30;
  const electricityCostPerYear = electricityCostPerDay * 365;

  // Calculate profit (Revenue - Electricity Cost)
  const profitPerDay = revenuePerDay - electricityCostPerDay;
  const profitPerMonth = revenuePerMonth - electricityCostPerMonth;
  const profitPerYear = revenuePerYear - electricityCostPerYear;

  // Calculate ROI if hardware cost provided
  let roiDays: number | null = null;
  let roiMonths: number | null = null;
  let breakEvenDate: string | null = null;

  if (input.hardwareCost && input.hardwareCost > 0 && profitPerDay > 0) {
    roiDays = input.hardwareCost / profitPerDay;
    roiMonths = roiDays / 30;

    const breakEven = new Date();
    breakEven.setDate(breakEven.getDate() + Math.ceil(roiDays));
    breakEvenDate = breakEven.toISOString().split("T")[0];
  }

  return {
    ok: true,
    value: {
      revenuePerDay,
      revenuePerMonth,
      revenuePerYear,
      electricityCostPerDay,
      electricityCostPerMonth,
      electricityCostPerYear,
      profitPerDay,
      profitPerMonth,
      profitPerYear,
      btcPerDay,
      btcPerMonth,
      btcPerYear,
      roiDays,
      roiMonths,
      breakEvenDate,
      isProfitable: profitPerDay > 0,
      currency: input.currency,
      btcPrice,
      networkDifficulty: miningData.difficulty,
      blockReward: miningData.blockReward,
    },
  };
}

/**
 * Format currency amount for display
 */
export function formatMiningCurrency(amount: number, _currency: FiatCurrency): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format BTC amount for display
 */
export function formatBtc(amount: number): string {
  if (amount === 0) {
    return "0";
  }

  if (amount >= 1) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }

  if (amount >= 0.0001) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    });
  }

  // Very small amounts: scientific notation
  return amount.toExponential(4);
}

/**
 * Get age of mining data in hours
 */
export function getMiningDataAge(): number {
  const timestamp = new Date(miningData.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  return Math.round(hoursDiff * 10) / 10; // Round to 1 decimal place
}

/**
 * Get formatted last updated timestamp
 */
export function getMiningLastUpdated(): string {
  return miningData.timestamp;
}
