import { describe, expect, it } from "vitest";
import { calculateCircle } from "@/lib/converters/math/circle";

describe("calculateCircle", () => {
  it("returns null for non-positive radius", () => {
    expect(calculateCircle({ mode: "radius", value: 0 }).ok).toBe(false);
    expect(calculateCircle({ mode: "radius", value: -3 }).ok).toBe(false);
  });

  it("calculates circumference from radius 5", () => {
    const result = calculateCircle({ mode: "radius", value: 5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.circumference).toBeCloseTo(
      2 * Math.PI * 5,
      5
    );
  });

  it("calculates area from radius 5", () => {
    const result = calculateCircle({ mode: "radius", value: 5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.area).toBeCloseTo(Math.PI * 25, 5);
  });

  it("calculates radius from diameter", () => {
    const result = calculateCircle({ mode: "diameter", value: 10 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.radius).toBe(5);
    expect((result as { ok: true; value: any }).value.diameter).toBe(10);
  });

  it("provides common angles array", () => {
    const result = calculateCircle({ mode: "radius", value: 5 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.commonAngles.length).toBeGreaterThan(0);
  });
});
