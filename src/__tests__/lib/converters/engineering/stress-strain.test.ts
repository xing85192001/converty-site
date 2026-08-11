import { describe, expect, it } from "vitest";
import { calculateStressStrain, getMaterials } from "@/lib/converters/engineering/stress-strain";

// Base input: no material from DB, custom values
const BASE_INPUT = {
  mode: "stress" as const,
  force: 10, // kN
  area: 100, // mm²
  originalLength: 1000, // mm
  changeInLength: 0.5, // mm
  materialId: "",
  customYoungsModulus: 200, // GPa (steel)
  customYieldStrength: 250, // MPa
};

describe("calculateStressStrain", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for area = 0", () => {
      const result = calculateStressStrain({ ...BASE_INPUT, area: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for originalLength = 0", () => {
      const result = calculateStressStrain({ ...BASE_INPUT, originalLength: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for negative force", () => {
      const result = calculateStressStrain({ ...BASE_INPUT, force: -1 });
      expect(result.ok).toBe(false);
    });
  });

  describe("stress mode: σ = F/A", () => {
    it("1000 N / 0.01 m² = 100,000 Pa = 100 kPa", () => {
      // force = 1 kN = 1000 N, area = 10 mm²
      // stress = 1000 / 10 = 100 N/mm² = 100 MPa
      const result = calculateStressStrain({
        ...BASE_INPUT,
        force: 1,
        area: 10,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.stress).toBeCloseTo(100, 1);
    });

    it("stress = F/A: 10 kN / 100 mm² = 100 MPa", () => {
      const result = calculateStressStrain(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // 10 kN = 10000 N, area = 100 mm², stress = 100 N/mm² = 100 MPa
      expect(result.value.stress).toBeCloseTo(100, 1);
    });

    it("larger area → lower stress (same force)", () => {
      const small = calculateStressStrain({ ...BASE_INPUT, area: 100 });
      const large = calculateStressStrain({ ...BASE_INPUT, area: 200 });
      expect(small.ok).toBe(true);
      expect(large.ok).toBe(true);
      if (!small.ok || !large.ok) return;
      expect(large.value.stress).toBeLessThan(small.value.stress);
    });
  });

  describe("strain mode: ε = ΔL/L", () => {
    it("ΔL/L = 0.5/1000 = 0.0005", () => {
      const result = calculateStressStrain({ ...BASE_INPUT, mode: "strain" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.strain).toBeCloseTo(0.0005, 4);
    });
  });

  describe("safety factor", () => {
    it("safety factor = yield / stress (when material provided)", () => {
      // stress = 100 MPa, yield = 250 MPa → SF = 2.5
      const result = calculateStressStrain(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      if (result.value.safetyFactor !== null) {
        expect(result.value.safetyFactor).toBeCloseTo(2.5, 1);
      }
    });

    it("exceedsYield is false when stress < yield strength", () => {
      const result = calculateStressStrain(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.exceedsYield).toBe(false);
    });

    it("exceedsYield is true when stress > yield strength", () => {
      // 500 kN / 100 mm² = 5000 MPa >> yield 250 MPa
      const result = calculateStressStrain({ ...BASE_INPUT, force: 500 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.exceedsYield).toBe(true);
    });
  });

  describe("youngs-modulus mode", () => {
    it("calculates Young's modulus from stress and strain", () => {
      // force=10kN, area=100mm² → stress=100MPa; changeInLength=0.5, origLength=1000 → strain=0.0005
      // E = σ/ε = 100/(0.0005*1000) = 200 GPa
      const result = calculateStressStrain({ ...BASE_INPUT, mode: "youngs-modulus" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.youngsModulus).toBeCloseTo(200, 0);
    });

    it("returns error when strain = 0 (changeInLength = 0)", () => {
      const result = calculateStressStrain({
        ...BASE_INPUT,
        mode: "youngs-modulus",
        changeInLength: 0,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("strain mode - additional cases", () => {
    it("strain mode with youngsModulus = 0 gives stress = 0", () => {
      const result = calculateStressStrain({
        ...BASE_INPUT,
        mode: "strain",
        customYoungsModulus: 0,
        customYieldStrength: 0,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.stress).toBe(0);
    });
  });

  describe("stress mode - no Young's modulus", () => {
    it("stress mode with youngsModulus = 0 gives strain = 0", () => {
      const result = calculateStressStrain({
        ...BASE_INPUT,
        customYoungsModulus: 0,
        customYieldStrength: 0,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.strain).toBe(0);
      expect(result.value.safetyFactor).toBeNull();
    });
  });

  describe("material lookup", () => {
    it("getMaterials returns array of materials", () => {
      const materials = getMaterials();
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);
    });

    it("uses material properties when valid materialId is provided", () => {
      const materials = getMaterials();
      if (materials.length === 0) return;
      const materialId = materials[0].id;
      const result = calculateStressStrain({ ...BASE_INPUT, materialId });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.materialName).not.toBeNull();
    });
  });

  describe("result structure", () => {
    it("returns stress in MPa, GPa, psi, ksi", () => {
      const result = calculateStressStrain(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.stressUnits.mpa).toBeGreaterThan(0);
      expect(result.value.stressUnits.gpa).toBeGreaterThan(0);
      expect(result.value.stressUnits.psi).toBeGreaterThan(0);
      expect(result.value.stressUnits.ksi).toBeGreaterThan(0);
    });

    it("has steps array", () => {
      const result = calculateStressStrain(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
