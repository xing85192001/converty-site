import { describe, expect, it } from "vitest";
import { calculateHyperfocal, generateHyperfocalTable } from "@/lib/converters/photo/hyperfocal";

describe("calculateHyperfocal", () => {
  it("calculates hyperfocal distance for 50mm f/8 on full frame", () => {
    // H = f²/(N×c) + f = 50²/(8×0.03) + 50 = 2500/0.24 + 50 = 10416.7 + 50 = 10466.7 mm ≈ 10.47m
    const result = calculateHyperfocal({ focalLength: 50, aperture: 8, circleOfConfusion: 0.03 });
    expect(result.hyperfocalDistance).toBeCloseTo(10.47, 0);
  });

  it("shorter focal length gives shorter hyperfocal distance", () => {
    const wide = calculateHyperfocal({ focalLength: 24, aperture: 8, circleOfConfusion: 0.03 });
    const tele = calculateHyperfocal({ focalLength: 85, aperture: 8, circleOfConfusion: 0.03 });
    expect(wide.hyperfocalDistance).toBeLessThan(tele.hyperfocalDistance);
  });

  it("near limit is half of hyperfocal distance", () => {
    const result = calculateHyperfocal({ focalLength: 50, aperture: 8, circleOfConfusion: 0.03 });
    expect(result.nearLimit).toBeCloseTo(result.hyperfocalDistance / 2, 1);
  });

  it("far limit is infinity", () => {
    const result = calculateHyperfocal({ focalLength: 50, aperture: 8, circleOfConfusion: 0.03 });
    expect(result.farLimit).toBe("Infinity");
  });

  it("returns feet conversion", () => {
    const result = calculateHyperfocal({ focalLength: 50, aperture: 8, circleOfConfusion: 0.03 });
    expect(result.hyperfocalDistanceFeet).toBeGreaterThan(result.hyperfocalDistance);
  });

  it("smaller aperture (f/16) gives shorter hyperfocal than f/8", () => {
    const f8 = calculateHyperfocal({ focalLength: 50, aperture: 8, circleOfConfusion: 0.03 });
    const f16 = calculateHyperfocal({ focalLength: 50, aperture: 16, circleOfConfusion: 0.03 });
    expect(f16.hyperfocalDistance).toBeLessThan(f8.hyperfocalDistance);
  });
});

describe("generateHyperfocalTable", () => {
  it("returns 9 entries (one per aperture preset)", () => {
    const table = generateHyperfocalTable(50, 0.03);
    expect(table).toHaveLength(9);
  });

  it("each entry has aperture, hyperfocal, and nearLimit", () => {
    const table = generateHyperfocalTable(50, 0.03);
    const entry = table[0];
    expect(entry).toHaveProperty("aperture");
    expect(entry).toHaveProperty("hyperfocal");
    expect(entry).toHaveProperty("nearLimit");
  });
});
