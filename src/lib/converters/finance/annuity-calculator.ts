import type { CalculationResult } from "@/types";

export interface AnnuityInput {
  principal: number;
  annualInterestRate: number;
  payoutYears: number;
  paymentFrequency: number; // 12 = monthly, 4 = quarterly, 1 = annual
  annuityType: "immediate" | "deferred";
  deferralYears?: number;
}

export interface AnnuityResult {
  periodicPayment: number;
  totalPayments: number;
  totalInterestEarned: number;
  effectiveRate: number;
  presentValue: number;
  futureValue: number;
  schedule: Array<{
    period: number;
    payment: number;
    interest: number;
    remainingBalance: number;
  }>;
}

export function calculateAnnuity(input: AnnuityInput): CalculationResult<AnnuityResult> {
  const {
    principal,
    annualInterestRate,
    payoutYears,
    paymentFrequency,
    annuityType,
    deferralYears = 0,
  } = input;

  if (principal <= 0 || payoutYears <= 0 || paymentFrequency < 1) {
    return {
      ok: false,
      error: "Principal, payout years must be positive and payment frequency at least 1",
      code: "INVALID_INPUT",
    };
  }

  const periodsPerYear = paymentFrequency;
  const totalPayoutPeriods = payoutYears * periodsPerYear;
  const ratePerPeriod = annualInterestRate / 100 / periodsPerYear;

  // Calculate present value at start of payout
  let presentValue = principal;

  // If deferred annuity, grow principal during deferral period
  if (annuityType === "deferred" && deferralYears > 0) {
    presentValue = principal * (1 + annualInterestRate / 100) ** deferralYears;
  }

  // Calculate periodic payment using present value of annuity formula
  // PV = PMT × [1 - (1 + r)^-n] / r
  // PMT = PV × r / [1 - (1 + r)^-n]
  let periodicPayment: number;

  if (ratePerPeriod === 0) {
    periodicPayment = presentValue / totalPayoutPeriods;
  } else {
    periodicPayment =
      (presentValue * ratePerPeriod) / (1 - (1 + ratePerPeriod) ** -totalPayoutPeriods);
  }

  const totalPayments = periodicPayment * totalPayoutPeriods;
  const totalInterestEarned = totalPayments - principal;

  // Effective annual rate
  const effectiveRate = (1 + ratePerPeriod) ** periodsPerYear - 1;

  // Calculate future value at start of payout
  const futureValue = presentValue;

  // Generate payout schedule (show yearly summaries)
  const schedule: AnnuityResult["schedule"] = [];
  let remainingBalance = presentValue;

  for (let year = 1; year <= payoutYears; year++) {
    let yearInterest = 0;
    const yearPayments = periodicPayment * periodsPerYear;

    for (let period = 0; period < periodsPerYear; period++) {
      const periodInterest = remainingBalance * ratePerPeriod;
      yearInterest += periodInterest;
      remainingBalance = remainingBalance + periodInterest - periodicPayment;
      remainingBalance = Math.max(0, remainingBalance);
    }

    schedule.push({
      period: year,
      payment: yearPayments,
      interest: yearInterest,
      remainingBalance,
    });
  }

  return {
    ok: true,
    value: {
      periodicPayment,
      totalPayments,
      totalInterestEarned,
      effectiveRate: effectiveRate * 100,
      presentValue,
      futureValue,
      schedule,
    },
  };
}
