import { describe, expect, it } from "vitest";
import { calculateDPI, calculatePixelsToDPI } from "@/lib/converters/photo/dpi";

describe("calculateDPI", () => {
  it("returns error for zero dpi", () => {
    const result = calculateDPI(8, 10, 0);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero print width", () => {
    const result = calculateDPI(0, 10, 300);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero print height", () => {
    const result = calculateDPI(8, 0, 300);
    expect(result.ok).toBe(false);
  });

  it("calculates 8x10 at 300dpi correctly", () => {
    const result = calculateDPI(8, 10, 300);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.pixelWidth).toBe(2400);
    expect(result.value.pixelHeight).toBe(3000);
  });

  it("calculates total pixels correctly", () => {
    const result = calculateDPI(8, 10, 300);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.totalPixels).toBe(7200000);
  });

  it("calculates megapixels correctly", () => {
    const result = calculateDPI(8, 10, 300);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.megapixels).toBeCloseTo(7.2, 1);
  });

  it("returns Excellent print quality at 300dpi", () => {
    const result = calculateDPI(8, 10, 300);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.printQuality).toBe("Excellent");
  });

  it("returns Poor print quality at 50dpi", () => {
    const result = calculateDPI(8, 10, 50);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.printQuality).toBe("Poor");
  });
});

describe("calculatePixelsToDPI", () => {
  it("returns error for zero pixel width", () => {
    const result = calculatePixelsToDPI(0, 1080, 8, 10);
    expect(result.ok).toBe(false);
  });

  it("calculates DPI from 2400x3000 at 8x10 inches", () => {
    const result = calculatePixelsToDPI(2400, 3000, 8, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.horizontalDPI).toBe(300);
    expect(result.value.verticalDPI).toBe(300);
    expect(result.value.effectiveDPI).toBe(300);
  });
});
