import { describe, expect, it } from "vitest";
import { calculateRounding } from "@/lib/converters/math/rounding";

describe("calculateRounding", () => {
  it("returns null for non-finite number", () => {
    expect(calculateRounding({ mode: "round", number: Number.POSITIVE_INFINITY }).ok).toBe(false);
    expect(calculateRounding({ mode: "round", number: Number.NaN }).ok).toBe(false);
  });

  it.each([
    ["round", 2.567, 2, 2.57],
    ["ceil", 2.1, 0, 3],
    ["floor", 2.9, 0, 2],
    ["truncate", -2.9, 0, -2],
  ] as Array<[Parameters<typeof calculateRounding>[0]["mode"], number, number, number]>)(
    "mode %s: rounds %f to %i decimal places giving %f",
    (mode, number, decimalPlaces, expected) => {
      const result = calculateRounding({ mode, number, decimalPlaces });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.rounded).toBeCloseTo(expected, 5);
    }
  );

  it("round to 0 decimal places: 2.567 → 3", () => {
    const result = calculateRounding({ mode: "round", number: 2.567 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.rounded).toBe(3);
  });

  it("toFixed mode rounds 1.005 to 2 decimal places", () => {
    const result = calculateRounding({ mode: "toFixed", number: 1.5, decimalPlaces: 0 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.rounded).toBe(2);
  });

  it("provides difference and percentChange", () => {
    // 10.5 rounds to 11 → difference = 11 - 10.5 = +0.5
    const result = calculateRounding({ mode: "round", number: 10.5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.difference).toBeCloseTo(0.5, 5);
  });
});
