import { describe, expect, it } from "vitest";
import { calculatePercentError } from "@/lib/converters/math/percent-error";

describe("calculatePercentError", () => {
  it("returns null when theoretical value is 0 (division by zero)", () => {
    expect(calculatePercentError({ experimental: 110, theoretical: 0 }).ok).toBe(false);
  });

  it("calculates 10% error for actual=100, measured=110", () => {
    const result = calculatePercentError({ experimental: 110, theoretical: 100 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.percentError).toBeCloseTo(10, 5);
  });

  it("calculates percent error for underestimate (negative direction)", () => {
    const result = calculatePercentError({ experimental: 90, theoretical: 100 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.percentError).toBeCloseTo(10, 5);
    expect((result as { ok: true; value: any }).value.absoluteError).toBe(10);
  });

  it("returns zero error when experimental equals theoretical", () => {
    const result = calculatePercentError({ experimental: 100, theoretical: 100 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.percentError).toBe(0);
  });

  it("provides relative error", () => {
    const result = calculatePercentError({ experimental: 110, theoretical: 100 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.relativeError).toBeCloseTo(0.1, 5);
  });
});
