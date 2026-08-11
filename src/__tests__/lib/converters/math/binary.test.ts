import { describe, expect, it } from "vitest";
import { calculateBinary } from "@/lib/converters/math/binary";

describe("calculateBinary", () => {
  describe("decimalToBinary", () => {
    it("returns null for non-integer input", () => {
      expect(calculateBinary({ mode: "decimalToBinary", decimal: 3.5 }).ok).toBe(false);
    });

    it("converts decimal 10 to binary '1010'", () => {
      const result = calculateBinary({ mode: "decimalToBinary", decimal: 10 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.binary).toBe("1010");
    });

    it("shows decimal and hex representation", () => {
      const result = calculateBinary({ mode: "decimalToBinary", decimal: 255 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.hexadecimal).toBe("FF");
      expect((result as { ok: true; value: any }).value.decimal).toBe(255);
    });
  });

  describe("binaryToDecimal", () => {
    it("returns null for invalid binary string", () => {
      expect(calculateBinary({ mode: "binaryToDecimal", binary: "1020" }).ok).toBe(false);
    });

    it("converts binary '1010' to decimal 10", () => {
      const result = calculateBinary({ mode: "binaryToDecimal", binary: "1010" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.decimal).toBe(10);
    });
  });

  describe("binaryOperation", () => {
    it("adds two binary numbers", () => {
      const result = calculateBinary({
        mode: "binaryOperation",
        binary: "1010",
        binary2: "0110",
        operation: "add",
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.operationResult!.decimal).toBe(16);
    });

    it("applies NOT operation", () => {
      const result = calculateBinary({ mode: "binaryOperation", binary: "1010", operation: "not" });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.operationResult!.binary).toBe("0101");
    });
  });
});
