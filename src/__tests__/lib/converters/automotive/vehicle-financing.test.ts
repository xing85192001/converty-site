import { describe, expect, it } from "vitest";
import {
  aprToMoneyFactor,
  calculateVehicleLease,
  calculateVehicleLoan,
  moneyFactorToAPR,
} from "@/lib/converters/automotive/vehicle-financing";

describe("calculateVehicleLoan", () => {
  it("returns ok: false for vehiclePrice = 0", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 0,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for loanTermMonths = 0", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 0,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(false);
  });

  it("$25,000 car at 5% APR 60 months → monthly payment ≈ $471.78", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.monthlyPayment).toBeCloseTo(471.78, 0);
    }
  });

  it("total cost > purchase price due to interest", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBeGreaterThan(25000);
    }
  });

  it("total payments = monthly payment * months", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalPayments).toBeCloseTo(result.value.monthlyPayment * 60, 0);
    }
  });

  it("down payment reduces loan amount", () => {
    const noDown = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    const withDown = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 5000,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(noDown.ok).toBe(true);
    expect(withDown.ok).toBe(true);
    if (noDown.ok && withDown.ok) {
      expect(noDown.value.loanAmount).toBeGreaterThan(withDown.value.loanAmount);
      expect(noDown.value.monthlyPayment).toBeGreaterThan(withDown.value.monthlyPayment);
    }
  });

  it("includes amortization schedule", () => {
    const result = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.amortization).toHaveLength(60);
      expect(result.value.amortization[0].month).toBe(1);
      expect(result.value.amortization[59].month).toBe(60);
    }
  });

  it("VAT is applied when includeVAT is true", () => {
    const noVAT = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 7.7,
      currency: "CHF",
      includeVAT: false,
    });
    const withVAT = calculateVehicleLoan({
      vehiclePrice: 25000,
      downPayment: 0,
      tradeInValue: 0,
      annualInterestRate: 5,
      loanTermMonths: 60,
      salesTaxRate: 7.7,
      currency: "CHF",
      includeVAT: true,
    });
    expect(noVAT.ok).toBe(true);
    expect(withVAT.ok).toBe(true);
    if (noVAT.ok && withVAT.ok) {
      expect(withVAT.value.totalVehicleCost).toBeGreaterThan(noVAT.value.totalVehicleCost);
    }
  });
});

describe("calculateVehicleLease", () => {
  it("returns ok: false for vehiclePrice = 0", () => {
    const result = calculateVehicleLease({
      vehiclePrice: 0,
      downPayment: 0,
      tradeInValue: 0,
      leaseTermMonths: 36,
      residualPercent: 50,
      moneyFactor: 0.00145,
      annualKmLimit: 15000,
      excessKmCharge: 0.25,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates monthly lease payment", () => {
    const result = calculateVehicleLease({
      vehiclePrice: 30000,
      downPayment: 3000,
      tradeInValue: 0,
      leaseTermMonths: 36,
      residualPercent: 50,
      moneyFactor: 0.00145,
      annualKmLimit: 15000,
      excessKmCharge: 0.25,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.monthlyPayment).toBeGreaterThan(0);
    }
  });

  it("residual value is percentage of vehicle price", () => {
    const result = calculateVehicleLease({
      vehiclePrice: 30000,
      downPayment: 0,
      tradeInValue: 0,
      leaseTermMonths: 36,
      residualPercent: 50,
      moneyFactor: 0.00145,
      annualKmLimit: 15000,
      excessKmCharge: 0.25,
      salesTaxRate: 0,
      currency: "CHF",
      includeVAT: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.residualValue).toBe(15000); // 50% of 30000
    }
  });
});

describe("aprToMoneyFactor and moneyFactorToAPR", () => {
  it("converts 3.48% APR to 0.00145 money factor", () => {
    expect(aprToMoneyFactor(3.48)).toBeCloseTo(0.00145, 5);
  });

  it("converts 0.00145 money factor back to ~3.48% APR", () => {
    expect(moneyFactorToAPR(0.00145)).toBeCloseTo(3.48, 1);
  });

  it("roundtrip APR → money factor → APR", () => {
    const apr = 5.0;
    expect(moneyFactorToAPR(aprToMoneyFactor(apr))).toBeCloseTo(apr, 5);
  });
});
