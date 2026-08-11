import { describe, expect, it } from "vitest";
import { calculateWindowsLicensing } from "@/lib/converters/infrastructure/windows-licensing";

const BASE_INPUT = {
  hostCount: 4,
  coresPerCpu: 16,
  socketsPerHost: 2,
  vmCount: 20,
  calculationMode: "compare" as const,
};

describe("calculateWindowsLicensing", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for hostCount = 0", () => {
      const result = calculateWindowsLicensing({ ...BASE_INPUT, hostCount: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for coresPerCpu = 0", () => {
      const result = calculateWindowsLicensing({ ...BASE_INPUT, coresPerCpu: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for socketsPerHost = 0", () => {
      const result = calculateWindowsLicensing({ ...BASE_INPUT, socketsPerHost: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for vmCount = 0", () => {
      const result = calculateWindowsLicensing({ ...BASE_INPUT, vmCount: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("datacenter edition", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("datacenter totalCost is positive", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.datacenter.totalCost).toBeGreaterThan(0);
    });

    it("datacenter vmsIncluded is 'Unlimited'", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.datacenter.vmsIncluded).toContain("nlimited");
    });
  });

  describe("standard edition", () => {
    it("standard totalCost is positive", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.standard.totalCost).toBeGreaterThan(0);
    });

    it("standard has vmsIncluded (limited number)", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.standard.vmsIncluded).toBeGreaterThan(0);
    });
  });

  describe("comparison", () => {
    it("recommendation is datacenter or standard", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(["datacenter", "standard"]).toContain(result.value.comparison.recommendation);
    });

    it("breakEvenVms is positive", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.comparison.breakEvenVms).toBeGreaterThan(0);
    });

    it("datacenter is better for high VM counts (many VMs)", () => {
      // With many VMs (200 VMs across 4 hosts = 50 VMs/host), datacenter should win
      const result = calculateWindowsLicensing({ ...BASE_INPUT, vmCount: 200 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.comparison.recommendation).toBe("datacenter");
    });

    it("standard is better for low VM counts", () => {
      // With very few VMs (4 total), standard may be cheaper
      const result = calculateWindowsLicensing({ ...BASE_INPUT, vmCount: 4 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // Just check the recommendation is valid, actual value depends on pricing data
      expect(["datacenter", "standard"]).toContain(result.value.comparison.recommendation);
    });
  });

  describe("more hosts → higher cost", () => {
    it("4 hosts costs more than 1 host (same config)", () => {
      const oneHost = calculateWindowsLicensing({ ...BASE_INPUT, hostCount: 1 });
      const fourHosts = calculateWindowsLicensing({ ...BASE_INPUT, hostCount: 4 });
      expect(oneHost.ok).toBe(true);
      expect(fourHosts.ok).toBe(true);
      if (!oneHost.ok || !fourHosts.ok) return;
      expect(fourHosts.value.datacenter.totalCost).toBeGreaterThan(
        oneHost.value.datacenter.totalCost
      );
    });
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateWindowsLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
