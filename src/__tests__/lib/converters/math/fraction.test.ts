import { describe, expect, it } from "vitest";
import { calculateFraction } from "@/lib/converters/math/fraction";

describe("calculateFraction", () => {
  it("returns null for denominator 0", () => {
    expect(calculateFraction({ mode: "simplify", numerator1: 6, denominator1: 0 }).ok).toBe(false);
  });

  it("simplifies 6/4 to 3/2", () => {
    const result = calculateFraction({ mode: "simplify", numerator1: 6, denominator1: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.simplified.numerator).toBe(3);
    expect((result as { ok: true; value: any }).value.simplified.denominator).toBe(2);
  });

  it("0/5 is valid (zero numerator)", () => {
    const result = calculateFraction({ mode: "simplify", numerator1: 0, denominator1: 5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.decimal).toBe(0);
  });

  it("decimal equivalent of 1/4 is 0.25", () => {
    const result = calculateFraction({ mode: "toDecimal", numerator1: 1, denominator1: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.decimal).toBeCloseTo(0.25, 5);
  });

  it("adds two fractions", () => {
    const result = calculateFraction({
      mode: "add",
      numerator1: 1,
      denominator1: 4,
      numerator2: 1,
      denominator2: 4,
    });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.simplified.numerator).toBe(1);
    expect((result as { ok: true; value: any }).value.simplified.denominator).toBe(2);
  });

  it("returns null for add with denominator2 = 0", () => {
    expect(
      calculateFraction({
        mode: "add",
        numerator1: 1,
        denominator1: 2,
        numerator2: 1,
        denominator2: 0,
      }).ok
    ).toBe(false);
  });
});
