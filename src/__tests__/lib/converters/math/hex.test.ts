import { describe, expect, it } from "vitest";
import { calculateHex } from "@/lib/converters/math/hex";

describe("calculateHex", () => {
  describe("hexToDecimal", () => {
    it("returns null for invalid hex string", () => {
      expect(calculateHex({ mode: "hexToDecimal", hex: "GGG" }).ok).toBe(false);
    });

    it("converts hex 'FF' to decimal 255", () => {
      const result = calculateHex({ mode: "hexToDecimal", hex: "FF" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.decimal).toBe(255);
    });

    it("provides binary representation", () => {
      const result = calculateHex({ mode: "hexToDecimal", hex: "FF" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.binary).toBe("11111111");
    });
  });

  describe("decimalToHex", () => {
    it("returns null for non-integer input", () => {
      expect(calculateHex({ mode: "decimalToHex", decimal: 3.5 }).ok).toBe(false);
    });

    it("converts decimal 255 to hex 'FF'", () => {
      const result = calculateHex({ mode: "decimalToHex", decimal: 255 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.hexadecimal).toBe("FF");
    });
  });

  describe("hexToRgb", () => {
    it("converts hex 'FF0000' to RGB red", () => {
      const result = calculateHex({ mode: "hexToRgb", hex: "FF0000" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.rgb!.r).toBe(255);
      expect((result as { ok: true; value: any }).value.rgb!.g).toBe(0);
      expect((result as { ok: true; value: any }).value.rgb!.b).toBe(0);
    });

    it("returns null for invalid hex color", () => {
      expect(calculateHex({ mode: "hexToRgb", hex: "ZZZZZZ" }).ok).toBe(false);
    });
  });

  describe("rgbToHex", () => {
    it("converts RGB (255, 255, 255) to #FFFFFF", () => {
      const result = calculateHex({ mode: "rgbToHex", rgb: { r: 255, g: 255, b: 255 } });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.hexadecimal).toBe("#FFFFFF");
    });

    it("returns null for out-of-range RGB values", () => {
      expect(calculateHex({ mode: "rgbToHex", rgb: { r: 256, g: 0, b: 0 } }).ok).toBe(false);
    });
  });
});
