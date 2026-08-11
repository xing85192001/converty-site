import { describe, expect, it } from "vitest";
import { BANDWIDTH_UNITS, convertBandwidth } from "@/lib/converters/data/bandwidth";

describe("convertBandwidth", () => {
  it("returns error for value <= 0", () => {
    expect(convertBandwidth(0, "mbps").ok).toBe(false);
    expect(convertBandwidth(-1, "mbps").ok).toBe(false);
  });

  it("returns error for unknown unit", () => {
    expect(convertBandwidth(100, "unknown").ok).toBe(false);
  });

  it("converts 1 Gbps to 1000 Mbps", () => {
    const result = convertBandwidth(1, "gbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const mbps = result.value.conversions.find((c) => c.unit === "Mbps");
    expect(mbps?.value).toBeCloseTo(1000, 0);
  });

  it("1 GBps = 8 Gbps", () => {
    const result = convertBandwidth(1, "GBps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const gbps = result.value.conversions.find((c) => c.unit === "Gbps");
    expect(gbps?.value).toBeCloseTo(8, 0);
  });

  it("returns time-based usage (perDay, perWeek, perMonth)", () => {
    const result = convertBandwidth(100, "mbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.perDay.GB).toBeGreaterThan(0);
    expect(result.value.perWeek.GB).toBeGreaterThan(result.value.perDay.GB);
    expect(result.value.perMonth.GB).toBeGreaterThan(result.value.perWeek.GB);
  });

  it("returns bitsPerSecond correctly", () => {
    const result = convertBandwidth(1, "mbps");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.bitsPerSecond).toBe(1000000);
  });
});

describe("BANDWIDTH_UNITS", () => {
  it("contains bps, kbps, mbps, gbps", () => {
    const ids = BANDWIDTH_UNITS.map((u) => u.id);
    expect(ids).toContain("bps");
    expect(ids).toContain("kbps");
    expect(ids).toContain("mbps");
    expect(ids).toContain("gbps");
  });
});
