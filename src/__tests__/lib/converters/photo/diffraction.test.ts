import { describe, expect, it } from "vitest";
import { calculateDiffraction } from "@/lib/converters/photo/diffraction";

describe("calculateDiffraction", () => {
  it("returns error for zero aperture", () => {
    const result = calculateDiffraction({
      aperture: 0,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero megapixels", () => {
    const result = calculateDiffraction({
      aperture: 8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates airy disk diameter for f/8", () => {
    const result = calculateDiffraction({
      aperture: 8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Airy disk = 2.44 × 0.55µm × 8 = 10.7µm
    expect(result.value.airyDiskDiameter).toBeCloseTo(10.74, 1);
  });

  it("narrow aperture gives larger airy disk (more diffraction)", () => {
    const wide = calculateDiffraction({
      aperture: 2.8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    const narrow = calculateDiffraction({
      aperture: 22,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(wide.ok).toBe(true);
    expect(narrow.ok).toBe(true);
    if (!wide.ok || !narrow.ok) return;
    expect(narrow.value.airyDiskDiameter).toBeGreaterThan(wide.value.airyDiskDiameter);
  });

  it("returns pixel pitch > 0", () => {
    const result = calculateDiffraction({
      aperture: 8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.pixelPitch).toBeGreaterThan(0);
  });

  it("returns isDiffractionLimited boolean", () => {
    const result = calculateDiffraction({
      aperture: 8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.value.isDiffractionLimited).toBe("boolean");
  });

  it("returns optimal aperture range", () => {
    const result = calculateDiffraction({
      aperture: 8,
      sensorWidth: 36,
      sensorHeight: 24,
      megapixels: 24,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.optimalApertureRange.min).toBeGreaterThan(0);
    expect(result.value.optimalApertureRange.max).toBeGreaterThan(0);
  });
});
