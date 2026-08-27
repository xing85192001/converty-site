import { describe, expect, it } from "vitest";
import {
  calculateFocusStackShots,
  calculateMacroDoF,
  calculateMacroDoFWithFocalLength,
} from "@/lib/converters/photo/macro-dof";

describe("calculateMacroDoF", () => {
  it("returns error for zero aperture", () => {
    const result = calculateMacroDoF({ aperture: 0, magnification: 1, coc: 0.03 });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero magnification", () => {
    const result = calculateMacroDoF({ aperture: 11, magnification: 0, coc: 0.03 });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero CoC", () => {
    const result = calculateMacroDoF({ aperture: 11, magnification: 1, coc: 0 });
    expect(result.ok).toBe(false);
  });

  it("calculates shallow DOF at 1:1 macro", () => {
    const result = calculateMacroDoF({ aperture: 11, magnification: 1, coc: 0.03 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // DOF should be in mm range
    expect(result.value.totalDoF).toBeGreaterThan(0);
    expect(result.value.totalDoF).toBeLessThan(50); // less than 50mm
  });

  it("higher magnification gives shallower DOF", () => {
    const halfSize = calculateMacroDoF({ aperture: 11, magnification: 0.5, coc: 0.03 });
    const lifeSize = calculateMacroDoF({ aperture: 11, magnification: 1, coc: 0.03 });
    expect(halfSize.ok).toBe(true);
    expect(lifeSize.ok).toBe(true);
    if (!halfSize.ok || !lifeSize.ok) return;
    expect(lifeSize.value.totalDoF).toBeLessThan(halfSize.value.totalDoF);
  });

  it("for symmetric lens: inFront equals behind", () => {
    const result = calculateMacroDoF({ aperture: 11, magnification: 1, coc: 0.03 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.inFront).toBeCloseTo(result.value.behind, 3);
  });

  it("returns effective aperture > marked aperture", () => {
    const result = calculateMacroDoF({ aperture: 11, magnification: 1, coc: 0.03 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.effectiveAperture).toBeGreaterThan(11);
  });
});

describe("calculateMacroDoFWithFocalLength", () => {
  it("returns working distance when focal length provided", () => {
    const result = calculateMacroDoFWithFocalLength(11, 1, 0.03, 100);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.workingDistance).toBeGreaterThan(0);
  });
});

describe("calculateFocusStackShots", () => {
  it("returns at least 1 shot", () => {
    const shots = calculateFocusStackShots(10, 11, 1, 0.03);
    expect(shots).toBeGreaterThanOrEqual(1);
  });

  it("more depth needed → more shots", () => {
    const fewShots = calculateFocusStackShots(5, 11, 1, 0.03);
    const manyShots = calculateFocusStackShots(50, 11, 1, 0.03);
    expect(manyShots).toBeGreaterThan(fewShots);
  });
});
