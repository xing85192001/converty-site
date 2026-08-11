import { describe, expect, it } from "vitest";
import { calculatePythagorean } from "@/lib/converters/math/pythagorean";

describe("calculatePythagorean", () => {
  it("returns null for non-positive sides in findHypotenuse", () => {
    expect(calculatePythagorean({ mode: "findHypotenuse", sideA: -3, sideB: 4 }).ok).toBe(false);
    expect(calculatePythagorean({ mode: "findHypotenuse", sideA: 3, sideB: 0 }).ok).toBe(false);
  });

  it("calculates hypotenuse: a=3, b=4 gives c=5", () => {
    const result = calculatePythagorean({ mode: "findHypotenuse", sideA: 3, sideB: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.hypotenuse).toBeCloseTo(5, 5);
    expect((result as { ok: true; value: any }).value.isPythagoreanTriple).toBe(true);
  });

  it("finds missing leg from c=5, a=3 gives b=4", () => {
    const result = calculatePythagorean({ mode: "findLeg", sideA: 3, hypotenuse: 5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.sideB).toBeCloseTo(4, 5);
  });

  it("returns null when leg >= hypotenuse in findLeg mode", () => {
    expect(calculatePythagorean({ mode: "findLeg", sideA: 5, hypotenuse: 5 }).ok).toBe(false);
    expect(calculatePythagorean({ mode: "findLeg", sideA: 6, hypotenuse: 5 }).ok).toBe(false);
  });

  it("calculates area and perimeter", () => {
    const result = calculatePythagorean({ mode: "findHypotenuse", sideA: 3, sideB: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.area).toBe(6);
    expect((result as { ok: true; value: any }).value.perimeter).toBeCloseTo(12, 5);
  });
});
