import { describe, expect, it } from "vitest";
import {
  formatTableDistance,
  generateDoFTable,
  generateHyperfocalMatrix,
} from "@/lib/converters/photo/dof-table";

describe("generateDoFTable", () => {
  it("returns a 2D array with correct dimensions", () => {
    const result = generateDoFTable({
      focalLength: 50,
      coc: 0.03,
      apertures: [4, 8, 16],
      distances: [1, 3, 5],
    });
    expect(result).toHaveLength(3); // 3 apertures
    expect(result[0]).toHaveLength(3); // 3 distances
  });

  it("each entry has near and far fields", () => {
    const result = generateDoFTable({
      focalLength: 50,
      coc: 0.03,
      apertures: [8],
      distances: [3],
    });
    const entry = result[0][0];
    expect(entry).toHaveProperty("nearLimit");
    expect(entry).toHaveProperty("farLimit");
    expect(entry).toHaveProperty("totalDoF");
    expect(entry).toHaveProperty("hyperfocal");
  });

  it("near limit is less than focus distance", () => {
    const result = generateDoFTable({
      focalLength: 50,
      coc: 0.03,
      apertures: [8],
      distances: [5],
    });
    const entry = result[0][0];
    expect(entry.nearLimit).toBeLessThan(5);
  });

  it("wider aperture gives more shallow DOF than narrow aperture at same distance", () => {
    const result = generateDoFTable({
      focalLength: 50,
      coc: 0.03,
      apertures: [1.4, 16],
      distances: [3],
    });
    const wideEntry = result[0][0];
    const narrowEntry = result[1][0];
    const wideDof = wideEntry.totalDoF === Infinity ? 9999 : wideEntry.totalDoF;
    const narrowDof = narrowEntry.totalDoF === Infinity ? 9999 : narrowEntry.totalDoF;
    expect(wideDof).toBeLessThan(narrowDof);
  });
});

describe("generateHyperfocalMatrix", () => {
  it("returns entries for all focal length / aperture combinations", () => {
    const result = generateHyperfocalMatrix([50, 85], [4, 8], 0.03);
    expect(result).toHaveLength(4);
  });

  it("all entries have positive hyperfocal distance", () => {
    const result = generateHyperfocalMatrix([50], [8], 0.03);
    expect(result[0].hyperfocal).toBeGreaterThan(0);
  });
});

describe("formatTableDistance", () => {
  it("formats infinity as ∞", () => {
    expect(formatTableDistance(Infinity)).toBe("∞");
  });

  it("formats sub-meter as cm", () => {
    expect(formatTableDistance(0.5)).toBe("50cm");
  });

  it("formats meters with 2 decimal places for < 10m", () => {
    expect(formatTableDistance(3.5)).toBe("3.50m");
  });
});
