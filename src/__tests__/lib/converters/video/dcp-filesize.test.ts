import { describe, expect, it } from "vitest";
import { calculateDCPFilesize } from "@/lib/converters/video/dcp-filesize";

describe("calculateDCPFilesize", () => {
  it("returns error for zero duration", () => {
    const result = calculateDCPFilesize(0, "2k");
    expect(result.ok).toBe(false);
  });

  it("calculates 2K feature film size > 0", () => {
    const result = calculateDCPFilesize(120, "2k");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.totalGB).toBeGreaterThan(0);
  });

  it("4K is larger than 2K for same duration", () => {
    const twoK = calculateDCPFilesize(120, "2k");
    const fourK = calculateDCPFilesize(120, "4k");
    expect(twoK.ok).toBe(true);
    expect(fourK.ok).toBe(true);
    if (!twoK.ok || !fourK.ok) return;
    expect(fourK.value.totalBytes).toBeGreaterThan(twoK.value.totalBytes);
  });

  it("4K bitrate is 500 Mbps", () => {
    const result = calculateDCPFilesize(120, "4k");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.videoBitrate).toBe(500);
  });

  it("2K bitrate is 250 Mbps", () => {
    const result = calculateDCPFilesize(120, "2k");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.videoBitrate).toBe(250);
  });

  it("includes audio bytes > 0", () => {
    const result = calculateDCPFilesize(120, "2k");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.audioBytes).toBeGreaterThan(0);
  });

  it("returns formatted string in GB or TB", () => {
    const result = calculateDCPFilesize(120, "2k");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.formatted).toMatch(/GB|TB/);
  });
});
