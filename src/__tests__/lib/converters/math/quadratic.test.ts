import { describe, expect, it } from "vitest";
import { calculateQuadratic } from "@/lib/converters/math/quadratic";

describe("calculateQuadratic", () => {
  it("returns null when a = 0 (not a quadratic equation)", () => {
    expect(calculateQuadratic({ a: 0, b: 2, c: 1 }).ok).toBe(false);
  });

  it("solves x^2 - 5x + 6 = 0 to get roots x=3 and x=2 (discriminant > 0)", () => {
    const result = calculateQuadratic({ a: 1, b: -5, c: 6 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.discriminant).toBeGreaterThan(0);
    expect((result as { ok: true; value: any }).value.discriminantType).toBe("positive");
    expect((result as { ok: true; value: any }).value.hasRealRoots).toBe(true);
    const roots = [
      (result as { ok: true; value: any }).value.roots.x1,
      (result as { ok: true; value: any }).value.roots.x2,
    ].sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(roots[0]).toBeCloseTo(2, 5);
    expect(roots[1]).toBeCloseTo(3, 5);
  });

  it("solves x^2 - 2x + 1 = 0 to get one repeated root x=1 (discriminant = 0)", () => {
    const result = calculateQuadratic({ a: 1, b: -2, c: 1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.discriminant).toBe(0);
    expect((result as { ok: true; value: any }).value.discriminantType).toBe("zero");
    expect((result as { ok: true; value: any }).value.roots.x1).toBeCloseTo(1, 5);
    expect((result as { ok: true; value: any }).value.roots.x2).toBeCloseTo(1, 5);
  });

  it("returns complex roots for x^2 + 1 = 0 (discriminant < 0)", () => {
    const result = calculateQuadratic({ a: 1, b: 0, c: 1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.discriminant).toBeLessThan(0);
    expect((result as { ok: true; value: any }).value.discriminantType).toBe("negative");
    expect((result as { ok: true; value: any }).value.hasRealRoots).toBe(false);
    expect((result as { ok: true; value: any }).value.complexRoots).not.toBeNull();
    expect((result as { ok: true; value: any }).value.complexRoots!.imaginary).toBeCloseTo(1, 5);
  });

  it("provides vertex and axis of symmetry", () => {
    const result = calculateQuadratic({ a: 1, b: -2, c: 1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.vertex.x).toBeCloseTo(1, 5);
    expect((result as { ok: true; value: any }).value.axisOfSymmetry).toBeCloseTo(1, 5);
  });
});
