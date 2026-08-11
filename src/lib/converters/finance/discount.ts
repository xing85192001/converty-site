import type { CalculationResult } from "@/types";

export interface DiscountInput {
  originalPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}

export function calculateDiscount(input: DiscountInput): CalculationResult<DiscountResult> {
  const { originalPrice, discountPercent, discountAmount, finalPrice } = input;

  if (originalPrice <= 0) {
    return { ok: false, error: "Original price must be positive", code: "INVALID_INPUT" };
  }

  let calculatedDiscountPercent: number;
  let calculatedDiscountAmount: number;
  let calculatedFinalPrice: number;

  if (discountPercent !== undefined && discountPercent >= 0 && discountPercent <= 100) {
    calculatedDiscountPercent = discountPercent;
    calculatedDiscountAmount = originalPrice * (discountPercent / 100);
    calculatedFinalPrice = originalPrice - calculatedDiscountAmount;
  } else if (
    discountAmount !== undefined &&
    discountAmount >= 0 &&
    discountAmount <= originalPrice
  ) {
    calculatedDiscountAmount = discountAmount;
    calculatedDiscountPercent = (discountAmount / originalPrice) * 100;
    calculatedFinalPrice = originalPrice - discountAmount;
  } else if (finalPrice !== undefined && finalPrice >= 0 && finalPrice <= originalPrice) {
    calculatedFinalPrice = finalPrice;
    calculatedDiscountAmount = originalPrice - finalPrice;
    calculatedDiscountPercent = (calculatedDiscountAmount / originalPrice) * 100;
  } else {
    return {
      ok: false,
      error: "Must provide valid discount percent, amount, or final price",
      code: "INVALID_INPUT",
    };
  }

  return {
    ok: true,
    value: {
      originalPrice: Math.round(originalPrice * 100) / 100,
      discountPercent: Math.round(calculatedDiscountPercent * 100) / 100,
      discountAmount: Math.round(calculatedDiscountAmount * 100) / 100,
      finalPrice: Math.round(calculatedFinalPrice * 100) / 100,
      savings: Math.round(calculatedDiscountAmount * 100) / 100,
    },
  };
}
