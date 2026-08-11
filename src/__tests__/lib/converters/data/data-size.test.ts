import { describe, expect, it } from "vitest";
import {
  convertDataSize,
  convertToAll,
  DATA_UNITS,
  type DataUnit,
  formatDataSize,
} from "@/lib/converters/data/data-size";

describe("convertDataSize", () => {
  it("1 GB (decimal) = 1000 MB", () => {
    const result = convertDataSize(1, "gb", "mb");
    expect(result).toBeCloseTo(1000, 0);
  });

  it("1 GiB (binary) = 1024 MiB", () => {
    const result = convertDataSize(1, "gib", "mib");
    expect(result).toBeCloseTo(1024, 0);
  });

  it("1 TB = 1024 GB in binary", () => {
    const result = convertDataSize(1, "tib", "gib");
    expect(result).toBeCloseTo(1024, 0);
  });

  it.each([
    ["kb", "mb", 1, 0.001],
    ["mb", "kb", 1, 1000],
    ["gb", "mb", 1, 1000],
    ["tb", "gb", 1, 1000],
  ])("converts %s to %s: %d → %d", (from, to, val, expected) => {
    const result = convertDataSize(val, from as DataUnit, to as DataUnit);
    expect(result).toBeCloseTo(expected, 0);
  });
});

describe("convertToAll", () => {
  it("converts 1 GB to all units", () => {
    const result = convertToAll(1, "gb");
    expect(result.bytes).toBe(1000 ** 3);
    expect(result.mb).toBeCloseTo(1000, 0);
    expect(result.tb).toBeCloseTo(0.001, 3);
  });
});

describe("formatDataSize", () => {
  it("formats bytes correctly", () => {
    expect(formatDataSize(0)).toBe("0 B");
    expect(formatDataSize(1000)).toBe("1.00 KB");
    expect(formatDataSize(1000000)).toBe("1.00 MB");
  });

  it("uses binary units when binary=true", () => {
    expect(formatDataSize(1024, true)).toBe("1.00 KiB");
    expect(formatDataSize(1024 * 1024, true)).toBe("1.00 MiB");
  });
});

describe("DATA_UNITS", () => {
  it("includes both decimal and binary units", () => {
    const decimalIds = DATA_UNITS.filter((u) => !u.binary).map((u) => u.id);
    const binaryIds = DATA_UNITS.filter((u) => u.binary).map((u) => u.id);
    expect(decimalIds).toContain("gb");
    expect(binaryIds).toContain("gib");
  });
});
