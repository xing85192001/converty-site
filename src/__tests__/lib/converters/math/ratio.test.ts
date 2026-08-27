import { describe, expect, it } from "vitest";
import { calculateRatio } from "@/lib/converters/math/ratio";

describe("calculateRatio", () => {
  it("returns null for zero denominator in simplify mode", () => {
    expect(calculateRatio({ mode: "simplify", a: 6, b: 0 }).ok).toBe(false);
  });

  it("simplifies ratio 6:4 to 3:2", () => {
    const result = calculateRatio({ mode: "simplify", a: 6, b: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.simplified.a).toBe(3);
    expect((result as { ok: true; value: any }).value.simplified.b).toBe(2);
  });

  it("ratio 1:1 stays 1:1", () => {
    const result = calculateRatio({ mode: "simplify", a: 1, b: 1 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.simplified.a).toBe(1);
    expect((result as { ok: true; value: any }).value.simplified.b).toBe(1);
  });

  it("provides decimal and percentage", () => {
    const result = calculateRatio({ mode: "simplify", a: 1, b: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.decimal).toBeCloseTo(0.5, 5);
    expect((result as { ok: true; value: any }).value.percentage).toBeCloseTo(50, 5);
  });

  it("finds missing value in proportion", () => {
    // 2:4 = 6:? → ? = (4 × 6) / 2 = 12
    const result = calculateRatio({ mode: "findMissing", a: 2, b: 4, c: 6 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.missing).toBe(12);
  });

  it("compares two ratios", () => {
    const result = calculateRatio({ mode: "compare", a: 1, b: 2, c: 2, d: 4 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.comparison).toContain("equivalent");
  });
});
