import { describe, expect, it } from "vitest";
import { calculateScreenSize } from "@/lib/converters/video/screen-size";

describe("calculateScreenSize", () => {
  it("returns error for zero diagonal", () => {
    const result = calculateScreenSize(0, 16, 9);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero aspect width", () => {
    const result = calculateScreenSize(55, 0, 9);
    expect(result.ok).toBe(false);
  });

  it("calculates 16:9 screen width and height from diagonal", () => {
    const result = calculateScreenSize(55, 16, 9);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Verify using Pythagorean theorem: width² + height² = diagonal²
    const calculatedDiagonal = Math.sqrt(result.value.width ** 2 + result.value.height ** 2);
    expect(calculatedDiagonal).toBeCloseTo(55, 0);
  });

  it("aspect ratio string is set correctly", () => {
    const result = calculateScreenSize(55, 16, 9);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.aspectRatio).toBe("16:9");
  });

  it("calculates PPI when pixel dimensions are provided", () => {
    const result = calculateScreenSize(55, 16, 9, "inches", 1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ppi).toBeDefined();
    expect(result.value.ppi ?? 0).toBeGreaterThan(0);
  });

  it("PPI not defined when no pixel dimensions", () => {
    const result = calculateScreenSize(55, 16, 9);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ppi).toBeUndefined();
  });

  it("area is width × height", () => {
    const result = calculateScreenSize(55, 16, 9);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expectedArea = result.value.width * result.value.height;
    expect(result.value.area).toBeCloseTo(expectedArea, 0);
  });
});
