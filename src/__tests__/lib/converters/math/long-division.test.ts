import { describe, expect, it } from "vitest";
import { calculateLongDivision } from "@/lib/converters/math/long-division";

describe("calculateLongDivision", () => {
  describe("basic division", () => {
    it("divides 10 by 3 with remainder 1", () => {
      const result = calculateLongDivision({ dividend: 10, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.quotient).toBe(3);
      expect((result as { ok: true; value: any }).value.remainder).toBe(1);
      expect((result as { ok: true; value: any }).value.isExact).toBe(false);
    });

    it("divides 100 by 4 evenly", () => {
      const result = calculateLongDivision({ dividend: 100, divisor: 4 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.quotient).toBe(25);
      expect((result as { ok: true; value: any }).value.remainder).toBe(0);
      expect((result as { ok: true; value: any }).value.isExact).toBe(true);
    });

    it("returns null for divisor=0", () => {
      const result = calculateLongDivision({ dividend: 10, divisor: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns null for non-integer dividend", () => {
      const result = calculateLongDivision({ dividend: 10.5, divisor: 2 });
      expect(result.ok).toBe(false);
    });

    it("returns null for non-integer divisor", () => {
      const result = calculateLongDivision({ dividend: 10, divisor: 2.5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("steps array", () => {
    it("returns non-empty steps array", () => {
      const result = calculateLongDivision({ dividend: 100, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });
  });

  describe("fraction and decimal", () => {
    it("provides fraction representation", () => {
      const result = calculateLongDivision({ dividend: 7, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fraction).toBe("7/3");
    });

    it("simplifies fraction when possible", () => {
      const result = calculateLongDivision({ dividend: 6, divisor: 4 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.fraction).toBe("3/2");
    });

    it("provides decimal value", () => {
      const result = calculateLongDivision({ dividend: 1, divisor: 4 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.decimal).toBeCloseTo(0.25, 5);
    });
  });

  describe("repeating decimals", () => {
    it("detects repeating decimal for 1/3", () => {
      const result = calculateLongDivision({ dividend: 1, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.repeatingDecimal).toBeDefined();
      expect((result as { ok: true; value: any }).value.repeatingDecimal).toContain("(");
    });

    it("no repeating decimal for exact division", () => {
      const result = calculateLongDivision({ dividend: 1, divisor: 4 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.repeatingDecimal).toBeUndefined();
    });
  });

  describe("mixed number", () => {
    it("shows whole number when exact", () => {
      const result = calculateLongDivision({ dividend: 8, divisor: 4 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mixedNumber).toBe("2");
    });

    it("shows mixed number for improper fraction", () => {
      const result = calculateLongDivision({ dividend: 7, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.mixedNumber).toContain("2");
    });
  });

  describe("negative numbers", () => {
    it("handles negative dividend", () => {
      const result = calculateLongDivision({ dividend: -10, divisor: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.decimal).toBeLessThan(0);
    });

    it("handles negative divisor", () => {
      const result = calculateLongDivision({ dividend: 10, divisor: -2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.decimal).toBeLessThan(0);
    });
  });

  describe("verification", () => {
    it("includes verification string", () => {
      const result = calculateLongDivision({ dividend: 17, divisor: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.verification).toBeDefined();
      expect(typeof (result as { ok: true; value: any }).value.verification).toBe("string");
    });
  });
});
