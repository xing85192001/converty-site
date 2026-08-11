import { describe, expect, it } from "vitest";
import { calculateDilution } from "@/lib/converters/chemistry/dilution";

describe("calculateDilution", () => {
  describe("error results for invalid inputs", () => {
    it("returns ok:false for initialMolarity <= 0", () => {
      expect(
        calculateDilution({
          mode: "find-M2",
          initialMolarity: 0,
          initialVolume: 10,
          initialVolumeUnit: "mL",
          finalVolume: 100,
          finalVolumeUnit: "mL",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for find-V2 when finalMolarity <= 0", () => {
      expect(
        calculateDilution({
          mode: "find-V2",
          initialMolarity: 1,
          initialVolume: 10,
          initialVolumeUnit: "mL",
          finalMolarity: 0,
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for find-M2 when finalVolume missing", () => {
      expect(
        calculateDilution({
          mode: "find-M2",
          initialMolarity: 1,
          initialVolume: 10,
          initialVolumeUnit: "mL",
        }).ok
      ).toBe(false);
    });

    it("returns ok:false for find-V1 when finalVolume missing", () => {
      expect(
        calculateDilution({
          mode: "find-V1",
          initialMolarity: 1,
          finalMolarity: 0.1,
        }).ok
      ).toBe(false);
    });
  });

  describe("find-M2 mode: C1=1M V1=10mL V2=100mL → C2=0.1M", () => {
    it("calculates final molarity correctly", () => {
      const result = calculateDilution({
        mode: "find-M2",
        initialMolarity: 1,
        initialVolume: 10,
        initialVolumeUnit: "mL",
        finalVolume: 100,
        finalVolumeUnit: "mL",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalMolarity).toBeCloseTo(0.1, 2);
      }
    });

    it("dilution factor is 10", () => {
      const result = calculateDilution({
        mode: "find-M2",
        initialMolarity: 1,
        initialVolume: 10,
        initialVolumeUnit: "mL",
        finalVolume: 100,
        finalVolumeUnit: "mL",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.dilutionFactor).toBeCloseTo(10, 1);
      }
    });
  });

  describe("find-V1 mode: given M1, M2, V2 → solve for V1", () => {
    it("calculates initial volume correctly: M1=2M, M2=0.5M, V2=1L → V1=0.25L", () => {
      const result = calculateDilution({
        mode: "find-V1",
        initialMolarity: 2,
        finalMolarity: 0.5,
        finalVolume: 1,
        finalVolumeUnit: "L",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.initialVolumeL).toBeCloseTo(0.25, 2);
      }
    });
  });

  describe("find-V2 mode: given M1, V1, M2 → solve for V2", () => {
    it("calculates final volume correctly: M1=1M, V1=50mL, M2=0.1M → V2=0.5L", () => {
      const result = calculateDilution({
        mode: "find-V2",
        initialMolarity: 1,
        initialVolume: 50,
        initialVolumeUnit: "mL",
        finalMolarity: 0.1,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.finalVolumeL).toBeCloseTo(0.5, 2);
      }
    });
  });

  describe("result structure", () => {
    it("returns steps array", () => {
      const result = calculateDilution({
        mode: "find-M2",
        initialMolarity: 1,
        initialVolume: 10,
        initialVolumeUnit: "mL",
        finalVolume: 100,
        finalVolumeUnit: "mL",
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.steps).toBeInstanceOf(Array);
        expect(result.value.steps.length).toBeGreaterThan(0);
      }
    });
  });
});
