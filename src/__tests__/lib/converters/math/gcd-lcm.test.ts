import { describe, expect, it } from "vitest";
import { calculateGcdLcm } from "@/lib/converters/math/gcd-lcm";

describe("calculateGcdLcm", () => {
  it("returns null for empty array", () => {
    expect(calculateGcdLcm({ numbers: [] }).ok).toBe(false);
  });

  it("returns null if any number is 0", () => {
    expect(calculateGcdLcm({ numbers: [0, 5] }).ok).toBe(false);
  });

  it("returns null for non-integer values", () => {
    expect(calculateGcdLcm({ numbers: [3.5, 2] }).ok).toBe(false);
  });

  it("calculates gcd(12, 8) = 4", () => {
    const result = calculateGcdLcm({ numbers: [12, 8] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.gcd).toBe(4);
  });

  it("calculates lcm(4, 6) = 12", () => {
    const result = calculateGcdLcm({ numbers: [4, 6] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.lcm).toBe(12);
  });

  it("calculates gcd and lcm for three numbers", () => {
    const result = calculateGcdLcm({ numbers: [12, 18, 24] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.gcd).toBe(6);
    expect((result as { ok: true; value: any }).value.lcm).toBe(72);
  });

  it("provides prime factorizations", () => {
    const result = calculateGcdLcm({ numbers: [12, 8] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.primeFactorizations.length).toBe(2);
  });
});
