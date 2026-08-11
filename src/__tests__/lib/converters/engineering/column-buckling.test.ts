import { describe, expect, it } from "vitest";
import { calculateColumnBuckling } from "@/lib/converters/engineering/column-buckling";

// Custom section values for deterministic tests (no DB dependency)
const BASE_INPUT = {
  materialId: "",
  sectionId: "",
  length: 3, // m
  endCondition: "pinned-pinned" as const,
  axis: "x" as const,
  customArea: 5000, // mm²
  customMomentOfInertia: 50e6, // mm⁴
  customYoungsModulus: 200, // GPa (steel)
  customYieldStrength: 250, // MPa
};

describe("calculateColumnBuckling", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for length = 0", () => {
      const result = calculateColumnBuckling({ ...BASE_INPUT, length: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for customYoungsModulus = 0", () => {
      const result = calculateColumnBuckling({ ...BASE_INPUT, customYoungsModulus: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for customMomentOfInertia = 0", () => {
      const result = calculateColumnBuckling({ ...BASE_INPUT, customMomentOfInertia: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("Euler critical load: Pcr = π²EI/(KL)²", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateColumnBuckling(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("eulerLoad is positive", () => {
      const result = calculateColumnBuckling(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.eulerLoad).toBeGreaterThan(0);
    });

    it("pinned-pinned has K=1.0", () => {
      const result = calculateColumnBuckling(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kFactor).toBe(1.0);
    });

    it("fixed-fixed has K=0.5 (lower K = higher Pcr)", () => {
      const result = calculateColumnBuckling({
        ...BASE_INPUT,
        endCondition: "fixed-fixed",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kFactor).toBe(0.5);
    });
  });

  describe("longer column → lower Euler load", () => {
    it("6m column buckles at lower load than 3m column", () => {
      const short = calculateColumnBuckling(BASE_INPUT);
      const long = calculateColumnBuckling({ ...BASE_INPUT, length: 6 });
      expect(short.ok).toBe(true);
      expect(long.ok).toBe(true);
      if (!short.ok || !long.ok) return;
      expect(long.value.eulerLoad).toBeLessThan(short.value.eulerLoad);
    });
  });

  describe("end condition effects", () => {
    it("fixed-free has lowest Euler load (K=2.0, longest effective length)", () => {
      const pinnedPinned = calculateColumnBuckling(BASE_INPUT);
      const fixedFree = calculateColumnBuckling({
        ...BASE_INPUT,
        endCondition: "fixed-free",
      });
      expect(pinnedPinned.ok).toBe(true);
      expect(fixedFree.ok).toBe(true);
      if (!pinnedPinned.ok || !fixedFree.ok) return;
      expect(fixedFree.value.eulerLoad).toBeLessThan(pinnedPinned.value.eulerLoad);
    });

    it("fixed-fixed has highest Euler load (K=0.5)", () => {
      const pinnedPinned = calculateColumnBuckling(BASE_INPUT);
      const fixedFixed = calculateColumnBuckling({
        ...BASE_INPUT,
        endCondition: "fixed-fixed",
      });
      expect(pinnedPinned.ok).toBe(true);
      expect(fixedFixed.ok).toBe(true);
      if (!pinnedPinned.ok || !fixedFixed.ok) return;
      expect(fixedFixed.value.eulerLoad).toBeGreaterThan(pinnedPinned.value.eulerLoad);
    });
  });

  describe("result structure", () => {
    it("has slendernessRatio, radiusOfGyration, bucklingMode", () => {
      const result = calculateColumnBuckling(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.slendernessRatio).toBeGreaterThan(0);
      expect(result.value.radiusOfGyration).toBeGreaterThan(0);
      expect(["elastic", "inelastic"]).toContain(result.value.bucklingMode);
    });

    it("returns load in kN, lbf, kips", () => {
      const result = calculateColumnBuckling(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.loadUnits.kN).toBeGreaterThan(0);
      expect(result.value.loadUnits.lbf).toBeGreaterThan(0);
      expect(result.value.loadUnits.kips).toBeGreaterThan(0);
    });
  });
});
