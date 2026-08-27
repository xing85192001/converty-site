import { describe, expect, it } from "vitest";
import { calculateLogarithm } from "@/lib/converters/math/logarithm";

describe("calculateLogarithm", () => {
  it("returns null for value <= 0", () => {
    expect(calculateLogarithm({ value: 0, base: 10 }).ok).toBe(false);
    expect(calculateLogarithm({ value: -5, base: 10 }).ok).toBe(false);
  });

  it("returns null for base <= 0", () => {
    expect(calculateLogarithm({ value: 100, base: 0 }).ok).toBe(false);
    expect(calculateLogarithm({ value: 100, base: -2 }).ok).toBe(false);
  });

  it("returns null for base == 1", () => {
    expect(calculateLogarithm({ value: 100, base: 1 }).ok).toBe(false);
  });

  it("log base 10 of 100 = 2", () => {
    const result = calculateLogarithm({ value: 100, base: 10 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(2, 5);
    expect((result as { ok: true; value: any }).value.log10).toBeCloseTo(2, 5);
  });

  it("natural log of e ≈ 1", () => {
    const result = calculateLogarithm({ value: Math.E, base: Math.E });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(1, 5);
    expect((result as { ok: true; value: any }).value.naturalLog).toBeCloseTo(1, 5);
  });

  it("log base 2 of 8 = 3", () => {
    const result = calculateLogarithm({ value: 8, base: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(3, 5);
  });

  it("antilog is approximately the original value", () => {
    const result = calculateLogarithm({ value: 100, base: 10 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.antilog).toBeCloseTo(100, 2);
  });
});
