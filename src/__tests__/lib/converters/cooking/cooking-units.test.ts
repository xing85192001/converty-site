import { describe, expect, it } from "vitest";
import {
  convertCookingUnit,
  getAllCookingUnits,
  getVolumeUnits,
  getWeightUnits,
} from "@/lib/converters/cooking/cooking-units";

describe("convertCookingUnit - volume to volume", () => {
  it("1 cup = 16 tablespoons", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "cup", toUnit: "tbsp" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(16, 1);
    }
  });

  it("1 tablespoon = 3 teaspoons", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "tbsp", toUnit: "tsp" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(3, 1);
    }
  });

  it("1 cup = 48 teaspoons", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "cup", toUnit: "tsp" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(48, 1);
    }
  });

  it("1 L = 1000 mL", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "l", toUnit: "ml" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(1000, 1);
    }
  });

  it("returns ok: false for amount = 0", () => {
    const result = convertCookingUnit({ amount: 0, fromUnit: "cup", toUnit: "tbsp" });
    expect(result.ok).toBe(false);
  });

  it("returns formula string", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "cup", toUnit: "tbsp" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.formula.length).toBeGreaterThan(0);
    }
  });
});

describe("convertCookingUnit - weight to weight", () => {
  it("1 kg = 1000 g", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "kg", toUnit: "g" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(1000, 1);
    }
  });

  it("1 lb ≈ 453.59 g", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "lb", toUnit: "g" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(453.6, 1);
    }
  });

  it("1 oz ≈ 28.35 g", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "oz", toUnit: "g" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(28.35, 1);
    }
  });
});

describe("convertCookingUnit - cross-type without ingredient", () => {
  it("returns ok: false for cup to g conversion without ingredient", () => {
    const result = convertCookingUnit({ amount: 1, fromUnit: "cup", toUnit: "g" });
    expect(result.ok).toBe(false);
  });
});

describe("it.each volume conversions", () => {
  it.each([
    [1, "cup" as const, "tbsp" as const, 16],
    [1, "tbsp" as const, "tsp" as const, 3],
    [1, "cup" as const, "tsp" as const, 48],
    [2, "cup" as const, "ml" as const, 480],
  ])("%d %s = %d %s", (amount, fromUnit, toUnit, expected) => {
    const result = convertCookingUnit({ amount, fromUnit, toUnit });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.convertedAmount).toBeCloseTo(expected, 0);
    }
  });
});

describe("getVolumeUnits", () => {
  it("returns volume unit list including cup and tbsp", () => {
    const units = getVolumeUnits();
    expect(units).toContain("cup");
    expect(units).toContain("tbsp");
    expect(units).toContain("tsp");
    expect(units).toContain("ml");
    expect(units).toContain("l");
  });
});

describe("getWeightUnits", () => {
  it("returns weight unit list including g and kg", () => {
    const units = getWeightUnits();
    expect(units).toContain("g");
    expect(units).toContain("kg");
    expect(units).toContain("oz");
    expect(units).toContain("lb");
  });
});

describe("getAllCookingUnits", () => {
  it("returns combined volume and weight units", () => {
    const all = getAllCookingUnits();
    expect(all.length).toBeGreaterThan(8);
    expect(all).toContain("cup");
    expect(all).toContain("g");
  });
});
