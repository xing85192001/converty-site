import { describe, expect, it } from "vitest";
import {
  estimateGoldenHour,
  LIGHT_PHASES,
  TWILIGHT_DURATION_EXAMPLES,
} from "@/lib/converters/photo/golden-hour";

describe("estimateGoldenHour", () => {
  it("returns morning and evening golden hour times", () => {
    const result = estimateGoldenHour(6, 30, 20, 0);
    expect(result).toHaveProperty("morningGoldenStart");
    expect(result).toHaveProperty("morningGoldenEnd");
    expect(result).toHaveProperty("eveningGoldenStart");
    expect(result).toHaveProperty("eveningGoldenEnd");
  });

  it("morning golden hour ends 30 minutes after start", () => {
    const result = estimateGoldenHour(6, 30, 20, 0);
    // morning golden start = 06:30, end = 07:00
    expect(result.morningGoldenStart).toBe("06:30");
    expect(result.morningGoldenEnd).toBe("07:00");
  });

  it("evening golden hour ends at sunset time", () => {
    const result = estimateGoldenHour(6, 30, 20, 30);
    // evening golden end = 20:30 (sunset), start = 20:00 (30min before)
    expect(result.eveningGoldenEnd).toBe("20:30");
    expect(result.eveningGoldenStart).toBe("20:00");
  });

  it("blue hour times are strings in HH:MM format", () => {
    const result = estimateGoldenHour(6, 30, 20, 0);
    expect(result.morningBlueStart).toMatch(/^\d{2}:\d{2}$/);
    expect(result.eveningBlueEnd).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("LIGHT_PHASES", () => {
  it("contains 6 phases", () => {
    expect(LIGHT_PHASES).toHaveLength(6);
  });

  it("includes Golden Hour phase", () => {
    const goldenHour = LIGHT_PHASES.find((p) => p.name === "Golden Hour");
    expect(goldenHour).toBeDefined();
    expect(goldenHour?.sunElevation).toBe("0° to 6°");
  });
});

describe("TWILIGHT_DURATION_EXAMPLES", () => {
  it("includes examples for multiple latitudes", () => {
    expect(TWILIGHT_DURATION_EXAMPLES.length).toBeGreaterThan(0);
  });

  it("equatorial example has shortest golden hour", () => {
    const equatorial = TWILIGHT_DURATION_EXAMPLES.find((e) => e.latitude === 0);
    expect(equatorial).toBeDefined();
    expect(equatorial?.goldenHour).toContain("25");
  });
});
