import { describe, expect, it } from "vitest";
import {
  calculateMacroDiffraction,
  generateEffectiveApertureTable,
} from "@/lib/converters/photo/macro-diffraction";

describe("calculateMacroDiffraction", () => {
  it("returns error for zero aperture", () => {
    const result = calculateMacroDiffraction({
      aperture: 0,
      magnification: 1,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero magnification", () => {
    const result = calculateMacroDiffraction({
      aperture: 11,
      magnification: 0,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates effective aperture: N × (1 + m)", () => {
    const result = calculateMacroDiffraction({
      aperture: 11,
      magnification: 1,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Effective = 11 × (1 + 1) = 22
    expect(result.value.effectiveAperture).toBeCloseTo(22, 0);
  });

  it("effective aperture > marked aperture at magnification > 0", () => {
    const result = calculateMacroDiffraction({
      aperture: 8,
      magnification: 0.5,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.effectiveAperture).toBeGreaterThan(result.value.markedAperture);
  });

  it("light loss at 1:1 = 2 stops", () => {
    const result = calculateMacroDiffraction({
      aperture: 8,
      magnification: 1,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lightLossStops).toBeCloseTo(2, 0);
  });

  it("returns pixel pitch > 0", () => {
    const result = calculateMacroDiffraction({
      aperture: 8,
      magnification: 1,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.pixelPitch).toBeGreaterThan(0);
  });
});

describe("generateEffectiveApertureTable", () => {
  it("returns entries for all aperture/magnification combinations", () => {
    const result = generateEffectiveApertureTable([8, 11], [0.5, 1.0]);
    expect(result).toHaveLength(4);
  });

  it("effective aperture equals N × (1 + m)", () => {
    const result = generateEffectiveApertureTable([8], [1.0]);
    expect(result[0].effective).toBeCloseTo(16, 0);
  });
});
