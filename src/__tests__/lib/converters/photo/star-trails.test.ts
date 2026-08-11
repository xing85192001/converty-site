import { describe, expect, it } from "vitest";
import {
  calculateExposureFromRotation,
  calculateRotationFromExposure,
  calculateStarTrails,
} from "@/lib/converters/photo/star-trails";

describe("calculateStarTrails", () => {
  it("calculates rotation degrees for 60-minute exposure", () => {
    // 60 minutes × 0.25°/min = 15°
    const result = calculateStarTrails({ exposureMinutes: 60, hemisphere: "north" });
    expect(result.rotationDegrees).toBeCloseTo(15, 1);
  });

  it("calculates rotation percent for 1-hour exposure", () => {
    const result = calculateStarTrails({ exposureMinutes: 60, hemisphere: "north" });
    // 15° / 360° = 4.17%
    expect(result.rotationPercent).toBeCloseTo(4.17, 1);
  });

  it("longer exposure gives larger trail", () => {
    const short = calculateStarTrails({ exposureMinutes: 30, hemisphere: "north" });
    const long = calculateStarTrails({ exposureMinutes: 120, hemisphere: "north" });
    expect(long.rotationDegrees).toBeGreaterThan(short.rotationDegrees);
  });

  it("calculates exposure hours correctly", () => {
    const result = calculateStarTrails({ exposureMinutes: 120, hemisphere: "north" });
    expect(result.exposureHours).toBeCloseTo(2, 1);
  });

  it("24-hour exposure gives full 360° circle", () => {
    const result = calculateStarTrails({ exposureMinutes: 1440, hemisphere: "north" });
    expect(result.rotationDegrees).toBeCloseTo(360, 0);
    expect(result.rotationPercent).toBeCloseTo(100, 0);
  });

  it("returns a trail description string", () => {
    const result = calculateStarTrails({ exposureMinutes: 30, hemisphere: "north" });
    expect(typeof result.trailDescription).toBe("string");
    expect(result.trailDescription.length).toBeGreaterThan(0);
  });
});

describe("calculateExposureFromRotation", () => {
  it("calculates exposure from 15° rotation as 60 minutes", () => {
    const minutes = calculateExposureFromRotation(15);
    expect(minutes).toBeCloseTo(60, 0);
  });
});

describe("calculateRotationFromExposure", () => {
  it("calculates rotation from 60 minutes as 15°", () => {
    const degrees = calculateRotationFromExposure(60);
    expect(degrees).toBeCloseTo(15, 1);
  });
});
