import { describe, expect, it } from "vitest";
import { calculateSpotStars } from "@/lib/converters/photo/spot-stars";

describe("calculateSpotStars", () => {
  it("calculates 500 rule for 24mm full-frame lens", () => {
    const result = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    expect(result).not.toBeNull();
    // 500 rule: 500 / (24 * 1.0 crop) ≈ 20.8
    expect(result.rule500).toBeCloseTo(20.8, 0);
  });

  it("calculates 400 rule for 24mm", () => {
    const result = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    // 400 rule: 400 / (24 * 1.0) ≈ 16.7
    expect(result.rule400).toBeCloseTo(16.7, 0);
  });

  it("longer focal length gives shorter maximum exposure", () => {
    const wide = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    const tele = calculateSpotStars({
      focalLength: 85,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    expect(tele.rule500).toBeLessThan(wide.rule500);
  });

  it("accurate mode gives shorter NPF than default", () => {
    const input = {
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
    };
    const defaultResult = calculateSpotStars({ ...input, accuracy: "default" });
    const accurateResult = calculateSpotStars({ ...input, accuracy: "accurate" });
    expect(accurateResult.npfRule).toBeLessThan(defaultResult.npfRule);
  });

  it("returns a description string", () => {
    const result = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    expect(typeof result.description).toBe("string");
    expect(result.description.length).toBeGreaterThan(0);
  });

  it("crop sensor shortens the rule500 value", () => {
    const fullFrame = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 36,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    const apsC = calculateSpotStars({
      focalLength: 24,
      aperture: 2.8,
      sensorWidth: 23.5,
      megapixels: 24,
      declination: 0,
      accuracy: "default",
    });
    expect(apsC.rule500).toBeLessThan(fullFrame.rule500);
  });
});
