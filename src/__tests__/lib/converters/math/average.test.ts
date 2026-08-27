import { describe, expect, it } from "vitest";
import { calculateAverage } from "@/lib/converters/math/average";

describe("calculateAverage", () => {
  it("returns null for empty array", () => {
    expect(calculateAverage({ numbers: [] }).ok).toBe(false);
  });

  it("calculates mean of [1, 2, 3]", () => {
    const result = calculateAverage({ numbers: [1, 2, 3] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.mean).toBe(2);
    expect((result as { ok: true; value: any }).value.sum).toBe(6);
    expect((result as { ok: true; value: any }).value.count).toBe(3);
  });

  it("calculates median of even-length array", () => {
    const result = calculateAverage({ numbers: [1, 2, 3, 4] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.median).toBe(2.5);
  });

  it("calculates median of odd-length array", () => {
    const result = calculateAverage({ numbers: [1, 2, 3] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.median).toBe(2);
  });

  it("identifies mode for array with repeated value", () => {
    const result = calculateAverage({ numbers: [1, 2, 2, 3] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.mode).toContain(2);
  });

  it("calculates min, max, and range", () => {
    const result = calculateAverage({ numbers: [3, 1, 4, 1, 5] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.min).toBe(1);
    expect((result as { ok: true; value: any }).value.max).toBe(5);
    expect((result as { ok: true; value: any }).value.range).toBe(4);
  });

  it("calculates weighted mean when weights provided", () => {
    const result = calculateAverage({ numbers: [10, 20], weights: [1, 3] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.weightedMean).toBeCloseTo(17.5, 5);
  });

  it("returns null weightedMean when weights have different length", () => {
    const result = calculateAverage({ numbers: [1, 2, 3], weights: [1, 1] });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.weightedMean).toBeNull();
  });
});
