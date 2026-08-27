import { describe, expect, it } from "vitest";
import { calculateTriangle } from "@/lib/converters/math/triangle";

describe("calculateTriangle", () => {
  describe("sides mode (SSS)", () => {
    it("computes 3-4-5 right triangle correctly", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isValid).toBe(true);
      expect((result as { ok: true; value: any }).value.angleType).toBe("Right");
      // angles should sum to 180
      const angleSum =
        (result as { ok: true; value: any }).value.angleA +
        (result as { ok: true; value: any }).value.angleB +
        (result as { ok: true; value: any }).value.angleC;
      expect(angleSum).toBeCloseTo(180, 5);
    });

    it("identifies equilateral triangle", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 5, sideB: 5, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.type).toBe("Equilateral");
    });

    it("identifies isosceles triangle", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 5, sideB: 5, sideC: 3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.type).toBe("Isosceles");
    });

    it("identifies scalene triangle", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.type).toBe("Scalene");
    });

    it("returns null for triangle inequality violation (a+b < c)", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 1, sideB: 2, sideC: 10 });
      expect(result.ok).toBe(false);
    });

    it("returns null for missing sides", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4 });
      expect(result.ok).toBe(false);
    });
  });

  describe("sasAngle mode (SAS)", () => {
    it("law of cosines: a=7, b=8, C=60° computes c correctly", () => {
      const result = calculateTriangle({ mode: "sasAngle", sideA: 7, sideB: 8, angleC: 60 });
      expect(result.ok).toBe(true);
      // c² = 7² + 8² - 2*7*8*cos(60°) = 49+64-56 = 57, c ≈ 7.55
      expect((result as { ok: true; value: any }).value.sideC).toBeCloseTo(Math.sqrt(57), 3);
    });

    it("angle sum = 180 for SAS result", () => {
      const result = calculateTriangle({ mode: "sasAngle", sideA: 5, sideB: 7, angleC: 45 });
      expect(result.ok).toBe(true);
      const angleSum =
        (result as { ok: true; value: any }).value.angleA +
        (result as { ok: true; value: any }).value.angleB +
        (result as { ok: true; value: any }).value.angleC;
      expect(angleSum).toBeCloseTo(180, 4);
    });

    it("returns null for invalid angle (C=0)", () => {
      const result = calculateTriangle({ mode: "sasAngle", sideA: 5, sideB: 7, angleC: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns null for missing inputs", () => {
      const result = calculateTriangle({ mode: "sasAngle", sideA: 5, sideB: 7 });
      expect(result.ok).toBe(false);
    });
  });

  describe("asaAngles mode (ASA)", () => {
    it("calculates third side from two angles and included side", () => {
      const result = calculateTriangle({
        mode: "asaAngles",
        angleA: 60,
        angleB: 60,
        sideC: 10,
      });
      expect(result.ok).toBe(true);
      // equilateral: all sides equal
      expect((result as { ok: true; value: any }).value.sideA).toBeCloseTo(
        (result as { ok: true; value: any }).value.sideC,
        3
      );
      expect((result as { ok: true; value: any }).value.sideB).toBeCloseTo(
        (result as { ok: true; value: any }).value.sideC,
        3
      );
    });

    it("returns null when angles sum to 180 or more", () => {
      const result = calculateTriangle({
        mode: "asaAngles",
        angleA: 90,
        angleB: 90,
        sideC: 10,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for missing inputs", () => {
      const result = calculateTriangle({ mode: "asaAngles", angleA: 60, angleB: 60 });
      expect(result.ok).toBe(false);
    });
  });

  describe("aasAngles mode (AAS)", () => {
    it("calculates sides from two angles and non-included side", () => {
      const result = calculateTriangle({
        mode: "aasAngles",
        angleA: 45,
        angleB: 60,
        sideA: 10,
      });
      expect(result.ok).toBe(true);
      const angleSum =
        (result as { ok: true; value: any }).value.angleA +
        (result as { ok: true; value: any }).value.angleB +
        (result as { ok: true; value: any }).value.angleC;
      expect(angleSum).toBeCloseTo(180, 4);
    });

    it("returns null for invalid angles", () => {
      const result = calculateTriangle({
        mode: "aasAngles",
        angleA: 90,
        angleB: 95,
        sideA: 10,
      });
      expect(result.ok).toBe(false);
    });

    it("returns null for missing inputs", () => {
      const result = calculateTriangle({ mode: "aasAngles", angleA: 45, angleB: 60 });
      expect(result.ok).toBe(false);
    });
  });

  describe("triangle properties", () => {
    it("calculates perimeter and area for 3-4-5 triangle", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.perimeter).toBeCloseTo(12, 5);
      expect((result as { ok: true; value: any }).value.area).toBeCloseTo(6, 5); // (1/2) * 3 * 4 = 6
    });

    it("calculates inradius and circumradius", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      // inradius of 3-4-5 = area/s = 6/6 = 1
      expect((result as { ok: true; value: any }).value.inradius).toBeCloseTo(1, 5);
      // circumradius of 3-4-5 = c/2 = 5/2 = 2.5
      expect((result as { ok: true; value: any }).value.circumradius).toBeCloseTo(2.5, 5);
    });

    it("calculates altitudes", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.altitudeA).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.altitudeB).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.altitudeC).toBeGreaterThan(0);
    });

    it("calculates medians", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.medianA).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.medianB).toBeGreaterThan(0);
      expect((result as { ok: true; value: any }).value.medianC).toBeGreaterThan(0);
    });

    it("semiperimeter = perimeter / 2", () => {
      const result = calculateTriangle({ mode: "sides", sideA: 3, sideB: 4, sideC: 5 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.semiperimeter).toBeCloseTo(6, 5);
    });
  });

  describe("it.each for all modes", () => {
    it.each([
      ["sides", { sideA: 3, sideB: 4, sideC: 5 }],
      ["sasAngle", { sideA: 3, sideB: 4, angleC: 90 }],
      ["asaAngles", { angleA: 90, angleB: 53.13, sideC: 5 }],
      ["aasAngles", { angleA: 36.87, angleB: 53.13, sideA: 3 }],
    ] as const)("mode %s returns valid triangle", (mode, extra) => {
      const result = calculateTriangle({ mode, ...extra });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const angleSum = result.value.angleA + result.value.angleB + result.value.angleC;
        expect(angleSum).toBeCloseTo(180, 1);
      }
    });
  });
});
