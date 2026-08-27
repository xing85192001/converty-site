import { describe, expect, it } from "vitest";
import {
  COMMON_BITRATES,
  getBitratesByCategory,
  getCategories,
} from "@/lib/converters/video/common-bitrates";

describe("COMMON_BITRATES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(COMMON_BITRATES)).toBe(true);
    expect(COMMON_BITRATES.length).toBeGreaterThan(0);
  });

  it("each entry has name, category, bitrateMbps, and description", () => {
    for (const entry of COMMON_BITRATES) {
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("category");
      expect(entry).toHaveProperty("bitrateMbps");
      expect(entry).toHaveProperty("description");
    }
  });

  it("all bitrateMbps values are positive", () => {
    for (const entry of COMMON_BITRATES) {
      expect(entry.bitrateMbps).toBeGreaterThan(0);
    }
  });

  it("includes DCP entries", () => {
    const dcp = COMMON_BITRATES.filter((b) => b.category === "DCP");
    expect(dcp.length).toBeGreaterThan(0);
  });

  it("includes H.264 entries", () => {
    const h264 = COMMON_BITRATES.filter((b) => b.category === "H.264");
    expect(h264.length).toBeGreaterThan(0);
  });
});

describe("getBitratesByCategory", () => {
  it("returns ProRes entries", () => {
    const proRes = getBitratesByCategory("ProRes");
    expect(proRes.length).toBeGreaterThan(0);
    for (const entry of proRes) {
      expect(entry.category).toBe("ProRes");
    }
  });

  it("returns empty array for unknown category", () => {
    expect(getBitratesByCategory("NonExistentCategory")).toEqual([]);
  });
});

describe("getCategories", () => {
  it("returns unique category list", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(new Set(categories).size).toBe(categories.length);
  });
});
