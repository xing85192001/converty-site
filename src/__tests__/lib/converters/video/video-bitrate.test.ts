import { describe, expect, it } from "vitest";
import { calculateVideoBitrate } from "@/lib/converters/video/video-bitrate";

describe("calculateVideoBitrate", () => {
  it("returns error for zero width", () => {
    const result = calculateVideoBitrate(0, 1080, 30);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero height", () => {
    const result = calculateVideoBitrate(1920, 0, 30);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero fps", () => {
    const result = calculateVideoBitrate(1920, 1080, 0);
    expect(result.ok).toBe(false);
  });

  it("1920x1080/30fps/h264/medium returns bitrateMbps > 0", () => {
    const result = calculateVideoBitrate(1920, 1080, 30, 8, "h264", "medium");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.bitrateMbps).toBeGreaterThan(0);
  });

  it("h265 returns lower bitrate than h264 at same settings", () => {
    const h264 = calculateVideoBitrate(1920, 1080, 30, 8, "h264", "medium");
    const h265 = calculateVideoBitrate(1920, 1080, 30, 8, "h265", "medium");
    expect(h264.ok).toBe(true);
    expect(h265.ok).toBe(true);
    if (!h264.ok || !h265.ok) return;
    expect(h265.value.bitrateMbps).toBeLessThan(h264.value.bitrateMbps);
  });

  it("4K gives higher bitrate than 1080p", () => {
    const hd = calculateVideoBitrate(1920, 1080, 30, 8, "h264", "medium");
    const fourK = calculateVideoBitrate(3840, 2160, 30, 8, "h264", "medium");
    expect(hd.ok).toBe(true);
    expect(fourK.ok).toBe(true);
    if (!hd.ok || !fourK.ok) return;
    expect(fourK.value.bitrateMbps).toBeGreaterThan(hd.value.bitrateMbps);
  });

  it("returns qualityLevel string", () => {
    const result = calculateVideoBitrate(1920, 1080, 30);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.value.qualityLevel).toBe("string");
  });

  it("bitrateKbps is approximately bitrateMbps × 1000", () => {
    const result = calculateVideoBitrate(1920, 1080, 30);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Due to rounding in source, bitrateKbps ≈ bitrateMbps × 1000 within a few kbps
    expect(result.value.bitrateKbps).toBeGreaterThan(0);
    expect(result.value.bitrateMbps).toBeGreaterThan(0);
    // bitrateKbps should be in the same order of magnitude as bitrateMbps * 1000
    expect(Math.abs(result.value.bitrateKbps - result.value.bitrateMbps * 1000)).toBeLessThan(10);
  });
});
