import { describe, expect, it } from "vitest";
import { calculateComposition } from "@/lib/converters/photo/composition";

describe("calculateComposition", () => {
  it("returns error for zero focal length", () => {
    const result = calculateComposition(0, 5);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero distance", () => {
    const result = calculateComposition(50, 0);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero crop factor", () => {
    const result = calculateComposition(50, 5, 0);
    expect(result.ok).toBe(false);
  });

  it("calculates composition for 50mm on full frame at 5m", () => {
    const result = calculateComposition(50, 5);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fieldOfView).toBeGreaterThan(0);
    expect(result.value.horizontalFOV).toBeGreaterThan(0);
    expect(result.value.verticalFOV).toBeGreaterThan(0);
    expect(result.value.effectiveFocalLength).toBe(50);
  });

  it("applies crop factor to effective focal length", () => {
    const fullFrame = calculateComposition(50, 5, 1);
    const apsC = calculateComposition(50, 5, 1.5);
    expect(fullFrame.ok).toBe(true);
    expect(apsC.ok).toBe(true);
    if (!fullFrame.ok || !apsC.ok) return;
    expect(apsC.value.effectiveFocalLength).toBe(75);
    // APS-C has narrower FOV due to crop factor
    expect(apsC.value.horizontalFOV).toBeLessThan(fullFrame.value.horizontalFOV);
  });

  it("calculates subject coverage percentage", () => {
    const result = calculateComposition(50, 5);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.subjectCoverage).toBeGreaterThan(0);
    expect(result.value.subjectCoverage).toBeLessThanOrEqual(100);
  });

  it("wider angle gives larger FOV", () => {
    const wide = calculateComposition(24, 5);
    const tele = calculateComposition(200, 5);
    expect(wide.ok).toBe(true);
    expect(tele.ok).toBe(true);
    if (!wide.ok || !tele.ok) return;
    expect(wide.value.fieldOfView).toBeGreaterThan(tele.value.fieldOfView);
  });
});
