import { describe, expect, it } from "vitest";
import { calculateAnnuity } from "@/lib/converters/finance/annuity-calculator";

describe("calculateAnnuity", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for zero principal", () => {
      const result = calculateAnnuity({
        principal: 0,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero payoutYears", () => {
      const result = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 0,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for paymentFrequency < 1", () => {
      const result = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 0,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("immediate annuity calculation", () => {
    it("$100,000 principal at 5% annual for 10 years monthly → periodicPayment > 0", () => {
      const result = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.periodicPayment).toBeGreaterThan(0);
      }
    });

    it("monthly payout ≈ $1,061 for $100k at 5% over 10 years", () => {
      const result = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // PMT = 100000 * (0.05/12) / (1 - (1 + 0.05/12)^-120) ≈ 1060.66
        expect(result.value.periodicPayment).toBeCloseTo(1061, 0);
      }
    });

    it("totalPayments = periodicPayment × (payoutYears × paymentFrequency)", () => {
      const result = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalPayments).toBeCloseTo(result.value.periodicPayment * 120, 0);
      }
    });

    it("schedule has one entry per payoutYear", () => {
      const result = calculateAnnuity({
        principal: 50000,
        annualInterestRate: 4,
        payoutYears: 5,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schedule).toHaveLength(5);
      }
    });
  });

  describe("deferred annuity", () => {
    it("deferred annuity with 5 year deferral grows principal before payout", () => {
      const immediate = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      const deferred = calculateAnnuity({
        principal: 100000,
        annualInterestRate: 5,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "deferred",
        deferralYears: 5,
      });
      expect(immediate.ok).toBe(true);
      expect(deferred.ok).toBe(true);
      if (immediate.ok && deferred.ok) {
        // Deferred should have higher payment since principal grows during deferral
        expect(deferred.value.periodicPayment).toBeGreaterThan(immediate.value.periodicPayment);
      }
    });
  });

  describe("zero interest rate", () => {
    it("zero interest → periodic payment = principal / totalPeriods", () => {
      const result = calculateAnnuity({
        principal: 12000,
        annualInterestRate: 0,
        payoutYears: 10,
        paymentFrequency: 12,
        annuityType: "immediate",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 12000 / 120 = 100
        expect(result.value.periodicPayment).toBeCloseTo(100, 2);
      }
    });
  });
});
