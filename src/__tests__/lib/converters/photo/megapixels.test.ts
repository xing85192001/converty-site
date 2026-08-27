import { describe, expect, it } from "vitest";
import {
  calculateDimensionsFromMegapixels,
  calculateMegapixels,
} from "@/lib/converters/photo/megapixels";

describe("calculateMegapixels", () => {
  it("returns error for zero width", () => {
    const result = calculateMegapixels(0, 3000);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero height", () => {
    const result = calculateMegapixels(4000, 0);
    expect(result.ok).toBe(false);
  });

  it("calculates 4000x3000 as 12MP", () => {
    const result = calculateMegapixels(4000, 3000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.megapixels).toBe(12);
  });

  it("calculates 1920x1080 as ~2.07MP", () => {
    const result = calculateMegapixels(1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.megapixels).toBeCloseTo(2.07, 1);
  });

  it("detects landscape orientation", () => {
    const result = calculateMegapixels(4000, 3000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.orientation).toBe("landscape");
  });

  it("detects portrait orientation", () => {
    const result = calculateMegapixels(3000, 4000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.orientation).toBe("portrait");
  });

  it("detects square orientation", () => {
    const result = calculateMegapixels(1000, 1000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.orientation).toBe("square");
  });

  it("calculates correct total pixels", () => {
    const result = calculateMegapixels(4000, 3000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.totalPixels).toBe(12000000);
  });
});

describe("calculateDimensionsFromMegapixels", () => {
  it("returns error for zero megapixels", () => {
    const result = calculateDimensionsFromMegapixels(0, 16, 9);
    expect(result.ok).toBe(false);
  });

  it("calculates 12MP at 4:3 ratio", () => {
    const result = calculateDimensionsFromMegapixels(12, 4, 3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.width).toBeCloseTo(4000, -1);
    expect(result.value.height).toBeCloseTo(3000, -1);
  });
});
