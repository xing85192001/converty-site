import { describe, expect, it } from "vitest";
import { calculatePh } from "@/lib/converters/chemistry/ph-calculator";

describe("calculatePh (real acids-bases.json data)", () => {
  describe("error results for invalid inputs", () => {
    it("returns ok:false for strong-acid with concentration = 0", () => {
      expect(
        calculatePh({
          mode: "strong-acid",
          concentration: 0,
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for from-h-concentration with hConcentration = 0", () => {
      expect(
        calculatePh({
          mode: "from-h-concentration",
          hConcentration: 0,
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for from-ph with ph outside 0-14 range", () => {
      expect(
        calculatePh({
          mode: "from-ph",
          ph: -1,
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for from-ph with ph > 14", () => {
      expect(
        calculatePh({
          mode: "from-ph",
          ph: 15,
        }).ok
      ).toBe(false);
    });
  });

  describe("strong-acid mode", () => {
    it("strong acid HCl 0.01 M → pH = 2.0", () => {
      const result = calculatePh({
        mode: "strong-acid",
        concentration: 0.01,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(2.0, 1);
      }
    });

    it("strong acid 1.0 M → pH = 0.0", () => {
      const result = calculatePh({
        mode: "strong-acid",
        concentration: 1.0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(0.0, 1);
      }
    });
  });

  describe("strong-base mode", () => {
    it("strong base NaOH 0.01 M → pH = 12.0", () => {
      const result = calculatePh({
        mode: "strong-base",
        concentration: 0.01,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(12.0, 1);
      }
    });
  });

  describe("from-h-concentration mode", () => {
    it("[H+] = 1e-7 → pH = 7.0 (pure water)", () => {
      const result = calculatePh({
        mode: "from-h-concentration",
        hConcentration: 1e-7,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(7.0, 1);
      }
    });

    it("[H+] = 0.01 → pH = 2.0", () => {
      const result = calculatePh({
        mode: "from-h-concentration",
        hConcentration: 0.01,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(2.0, 1);
      }
    });
  });

  describe("from-ph mode", () => {
    it("pH = 7.0 → solutionType neutral", () => {
      const result = calculatePh({ mode: "from-ph", ph: 7 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.solutionType).toBe("neutral");
      }
    });

    it("pH = 2.0 → solutionType strongly acidic", () => {
      const result = calculatePh({ mode: "from-ph", ph: 2 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.solutionType).toBe("strongly acidic");
      }
    });

    it("pH = 12.0 → solutionType strongly basic", () => {
      const result = calculatePh({ mode: "from-ph", ph: 12 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.solutionType).toBe("strongly basic");
      }
    });
  });

  describe("from-poh mode", () => {
    it("pOH = 7.0 → pH = 7.0", () => {
      const result = calculatePh({ mode: "from-poh", poh: 7 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeCloseTo(7.0, 1);
      }
    });
  });

  describe("result structure", () => {
    it("result includes ph, poh, hConcentration, ohConcentration, color, steps", () => {
      const result = calculatePh({
        mode: "strong-acid",
        concentration: 0.01,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph).toBeDefined();
        expect(result.value.poh).toBeDefined();
        expect(result.value.hConcentration).toBeDefined();
        expect(result.value.ohConcentration).toBeDefined();
        expect(result.value.color).toBeTruthy();
        expect(result.value.steps).toBeInstanceOf(Array);
      }
    });

    it("pH + pOH = 14", () => {
      const result = calculatePh({
        mode: "strong-acid",
        concentration: 0.01,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.ph + result.value.poh).toBeCloseTo(14, 5);
      }
    });
  });
});
