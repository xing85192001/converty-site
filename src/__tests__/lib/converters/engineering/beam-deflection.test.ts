import { describe, expect, it } from "vitest";
import { calculateBeamDeflection } from "@/lib/converters/engineering/beam-deflection";

// Beam properties: steel I-beam typical values
const BASE_INPUT = {
  beamType: "simply-supported" as const,
  loadType: "point-load" as const,
  length: 5, // m
  momentOfInertia: 100e6, // mm⁴ (100×10⁶ mm⁴)
  youngsModulus: 200, // GPa (steel)
  pointLoad: 10, // kN
};

describe("calculateBeamDeflection", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for length = 0", () => {
      const result = calculateBeamDeflection({ ...BASE_INPUT, length: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for youngsModulus = 0", () => {
      const result = calculateBeamDeflection({ ...BASE_INPUT, youngsModulus: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for momentOfInertia = 0", () => {
      const result = calculateBeamDeflection({ ...BASE_INPUT, momentOfInertia: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for point-load type with no pointLoad", () => {
      const input = { ...BASE_INPUT, pointLoad: undefined };
      const result = calculateBeamDeflection(input);
      expect(result.ok).toBe(false);
    });
  });

  describe("simply-supported beam with point load at midspan", () => {
    it("returns ok result", () => {
      const result = calculateBeamDeflection(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("maxDeflection is positive", () => {
      const result = calculateBeamDeflection(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.maxDeflection).toBeGreaterThan(0);
    });

    it("has shearDiagram, momentDiagram, deflectionCurve arrays", () => {
      const result = calculateBeamDeflection(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.shearDiagram).toBeInstanceOf(Array);
      expect(result.value.momentDiagram).toBeInstanceOf(Array);
      expect(result.value.deflectionCurve).toBeInstanceOf(Array);
    });

    it("deflectionRatios.actual is positive", () => {
      const result = calculateBeamDeflection(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.deflectionRatios.actual).toBeGreaterThan(0);
    });
  });

  describe("simply-supported beam with distributed load", () => {
    it("δ = 5wL⁴/(384EI): returns valid deflection for uniform load", () => {
      const result = calculateBeamDeflection({
        beamType: "simply-supported",
        loadType: "distributed-load",
        length: 5,
        momentOfInertia: 100e6,
        youngsModulus: 200,
        distributedLoad: 10, // kN/m
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.maxDeflection).toBeGreaterThan(0);
    });
  });

  describe("cantilever beam", () => {
    it("cantilever beam with point load returns ok result", () => {
      const result = calculateBeamDeflection({
        ...BASE_INPUT,
        beamType: "cantilever",
      });
      expect(result.ok).toBe(true);
    });

    it("cantilever deflection is greater than simply-supported (same load)", () => {
      const ssResult = calculateBeamDeflection(BASE_INPUT);
      const cantResult = calculateBeamDeflection({ ...BASE_INPUT, beamType: "cantilever" });
      expect(ssResult.ok).toBe(true);
      expect(cantResult.ok).toBe(true);
      if (!ssResult.ok || !cantResult.ok) return;
      expect(cantResult.value.maxDeflection).toBeGreaterThan(ssResult.value.maxDeflection);
    });
  });

  describe("fixed-fixed beam", () => {
    it("fixed-fixed beam returns ok result", () => {
      const result = calculateBeamDeflection({
        ...BASE_INPUT,
        beamType: "fixed-fixed",
      });
      expect(result.ok).toBe(true);
    });

    it("fixed-fixed deflection is less than simply-supported (stiffer)", () => {
      const ssResult = calculateBeamDeflection(BASE_INPUT);
      const ffResult = calculateBeamDeflection({ ...BASE_INPUT, beamType: "fixed-fixed" });
      expect(ssResult.ok).toBe(true);
      expect(ffResult.ok).toBe(true);
      if (!ssResult.ok || !ffResult.ok) return;
      expect(ffResult.value.maxDeflection).toBeLessThan(ssResult.value.maxDeflection);
    });
  });

  describe("units output", () => {
    it("returns deflection in mm, in, cm", () => {
      const result = calculateBeamDeflection(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.units.deflection.mm).toBeGreaterThan(0);
      expect(result.value.units.deflection.in).toBeGreaterThan(0);
      expect(result.value.units.deflection.cm).toBeGreaterThan(0);
    });
  });

  describe("longer beam deflects more", () => {
    it("10m beam deflects more than 5m beam (same load & section)", () => {
      const short = calculateBeamDeflection(BASE_INPUT);
      const long = calculateBeamDeflection({ ...BASE_INPUT, length: 10 });
      expect(short.ok).toBe(true);
      expect(long.ok).toBe(true);
      if (!short.ok || !long.ok) return;
      expect(long.value.maxDeflection).toBeGreaterThan(short.value.maxDeflection);
    });
  });
});
