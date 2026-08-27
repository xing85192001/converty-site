import { describe, expect, it } from "vitest";
import { calculateAdvancedDoF, formatDistance } from "@/lib/converters/photo/advanced-dof";

const validInput = {
  aperture: 8,
  focalLength: 50,
  subjectDistance: 3,
  sensorWidth: 36,
  sensorHeight: 24,
  printWidth: 254,
  viewingDistance: 450,
  visualAcuity: 30,
};

describe("calculateAdvancedDoF", () => {
  it("returns error for zero aperture", () => {
    const result = calculateAdvancedDoF({ ...validInput, aperture: 0 });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero focal length", () => {
    const result = calculateAdvancedDoF({ ...validInput, focalLength: 0 });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero subject distance", () => {
    const result = calculateAdvancedDoF({ ...validInput, subjectDistance: 0 });
    expect(result.ok).toBe(false);
  });

  it("calculates near and far limits", () => {
    const result = calculateAdvancedDoF(validInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nearLimit).toBeGreaterThan(0);
    expect(result.value.nearLimit).toBeLessThan(3);
  });

  it("provides adjustedCoC and standardCoC fields", () => {
    const result = calculateAdvancedDoF(validInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.adjustedCoC).toBeGreaterThan(0);
    expect(result.value.standardCoC).toBeGreaterThan(0);
  });

  it("provides hyperfocalDistance field", () => {
    const result = calculateAdvancedDoF(validInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.hyperfocalDistance).toBeGreaterThan(0);
  });

  it("comparison object has standardNear, standardFar, standardDoF fields", () => {
    const result = calculateAdvancedDoF(validInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.comparison).toHaveProperty("standardNear");
    expect(result.value.comparison).toHaveProperty("standardFar");
    expect(result.value.comparison).toHaveProperty("standardDoF");
  });

  it("wider aperture gives smaller DOF than narrower aperture", () => {
    const wide = calculateAdvancedDoF({ ...validInput, aperture: 1.8 });
    const narrow = calculateAdvancedDoF({ ...validInput, aperture: 16 });
    expect(wide.ok).toBe(true);
    expect(narrow.ok).toBe(true);
    if (!wide.ok || !narrow.ok) return;
    const wideDof = wide.value.totalDoF === Infinity ? 9999 : wide.value.totalDoF;
    const narrowDof = narrow.value.totalDoF === Infinity ? 9999 : narrow.value.totalDoF;
    expect(wideDof).toBeLessThan(narrowDof);
  });
});

describe("formatDistance", () => {
  it("formats infinity as ∞", () => {
    expect(formatDistance(Infinity)).toBe("∞");
  });

  it("formats sub-meter as cm", () => {
    expect(formatDistance(0.5)).toBe("50 cm");
  });

  it("formats meters with 2 decimal places for < 10m", () => {
    expect(formatDistance(3.5)).toBe("3.50 m");
  });

  it("formats large distances with 1 decimal place", () => {
    expect(formatDistance(25.5)).toBe("25.5 m");
  });
});
