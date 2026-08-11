import { describe, expect, it } from "vitest";
import { calculateDistance } from "@/lib/converters/math/distance";

describe("calculateDistance", () => {
  describe("twoPoints2D mode", () => {
    it("calculates Euclidean distance 3-4-5 triangle", () => {
      const result = calculateDistance({
        mode: "twoPoints2D",
        x1: 0,
        y1: 0,
        x2: 3,
        y2: 4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(5, 5);
      expect((result as { ok: true; value: any }).value.unit).toBe("units");
    });

    it("calculates midpoint correctly", () => {
      const result = calculateDistance({
        mode: "twoPoints2D",
        x1: 0,
        y1: 0,
        x2: 4,
        y2: 6,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.midpoint?.x).toBe(2);
      expect((result as { ok: true; value: any }).value.midpoint?.y).toBe(3);
    });

    it("returns 0 for identical points", () => {
      const result = calculateDistance({
        mode: "twoPoints2D",
        x1: 5,
        y1: 5,
        x2: 5,
        y2: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBe(0);
    });

    it("returns null when coordinates are missing", () => {
      const result = calculateDistance({ mode: "twoPoints2D", x1: 0, y1: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("twoPoints3D mode", () => {
    it("calculates 3D Euclidean distance", () => {
      const result = calculateDistance({
        mode: "twoPoints3D",
        x1: 0,
        y1: 0,
        z1: 0,
        x2: 1,
        y2: 2,
        z2: 2,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(3, 5);
    });

    it("includes 3D midpoint", () => {
      const result = calculateDistance({
        mode: "twoPoints3D",
        x1: 0,
        y1: 0,
        z1: 0,
        x2: 2,
        y2: 4,
        z2: 6,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.midpoint?.z).toBe(3);
    });

    it("returns null when 3D coordinates are missing", () => {
      const result = calculateDistance({ mode: "twoPoints3D", x1: 0, y1: 0, z1: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("manhattan mode", () => {
    it("calculates Manhattan distance (0,0)-(3,4)=7", () => {
      const result = calculateDistance({
        mode: "manhattan",
        x1: 0,
        y1: 0,
        x2: 3,
        y2: 4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBe(7);
      expect((result as { ok: true; value: any }).value.distanceType).toContain("Manhattan");
    });

    it("Manhattan distance is non-negative", () => {
      const result = calculateDistance({
        mode: "manhattan",
        x1: 5,
        y1: 10,
        x2: 2,
        y2: 7,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBe(6);
    });

    it("returns null when coordinates are missing", () => {
      const result = calculateDistance({ mode: "manhattan", x1: 0, y1: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("pointToLine mode", () => {
    it("calculates distance from point to line", () => {
      // Line: x + y - 2 = 0 (a=1, b=1, c=-2), point (0,0)
      // d = |0+0-2| / sqrt(2) = 2/sqrt(2) = sqrt(2) ≈ 1.414
      const result = calculateDistance({
        mode: "pointToLine",
        x1: 0,
        y1: 0,
        lineA: 1,
        lineB: 1,
        lineC: -2,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(Math.sqrt(2), 4);
    });

    it("returns null when line coefficients are zero (degenerate)", () => {
      const result = calculateDistance({
        mode: "pointToLine",
        x1: 0,
        y1: 0,
        lineA: 0,
        lineB: 0,
        lineC: 5,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when inputs are missing", () => {
      const result = calculateDistance({ mode: "pointToLine", x1: 0, y1: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("haversine mode", () => {
    it("calculates distance between two known cities (Paris to London ~341 km)", () => {
      // Paris: 48.8566°N, 2.3522°E
      // London: 51.5074°N, 0.1278°W
      const result = calculateDistance({
        mode: "haversine",
        lat1: 48.8566,
        lon1: 2.3522,
        lat2: 51.5074,
        lon2: -0.1278,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(341, -1); // within ~10 km
      expect((result as { ok: true; value: any }).value.unit).toBe("km");
      expect((result as { ok: true; value: any }).value.bearing).toBeDefined();
    });

    it("returns 0 for same location", () => {
      const result = calculateDistance({
        mode: "haversine",
        lat1: 48.8566,
        lon1: 2.3522,
        lat2: 48.8566,
        lon2: 2.3522,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(0, 2);
    });

    it("returns null when coordinates are missing", () => {
      const result = calculateDistance({ mode: "haversine", lat1: 48.8566, lon1: 2.3522 });
      expect(result.ok).toBe(false);
    });
  });

  describe("it.each for modes with full inputs", () => {
    it.each([
      ["twoPoints2D", { x1: 0, y1: 0, x2: 3, y2: 4 }, 5],
      ["manhattan", { x1: 0, y1: 0, x2: 3, y2: 4 }, 7],
    ] as const)("mode %s returns expected distance", (mode, extra, expected) => {
      const result = calculateDistance({ mode, ...extra });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(expected, 1);
    });
  });
});
