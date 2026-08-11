import { describe, expect, it } from "vitest";
import {
  cmykToRgb,
  convertFromHex,
  convertFromRgb,
  hexToRgb,
  hslToRgb,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
} from "@/lib/converters/color/rgb";

describe("rgbToHex", () => {
  it("converts red (255, 0, 0) to #FF0000", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#FF0000");
  });

  it("converts green (0, 255, 0) to #00FF00", () => {
    expect(rgbToHex(0, 255, 0)).toBe("#00FF00");
  });

  it("converts blue (0, 0, 255) to #0000FF", () => {
    expect(rgbToHex(0, 0, 255)).toBe("#0000FF");
  });

  it("converts black (0, 0, 0) to #000000", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("converts white (255, 255, 255) to #FFFFFF", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF");
  });
});

describe("hexToRgb", () => {
  it("converts #FF0000 to {r:255, g:0, b:0}", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts lowercase #ff0000", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("invalid")).toBeNull();
    expect(hexToRgb("#XYZ")).toBeNull();
  });

  it("handles hex without # prefix", () => {
    expect(hexToRgb("FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("rgbToHsl", () => {
  it("converts red (255, 0, 0) to {h:0, s:100, l:50}", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts white (255, 255, 255) to {h:0, s:0, l:100}", () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it("converts black (0, 0, 0) to {h:0, s:0, l:0}", () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });
});

describe("hslToRgb", () => {
  it("converts (0, 100, 50) to red {r:255, g:0, b:0}", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("round-trips: rgb → hsl → rgb", () => {
    const original = { r: 128, g: 64, b: 192 };
    const hsl = rgbToHsl(original.r, original.g, original.b);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(back.r).toBeCloseTo(original.r, -1);
    expect(back.g).toBeCloseTo(original.g, -1);
    expect(back.b).toBeCloseTo(original.b, -1);
  });
});

describe("rgbToCmyk", () => {
  it("converts red (255, 0, 0) to {c:0, m:100, y:100, k:0}", () => {
    expect(rgbToCmyk(255, 0, 0)).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("converts black (0, 0, 0) to {c:0, m:0, y:0, k:100}", () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });
});

describe("cmykToRgb", () => {
  it("converts (0, 100, 100, 0) to red {r:255, g:0, b:0}", () => {
    expect(cmykToRgb(0, 100, 100, 0)).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("convertFromRgb", () => {
  it("returns all color formats for red", () => {
    const result = convertFromRgb(255, 0, 0);
    expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(result.hex).toBe("#FF0000");
    expect(result.hsl).toEqual({ h: 0, s: 100, l: 50 });
    expect(result.cmyk).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });
});

describe("convertFromHex", () => {
  it("converts valid hex to all formats", () => {
    const result = convertFromHex("#FF0000");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(result.value.hex).toBe("#FF0000");
  });

  it("returns error for invalid hex", () => {
    expect(convertFromHex("invalid").ok).toBe(false);
    expect(convertFromHex("#XYZ123").ok).toBe(false);
  });
});
