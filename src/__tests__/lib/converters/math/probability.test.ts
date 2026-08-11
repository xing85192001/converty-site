import { describe, expect, it } from "vitest";
import { calculateProbability } from "@/lib/converters/math/probability";

describe("calculateProbability", () => {
  describe("single mode", () => {
    it("returns the probability itself", () => {
      const result = calculateProbability({ mode: "single", probabilityA: 0.3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe(0.3);
      expect((result as { ok: true; value: any }).value.percentage).toBeCloseTo(30, 4);
    });

    it("returns null for probability outside [0,1] (negative)", () => {
      const result = calculateProbability({ mode: "single", probabilityA: -0.1 });
      expect(result.ok).toBe(false);
    });

    it("returns null for probability outside [0,1] (>1)", () => {
      const result = calculateProbability({ mode: "single", probabilityA: 1.5 });
      expect(result.ok).toBe(false);
    });

    it("returns null when probabilityA is undefined", () => {
      const result = calculateProbability({ mode: "single" });
      expect(result.ok).toBe(false);
    });

    it("accepts boundary value 0", () => {
      const result = calculateProbability({ mode: "single", probabilityA: 0 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe(0);
    });

    it("accepts boundary value 1", () => {
      const result = calculateProbability({ mode: "single", probabilityA: 1 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe(1);
    });
  });

  describe("complement mode", () => {
    it("calculates complement 1 - p", () => {
      const result = calculateProbability({ mode: "complement", probabilityA: 0.3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.7, 5);
    });

    it("returns null for invalid probability", () => {
      const result = calculateProbability({ mode: "complement", probabilityA: -0.5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("and mode (independent events)", () => {
    it("calculates P(A and B) = P(A) × P(B)", () => {
      const result = calculateProbability({
        mode: "and",
        probabilityA: 0.5,
        probabilityB: 0.4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.2, 5);
    });

    it("returns null for missing probabilityB", () => {
      const result = calculateProbability({ mode: "and", probabilityA: 0.5 });
      expect(result.ok).toBe(false);
    });

    it("returns null for invalid probability", () => {
      const result = calculateProbability({
        mode: "and",
        probabilityA: 1.5,
        probabilityB: 0.5,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("or mode", () => {
    it("calculates P(A or B) = P(A) + P(B) - P(A and B)", () => {
      const result = calculateProbability({
        mode: "or",
        probabilityA: 0.5,
        probabilityB: 0.4,
        probabilityAandB: 0.2,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.7, 5);
    });

    it("defaults probabilityAandB to 0 when not provided", () => {
      const result = calculateProbability({
        mode: "or",
        probabilityA: 0.3,
        probabilityB: 0.4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.7, 5);
    });

    it("clamps result to [0, 1]", () => {
      const result = calculateProbability({
        mode: "or",
        probabilityA: 0.9,
        probabilityB: 0.9,
        probabilityAandB: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeLessThanOrEqual(1);
    });
  });

  describe("conditional mode", () => {
    it("calculates P(A|B) = P(A∩B) / P(B)", () => {
      const result = calculateProbability({
        mode: "conditional",
        probabilityAandB: 0.2,
        probabilityB: 0.4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.5, 5);
    });

    it("returns null when P(B) = 0", () => {
      const result = calculateProbability({
        mode: "conditional",
        probabilityAandB: 0.2,
        probabilityB: 0,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when fields are missing", () => {
      const result = calculateProbability({ mode: "conditional" });
      expect(result.ok).toBe(false);
    });
  });

  describe("binomial mode", () => {
    it("calculates P(X=2) for n=5, p=0.5", () => {
      // C(5,2) * 0.5^2 * 0.5^3 = 10 * 0.25 * 0.125 = 0.3125
      const result = calculateProbability({
        mode: "binomial",
        trials: 5,
        successes: 2,
        probabilityA: 0.5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(0.3125, 4);
    });

    it("returns null for successes > trials", () => {
      const result = calculateProbability({
        mode: "binomial",
        trials: 5,
        successes: 6,
        probabilityA: 0.5,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for negative trials", () => {
      const result = calculateProbability({
        mode: "binomial",
        trials: -1,
        successes: 0,
        probabilityA: 0.5,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("permutation mode", () => {
    it("calculates P(5,3) = 60", () => {
      const result = calculateProbability({ mode: "permutation", n: 5, r: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe(60);
    });

    it("returns null for r > n", () => {
      const result = calculateProbability({ mode: "permutation", n: 3, r: 5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("combination mode", () => {
    it("calculates C(5,2) = 10", () => {
      const result = calculateProbability({ mode: "combination", n: 5, r: 2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe(10);
    });

    it("returns null for r > n", () => {
      const result = calculateProbability({ mode: "combination", n: 3, r: 5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("result structure", () => {
    it("includes formula, explanation, odds in result", () => {
      const result = calculateProbability({ mode: "single", probabilityA: 0.5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.formula).toBeDefined();
      expect((result as { ok: true; value: any }).value.explanation).toBeDefined();
      expect((result as { ok: true; value: any }).value.odds.for).toBeDefined();
      expect((result as { ok: true; value: any }).value.odds.against).toBeDefined();
    });

    it("includes steps array", () => {
      const result = calculateProbability({
        mode: "and",
        probabilityA: 0.5,
        probabilityB: 0.4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });
  });
});
