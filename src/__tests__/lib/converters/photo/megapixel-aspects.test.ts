import { describe, expect, it } from "vitest";
import { calculateMegapixelAspects } from "@/lib/converters/photo/megapixel-aspects";

describe("calculateMegapixelAspects", () => {
  it("returns empty array for zero megapixels", () => {
    expect(calculateMegapixelAspects(0)).toEqual([]);
  });

  it("returns array for valid megapixels", () => {
    const result = calculateMegapixelAspects(12);
    expect(result).toHaveLength(9);
  });

  it("calculates dimensions for 12MP at 3:2", () => {
    const result = calculateMegapixelAspects(12);
    const aspect3_2 = result.find((r) => r.ratioW === 3 && r.ratioH === 2);
    expect(aspect3_2).toBeDefined();
    expect(aspect3_2?.width).toBeCloseTo(4243, -1);
    expect(aspect3_2?.height).toBeCloseTo(2828, -1);
  });

  it("each variation has a valid megapixel value close to target", () => {
    const target = 12;
    const result = calculateMegapixelAspects(target);
    for (const variation of result) {
      expect(variation.megapixels).toBeCloseTo(target, 0);
    }
  });

  it("includes useCases for each variation", () => {
    const result = calculateMegapixelAspects(12);
    for (const variation of result) {
      expect(variation.useCases).toBeTruthy();
    }
  });

  it("includes square 1:1 variation", () => {
    const result = calculateMegapixelAspects(12);
    const square = result.find((r) => r.ratioW === 1 && r.ratioH === 1);
    expect(square).toBeDefined();
    expect(square?.width).toBe(square?.height);
  });
});
