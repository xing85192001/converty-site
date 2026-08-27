import { describe, expect, it } from "vitest";
import { calculateEV, calculateSettingsForEV } from "@/lib/converters/photo/light-ev";

describe("calculateEV", () => {
  it("returns error for zero aperture", () => {
    const result = calculateEV(0, 1 / 125, 100);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero shutter speed", () => {
    const result = calculateEV(4, 0, 100);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero ISO", () => {
    const result = calculateEV(4, 1 / 125, 0);
    expect(result.ok).toBe(false);
  });

  it("calculates EV for f/4, 1/125s, ISO100 ≈ EV 9", () => {
    // EV = log2(N²/t) = log2(16 * 125) = log2(2000) ≈ 11
    // EV100 = EV + log2(100/100) = EV + 0 = EV
    const result = calculateEV(4, 1 / 125, 100);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ev).toBeCloseTo(11, 0);
  });

  it("higher ISO increases EV100", () => {
    const low = calculateEV(4, 1 / 125, 100);
    const high = calculateEV(4, 1 / 125, 800);
    expect(low.ok).toBe(true);
    expect(high.ok).toBe(true);
    if (!low.ok || !high.ok) return;
    expect(high.value.ev100).toBeGreaterThan(low.value.ev100);
  });

  it("returns a valid light level string", () => {
    const result = calculateEV(4, 1 / 125, 100);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lightLevel).toBeTruthy();
    expect(typeof result.value.lightLevel).toBe("string");
  });

  it("returns lux > 0", () => {
    const result = calculateEV(4, 1 / 125, 100);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lux).toBeGreaterThan(0);
  });
});

describe("calculateSettingsForEV", () => {
  it("calculates shutter speed for fixed aperture", () => {
    const result = calculateSettingsForEV(10, 4);
    expect(result.shutterSpeed).toBeDefined();
    expect(result.shutterSpeed).toBeGreaterThan(0);
  });

  it("calculates aperture for fixed shutter speed", () => {
    const result = calculateSettingsForEV(10, undefined, 1 / 125);
    expect(result.aperture).toBeDefined();
    expect(result.aperture).toBeGreaterThan(0);
  });
});
