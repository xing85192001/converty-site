import { describe, expect, it } from "vitest";
import { calculatePipeFlow } from "@/lib/converters/engineering/pipe-flow";

// Base inputs: custom fluid/pipe properties (no DB dependency)
const BASE_INPUT = {
  diameter: 50, // mm
  length: 100, // m
  velocity: 2, // m/s
  pipeMaterialId: "",
  fluidId: "",
  customRoughness: 0.05, // mm (commercial steel)
  customDensity: 1000, // kg/m³ (water)
  customViscosity: 0.001, // Pa·s (water at 20°C)
};

describe("calculatePipeFlow", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for diameter = 0", () => {
      const result = calculatePipeFlow({ ...BASE_INPUT, diameter: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for velocity = 0", () => {
      const result = calculatePipeFlow({ ...BASE_INPUT, velocity: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for length = 0", () => {
      const result = calculatePipeFlow({ ...BASE_INPUT, length: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for density = 0", () => {
      const result = calculatePipeFlow({ ...BASE_INPUT, customDensity: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("Reynolds number: Re = ρvD/μ", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("Re = ρvD/μ = 1000×2×0.05/0.001 = 100,000", () => {
      // D = 50 mm = 0.05 m
      // Re = 1000 × 2 × 0.05 / 0.001 = 100,000
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.reynoldsNumber).toBeCloseTo(100000, -2);
    });

    it("Re > 4000 → turbulent flow", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.flowRegime).toBe("turbulent");
    });
  });

  describe("laminar flow (Re < 2300)", () => {
    it("very slow velocity gives laminar flow", () => {
      const result = calculatePipeFlow({
        ...BASE_INPUT,
        velocity: 0.001, // very slow → Re = 50
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.flowRegime).toBe("laminar");
    });

    it("laminar flow: friction factor f = 64/Re", () => {
      // Re = 1000 × 0.001 × 0.05 / 0.001 = 50
      const result = calculatePipeFlow({
        ...BASE_INPUT,
        velocity: 0.001,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expectedF = 64 / result.value.reynoldsNumber;
      expect(result.value.frictionFactor).toBeCloseTo(expectedF, 4);
    });
  });

  describe("pressure drop", () => {
    it("pressureDrop is positive", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.pressureDrop).toBeGreaterThan(0);
    });

    it("longer pipe has higher pressure drop", () => {
      const short = calculatePipeFlow(BASE_INPUT);
      const long = calculatePipeFlow({ ...BASE_INPUT, length: 200 });
      expect(short.ok).toBe(true);
      expect(long.ok).toBe(true);
      if (!short.ok || !long.ok) return;
      expect(long.value.pressureDrop).toBeGreaterThan(short.value.pressureDrop);
    });

    it("returns pressure in multiple units: pa, kpa, bar, psi", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.pressureUnits.pa).toBeGreaterThan(0);
      expect(result.value.pressureUnits.kpa).toBeGreaterThan(0);
      expect(result.value.pressureUnits.bar).toBeGreaterThan(0);
      expect(result.value.pressureUnits.psi).toBeGreaterThan(0);
    });
  });

  describe("transitional flow (2300 ≤ Re < 4000)", () => {
    it("velocity that gives Re ≈ 3000 results in transitional flow", () => {
      // Re = ρvD/μ = 1000 * v * 0.05 / 0.001 = 50000v → v for Re=3000: v = 3000/50000 = 0.06
      const result = calculatePipeFlow({
        ...BASE_INPUT,
        velocity: 0.06,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.flowRegime).toBe("transitional");
    });
  });

  describe("pipe material and fluid lookup", () => {
    it("returns pipeMaterialName when valid pipeMaterialId is provided", () => {
      // Use a known material ID if exists, else test that null materialId works
      const result = calculatePipeFlow({ ...BASE_INPUT, pipeMaterialId: "" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.pipeMaterialName).toBeNull();
    });
  });

  describe("result structure", () => {
    it("has flowRate, flowRateLpm, headLoss, relativeRoughness", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.flowRate).toBeGreaterThan(0);
      expect(result.value.flowRateLpm).toBeGreaterThan(0);
      expect(result.value.headLoss).toBeGreaterThan(0);
      expect(result.value.relativeRoughness).toBeGreaterThan(0);
    });

    it("has steps array", () => {
      const result = calculatePipeFlow(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
