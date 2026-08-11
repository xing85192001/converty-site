import type { CalculationResult } from "@/types";

export interface RoiInput {
  initialInvestment: number;
  finalValue: number;
  years?: number;
}

export interface RoiResult {
  roi: number;
  roiPercent: number;
  profit: number;
  annualizedRoi?: number;
  annualizedRoiPercent?: number;
}

export function calculateRoi(input: RoiInput): CalculationResult<RoiResult> {
  const { initialInvestment, finalValue, years } = input;

  if (initialInvestment <= 0 || finalValue < 0) {
    return {
      ok: false,
      error: "Initial investment must be positive and final value non-negative",
      code: "INVALID_INPUT",
    };
  }

  const profit = finalValue - initialInvestment;
  const roi = profit / initialInvestment;
  const roiPercent = roi * 100;

  let annualizedRoi: number | undefined;
  let annualizedRoiPercent: number | undefined;

  if (years && years > 0) {
    annualizedRoi = (finalValue / initialInvestment) ** (1 / years) - 1;
    annualizedRoiPercent = annualizedRoi * 100;
  }

  return {
    ok: true,
    value: {
      roi: Math.round(roi * 10000) / 10000,
      roiPercent: Math.round(roiPercent * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      annualizedRoi: annualizedRoi ? Math.round(annualizedRoi * 10000) / 10000 : undefined,
      annualizedRoiPercent: annualizedRoiPercent
        ? Math.round(annualizedRoiPercent * 100) / 100
        : undefined,
    },
  };
}
