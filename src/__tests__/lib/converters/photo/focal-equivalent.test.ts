import { describe, expect, it } from "vitest";
import { calculateFocalEquivalent } from "@/lib/converters/photo/focal-equivalent";

describe("calculateFocalEquivalent", () => {
  it("calculates 50mm on APS-C (1.5x) as 75mm equivalent", () => {
    const result = calculateFocalEquivalent({
      sourceFocalLength: 50,
      sourceAperture: 1.8,
      sourceDistance: 3,
      sourceCropFactor: 1.5,
      targetCropFactor: 1.0,
    });
    expect(result.sourceEffectiveFocalLength).toBeCloseTo(75, 0);
  });

  it("same sensor size: settings identical", () => {
    const result = calculateFocalEquivalent({
      sourceFocalLength: 50,
      sourceAperture: 1.8,
      sourceDistance: 3,
      sourceCropFactor: 1.0,
      targetCropFactor: 1.0,
    });
    expect(result.dofMultiplier).toBeCloseTo(1.0, 2);
    expect(result.targetFocalLength).toBeCloseTo(50, 0);
  });

  it("moving to larger sensor requires longer focal length", () => {
    const result = calculateFocalEquivalent({
      sourceFocalLength: 25,
      sourceAperture: 1.4,
      sourceDistance: 3,
      sourceCropFactor: 2.0,
      targetCropFactor: 1.0,
    });
    // From MFT 25mm (FF equivalent 50mm) to full frame
    expect(result.targetFocalLength).toBeGreaterThan(25);
  });

  it("source and target FOV match", () => {
    const result = calculateFocalEquivalent({
      sourceFocalLength: 50,
      sourceAperture: 1.8,
      sourceDistance: 3,
      sourceCropFactor: 1.5,
      targetCropFactor: 1.0,
    });
    expect(result.sourceFieldOfView).toBeCloseTo(result.targetFieldOfView, 0);
  });

  it("moving to smaller sensor gives explanation about smaller sensor", () => {
    const result = calculateFocalEquivalent({
      sourceFocalLength: 50,
      sourceAperture: 1.8,
      sourceDistance: 3,
      sourceCropFactor: 1.0,
      targetCropFactor: 2.0,
    });
    expect(result.explanation.toLowerCase()).toContain("smaller sensor");
  });
});
