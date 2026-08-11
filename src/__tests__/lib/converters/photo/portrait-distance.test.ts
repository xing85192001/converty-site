import { describe, expect, it } from "vitest";
import { calculatePortraitDistance } from "@/lib/converters/photo/portrait-distance";

describe("calculatePortraitDistance", () => {
  it("returns error for zero focal length", () => {
    const result = calculatePortraitDistance(0, "headshot");
    expect(result.ok).toBe(false);
  });

  it("returns error for zero crop factor", () => {
    const result = calculatePortraitDistance(85, "headshot", 0);
    expect(result.ok).toBe(false);
  });

  it("calculates portrait distance for 85mm headshot", () => {
    const result = calculatePortraitDistance(85, "headshot");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.recommendedDistance).toBeGreaterThan(0);
  });

  it("longer focal length gives greater working distance", () => {
    const short = calculatePortraitDistance(50, "head-shoulders");
    const long = calculatePortraitDistance(135, "head-shoulders");
    expect(short.ok).toBe(true);
    expect(long.ok).toBe(true);
    if (!short.ok || !long.ok) return;
    expect(long.value.recommendedDistance).toBeGreaterThan(short.value.recommendedDistance);
  });

  it("full-body portrait requires more distance than headshot", () => {
    const headshot = calculatePortraitDistance(85, "headshot");
    const fullBody = calculatePortraitDistance(85, "full-body");
    expect(headshot.ok).toBe(true);
    expect(fullBody.ok).toBe(true);
    if (!headshot.ok || !fullBody.ok) return;
    expect(fullBody.value.recommendedDistance).toBeGreaterThan(headshot.value.recommendedDistance);
  });

  it("returns minimum and maximum distance range", () => {
    const result = calculatePortraitDistance(85, "half-body");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.minimumDistance).toBeLessThan(result.value.recommendedDistance);
    expect(result.value.maximumDistance).toBeGreaterThan(result.value.recommendedDistance);
  });

  it("85mm is labeled as flattering compression", () => {
    const result = calculatePortraitDistance(85, "headshot");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.compressionEffect).toBe("Flattering");
  });
});
