import { describe, expect, it } from "vitest";
import { calculateHypervConsolidation } from "@/lib/converters/infrastructure/hyperv-consolidation";

const BASE_INPUT = {
  vmCount: 50,
  avgVcpusPerVm: 4,
  avgRamPerVm: 8, // GB
  avgStoragePerVm: 100, // GB
  haMode: "n_plus_1" as const,
  enableReplica: false,
  diskType: "fixed" as const,
  enableSnapshots: false,
  coresPerCpu: 16,
  cpusPerHost: 2,
  ramPerHost: 256, // GB
  storagePerHost: 10000, // GB
  vcpuRatio: 4,
  ramOvercommit: 1,
};

describe("calculateHypervConsolidation", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for vmCount = 0", () => {
      const result = calculateHypervConsolidation({ ...BASE_INPUT, vmCount: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for avgVcpusPerVm = 0", () => {
      const result = calculateHypervConsolidation({ ...BASE_INPUT, avgVcpusPerVm: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for avgRamPerVm = 0", () => {
      const result = calculateHypervConsolidation({ ...BASE_INPUT, avgRamPerVm: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for coresPerCpu = 0", () => {
      const result = calculateHypervConsolidation({ ...BASE_INPUT, coresPerCpu: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for ramPerHost = 0", () => {
      const result = calculateHypervConsolidation({ ...BASE_INPUT, ramPerHost: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic consolidation calculations", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("hostsRequired is positive", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hostsRequired).toBeGreaterThan(0);
    });

    it("more VMs → more hosts required", () => {
      const small = calculateHypervConsolidation({ ...BASE_INPUT, vmCount: 10 });
      const large = calculateHypervConsolidation({ ...BASE_INPUT, vmCount: 100 });
      expect(small.ok).toBe(true);
      expect(large.ok).toBe(true);
      if (!small.ok || !large.ok) return;
      expect(large.value.hostsRequired).toBeGreaterThanOrEqual(small.value.hostsRequired);
    });
  });

  describe("storage calculation", () => {
    it("totalStorageRequired is positive", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.totalStorageRequired).toBeGreaterThan(0);
    });

    it("enables snapshot storage when enableSnapshots=true", () => {
      const noSnaps = calculateHypervConsolidation({ ...BASE_INPUT, enableSnapshots: false });
      const withSnaps = calculateHypervConsolidation({ ...BASE_INPUT, enableSnapshots: true });
      expect(noSnaps.ok).toBe(true);
      expect(withSnaps.ok).toBe(true);
      if (!noSnaps.ok || !withSnaps.ok) return;
      expect(withSnaps.value.storageBreakdown.snapshots).toBeGreaterThan(
        noSnaps.value.storageBreakdown.snapshots
      );
    });

    it("enables replica storage when enableReplica=true", () => {
      const noReplica = calculateHypervConsolidation({ ...BASE_INPUT, enableReplica: false });
      const withReplica = calculateHypervConsolidation({ ...BASE_INPUT, enableReplica: true });
      expect(noReplica.ok).toBe(true);
      expect(withReplica.ok).toBe(true);
      if (!noReplica.ok || !withReplica.ok) return;
      expect(withReplica.value.storageBreakdown.replica).toBeGreaterThan(
        noReplica.value.storageBreakdown.replica
      );
    });
  });

  describe("licensing", () => {
    it("licensing object has datacenter and standard editions", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.licensing.datacenter.totalCost).toBeGreaterThan(0);
      expect(result.value.licensing.standard.totalCost).toBeGreaterThan(0);
    });

    it("licensing recommendation is either datacenter or standard", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(["datacenter", "standard"]).toContain(result.value.licensing.recommendation);
    });
  });

  describe("HA configuration", () => {
    it("n_plus_1 results in extra host vs none", () => {
      const noHA = calculateHypervConsolidation({ ...BASE_INPUT, haMode: "none" as const });
      const withHA = calculateHypervConsolidation({ ...BASE_INPUT, haMode: "n_plus_1" as const });
      expect(noHA.ok).toBe(true);
      expect(withHA.ok).toBe(true);
      if (!noHA.ok || !withHA.ok) return;
      expect(withHA.value.hostsRequired).toBeGreaterThan(noHA.value.hostsRequired);
    });
  });

  describe("result structure", () => {
    it("has steps array", () => {
      const result = calculateHypervConsolidation(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
