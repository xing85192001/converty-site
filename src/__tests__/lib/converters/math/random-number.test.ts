import { describe, expect, it } from "vitest";
import { calculateRandomNumber } from "@/lib/converters/math/random-number";

describe("calculateRandomNumber", () => {
  describe("integer mode", () => {
    it("returns null when min > max", () => {
      expect(calculateRandomNumber({ mode: "integer", min: 10, max: 1 }).ok).toBe(false);
    });

    it("generates result in range [1, 10]", () => {
      const result = calculateRandomNumber({ mode: "integer", min: 1, max: 10 });
      expect(result.ok).toBe(true);
      const value = ((result as { ok: true; value: any }).value.results as number[])[0];
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });

    it("min=max=5 always returns 5", () => {
      for (let i = 0; i < 10; i++) {
        const result = calculateRandomNumber({ mode: "integer", min: 5, max: 5 });
        expect(result.ok).toBe(true);
        expect(((result as { ok: true; value: any }).value.results as number[])[0]).toBe(5);
      }
    });
  });

  describe("float mode", () => {
    it("returns null when min > max", () => {
      expect(calculateRandomNumber({ mode: "float", min: 5, max: 1 }).ok).toBe(false);
    });

    it("generates float in range [0, 1]", () => {
      const result = calculateRandomNumber({ mode: "float", min: 0, max: 1 });
      expect(result.ok).toBe(true);
      const value = ((result as { ok: true; value: any }).value.results as number[])[0];
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  describe("dice mode", () => {
    it("returns null for invalid sides", () => {
      expect(calculateRandomNumber({ mode: "dice", diceSides: 1 }).ok).toBe(false);
    });

    it("rolls a 6-sided die in range [1, 6]", () => {
      const result = calculateRandomNumber({ mode: "dice", diceSides: 6, diceCount: 1 });
      expect(result.ok).toBe(true);
      const value = ((result as { ok: true; value: any }).value.results as number[])[0];
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  describe("shuffle mode", () => {
    it("returns null for empty items array", () => {
      expect(calculateRandomNumber({ mode: "shuffle", items: [] }).ok).toBe(false);
    });

    it("shuffles an array and returns all items", () => {
      const items = ["a", "b", "c"];
      const result = calculateRandomNumber({ mode: "shuffle", items });
      expect(result.ok).toBe(true);
      expect(((result as { ok: true; value: any }).value.results as string[]).sort()).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
  });
});
