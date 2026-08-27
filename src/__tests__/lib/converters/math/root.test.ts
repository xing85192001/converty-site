import { describe, expect, it } from "vitest";
import { calculateRoot } from "@/lib/converters/math/root";

describe("calculateRoot", () => {
  it("returns null for even root of negative number", () => {
    expect(calculateRoot({ radicand: -9, index: 2 }).ok).toBe(false);
    expect(calculateRoot({ radicand: -16, index: 4 }).ok).toBe(false);
  });

  it("returns null for index < 1", () => {
    expect(calculateRoot({ radicand: 9, index: 0 }).ok).toBe(false);
  });

  it("calculates square root of 9 = 3", () => {
    const result = calculateRoot({ radicand: 9, index: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(3, 5);
    expect((result as { ok: true; value: any }).value.isRational).toBe(true);
  });

  it("calculates cube root of 27 = 3", () => {
    const result = calculateRoot({ radicand: 27, index: 3 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(3, 5);
  });

  it("calculates odd root of negative number", () => {
    const result = calculateRoot({ radicand: -27, index: 3 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(-3, 5);
  });

  it("returns irrational for non-perfect square", () => {
    const result = calculateRoot({ radicand: 2, index: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.isRational).toBe(false);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(Math.SQRT2, 5);
  });
});
