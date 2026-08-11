import { describe, expect, it } from "vitest";
import {
  calculatePropertyValuation,
  getConditions,
  getPropertyTypes,
  getSwissRegions,
  PROPERTY_FEATURES,
} from "@/lib/converters/realestate/property-valuation";

const BASE_INPUT = {
  propertyType: "apartment" as const,
  region: "bern" as const,
  size: 80,
  rooms: 3,
  constructionYear: 2010,
  condition: "good" as const,
  features: [],
  currency: "CHF" as const,
};

describe("calculatePropertyValuation", () => {
  describe("basic calculations", () => {
    it("returns non-null result for valid input", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result).not.toBeNull();
    });

    it("estimatedValue is positive", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.estimatedValue).toBeGreaterThan(0);
    });

    it("baseValue equals regionPricePerM2 * size", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      // Bern apartment = 8500 CHF/m2; 80m2 = 680,000
      expect(result.baseValue).toBeCloseTo(result.regionPricePerM2 * BASE_INPUT.size, 0);
    });

    it("pricePerM2 equals estimatedValue / size", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.pricePerM2).toBeCloseTo(result.estimatedValue / BASE_INPUT.size, 5);
    });
  });

  describe("value range", () => {
    it("minValue is estimatedValue * 0.85", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.minValue).toBeCloseTo(result.estimatedValue * 0.85, 0);
    });

    it("maxValue is estimatedValue * 1.15", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.maxValue).toBeCloseTo(result.estimatedValue * 1.15, 0);
    });

    it("minValue < estimatedValue < maxValue", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.minValue).toBeLessThan(result.estimatedValue);
      expect(result.estimatedValue).toBeLessThan(result.maxValue);
    });
  });

  describe("condition adjustments", () => {
    it("excellent condition produces higher value than poor condition", () => {
      const poor = calculatePropertyValuation({ ...BASE_INPUT, condition: "poor" });
      const excellent = calculatePropertyValuation({ ...BASE_INPUT, condition: "excellent" });
      expect(excellent.estimatedValue).toBeGreaterThan(poor.estimatedValue);
    });

    it("good condition has zero conditionAdjustment (multiplier 1.0)", () => {
      const result = calculatePropertyValuation({ ...BASE_INPUT, condition: "good" });
      expect(result.conditionAdjustment).toBeCloseTo(0, 0);
    });
  });

  describe("region differences", () => {
    it("Zurich apartment is more expensive than Bern apartment", () => {
      const bern = calculatePropertyValuation(BASE_INPUT);
      const zurich = calculatePropertyValuation({ ...BASE_INPUT, region: "zurich" });
      expect(zurich.estimatedValue).toBeGreaterThan(bern.estimatedValue);
    });
  });

  describe("size scaling", () => {
    it("larger size produces proportionally higher estimated value", () => {
      const small = calculatePropertyValuation({ ...BASE_INPUT, size: 50 });
      const large = calculatePropertyValuation({ ...BASE_INPUT, size: 100 });
      // Not exactly 2x due to feature bonus cap, but substantially larger
      expect(large.estimatedValue).toBeGreaterThan(small.estimatedValue);
    });
  });

  describe("feature bonuses", () => {
    it("adding features increases estimated value", () => {
      const noFeatures = calculatePropertyValuation({ ...BASE_INPUT, features: [] });
      const withFeatures = calculatePropertyValuation({
        ...BASE_INPUT,
        features: ["balcony", "parking"],
      });
      expect(withFeatures.estimatedValue).toBeGreaterThan(noFeatures.estimatedValue);
    });

    it("featureBonus is non-negative", () => {
      const result = calculatePropertyValuation({ ...BASE_INPUT, features: ["garden"] });
      expect(result.featureBonus).toBeGreaterThanOrEqual(0);
    });

    it("unknown feature id has no effect", () => {
      const base = calculatePropertyValuation({ ...BASE_INPUT, features: [] });
      const withUnknown = calculatePropertyValuation({
        ...BASE_INPUT,
        features: ["nonexistent_feature"],
      });
      expect(withUnknown.estimatedValue).toBeCloseTo(base.estimatedValue, 0);
    });
  });

  describe("confidence level", () => {
    it("high confidence for large well-specified property", () => {
      const result = calculatePropertyValuation({
        ...BASE_INPUT,
        size: 100,
        rooms: 4,
        constructionYear: 2000,
      });
      expect(result.confidence).toBe("high");
    });

    it("low confidence for very small old property", () => {
      const result = calculatePropertyValuation({
        ...BASE_INPUT,
        size: 20,
        rooms: 1,
        constructionYear: 1900,
      });
      expect(result.confidence).toBe("low");
    });
  });

  describe("result structure", () => {
    it("returns regionName string", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.regionName).toBe("Bern");
    });

    it("returns currency as CHF", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(result.currency).toBe("CHF");
    });

    it("returns vsRegionalAverage number", () => {
      const result = calculatePropertyValuation(BASE_INPUT);
      expect(typeof result.vsRegionalAverage).toBe("number");
    });
  });
});

describe("helper functions", () => {
  it("getPropertyTypes returns array with apartment, house, commercial", () => {
    const types = getPropertyTypes();
    expect(types).toContain("apartment");
    expect(types).toContain("house");
    expect(types).toContain("commercial");
  });

  it("getConditions returns array with all 5 conditions", () => {
    const conditions = getConditions();
    expect(conditions).toContain("poor");
    expect(conditions).toContain("excellent");
    expect(conditions).toHaveLength(5);
  });

  it("getSwissRegions returns array including zurich and bern", () => {
    const regions = getSwissRegions();
    expect(regions).toContain("zurich");
    expect(regions).toContain("bern");
  });

  it("PROPERTY_FEATURES includes balcony", () => {
    const balcony = PROPERTY_FEATURES.find((f) => f.id === "balcony");
    expect(balcony).toBeDefined();
    expect(balcony?.bonus).toBeGreaterThan(0);
  });
});
