import { describe, expect, it } from "vitest";
import { calculateDepthOfField } from "@/lib/converters/photo/depth-of-field";

describe("calculateDepthOfField", () => {
  it("returns error for zero aperture", () => {
    const result = calculateDepthOfField(0, 50, 3);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero focal length", () => {
    const result = calculateDepthOfField(1.8, 0, 3);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero distance", () => {
    const result = calculateDepthOfField(1.8, 50, 0);
    expect(result.ok).toBe(false);
  });

  it("near limit is less than focus distance", () => {
    const result = calculateDepthOfField(8, 50, 3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nearLimit).toBeLessThan(3);
  });

  it("wide aperture gives smaller DOF than narrow aperture", () => {
    const wide = calculateDepthOfField(1.8, 50, 3);
    const narrow = calculateDepthOfField(16, 50, 3);
    expect(wide.ok).toBe(true);
    expect(narrow.ok).toBe(true);
    if (!wide.ok || !narrow.ok) return;
    // wide aperture gives smaller total DOF
    const wideDof = wide.value.totalDoF === Infinity ? 999 : wide.value.totalDoF;
    const narrowDof = narrow.value.totalDoF === Infinity ? 999 : narrow.value.totalDoF;
    expect(wideDof).toBeLessThan(narrowDof);
  });

  it("returns hyperfocal distance > 0", () => {
    const result = calculateDepthOfField(8, 50, 3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.hyperfocalDistance).toBeGreaterThan(0);
  });

  it("at or beyond hyperfocal distance, far limit is infinity", () => {
    // Set distance to well beyond hyperfocal
    const result = calculateDepthOfField(8, 50, 10000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.farLimit).toBe(Infinity);
  });

  it("in-front-of-subject distance > 0", () => {
    const result = calculateDepthOfField(8, 50, 3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.inFrontOfSubject).toBeGreaterThan(0);
  });
});
