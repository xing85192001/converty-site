import { describe, expect, it } from "vitest";
import { calculatePercentage } from "@/lib/converters/math/percentage";

describe("calculatePercentage", () => {
  it("returns null for percentOf mode when value2 = 0", () => {
    expect(calculatePercentage({ mode: "percentOf", value1: 50, value2: 0 }).ok).toBe(false);
  });

  it("calculates 50% of 200 = 100", () => {
    const result = calculatePercentage({ mode: "percentOf", value1: 50, value2: 200 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(100);
  });

  it("returns null for percentChange mode when value1 = 0", () => {
    expect(calculatePercentage({ mode: "percentChange", value1: 0, value2: 50 }).ok).toBe(false);
  });

  it("calculates percent change from 50 to 75 = 50%", () => {
    const result = calculatePercentage({ mode: "percentChange", value1: 50, value2: 75 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBeCloseTo(50, 5);
  });

  it.each([
    ["percentOf", 10, 100, 10],
    ["whatPercent", 25, 100, 25],
    ["percentChange", 100, 150, 50],
    ["percentDifference", 100, 200, 66.667],
  ] as Array<[Parameters<typeof calculatePercentage>[0]["mode"], number, number, number]>)(
    "mode %s returns non-null for valid inputs",
    (mode, value1, value2, expected) => {
      const result = calculatePercentage({ mode, value1, value2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(expected, 1);
    }
  );
});
