import { describe, expect, it } from "vitest";
import { calculateFrameRateConversion } from "@/lib/converters/video/frame-rate";

describe("calculateFrameRateConversion", () => {
  it("returns error for zero source fps", () => {
    const result = calculateFrameRateConversion(0, 30);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero target fps", () => {
    const result = calculateFrameRateConversion(24, 0);
    expect(result.ok).toBe(false);
  });

  it("same fps: no conversion needed", () => {
    const result = calculateFrameRateConversion(24, 24);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.conversionMethod).toBe("None required");
    expect(result.value.speedChange).toBeCloseTo(0, 1);
  });

  it("30 to 60 fps: frame duplication", () => {
    const result = calculateFrameRateConversion(30, 60);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.conversionMethod).toBe("Frame duplication");
  });

  it("60 to 30 fps: frame dropping", () => {
    const result = calculateFrameRateConversion(60, 30);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.conversionMethod).toBe("Frame dropping");
  });

  it("returns ffmpeg command", () => {
    const result = calculateFrameRateConversion(24, 30);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ffmpegCommand).toBeTruthy();
    expect(typeof result.value.ffmpegCommand).toBe("string");
  });

  it("PAL/Film conversion adds warning", () => {
    const result = calculateFrameRateConversion(24, 25);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.warnings.length).toBeGreaterThan(0);
  });
});
