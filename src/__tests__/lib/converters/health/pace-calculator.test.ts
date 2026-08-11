import { describe, expect, it } from "vitest";
import { calculatePace } from "@/lib/converters/health/pace-calculator";

describe("calculatePace", () => {
  describe("null for invalid inputs (mode: pace)", () => {
    it("returns null for distance <= 0", () => {
      expect(
        calculatePace({ mode: "pace", distance: 0, hours: 0, minutes: 50, seconds: 0 }).ok
      ).toBe(false);
    });

    it("returns null when total time is 0", () => {
      expect(
        calculatePace({ mode: "pace", distance: 10, hours: 0, minutes: 0, seconds: 0 }).ok
      ).toBe(false);
    });
  });

  describe("mode: pace — 10km in 50 minutes", () => {
    it("calculates pace as 5:00/km", () => {
      // 10km in 50min = 3000s total, pace = 3000/10 = 300s/km = 5:00
      const result = calculatePace({
        mode: "pace",
        distance: 10,
        hours: 0,
        minutes: 50,
        seconds: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.pace.minutes).toBe(5);
      expect((result as { ok: true; value: any }).value.pace.seconds).toBe(0);
    });

    it("calculates speed as 12 km/h", () => {
      const result = calculatePace({
        mode: "pace",
        distance: 10,
        hours: 0,
        minutes: 50,
        seconds: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.speed).toBeCloseTo(12, 1);
    });

    it("returns pace per mile (1 mile = 1.60934 km)", () => {
      const result = calculatePace({
        mode: "pace",
        distance: 10,
        hours: 0,
        minutes: 50,
        seconds: 0,
      });
      expect(result.ok).toBe(true);
      // 5:00/km × 1.60934 = 8:03/mile
      expect((result as { ok: true; value: any }).value.paceMile.minutes).toBe(8);
      expect((result as { ok: true; value: any }).value.paceMile.seconds).toBe(3);
    });
  });

  describe("mode: time — calculate time from distance and pace", () => {
    it("returns null when distance <= 0", () => {
      expect(calculatePace({ mode: "time", distance: 0, paceMinutes: 5, paceSeconds: 0 }).ok).toBe(
        false
      );
    });

    it("calculates total time for 10km at 5:00/km pace", () => {
      // 10km × 300s/km = 3000s = 0h 50m 0s
      const result = calculatePace({ mode: "time", distance: 10, paceMinutes: 5, paceSeconds: 0 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.totalTime.hours).toBe(0);
      expect((result as { ok: true; value: any }).value.totalTime.minutes).toBe(50);
      expect((result as { ok: true; value: any }).value.totalTime.seconds).toBe(0);
    });
  });

  describe("mode: distance — calculate distance from time and pace", () => {
    it("calculates distance for 50 minutes at 5:00/km pace", () => {
      // 3000s / 300s/km = 10km
      const result = calculatePace({
        mode: "distance",
        hours: 0,
        minutes: 50,
        seconds: 0,
        paceMinutes: 5,
        paceSeconds: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.distance).toBeCloseTo(10, 1);
    });
  });

  describe("splits array", () => {
    it("returns splits for each km", () => {
      const result = calculatePace({
        mode: "pace",
        distance: 5,
        hours: 0,
        minutes: 25,
        seconds: 0,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.splits.length).toBeGreaterThanOrEqual(5);
    });
  });
});
