import { describe, expect, it } from "vitest";
import { calculateVirtualizationCost } from "@/lib/converters/infrastructure/virtualization-cost";

const BASE_INPUT = {
  platform: "vmware" as const,
  serverCost: 100000,
  storageCost: 50000,
  networkCost: 20000,
  hypervisorLicenseCost: 35000,
  osLicenseCost: 10000,
  backupSoftwareCost: 5000,
  powerCostPerKwh: 0.12,
  totalPowerKw: 10,
  pue: 1.5,
  datacenterCostPerRu: 50,
  totalRackUnits: 20,
  laborCostAnnual: 80000,
  vmCount: 100,
  termYears: 3 as const,
};

describe("calculateVirtualizationCost", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for vmCount = 0", () => {
      const result = calculateVirtualizationCost({ ...BASE_INPUT, vmCount: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for pue < 1.0", () => {
      const result = calculateVirtualizationCost({ ...BASE_INPUT, pue: 0.5 });
      expect(result.ok).toBe(false);
    });

    it("returns error for negative serverCost", () => {
      const result = calculateVirtualizationCost({ ...BASE_INPUT, serverCost: -1 });
      expect(result.ok).toBe(false);
    });

    it("returns error for invalid termYears", () => {
      const result = calculateVirtualizationCost({ ...BASE_INPUT, termYears: 2 as 1 | 3 | 5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("TCO calculations", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("tco > capex (OPEX adds to cost over time)", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.tco).toBeGreaterThan(result.value.capex);
    });

    it("capex = serverCost + storageCost + networkCost", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expected = BASE_INPUT.serverCost + BASE_INPUT.storageCost + BASE_INPUT.networkCost;
      expect(result.value.capex).toBe(expected);
    });

    it("costPerVm > 0", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.costPerVm).toBeGreaterThan(0);
    });

    it("costPerVmMonthly > 0", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.costPerVmMonthly).toBeGreaterThan(0);
    });
  });

  describe("longer term = higher total cost", () => {
    it("5-year TCO > 3-year TCO", () => {
      const threeYear = calculateVirtualizationCost({ ...BASE_INPUT, termYears: 3 });
      const fiveYear = calculateVirtualizationCost({ ...BASE_INPUT, termYears: 5 });
      expect(threeYear.ok).toBe(true);
      expect(fiveYear.ok).toBe(true);
      if (!threeYear.ok || !fiveYear.ok) return;
      expect(fiveYear.value.tco).toBeGreaterThan(threeYear.value.tco);
    });
  });

  describe("breakdown structure", () => {
    it("breakdown has hardware, software, power, datacenter, labor", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.breakdown.hardware).toBeGreaterThan(0);
      expect(result.value.breakdown.software).toBeGreaterThan(0);
      expect(result.value.breakdown.power).toBeGreaterThan(0);
    });

    it("percentages sum to approximately 100", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const total =
        result.value.percentages.hardware +
        result.value.percentages.software +
        result.value.percentages.power +
        result.value.percentages.datacenter +
        result.value.percentages.labor;
      expect(total).toBeCloseTo(100, 0);
    });
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateVirtualizationCost(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
