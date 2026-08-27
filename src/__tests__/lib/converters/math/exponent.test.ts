import { describe, expect, it } from "vitest";
import { calculateExponent } from "@/lib/converters/math/exponent";

describe("calculateExponent", () => {
  it("returns null for 0^0", () => {
    expect(calculateExponent({ base: 0, exponent: 0 }).ok).toBe(false);
  });

  it("returns null for 0^negative", () => {
    expect(calculateExponent({ base: 0, exponent: -2 }).ok).toBe(false);
  });

  it("calculates 2^10 = 1024", () => {
    const result = calculateExponent({ base: 2, exponent: 10 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(1024);
  });

  it("calculates square root via 0.5 exponent", () => {
    const result = calculateExponent({ base: 9, exponent: 0.5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(3, 5);
  });

  it("calculates negative exponent", () => {
    const result = calculateExponent({ base: 2, exponent: -1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(0.5);
  });

  it("any number to exponent 0 equals 1", () => {
    const result = calculateExponent({ base: 5, exponent: 0 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(1);
  });

  it("returns reciprocal", () => {
    const result = calculateExponent({ base: 2, exponent: 3 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.reciprocal).toBeCloseTo(1 / 8, 5);
  });
});
