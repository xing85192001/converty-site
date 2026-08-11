import { describe, expect, it } from "vitest";
import { calculateScientificNotation } from "@/lib/converters/math/scientific-notation";

describe("calculateScientificNotation", () => {
  describe("toScientific mode", () => {
    it("returns null when number is undefined", () => {
      expect(calculateScientificNotation({ mode: "toScientific" }).ok).toBe(false);
    });

    it("converts 1234 to scientific notation", () => {
      const result = calculateScientificNotation({ mode: "toScientific", number: 1234 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.standardForm).toBe(1234);
      expect((result as { ok: true; value: any }).value.exponent).toBe(3);
      expect((result as { ok: true; value: any }).value.mantissa).toBeCloseTo(1.234, 5);
    });

    it("converts 0.001 to scientific notation with negative exponent", () => {
      const result = calculateScientificNotation({ mode: "toScientific", number: 0.001 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.exponent).toBe(-3);
    });
  });

  describe("fromScientific mode", () => {
    it("returns null when mantissa or exponent missing", () => {
      expect(calculateScientificNotation({ mode: "fromScientific" }).ok).toBe(false);
    });

    it("converts 1.234 × 10^3 = 1234", () => {
      const result = calculateScientificNotation({
        mode: "fromScientific",
        mantissa: 1.234,
        exponent: 3,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.standardForm).toBeCloseTo(1234, 3);
    });
  });

  describe("operation mode", () => {
    it("multiplies numbers in scientific notation", () => {
      // (2 × 10^2) × (3 × 10^1) = 6 × 10^3 = 6000
      const result = calculateScientificNotation({
        mode: "operation",
        mantissa: 2,
        exponent: 2,
        mantissa2: 3,
        exponent2: 1,
        operation: "multiply",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.operationResult!.standardForm).toBeCloseTo(
        6000,
        3
      );
    });

    it("returns null for division by zero", () => {
      expect(
        calculateScientificNotation({
          mode: "operation",
          mantissa: 2,
          exponent: 2,
          mantissa2: 0,
          exponent2: 0,
          operation: "divide",
        }).ok
      ).toBe(false);
    });
  });
});
