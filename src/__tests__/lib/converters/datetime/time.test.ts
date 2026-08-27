import { describe, expect, it } from "vitest";
import { calculateTime } from "@/lib/converters/datetime/time";

describe("calculateTime", () => {
  it("returns ok: false for missing startTime", () => {
    const result = calculateTime({
      startTime: "",
      operation: "add",
      hours: "1",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(false);
  });

  it("adds 90 minutes to 10:00 → 11:30", () => {
    const result = calculateTime({
      startTime: "10:00",
      operation: "add",
      hours: "0",
      minutes: "90",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resultTime).toBe("11:30:00");
      expect(result.value.crossesMidnight).toBe(false);
    }
  });

  it("subtracts 45 minutes from 01:00 → 00:15", () => {
    const result = calculateTime({
      startTime: "01:00",
      operation: "subtract",
      hours: "0",
      minutes: "45",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resultTime).toBe("00:15:00");
    }
  });

  it("adding crosses midnight correctly", () => {
    const result = calculateTime({
      startTime: "23:00",
      operation: "add",
      hours: "2",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.crossesMidnight).toBe(true);
      expect(result.value.dayChange).toBe(1);
      expect(result.value.resultTime).toBe("01:00:00");
    }
  });

  it("subtracting crosses midnight backward", () => {
    const result = calculateTime({
      startTime: "00:30",
      operation: "subtract",
      hours: "1",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.crossesMidnight).toBe(true);
      expect(result.value.dayChange).toBe(-1);
      expect(result.value.resultTime).toBe("23:30:00");
    }
  });

  it("adds 0 time returns same time", () => {
    const result = calculateTime({
      startTime: "10:30",
      operation: "add",
      hours: "0",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.resultTime).toBe("10:30:00");
    }
  });

  it("returns AM for morning time", () => {
    const result = calculateTime({
      startTime: "10:00",
      operation: "add",
      hours: "0",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.period).toBe("AM");
    }
  });

  it("returns PM for afternoon time", () => {
    const result = calculateTime({
      startTime: "14:00",
      operation: "add",
      hours: "0",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.period).toBe("PM");
    }
  });

  it("provides both 12h and 24h formatted times", () => {
    const result = calculateTime({
      startTime: "13:30",
      operation: "add",
      hours: "0",
      minutes: "0",
      seconds: "0",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.formatted24h).toBe("13:30:00");
      expect(result.value.formatted12h).toContain("1:30");
    }
  });
});
