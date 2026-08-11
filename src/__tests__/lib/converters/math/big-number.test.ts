import { describe, expect, it } from "vitest";
import { calculateBigNumber } from "@/lib/converters/math/big-number";

describe("calculateBigNumber", () => {
  describe("add mode", () => {
    it("adds two positive large integers", () => {
      const result = calculateBigNumber({
        mode: "add",
        numberA: "999999999999999999",
        numberB: "1",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("1000000000000000000");
    });

    it("adds two numbers with same sign (negative)", () => {
      const result = calculateBigNumber({
        mode: "add",
        numberA: "-5",
        numberB: "-3",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("-8");
    });

    it("adds numbers with different signs (positive larger)", () => {
      const result = calculateBigNumber({
        mode: "add",
        numberA: "10",
        numberB: "-3",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("7");
    });

    it("adds numbers with different signs resulting in zero", () => {
      const result = calculateBigNumber({
        mode: "add",
        numberA: "5",
        numberB: "-5",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("0");
    });

    it("returns null when numberB missing for add", () => {
      const result = calculateBigNumber({ mode: "add", numberA: "5" });
      expect(result.ok).toBe(false);
    });
  });

  describe("subtract mode", () => {
    it("subtracts two positive integers", () => {
      const result = calculateBigNumber({
        mode: "subtract",
        numberA: "100",
        numberB: "37",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("63");
    });

    it("subtracts resulting in negative", () => {
      const result = calculateBigNumber({
        mode: "subtract",
        numberA: "3",
        numberB: "10",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("-7");
    });

    it("returns null when numberB missing", () => {
      const result = calculateBigNumber({ mode: "subtract", numberA: "5" });
      expect(result.ok).toBe(false);
    });
  });

  describe("multiply mode", () => {
    it("multiplies two positive integers", () => {
      const result = calculateBigNumber({
        mode: "multiply",
        numberA: "123456789",
        numberB: "987654321",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("121932631112635269");
    });

    it("multiplies by zero", () => {
      const result = calculateBigNumber({
        mode: "multiply",
        numberA: "999999999",
        numberB: "0",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("0");
    });

    it("handles negative × positive = negative", () => {
      const result = calculateBigNumber({
        mode: "multiply",
        numberA: "-7",
        numberB: "3",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("-21");
    });

    it("handles negative × negative = positive", () => {
      const result = calculateBigNumber({
        mode: "multiply",
        numberA: "-4",
        numberB: "-5",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("20");
    });

    it("returns null when numberB missing", () => {
      const result = calculateBigNumber({ mode: "multiply", numberA: "5" });
      expect(result.ok).toBe(false);
    });
  });

  describe("divide mode", () => {
    it("divides evenly", () => {
      const result = calculateBigNumber({
        mode: "divide",
        numberA: "100",
        numberB: "4",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("25");
    });

    it("returns null for division by zero", () => {
      const result = calculateBigNumber({
        mode: "divide",
        numberA: "100",
        numberB: "0",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("power mode", () => {
    it("calculates power correctly", () => {
      const result = calculateBigNumber({
        mode: "power",
        numberA: "2",
        numberB: "10",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("1024");
    });

    it("returns 1 for any number to the power 0", () => {
      const result = calculateBigNumber({
        mode: "power",
        numberA: "999",
        numberB: "0",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("1");
    });

    it("returns null for negative exponent", () => {
      const result = calculateBigNumber({
        mode: "power",
        numberA: "2",
        numberB: "-1",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("factorial mode", () => {
    it("calculates factorial of 10", () => {
      const result = calculateBigNumber({ mode: "factorial", numberA: "10" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("3628800");
    });

    it("calculates factorial of 0", () => {
      const result = calculateBigNumber({ mode: "factorial", numberA: "0" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("1");
    });

    it("returns null for negative input", () => {
      const result = calculateBigNumber({ mode: "factorial", numberA: "-1" });
      expect(result.ok).toBe(false);
    });
  });

  describe("compare mode", () => {
    it("returns 1 when A > B", () => {
      const result = calculateBigNumber({
        mode: "compare",
        numberA: "100",
        numberB: "99",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("1");
    });

    it("returns -1 when A < B", () => {
      const result = calculateBigNumber({
        mode: "compare",
        numberA: "50",
        numberB: "100",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("-1");
    });

    it("returns 0 when A = B", () => {
      const result = calculateBigNumber({
        mode: "compare",
        numberA: "42",
        numberB: "42",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBe("0");
    });
  });

  describe("validation", () => {
    it("returns null for invalid numberA", () => {
      const result = calculateBigNumber({ mode: "add", numberA: "abc", numberB: "5" });
      expect(result.ok).toBe(false);
    });

    it("returns null for invalid numberB", () => {
      const result = calculateBigNumber({ mode: "add", numberA: "5", numberB: "xyz" });
      expect(result.ok).toBe(false);
    });

    it("includes scientificNotation in result", () => {
      const result = calculateBigNumber({ mode: "factorial", numberA: "20" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.scientificNotation).toContain("×");
      expect((result as { ok: true; value: any }).value.digitCount).toBeGreaterThan(0);
    });

    it("includes steps in result", () => {
      const result = calculateBigNumber({
        mode: "add",
        numberA: "100",
        numberB: "200",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });
  });
});
