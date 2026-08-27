import { describe, expect, it } from "vitest";
import { calculateBodySurfaceArea } from "@/lib/converters/health/body-surface-area";

describe("calculateBodySurfaceArea", () => {
  describe("null for invalid inputs", () => {
    it("returns null for height <= 0", () => {
      expect(calculateBodySurfaceArea({ weight: 70, height: 0 }).ok).toBe(false);
    });

    it("returns null for weight <= 0", () => {
      expect(calculateBodySurfaceArea({ weight: 0, height: 175 }).ok).toBe(false);
    });
  });

  describe("Mosteller formula", () => {
    it("calculates BSA for 70kg / 175cm using Mosteller formula", () => {
      // Mosteller: sqrt((175 * 70) / 3600) = sqrt(3.402...) ≈ 1.845
      const result = calculateBodySurfaceArea({ weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mosteller).toBeCloseTo(1.845, 2);
    });
  });

  describe("all formulas return positive values", () => {
    it("returns positive values for all formulas", () => {
      const result = calculateBodySurfaceArea({ weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.duBois).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.mosteller).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.haycock).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.gehanGeorge).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.boyd).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.average).toBeGreaterThan(0);
    });

    it("average is between min and max of all formulas", () => {
      const result = calculateBodySurfaceArea({ weight: 70, height: 175 });
      expect(result.ok).toBe(true);
      const vals = [
        (result as { ok: true; value: any }).value.duBois,
        (result as { ok: true; value: any }).value.mosteller,
        (result as { ok: true; value: any }).value.haycock,
        (result as { ok: true; value: any }).value.gehanGeorge,
        (result as { ok: true; value: any }).value.boyd,
      ];
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      expect((result as { ok: true; value: any }).value.average).toBeGreaterThanOrEqual(min);
      expect((result as { ok: true; value: any }).value.average).toBeLessThanOrEqual(max);
    });
  });

  describe("BSA increases with weight and height", () => {
    it("larger person has larger BSA", () => {
      const small = calculateBodySurfaceArea({ weight: 50, height: 155 });
      const large = calculateBodySurfaceArea({ weight: 100, height: 190 });
      expect(small.ok).toBe(true);
      expect(large.ok).toBe(true);
      expect((large as { ok: true; value: any }).value.mosteller).toBeGreaterThan(
        (small as { ok: true; value: any }).value.mosteller
      );
    });
  });
});
