import { describe, expect, it } from "vitest";
import { calculateTimeLapse } from "@/lib/converters/photo/time-lapse";

describe("calculateTimeLapse - clip_length mode", () => {
  it("calculates clip length from event duration and interval", () => {
    // 60min event, 5s interval, 30fps: 720 photos / 30fps = 24s clip
    const result = calculateTimeLapse({
      calculateMode: "clip_length",
      eventDurationMinutes: 60,
      intervalSeconds: 5,
      frameRate: 30,
      imageSizeMB: 8,
    });
    expect(result.clipLengthSeconds).toBeCloseTo(24, 0);
    expect(result.totalPhotos).toBe(720);
  });

  it("calculates total memory correctly", () => {
    const result = calculateTimeLapse({
      calculateMode: "clip_length",
      eventDurationMinutes: 60,
      intervalSeconds: 5,
      frameRate: 30,
      imageSizeMB: 8,
    });
    expect(result.totalMemoryMB).toBe(720 * 8);
  });
});

describe("calculateTimeLapse - interval mode", () => {
  it("calculates interval from event duration and desired clip length", () => {
    // 60min event, 30fps, 30s clip: 900 photos needed, interval = 3600/900 = 4s
    const result = calculateTimeLapse({
      calculateMode: "interval",
      eventDurationMinutes: 60,
      clipLengthSeconds: 30,
      frameRate: 30,
      imageSizeMB: 8,
    });
    expect(result.intervalSeconds).toBeCloseTo(4, 0);
  });
});

describe("calculateTimeLapse - event_duration mode", () => {
  it("calculates event duration from clip length and interval", () => {
    // 30s clip at 30fps = 900 photos, 5s interval: event = 900 * 5 = 4500s = 75min
    const result = calculateTimeLapse({
      calculateMode: "event_duration",
      clipLengthSeconds: 30,
      intervalSeconds: 5,
      frameRate: 30,
      imageSizeMB: 8,
    });
    expect(result.eventDurationMinutes).toBeCloseTo(75, 0);
  });

  it("returns speedup factor", () => {
    const result = calculateTimeLapse({
      calculateMode: "event_duration",
      clipLengthSeconds: 30,
      intervalSeconds: 5,
      frameRate: 30,
      imageSizeMB: 8,
    });
    expect(result.speedupFactor).toBeGreaterThan(1);
  });
});
