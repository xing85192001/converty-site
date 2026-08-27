import { describe, expect, it } from "vitest";
import { calculateVmStorage } from "@/lib/converters/infrastructure/vm-storage";

const BASE_VM_CONFIGS = [
  { diskGb: 50, ramGb: 8, count: 10 },
  { diskGb: 100, ramGb: 16, count: 5 },
];

const BASE_INPUT = {
  platform: "vmware" as const,
  vmConfigs: BASE_VM_CONFIGS,
  includeSwapFiles: false,
  configLogGbPerVm: 0.25,
  snapshotPercent: 0,
  hypervisorHosts: 3,
  hypervisorStorageGbPerHost: 8,
  thinProvisioningPercent: 0,
  growthPercent: 20,
};

describe("calculateVmStorage", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for empty vmConfigs array", () => {
      const result = calculateVmStorage({ ...BASE_INPUT, vmConfigs: [] });
      expect(result.ok).toBe(false);
    });

    it("returns error for vmConfig with negative count", () => {
      const result = calculateVmStorage({
        ...BASE_INPUT,
        vmConfigs: [{ diskGb: 50, ramGb: 8, count: -1 }],
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for vmConfig with negative diskGb", () => {
      const result = calculateVmStorage({
        ...BASE_INPUT,
        vmConfigs: [{ diskGb: -1, ramGb: 8, count: 5 }],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("storage calculations", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateVmStorage(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("totalProvisionedGb = sum of diskGb × count for all configs", () => {
      // (50 × 10) + (100 × 5) = 500 + 500 = 1000 GB
      const result = calculateVmStorage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalProvisionedGb).toBe(1000);
    });

    it("totalRequiredGb > totalProvisionedGb (overhead added)", () => {
      const result = calculateVmStorage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalRequiredGb).toBeGreaterThan(result.value.totalProvisionedGb);
    });
  });

  describe("50 VMs × 50GB = 2500GB total provisioned", () => {
    it("50 uniform VMs totals 2500 GB provisioned", () => {
      const result = calculateVmStorage({
        ...BASE_INPUT,
        vmConfigs: [{ diskGb: 50, ramGb: 8, count: 50 }],
        growthPercent: 0,
        snapshotPercent: 0,
        includeSwapFiles: false,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalProvisionedGb).toBe(2500);
    });
  });

  describe("swap files", () => {
    it("includeSwapFiles=true increases swapGb", () => {
      const noSwap = calculateVmStorage({ ...BASE_INPUT, includeSwapFiles: false });
      const withSwap = calculateVmStorage({ ...BASE_INPUT, includeSwapFiles: true });
      expect(noSwap.ok).toBe(true);
      expect(withSwap.ok).toBe(true);
      if (!noSwap.ok || !withSwap.ok) return;
      expect(withSwap.value.swapGb).toBeGreaterThan(noSwap.value.swapGb);
    });
  });

  describe("snapshot allocation", () => {
    it("snapshotPercent=20 adds snapshot storage", () => {
      const noSnap = calculateVmStorage({ ...BASE_INPUT, snapshotPercent: 0 });
      const withSnap = calculateVmStorage({ ...BASE_INPUT, snapshotPercent: 20 });
      expect(noSnap.ok).toBe(true);
      expect(withSnap.ok).toBe(true);
      if (!noSnap.ok || !withSnap.ok) return;
      expect(withSnap.value.snapshotGb).toBeGreaterThan(noSnap.value.snapshotGb);
    });
  });

  describe("growth headroom", () => {
    it("growthPercent=0 gives smaller total than growthPercent=20", () => {
      const noGrowth = calculateVmStorage({ ...BASE_INPUT, growthPercent: 0 });
      const withGrowth = calculateVmStorage({ ...BASE_INPUT, growthPercent: 20 });
      expect(noGrowth.ok).toBe(true);
      expect(withGrowth.ok).toBe(true);
      if (!noGrowth.ok || !withGrowth.ok) return;
      expect(withGrowth.value.totalRequiredGb).toBeGreaterThan(noGrowth.value.totalRequiredGb);
    });
  });

  describe("multi-platform support", () => {
    it.each(["vmware", "hyperv", "proxmox"] as const)(
      "platform %s returns ok result",
      (platform) => {
        const result = calculateVmStorage({ ...BASE_INPUT, platform });
        expect(result.ok).toBe(true);
      }
    );
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateVmStorage(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
