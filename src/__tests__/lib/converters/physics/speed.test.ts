import { describe, expect, it } from "vitest";
import {
  convertSpeed,
  convertToAllSpeeds,
  getSpeedUnitInfo,
  type SpeedUnit,
} from "@/lib/converters/physics/speed";

describe("convertSpeed", () => {
  it("converts 10 m/s to 36 km/h", () => {
    const result = convertSpeed(10, "ms", "kmh");
    expect(result).toBeCloseTo(36, 1);
  });

  it("converts 60 mph to km/h ≈ 96.56", () => {
    const result = convertSpeed(60, "mph", "kmh");
    expect(result).toBeCloseTo(96.56, 1);
  });

  it("converts 1 Mach to ~1234.8 km/h", () => {
    const result = convertSpeed(1, "mach", "kmh");
    expect(result).toBeCloseTo(1234.8, 0);
  });

  it("round-trips m/s → km/h → m/s", () => {
    const ms = convertSpeed(100, "ms", "kmh");
    const back = convertSpeed(ms, "kmh", "ms");
    expect(back).toBeCloseTo(100, 3);
  });

  it("returns 0 for unknown unit", () => {
    const result = convertSpeed(10, "ms", "unknown" as SpeedUnit);
    expect(result).toBe(0);
  });
});

describe("convertToAllSpeeds", () => {
  it("converts 100 m/s to all units", () => {
    const result = convertToAllSpeeds(100, "ms");
    expect(result.ms).toBeCloseTo(100, 2);
    expect(result.kmh).toBeCloseTo(360, 1);
    expect(result.mph).toBeGreaterThan(0);
    expect(result.knot).toBeGreaterThan(0);
    expect(result.fts).toBeGreaterThan(0);
    expect(result.mach).toBeGreaterThan(0);
  });
});

describe("getSpeedUnitInfo", () => {
  it("returns info for m/s unit", () => {
    const info = getSpeedUnitInfo("ms");
    expect(info).toBeDefined();
    expect(info?.symbol).toBe("m/s");
    expect(info?.toMs).toBe(1);
  });

  it("returns undefined for unknown unit", () => {
    const info = getSpeedUnitInfo("xyz" as SpeedUnit);
    expect(info).toBeUndefined();
  });
});
