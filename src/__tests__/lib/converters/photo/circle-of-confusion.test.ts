import { describe, expect, it } from "vitest";
import {
  calculateCoC,
  calculateStandardCoC,
  getCoCForSensor,
} from "@/lib/converters/photo/circle-of-confusion";

describe("calculateCoC", () => {
  it("returns error for zero sensor width", () => {
    const result = calculateCoC({
      sensorWidth: 0,
      printWidth: 152,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    expect(result.ok).toBe(false);
  });

  it("returns error for zero print width", () => {
    const result = calculateCoC({
      sensorWidth: 36,
      printWidth: 0,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates CoC for full frame sensor", () => {
    const result = calculateCoC({
      sensorWidth: 36,
      printWidth: 254,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.coc).toBeGreaterThan(0);
    expect(result.value.cocMicrons).toBeGreaterThan(0);
  });

  it("larger sensor gives larger coc value", () => {
    const fullFrame = calculateCoC({
      sensorWidth: 36,
      printWidth: 254,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    const apsC = calculateCoC({
      sensorWidth: 23.5,
      printWidth: 254,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    expect(fullFrame.ok).toBe(true);
    expect(apsC.ok).toBe(true);
    if (!fullFrame.ok || !apsC.ok) return;
    // Full frame has larger sensor so larger CoC on sensor
    expect(fullFrame.value.coc).toBeGreaterThan(apsC.value.coc);
  });

  it("returns enlargement factor", () => {
    const result = calculateCoC({
      sensorWidth: 36,
      printWidth: 254,
      viewingDistance: 450,
      visualAcuity: 30,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.enlargementFactor).toBeGreaterThan(1);
  });
});

describe("calculateStandardCoC", () => {
  it("calculates standard CoC for full frame (36x24mm) ≈ 0.03mm", () => {
    const coc = calculateStandardCoC(36, 24);
    expect(coc).toBeCloseTo(0.029, 2);
  });

  it("smaller sensor gives smaller CoC", () => {
    const fullFrame = calculateStandardCoC(36, 24);
    const apsC = calculateStandardCoC(23.5, 15.6);
    expect(fullFrame).toBeGreaterThan(apsC);
  });
});

describe("getCoCForSensor", () => {
  it("finds full frame sensor by name", () => {
    const coc = getCoCForSensor("Full Frame");
    expect(coc).not.toBeNull();
    expect(coc).toBeCloseTo(0.03, 2);
  });

  it("returns null for unknown sensor", () => {
    const coc = getCoCForSensor("Unknown Sensor XYZ");
    expect(coc).toBeNull();
  });
});
