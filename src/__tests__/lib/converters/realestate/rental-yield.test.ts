import { describe, expect, it } from "vitest";
import {
  calculateRentalYield,
  getSwissBenchmarks,
  getSwissCityYields,
} from "@/lib/converters/realestate/rental-yield";

const BASE_INPUT = {
  purchasePrice: 300_000,
  annualRent: 18_000,
  annualExpenses: 2_000,
  transactionCostsPercent: 4,
  currency: "CHF" as const,
  includeMortgage: false,
  monthlyMortgagePayment: 0,
};

describe("calculateRentalYield", () => {
  describe("basic yield calculations", () => {
    it("grossYield is annualRent / purchasePrice * 100", () => {
      const result = calculateRentalYield(BASE_INPUT);
      // 18000 / 300000 * 100 = 6%
      expect(result.grossYield).toBeCloseTo(6, 5);
    });

    it("gross yield for $18,000 rent on $300,000 property is 6%", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.grossYield).toBeCloseTo(6, 1);
    });

    it("netYield is less than grossYield due to expenses", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.netYield).toBeLessThan(result.grossYield);
    });

    it("capRate equals netOperatingIncome / purchasePrice * 100", () => {
      const result = calculateRentalYield(BASE_INPUT);
      // NOI = 18000 - 2000 = 16000; capRate = 16000/300000*100 = 5.33%
      expect(result.capRate).toBeCloseTo(
        (result.netOperatingIncome / BASE_INPUT.purchasePrice) * 100,
        5
      );
    });

    it("grossRentMultiplier (GRM) is purchasePrice / annualRent", () => {
      const result = calculateRentalYield(BASE_INPUT);
      // GRM = 300000 / 18000 = 16.67
      expect(result.grm).toBeCloseTo(300_000 / 18_000, 2);
    });
  });

  describe("transaction costs", () => {
    it("totalInvestment includes transaction costs", () => {
      const result = calculateRentalYield(BASE_INPUT);
      const expectedCosts = 300_000 * 0.04;
      expect(result.transactionCosts).toBeCloseTo(expectedCosts, 0);
      expect(result.totalInvestment).toBeCloseTo(300_000 + expectedCosts, 0);
    });
  });

  describe("cash flow calculations", () => {
    it("monthlyGrossIncome equals annualRent / 12", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.monthlyGrossIncome).toBeCloseTo(18_000 / 12, 5);
    });

    it("monthlyExpenses equals annualExpenses / 12", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.monthlyExpenses).toBeCloseTo(2_000 / 12, 5);
    });

    it("annualCashFlow is 12x monthlyCashFlow", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.annualCashFlow).toBeCloseTo(result.monthlyCashFlow * 12, 5);
    });
  });

  describe("mortgage inclusion", () => {
    it("including mortgage reduces monthly cash flow", () => {
      const noMortgage = calculateRentalYield({ ...BASE_INPUT, includeMortgage: false });
      const withMortgage = calculateRentalYield({
        ...BASE_INPUT,
        includeMortgage: true,
        monthlyMortgagePayment: 1000,
      });
      expect(withMortgage.monthlyCashFlow).toBeLessThan(noMortgage.monthlyCashFlow);
    });
  });

  describe("net operating income", () => {
    it("netOperatingIncome equals annualRent minus annualExpenses", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.netOperatingIncome).toBeCloseTo(18_000 - 2_000, 5);
    });
  });

  describe("rating system", () => {
    it("high yield (>= 4.5%) gets excellent rating", () => {
      const result = calculateRentalYield({
        ...BASE_INPUT,
        purchasePrice: 200_000,
        annualRent: 15_000,
        annualExpenses: 500,
        transactionCostsPercent: 1,
      });
      expect(result.rating).toBe("excellent");
    });

    it("very low yield gets poor rating", () => {
      const result = calculateRentalYield({
        ...BASE_INPUT,
        purchasePrice: 2_000_000, // Very high price
        annualRent: 12_000,
      });
      expect(result.rating).toBe("poor");
    });

    it("returns a valid rating value", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(["excellent", "good", "fair", "poor"]).toContain(result.rating);
    });
  });

  describe("market comparison", () => {
    it("returns marketAverage as Swiss average 2.92%", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.marketAverage).toBeCloseTo(2.92, 2);
    });

    it("returns comparisonToMarket as above, below, or average", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(["above", "below", "average"]).toContain(result.comparisonToMarket);
    });
  });

  describe("higher rent yields higher gross yield (invariant)", () => {
    it("doubling rent doubles grossYield", () => {
      const base = calculateRentalYield(BASE_INPUT);
      const doubled = calculateRentalYield({ ...BASE_INPUT, annualRent: 36_000 });
      expect(doubled.grossYield).toBeCloseTo(base.grossYield * 2, 5);
    });

    it("higher property value decreases grossYield", () => {
      const cheap = calculateRentalYield(BASE_INPUT);
      const expensive = calculateRentalYield({ ...BASE_INPUT, purchasePrice: 600_000 });
      expect(expensive.grossYield).toBeLessThan(cheap.grossYield);
    });
  });

  describe("result structure", () => {
    it("returns currency field", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.currency).toBe("CHF");
    });

    it("returns yearsToBreakEven as positive number", () => {
      const result = calculateRentalYield(BASE_INPUT);
      expect(result.yearsToBreakEven).toBeGreaterThan(0);
    });
  });
});

describe("getSwissBenchmarks", () => {
  it("returns object with averageYield", () => {
    const benchmarks = getSwissBenchmarks();
    expect(benchmarks.averageYield).toBeCloseTo(2.92, 2);
  });

  it("excellentYield is greater than goodYield", () => {
    const benchmarks = getSwissBenchmarks();
    expect(benchmarks.excellentYield).toBeGreaterThan(benchmarks.goodYield);
  });
});

describe("getSwissCityYields", () => {
  it("returns yields for Zurich", () => {
    const yields = getSwissCityYields();
    expect(yields.zurich).toBeDefined();
    expect(yields.zurich.average).toBeGreaterThan(0);
  });

  it("returns yields for multiple cities", () => {
    const yields = getSwissCityYields();
    expect(yields.bern).toBeDefined();
    expect(yields.geneva).toBeDefined();
  });
});
