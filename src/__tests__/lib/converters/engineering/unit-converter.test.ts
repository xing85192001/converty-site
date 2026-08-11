import { describe, expect, it } from "vitest";
import {
  calculateUnitConversion,
  UNIT_CATEGORIES,
} from "@/lib/converters/engineering/unit-converter";

describe("calculateUnitConversion", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for unknown categoryId", () => {
      const result = calculateUnitConversion({
        categoryId: "unknown-category",
        fromUnit: "m",
        toUnit: "ft",
        value: 1,
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for unknown fromUnit", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "unknown",
        toUnit: "ft",
        value: 1,
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for unknown toUnit", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "m",
        toUnit: "unknown",
        value: 1,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("length conversions", () => {
    it("1 meter = 3.28084 feet", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "m",
        toUnit: "ft",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.result).toBeCloseTo(3.28084, 4);
    });

    it("1 foot = 0.3048 meters", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "ft",
        toUnit: "m",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.result).toBeCloseTo(0.3048, 4);
    });

    it("same unit conversion returns 1:1", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "m",
        toUnit: "m",
        value: 5,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.result).toBeCloseTo(5, 4);
    });
  });

  describe("pressure conversions", () => {
    it("1 atm = 101325 Pa", () => {
      const result = calculateUnitConversion({
        categoryId: "pressure",
        fromUnit: "atm",
        toUnit: "Pa",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.result).toBeCloseTo(101325, 0);
    });

    it("1 MPa = 1,000,000 Pa", () => {
      const result = calculateUnitConversion({
        categoryId: "pressure",
        fromUnit: "MPa",
        toUnit: "Pa",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.result).toBeCloseTo(1e6, 0);
    });
  });

  describe("mass conversions", () => {
    it.each([
      ["mass", "kg", "lb", 1, 2.20462, 4],
      ["mass", "lb", "kg", 1, 0.453592, 4],
    ])("category=%s: %s %s = %s %s (≈%s decimals)", (categoryId, from, to, val, expected, prec) => {
      const result = calculateUnitConversion({
        categoryId,
        fromUnit: from,
        toUnit: to,
        value: val,
      });
      if (result.ok) {
        expect(result.value.result).toBeCloseTo(expected, prec);
      }
    });
  });

  describe("result structure", () => {
    it("returns result, conversionFactor, steps, allConversions", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "m",
        toUnit: "ft",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.conversionFactor).toBeGreaterThan(0);
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.allConversions).toBeInstanceOf(Array);
    });

    it("allConversions includes all units in category", () => {
      const result = calculateUnitConversion({
        categoryId: "length",
        fromUnit: "m",
        toUnit: "ft",
        value: 1,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const lengthCategory = UNIT_CATEGORIES.find((c) => c.id === "length");
      expect(result.value.allConversions.length).toBe(lengthCategory!.units.length);
    });
  });
});

describe("UNIT_CATEGORIES", () => {
  it("contains at least 5 categories", () => {
    expect(UNIT_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  it("each category has id, name, and units array", () => {
    for (const cat of UNIT_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.units.length).toBeGreaterThan(0);
    }
  });
});
