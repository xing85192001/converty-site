import { describe, expect, it } from "vitest";
import {
  calculateAspectRatio,
  calculateDimensionFromRatio,
} from "@/lib/converters/photo/aspect-ratio";

describe("calculateAspectRatio", () => {
  it("returns error for zero width", () => {
    const result = calculateAspectRatio(0, 1080);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero height", () => {
    const result = calculateAspectRatio(1920, 0);
    expect(result.ok).toBe(false);
  });

  it("calculates 1920x1080 as 16:9", () => {
    const result = calculateAspectRatio(1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ratio).toBe("16:9");
  });

  it("calculates 1600x1200 as 4:3", () => {
    const result = calculateAspectRatio(1600, 1200);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ratio).toBe("4:3");
  });

  it("detects landscape orientation", () => {
    const result = calculateAspectRatio(1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isLandscape).toBe(true);
    expect(result.value.isPortrait).toBe(false);
  });

  it("detects portrait orientation", () => {
    const result = calculateAspectRatio(1080, 1920);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isPortrait).toBe(true);
    expect(result.value.isLandscape).toBe(false);
  });

  it("detects square", () => {
    const result = calculateAspectRatio(500, 500);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isSquare).toBe(true);
  });

  it("calculates decimal ratio", () => {
    const result = calculateAspectRatio(1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.decimal).toBeCloseTo(1.778, 2);
  });
});

describe("calculateDimensionFromRatio", () => {
  it("returns error for zero ratio width", () => {
    const result = calculateDimensionFromRatio(0, 9, 1920);
    expect(result.ok).toBe(false);
  });

  it("calculates height from target width using 16:9 ratio", () => {
    const result = calculateDimensionFromRatio(16, 9, 1920);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.width).toBe(1920);
    expect(result.value.height).toBe(1080);
  });

  it("calculates width from target height using 16:9 ratio", () => {
    const result = calculateDimensionFromRatio(16, 9, undefined, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.width).toBe(1920);
    expect(result.value.height).toBe(1080);
  });
});
