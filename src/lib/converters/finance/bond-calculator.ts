import type { CalculationResult } from "@/types";

export interface BondInput {
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  paymentFrequency: number; // 1 = annual, 2 = semi-annual, 4 = quarterly
  marketRate: number;
}

export interface BondResult {
  bondPrice: number;
  currentYield: number;
  yieldToMaturity: number;
  couponPayment: number;
  totalCouponPayments: number;
  totalReturn: number;
  premiumOrDiscount: number;
  isPremium: boolean;
  schedule: Array<{
    period: number;
    couponPayment: number;
    principalPayment: number;
    totalPayment: number;
  }>;
}

export function calculateBond(input: BondInput): CalculationResult<BondResult> {
  const { faceValue, couponRate, yearsToMaturity, paymentFrequency, marketRate } = input;

  if (faceValue <= 0 || yearsToMaturity <= 0 || paymentFrequency < 1) {
    return {
      ok: false,
      error: "Face value and years to maturity must be positive, payment frequency at least 1",
      code: "INVALID_INPUT",
    };
  }

  const periodsPerYear = paymentFrequency;
  const totalPeriods = yearsToMaturity * periodsPerYear;
  const couponPaymentPerPeriod = (faceValue * (couponRate / 100)) / periodsPerYear;
  const marketRatePerPeriod = marketRate / 100 / periodsPerYear;

  // Calculate bond price using present value formula
  // PV = C × [1 - (1 + r)^-n] / r + F / (1 + r)^n
  let bondPrice: number;

  if (marketRatePerPeriod === 0) {
    // If market rate is 0, price is sum of all payments
    bondPrice = couponPaymentPerPeriod * totalPeriods + faceValue;
  } else {
    const pvCoupons =
      (couponPaymentPerPeriod * (1 - (1 + marketRatePerPeriod) ** -totalPeriods)) /
      marketRatePerPeriod;
    const pvFaceValue = faceValue / (1 + marketRatePerPeriod) ** totalPeriods;
    bondPrice = pvCoupons + pvFaceValue;
  }

  // Current yield = Annual coupon / Current price
  const annualCoupon = couponPaymentPerPeriod * periodsPerYear;
  const currentYield = (annualCoupon / bondPrice) * 100;

  // Yield to maturity is approximately the market rate (since we calculated price from it)
  const yieldToMaturity = marketRate;

  // Total payments
  const totalCouponPayments = couponPaymentPerPeriod * totalPeriods;
  const totalReturn = totalCouponPayments + faceValue - bondPrice;

  // Premium or discount
  const premiumOrDiscount = bondPrice - faceValue;
  const isPremium = premiumOrDiscount > 0;

  // Generate payment schedule (show annual summaries)
  const schedule: BondResult["schedule"] = [];
  for (let year = 1; year <= yearsToMaturity; year++) {
    const isLastYear = year === yearsToMaturity;
    schedule.push({
      period: year,
      couponPayment: annualCoupon,
      principalPayment: isLastYear ? faceValue : 0,
      totalPayment: annualCoupon + (isLastYear ? faceValue : 0),
    });
  }

  return {
    ok: true,
    value: {
      bondPrice,
      currentYield,
      yieldToMaturity,
      couponPayment: annualCoupon,
      totalCouponPayments,
      totalReturn,
      premiumOrDiscount: Math.abs(premiumOrDiscount),
      isPremium,
      schedule,
    },
  };
}
