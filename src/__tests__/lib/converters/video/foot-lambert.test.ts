import { describe, expect, it } from "vitest";
import { calculateFootLambert } from "@/lib/converters/video/foot-lambert";

describe("calculateFootLambert", () => {
  it("returns error for value <= 0", () => {
    expect(calculateFootLambert(0, "fl").ok).toBe(false);
    expect(calculateFootLambert(-1, "fl").ok).toBe(false);
  });

  it("converts 14 fl to nits: 14 × 3.426 ≈ 47.96", () => {
    const result = calculateFootLambert(14, "fl");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nits).toBeCloseTo(14 * 3.426, 1);
  });

  it("converts nits back to fl (round-trip)", () => {
    const nits = 14 * 3.426;
    const result = calculateFootLambert(nits, "nits");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.footLamberts).toBeCloseTo(14, 0);
  });

  it("candelasPerM2 equals nits", () => {
    const result = calculateFootLambert(14, "fl");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.candelasPerM2).toBe(result.value.nits);
  });

  it("returns description key string", () => {
    const result = calculateFootLambert(14, "fl");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.value.descriptionKey).toBe("string");
    expect(result.value.descriptionKey.length).toBeGreaterThan(0);
  });

  it("returns error when converting lumens without screen size", () => {
    const result = calculateFootLambert(10000, "lumens");
    expect(result.ok).toBe(false);
  });

  it("converts lumens with screen size", () => {
    const result = calculateFootLambert(10000, "lumens", 20, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.footLamberts).toBeGreaterThan(0);
  });
});
