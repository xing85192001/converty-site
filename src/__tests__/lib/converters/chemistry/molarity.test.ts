import { describe, expect, it } from "vitest";
import { calculateMolarity } from "@/lib/converters/chemistry/molarity";

describe("calculateMolarity", () => {
  describe("error results for invalid inputs", () => {
    it("returns ok:false for volume = 0", () => {
      expect(
        calculateMolarity({
          mode: "moles-volume",
          moles: 1,
          volume: 0,
          volumeUnit: "L",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for negative volume", () => {
      expect(
        calculateMolarity({
          mode: "moles-volume",
          moles: 1,
          volume: -1,
          volumeUnit: "L",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for moles-volume mode with zero moles", () => {
      expect(
        calculateMolarity({
          mode: "moles-volume",
          moles: 0,
          volume: 1,
          volumeUnit: "L",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for mass-volume mode with zero mass", () => {
      expect(
        calculateMolarity({
          mode: "mass-volume",
          mass: 0,
          molecularWeight: 18,
          volume: 1,
          volumeUnit: "L",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for mass-volume mode with zero molecular weight", () => {
      expect(
        calculateMolarity({
          mode: "mass-volume",
          mass: 1,
          molecularWeight: 0,
          volume: 1,
          volumeUnit: "L",
        }).ok
      ).toBe(false);
    });
  });

  describe("moles-volume mode", () => {
    it("0.5 mol in 0.5 L → 1.0 M", () => {
      const result = calculateMolarity({
        mode: "moles-volume",
        moles: 0.5,
        volume: 0.5,
        volumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.molarity).toBeCloseTo(1.0, 4);
      }
    });

    it("2 mol in 4 L → 0.5 M", () => {
      const result = calculateMolarity({
        mode: "moles-volume",
        moles: 2,
        volume: 4,
        volumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.molarity).toBeCloseTo(0.5, 4);
      }
    });

    it("1 mol in 500 mL → 2.0 M", () => {
      const result = calculateMolarity({
        mode: "moles-volume",
        moles: 1,
        volume: 500,
        volumeUnit: "mL",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.molarity).toBeCloseTo(2.0, 4);
      }
    });
  });

  describe("mass-volume mode", () => {
    it("18 g NaCl (MW=58.44) in 1 L → ≈0.308 M", () => {
      const result = calculateMolarity({
        mode: "mass-volume",
        mass: 18,
        molecularWeight: 58.44,
        volume: 1,
        volumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.molarity).toBeCloseTo(0.308, 2);
      }
    });
  });

  describe("result structure", () => {
    it("returns molarity and moles and volumeL", () => {
      const result = calculateMolarity({
        mode: "moles-volume",
        moles: 1,
        volume: 1,
        volumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.molarity).toBeDefined();
        expect(result.value.moles).toBeDefined();
        expect(result.value.volumeL).toBeDefined();
      }
    });

    it("returns concentration in multiple units", () => {
      const result = calculateMolarity({
        mode: "moles-volume",
        moles: 1,
        volume: 1,
        volumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.concentrationUnits.M).toBeCloseTo(1.0, 4);
        expect(result.value.concentrationUnits.mM).toBeCloseTo(1000, 1);
      }
    });
  });
});
