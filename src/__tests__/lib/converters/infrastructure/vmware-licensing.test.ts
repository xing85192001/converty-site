import { describe, expect, it } from "vitest";
import { calculateVmwareLicensing } from "@/lib/converters/infrastructure/vmware-licensing";

const BASE_INPUT = {
  hostCount: 4,
  cpusPerHost: 2,
  coresPerCpu: 16,
  productType: "vcf" as const,
  termYears: 3 as const,
};

describe("calculateVmwareLicensing", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for hostCount = 0", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, hostCount: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for cpusPerHost = 0", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, cpusPerHost: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for coresPerCpu = 0", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, coresPerCpu: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for invalid termYears", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, termYears: 2 as 1 | 3 | 5 });
      expect(result.ok).toBe(false);
    });
  });

  describe("core licensing math", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateVmwareLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("totalPhysicalCores = hostCount × cpusPerHost × coresPerCpu", () => {
      const result = calculateVmwareLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expected = BASE_INPUT.hostCount * BASE_INPUT.cpusPerHost * BASE_INPUT.coresPerCpu;
      expect(result.value.totalPhysicalCores).toBe(expected);
    });

    it("annualCost is positive", () => {
      const result = calculateVmwareLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.annualCost).toBeGreaterThan(0);
    });

    it("totalCost = annualCost × termYears", () => {
      const result = calculateVmwareLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalCost).toBeCloseTo(result.value.annualCost * BASE_INPUT.termYears, 0);
    });
  });

  describe("16-core minimum enforcement", () => {
    it("minCoreEnforced=true when coresPerCpu < 16", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, coresPerCpu: 8 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.minCoreEnforced).toBe(true);
      expect(result.value.coresPerCpuLicensed).toBe(16);
    });

    it("minCoreEnforced=false when coresPerCpu >= 16", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, coresPerCpu: 20 });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.minCoreEnforced).toBe(false);
      expect(result.value.coresPerCpuLicensed).toBe(20);
    });
  });

  describe("vSAN entitlement", () => {
    it("vcf product has vsanEntitlementTib > 0", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, productType: "vcf" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.vsanEntitlementTib).not.toBeNull();
      expect(result.value.vsanEntitlementTib).toBeGreaterThan(0);
    });

    it("vvf product has vsanEntitlementTib > 0", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, productType: "vvf" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.vsanEntitlementTib).not.toBeNull();
      expect(result.value.vsanEntitlementTib).toBeGreaterThan(0);
    });

    it("vsphere-ep has no vSAN entitlement", () => {
      const result = calculateVmwareLicensing({ ...BASE_INPUT, productType: "vsphere-ep" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.vsanEntitlementTib).toBeNull();
    });
  });

  describe("different product types", () => {
    it.each(["vcf", "vvf", "vsphere-ep", "vsphere-std"] as const)(
      "productType %s returns ok result",
      (productType) => {
        const result = calculateVmwareLicensing({ ...BASE_INPUT, productType });
        expect(result.ok).toBe(true);
      }
    );

    it("vcf is more expensive per core than vsphere-std", () => {
      const vcf = calculateVmwareLicensing({ ...BASE_INPUT, productType: "vcf" });
      const std = calculateVmwareLicensing({ ...BASE_INPUT, productType: "vsphere-std" });
      expect(vcf.ok).toBe(true);
      expect(std.ok).toBe(true);
      if (!vcf.ok || !std.ok) return;
      expect(vcf.value.pricePerCorePerYear).toBeGreaterThan(std.value.pricePerCorePerYear);
    });
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateVmwareLicensing(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
