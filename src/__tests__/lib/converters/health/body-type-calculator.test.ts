import { describe, expect, it } from "vitest";
import { calculateBodyType } from "@/lib/converters/health/body-type-calculator";

describe("calculateBodyType", () => {
  describe("null for invalid inputs", () => {
    it("returns null for wristCircumference <= 0", () => {
      expect(calculateBodyType({ gender: "male", wristCircumference: 0, height: 175 }).ok).toBe(
        false
      );
    });

    it("returns null for height <= 0", () => {
      expect(calculateBodyType({ gender: "male", wristCircumference: 17, height: 0 }).ok).toBe(
        false
      );
    });
  });

  describe("frame size classification", () => {
    it("classifies male with wristRatio > 10.4 as small frame (ectomorph)", () => {
      // wristRatio = height / wrist = 175 / 16 = 10.9375 > 10.4 → small
      const result = calculateBodyType({ gender: "male", wristCircumference: 16, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.frameSize).toBe("small");
      expect((result as { ok: true; value: any }).value.bodyType).toBe("ectomorph");
    });

    it("classifies male with wristRatio < 9.6 as large frame (endomorph)", () => {
      // wristRatio = 175 / 19 = 9.21 < 9.6 → large
      const result = calculateBodyType({ gender: "male", wristCircumference: 19, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.frameSize).toBe("large");
      expect((result as { ok: true; value: any }).value.bodyType).toBe("endomorph");
    });

    it("classifies male with medium wristRatio as mesomorph", () => {
      // wristRatio = 175 / 18 = 9.72, between 9.6-10.4 → medium
      const result = calculateBodyType({ gender: "male", wristCircumference: 18, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.frameSize).toBe("medium");
      expect((result as { ok: true; value: any }).value.bodyType).toBe("mesomorph");
    });
  });

  describe("female frame size", () => {
    it("classifies female with small wrist as small frame", () => {
      // wristRatio = 165 / 14 = 11.78 > 11.0 → small
      const result = calculateBodyType({ gender: "female", wristCircumference: 14, height: 165 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.frameSize).toBe("small");
    });
  });

  describe("wristRatio is computed correctly", () => {
    it("wristRatio = height / wristCircumference", () => {
      const result = calculateBodyType({ gender: "male", wristCircumference: 17, height: 170 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.wristRatio).toBeCloseTo(170 / 17, 4);
    });
  });

  describe("result structure", () => {
    it("returns all required arrays", () => {
      const result = calculateBodyType({ gender: "male", wristCircumference: 17, height: 175 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.characteristics.length).toBeGreaterThan(0);
      expect(
        (result as { ok: true; value: any }).value.trainingRecommendations.length
      ).toBeGreaterThan(0);
      expect(
        (result as { ok: true; value: any }).value.nutritionRecommendations.length
      ).toBeGreaterThan(0);
    });
  });
});
