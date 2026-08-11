import { describe, expect, it } from "vitest";
import { calculateServerVirtualization } from "@/lib/converters/infrastructure/server-virtualization";

const BASE_INPUT = {
  platform: "vmware" as const,
  vmCount: 100,
  vCpuPerVm: 4,
  ramPerVmGb: 16,
  hostCores: 32,
  hostRamGb: 512,
  vCpuToCoreRatio: 4,
  targetCpuUtilization: 80,
  targetRamUtilization: 85,
  highAvailability: false,
};

describe("calculateServerVirtualization", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for vmCount = 0", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, vmCount: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for hostCores = 0", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, hostCores: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for hostRamGb = 0", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, hostRamGb: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for vCpuToCoreRatio = 0", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, vCpuToCoreRatio: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for targetCpuUtilization = 0", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, targetCpuUtilization: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic virtualization calculations", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("hostsNeededTotal is positive", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hostsNeededTotal).toBeGreaterThan(0);
    });

    it("totalVCpuRequired = vmCount × vCpuPerVm", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalVCpuRequired).toBe(BASE_INPUT.vmCount * BASE_INPUT.vCpuPerVm);
    });

    it("totalRamRequiredGb = vmCount × ramPerVmGb", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalRamRequiredGb).toBe(BASE_INPUT.vmCount * BASE_INPUT.ramPerVmGb);
    });
  });

  describe("overcommit ratio effect", () => {
    it("higher vCPU ratio → effective CPU capacity increases per host", () => {
      const lowRatio = calculateServerVirtualization({ ...BASE_INPUT, vCpuToCoreRatio: 2 });
      const highRatio = calculateServerVirtualization({ ...BASE_INPUT, vCpuToCoreRatio: 8 });
      expect(lowRatio.ok).toBe(true);
      expect(highRatio.ok).toBe(true);
      if (!lowRatio.ok || !highRatio.ok) return;
      expect(highRatio.value.effectiveCpuPerHost).toBeGreaterThan(
        lowRatio.value.effectiveCpuPerHost
      );
    });
  });

  describe("high availability", () => {
    it("N+1 HA adds extra host", () => {
      const noHA = calculateServerVirtualization({ ...BASE_INPUT, highAvailability: false });
      const withHA = calculateServerVirtualization({ ...BASE_INPUT, highAvailability: true });
      expect(noHA.ok).toBe(true);
      expect(withHA.ok).toBe(true);
      if (!noHA.ok || !withHA.ok) return;
      expect(withHA.value.hostsNeededTotal).toBeGreaterThan(noHA.value.hostsNeededTotal);
    });
  });

  describe("multi-platform support", () => {
    it.each(["vmware", "hyperv", "proxmox"] as const)(
      "platform %s returns ok result",
      (platform) => {
        const result = calculateServerVirtualization({ ...BASE_INPUT, platform });
        expect(result.ok).toBe(true);
      }
    );
  });

  describe("limiting factor", () => {
    it("limitingFactor is either cpu or ram", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(["cpu", "ram"]).toContain(result.value.limitingFactor);
    });

    it("hostsNeededBeforeHa = max(hostsNeededByCpu, hostsNeededByRam)", () => {
      const result = calculateServerVirtualization({ ...BASE_INPUT, highAvailability: false });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expected = Math.max(result.value.hostsNeededByCpu, result.value.hostsNeededByRam);
      expect(result.value.hostsNeededBeforeHa).toBe(expected);
    });
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateServerVirtualization(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
