import { describe, expect, it } from "vitest";
import { calculateNumberSequence } from "@/lib/converters/math/number-sequence";

describe("calculateNumberSequence", () => {
  describe("arithmetic mode", () => {
    it("generates arithmetic sequence first=1,diff=2,n=5=[1,3,5,7,9]", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        firstTerm: 1,
        commonDifference: 2,
        numberOfTerms: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequence).toEqual([1, 3, 5, 7, 9]);
    });

    it("calculates correct sum for arithmetic sequence", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        firstTerm: 1,
        commonDifference: 1,
        numberOfTerms: 10,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sum).toBe(55); // 1+2+...+10
    });

    it("finds nth term when requested", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        firstTerm: 2,
        commonDifference: 3,
        numberOfTerms: 5,
        findNthTerm: 6,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.nthTerm).toBe(17); // 2 + (6-1)*3 = 17
    });

    it("returns null for n<=0", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        firstTerm: 1,
        commonDifference: 1,
        numberOfTerms: 0,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("geometric mode", () => {
    it("generates geometric sequence first=2,ratio=3,n=4=[2,6,18,54]", () => {
      const result = calculateNumberSequence({
        mode: "geometric",
        firstTerm: 2,
        commonRatio: 3,
        numberOfTerms: 4,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequence).toEqual([2, 6, 18, 54]);
    });

    it("marks convergent when |r|<1", () => {
      const result = calculateNumberSequence({
        mode: "geometric",
        firstTerm: 1,
        commonRatio: 0.5,
        numberOfTerms: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isConvergent).toBe(true);
      expect((result as { ok: true; value: any }).value.limit).toBeCloseTo(2, 5); // 1/(1-0.5) = 2
    });

    it("marks divergent when |r|>=1", () => {
      const result = calculateNumberSequence({
        mode: "geometric",
        firstTerm: 1,
        commonRatio: 2,
        numberOfTerms: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isConvergent).toBe(false);
    });

    it("handles ratio=1 (constant sequence)", () => {
      const result = calculateNumberSequence({
        mode: "geometric",
        firstTerm: 5,
        commonRatio: 1,
        numberOfTerms: 3,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequence).toEqual([5, 5, 5]);
      expect((result as { ok: true; value: any }).value.sum).toBe(15);
    });
  });

  describe("fibonacci mode", () => {
    it("generates first 8 fibonacci terms", () => {
      const result = calculateNumberSequence({
        mode: "fibonacci",
        numberOfTerms: 8,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequence).toEqual([
        1, 1, 2, 3, 5, 8, 13, 21,
      ]);
    });

    it("finds nth fibonacci term", () => {
      const result = calculateNumberSequence({
        mode: "fibonacci",
        numberOfTerms: 10,
        findNthTerm: 7,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.nthTerm).toBe(13); // 7th fibonacci = 13
    });
  });

  describe("custom mode", () => {
    it("detects arithmetic pattern", () => {
      const result = calculateNumberSequence({
        mode: "custom",
        terms: [2, 4, 6, 8, 10],
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequenceType).toContain("Arithmetic");
    });

    it("detects geometric pattern", () => {
      const result = calculateNumberSequence({
        mode: "custom",
        terms: [1, 3, 9, 27],
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequenceType).toContain("Geometric");
    });

    it("detects fibonacci-like pattern", () => {
      const result = calculateNumberSequence({
        mode: "custom",
        terms: [1, 1, 2, 3, 5],
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.sequenceType).toContain("Fibonacci");
    });

    it("returns null for fewer than 3 terms", () => {
      const result = calculateNumberSequence({
        mode: "custom",
        terms: [1, 2],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("findPattern mode", () => {
    it("analyzes sequence pattern", () => {
      const result = calculateNumberSequence({
        mode: "findPattern",
        terms: [3, 6, 9, 12, 15],
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });

    it("returns null for fewer than 3 terms", () => {
      const result = calculateNumberSequence({
        mode: "findPattern",
        terms: [1, 2],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("validation", () => {
    it("returns null for n > 1000", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        numberOfTerms: 1001,
      });
      expect(result.ok).toBe(false);
    });

    it("includes steps in result", () => {
      const result = calculateNumberSequence({
        mode: "arithmetic",
        firstTerm: 1,
        commonDifference: 1,
        numberOfTerms: 5,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });
  });
});
