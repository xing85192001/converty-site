import { describe, expect, it } from "vitest";
import { calculateDownloadTime } from "@/lib/converters/data/download-calculator";

describe("calculateDownloadTime", () => {
  it("returns error for zero file size", () => {
    const result = calculateDownloadTime(0, "GB", 10, "mbps");
    expect(result.ok).toBe(false);
  });

  it("returns error for zero bandwidth", () => {
    const result = calculateDownloadTime(1, "GB", 0, "mbps");
    expect(result.ok).toBe(false);
  });

  it("returns error for unknown file size unit", () => {
    const result = calculateDownloadTime(1, "ZB", 10, "mbps");
    expect(result.ok).toBe(false);
  });

  it("returns error for unknown bandwidth unit", () => {
    const result = calculateDownloadTime(1, "GB", 10, "unknown");
    expect(result.ok).toBe(false);
  });

  it("calculates 1 GB at 10 Mbps correctly", () => {
    // 1 GB = 1024 MB = 1024*1024*1024 bytes × 8 bits = 8589934592 bits
    // 10 Mbps = 10,000,000 bps
    // Time = 8589934592 / 10000000 = 858.99s ≈ 859s
    const result = calculateDownloadTime(1, "GB", 10, "mbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.totalSeconds).toBeGreaterThan(800);
    expect(result.value.totalSeconds).toBeLessThan(900);
  });

  it("faster connection gives shorter download time", () => {
    const slow = calculateDownloadTime(1, "GB", 10, "mbps");
    const fast = calculateDownloadTime(1, "GB", 100, "mbps");
    expect(slow.ok).toBe(true);
    expect(fast.ok).toBe(true);
    if (!slow.ok || !fast.ok) return;
    expect(fast.value.totalSeconds).toBeLessThan(slow.value.totalSeconds);
  });

  it("returns formatted string", () => {
    const result = calculateDownloadTime(1, "GB", 10, "mbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.value.formatted).toBe("string");
    expect(result.value.formatted.length).toBeGreaterThan(0);
  });

  it("decomposes time into days, hours, minutes, seconds", () => {
    const result = calculateDownloadTime(1, "GB", 10, "mbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveProperty("days");
    expect(result.value).toHaveProperty("hours");
    expect(result.value).toHaveProperty("minutes");
    expect(result.value).toHaveProperty("seconds");
  });
});
