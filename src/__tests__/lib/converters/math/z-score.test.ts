import { describe, expect, it } from "vitest";
import { calculateZScore } from "@/lib/converters/math/z-score";

describe("calculateZScore", () => {
  it("returns null for σ = 0", () => {
    expect(
      calculateZScore({ mode: "calculate", value: 75, mean: 70, standardDeviation: 0 }).ok
    ).toBe(false);
  });

  it("returns null for negative σ", () => {
    expect(
      calculateZScore({ mode: "calculate", value: 75, mean: 70, standardDeviation: -5 }).ok
    ).toBe(false);
  });

  it("calculates z-score: (x=75, μ=70, σ=5) → z=1.0", () => {
    const result = calculateZScore({
      mode: "calculate",
      value: 75,
      mean: 70,
      standardDeviation: 5,
    });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.zScore).toBeCloseTo(1.0, 5);
  });

  it("calculates negative z-score: (x=60, μ=70, σ=5) → z=-2.0", () => {
    const result = calculateZScore({
      mode: "calculate",
      value: 60,
      mean: 70,
      standardDeviation: 5,
    });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.zScore).toBeCloseTo(-2.0, 5);
  });

  it("calculates value from z-score in fromZScore mode", () => {
    const result = calculateZScore({
      mode: "fromZScore",
      zScore: 1.0,
      mean: 70,
      standardDeviation: 5,
    });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.value).toBeCloseTo(75, 5);
  });

  it("provides probability below and above", () => {
    const result = calculateZScore({
      mode: "calculate",
      value: 70,
      mean: 70,
      standardDeviation: 5,
    });
    expect(result.ok).toBe(true);
    // z=0 → 50% probability below and above
    expect((result as { ok: true; value: any }).value.probabilityBelow).toBeCloseTo(0.5, 2);
    expect((result as { ok: true; value: any }).value.probabilityAbove).toBeCloseTo(0.5, 2);
  });

  it("returns null for undefined value in calculate mode", () => {
    expect(calculateZScore({ mode: "calculate", mean: 70, standardDeviation: 5 }).ok).toBe(false);
  });
});
