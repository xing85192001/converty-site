import { describe, expect, it } from "vitest";
import {
  calculateTireDimensions,
  compareTireSizes,
  formatTireNotation,
  parseTireNotation,
} from "@/lib/converters/automotive/tire-sizing";

describe("parseTireNotation", () => {
  it("returns null for invalid tire notation", () => {
    expect(parseTireNotation("invalid")).toBeNull();
    expect(parseTireNotation("")).toBeNull();
    expect(parseTireNotation("225/45")).toBeNull();
  });

  it("parses 225/45R17 correctly", () => {
    const result = parseTireNotation("225/45R17");
    expect(result).not.toBeNull();
    expect(result!.width).toBe(225);
    expect(result!.aspectRatio).toBe(45);
    expect(result!.construction).toBe("R");
    expect(result!.rimDiameter).toBe(17);
  });

  it("parses 205/55R16 correctly", () => {
    const result = parseTireNotation("205/55R16");
    expect(result).not.toBeNull();
    expect(result!.width).toBe(205);
    expect(result!.aspectRatio).toBe(55);
    expect(result!.rimDiameter).toBe(16);
  });

  it("parses tire with load index and speed rating: 225/45R17 94W", () => {
    const result = parseTireNotation("225/45R17 94W");
    expect(result).not.toBeNull();
    expect(result!.loadIndex).toBe(94);
    expect(result!.speedRating).toBe("W");
  });
});

describe("calculateTireDimensions", () => {
  it("returns ok: false for invalid tire notation string", () => {
    const result = calculateTireDimensions("invalid-notation");
    expect(result.ok).toBe(false);
  });

  it("calculates sidewall height for 225/45R17", () => {
    const result = calculateTireDimensions("225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      // sidewall = 225 * 0.45 = 101.25mm
      expect(result.value.sidewallHeight).toBeCloseTo(101.25, 1);
    }
  });

  it("calculates overall diameter for 225/45R17", () => {
    const result = calculateTireDimensions("225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      // rimDiameterMm = 17 * 25.4 = 431.8mm
      // overallDiameter = 431.8 + 2*101.25 = 634.3mm
      expect(result.value.overallDiameter).toBeCloseTo(634.3, 0);
    }
  });

  it("calculates circumference from diameter", () => {
    const result = calculateTireDimensions("225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.circumference).toBeCloseTo(Math.PI * result.value.overallDiameter, 0);
    }
  });

  it("calculates revolurionsPerKm", () => {
    const result = calculateTireDimensions("225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.revolutionsPerKm).toBeGreaterThan(0);
    }
  });

  it("provides cm dimensions", () => {
    const result = calculateTireDimensions("225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sidewallHeightCm).toBeCloseTo(result.value.sidewallHeight / 10, 3);
      expect(result.value.overallDiameterCm).toBeCloseTo(result.value.overallDiameter / 10, 3);
    }
  });

  it("accepts TireSizeComponents object as input", () => {
    const components = {
      width: 205,
      aspectRatio: 55,
      construction: "R" as const,
      rimDiameter: 16,
      notation: "205/55R16",
    };
    const result = calculateTireDimensions(components);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.components.width).toBe(205);
    }
  });
});

describe("compareTireSizes", () => {
  it("returns ok: false when one tire notation is invalid", () => {
    const result = compareTireSizes("225/45R17", "invalid");
    expect(result.ok).toBe(false);
  });

  it("compares same tire size with 0% difference", () => {
    const result = compareTireSizes("225/45R17", "225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.diameterDifferencePercent).toBeCloseTo(0, 4);
      expect(result.value.withinTolerance).toBe(true);
    }
  });

  it("detects diameter difference between different sizes", () => {
    const result = compareTireSizes("205/55R16", "225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Math.abs(result.value.diameterDifferenceMm)).toBeGreaterThan(0);
    }
  });

  it("calculates speedometer error percentage", () => {
    const result = compareTireSizes("205/55R16", "225/45R17");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.value.speedometerErrorPercent).toBe("number");
    }
  });
});

describe("formatTireNotation", () => {
  it("formats basic tire notation", () => {
    const components = {
      width: 225,
      aspectRatio: 45,
      construction: "R" as const,
      rimDiameter: 17,
      notation: "225/45R17",
    };
    const formatted = formatTireNotation(components);
    expect(formatted).toBe("225/45R17");
  });

  it("includes load index and speed rating when present", () => {
    const components = {
      width: 225,
      aspectRatio: 45,
      construction: "R" as const,
      rimDiameter: 17,
      loadIndex: 94,
      speedRating: "W",
      notation: "225/45R17 94W",
    };
    const formatted = formatTireNotation(components);
    expect(formatted).toBe("225/45R17 94W");
  });
});
