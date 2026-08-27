import { describe, expect, it } from "vitest";
import {
  calculateNDFilter,
  calculateRequiredStops,
  stackFilters,
} from "@/lib/converters/photo/nd-filter";

describe("calculateNDFilter", () => {
  it("calculates 10-stop ND filter on 1s base exposure → 1024s", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1, filterStops: 10 });
    expect(result.newShutterSpeed).toBeCloseTo(1024, 0);
  });

  it("calculates 6-stop ND on 1/60s → ~1.07s", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1 / 60, filterStops: 6 });
    expect(result.newShutterSpeed).toBeCloseTo(64 / 60, 1);
  });

  it("returns filterFactor as 2^stops", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1, filterStops: 3 });
    expect(result.filterFactor).toBe(8);
  });

  it("returns formatted shutter speed string", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1 / 250, filterStops: 3 });
    expect(result.newShutterSpeedFormatted).toBeTruthy();
    expect(typeof result.newShutterSpeedFormatted).toBe("string");
  });

  it("returns light reduction percentage close to 100% for large stops", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1, filterStops: 10 });
    expect(result.lightReductionPercent).toBeGreaterThan(99);
  });

  it("returns description string", () => {
    const result = calculateNDFilter({ baseShutterSpeed: 1, filterStops: 10 });
    expect(typeof result.description).toBe("string");
    expect(result.description.length).toBeGreaterThan(0);
  });
});

describe("calculateRequiredStops", () => {
  it("calculates stops needed to go from 1s to 1024s as 10 stops", () => {
    const stops = calculateRequiredStops(1, 1024);
    expect(stops).toBeCloseTo(10, 0);
  });
});

describe("stackFilters", () => {
  it("adds filter stops together", () => {
    expect(stackFilters([3, 6, 10])).toBe(19);
  });

  it("handles empty array", () => {
    expect(stackFilters([])).toBe(0);
  });
});
