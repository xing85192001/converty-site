import { describe, expect, it } from "vitest";
import { calculateSurfaceArea } from "@/lib/converters/math/surface-area";

describe("calculateSurfaceArea", () => {
  it("returns null for non-positive dimensions", () => {
    expect(calculateSurfaceArea({ shape: "cube", side: 0 }).ok).toBe(false);
    expect(calculateSurfaceArea({ shape: "cube", side: -2 }).ok).toBe(false);
  });

  it("calculates sphere surface area from r=1 ≈ 12.566", () => {
    const result = calculateSurfaceArea({ shape: "sphere", radius: 1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(4 * Math.PI, 3);
  });

  it("calculates cube surface area from side=2 = 24", () => {
    const result = calculateSurfaceArea({ shape: "cube", side: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBe(24);
  });

  it.each([
    ["cube", { shape: "cube" as const, side: 3 }, 54],
    [
      "rectangularPrism",
      { shape: "rectangularPrism" as const, length: 2, width: 3, height: 4 },
      52,
    ],
  ])("calculates %s surface area", (_name, input, expectedSA) => {
    const result = calculateSurfaceArea(input);
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(expectedSA, 3);
  });

  it("calculates cylinder total surface area", () => {
    const result = calculateSurfaceArea({ shape: "cylinder", radius: 1, height: 1 });
    expect(result.ok).toBe(true);
    // SA = 2πr(r+h) = 2π×1×2 = 4π ≈ 12.566
    expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(4 * Math.PI, 3);
  });

  describe("cone", () => {
    it("calculates cone surface area: πrs + πr²", () => {
      const result = calculateSurfaceArea({ shape: "cone", radius: 3, slantHeight: 5 });
      expect(result.ok).toBe(true);
      // SA = π*3*5 + π*3² = 15π + 9π = 24π
      expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(
        24 * Math.PI,
        3
      );
    });

    it("returns null for missing slantHeight", () => {
      expect(calculateSurfaceArea({ shape: "cone", radius: 3 }).ok).toBe(false);
    });
  });

  describe("pyramid", () => {
    it("calculates rectangular pyramid surface area", () => {
      const result = calculateSurfaceArea({
        shape: "pyramid",
        baseLength: 4,
        baseWidth: 3,
        slantHeight: 5,
      });
      expect(result.ok).toBe(true);
      // baseSA = 4*3 = 12, lateralSA = 4*5 + 3*5 = 35, total = 47
      expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(47, 3);
    });

    it("returns null for missing slantHeight in pyramid", () => {
      expect(calculateSurfaceArea({ shape: "pyramid", baseLength: 4, baseWidth: 3 }).ok).toBe(
        false
      );
    });
  });

  describe("triangularPrism", () => {
    it("calculates triangular prism surface area", () => {
      const result = calculateSurfaceArea({
        shape: "triangularPrism",
        triangleBase: 3,
        triangleHeight: 4,
        prismLength: 10,
        side1: 3,
        side2: 4,
        side3: 5,
      });
      expect(result.ok).toBe(true);
      // baseSA = 0.5*3*4 = 6; lateral = (3+4+5)*10 = 120; total = 2*6 + 120 = 132
      expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(132, 3);
    });

    it("calculates triangular prism with estimated sides when not provided", () => {
      const result = calculateSurfaceArea({
        shape: "triangularPrism",
        triangleBase: 6,
        triangleHeight: 4,
        prismLength: 10,
      });
      expect(result.ok).toBe(true);
    });

    it("returns null for missing triangleBase", () => {
      expect(
        calculateSurfaceArea({ shape: "triangularPrism", triangleHeight: 4, prismLength: 10 }).ok
      ).toBe(false);
    });
  });

  describe("hemisphere", () => {
    it("calculates hemisphere surface area: 3πr²", () => {
      const result = calculateSurfaceArea({ shape: "hemisphere", radius: 2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.totalSurfaceArea).toBeCloseTo(
        3 * Math.PI * 4,
        3
      );
    });

    it("returns null for non-positive radius", () => {
      expect(calculateSurfaceArea({ shape: "hemisphere", radius: 0 }).ok).toBe(false);
    });
  });

  it("returns null for unknown shape", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing invalid input
    expect(calculateSurfaceArea({ shape: "unknown" as any }).ok).toBe(false);
  });
});
