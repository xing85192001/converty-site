import { describe, expect, it } from "vitest";
import { calculateK8sCapacity } from "@/lib/converters/infrastructure/k8s-capacity";

const BASE_INPUT = {
  podCpuRequest: 500, // millicores (0.5 CPU per pod)
  podMemoryRequest: 512, // MiB
  podReplicas: 10,
  daemonSetCpuPerNode: 300, // millicores
  daemonSetMemoryPerNode: 384, // MiB
  nodeCpuCores: 8,
  nodeMemoryMb: 16384, // 16 GiB
  systemReservedCpu: 700, // millicores
  systemReservedMemory: 1024, // MiB
  targetCpuUtilization: 70,
  targetMemoryUtilization: 80,
};

describe("calculateK8sCapacity", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for podReplicas = 0", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, podReplicas: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for nodeCpuCores = 0", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, nodeCpuCores: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for podCpuRequest = 0", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, podCpuRequest: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for podMemoryRequest = 0", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, podMemoryRequest: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for targetCpuUtilization = 0", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, targetCpuUtilization: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns error for targetCpuUtilization > 100", () => {
      const result = calculateK8sCapacity({ ...BASE_INPUT, targetCpuUtilization: 101 });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic capacity calculation", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("nodesNeededTotal is positive", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.nodesNeededTotal).toBeGreaterThan(0);
    });

    it("allocatableCpuPerNode is less than total CPU capacity", () => {
      // Total CPU = 8 cores = 8000 millicores
      // After system+daemonset overhead, allocatable < 8000m
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const totalCpu = BASE_INPUT.nodeCpuCores * 1000;
      expect(result.value.allocatableCpuPerNode).toBeLessThan(totalCpu);
    });
  });

  describe("pod count calculations", () => {
    it("totalPodCpuRequired = podReplicas × podCpuRequest", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expected = BASE_INPUT.podReplicas * BASE_INPUT.podCpuRequest;
      expect(result.value.totalPodCpuRequired).toBe(expected);
    });

    it("totalPodMemoryRequired = podReplicas × podMemoryRequest", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const expected = BASE_INPUT.podReplicas * BASE_INPUT.podMemoryRequest;
      expect(result.value.totalPodMemoryRequired).toBe(expected);
    });
  });

  describe("scaling behavior", () => {
    it("more pods → more nodes needed", () => {
      const small = calculateK8sCapacity({ ...BASE_INPUT, podReplicas: 5 });
      const large = calculateK8sCapacity({ ...BASE_INPUT, podReplicas: 100 });
      expect(small.ok).toBe(true);
      expect(large.ok).toBe(true);
      if (!small.ok || !large.ok) return;
      expect(large.value.nodesNeededTotal).toBeGreaterThan(small.value.nodesNeededTotal);
    });

    it("limiting factor is either cpu or memory", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(["cpu", "memory"]).toContain(result.value.limitingFactor);
    });
  });

  describe("result structure", () => {
    it("has nodesNeededByCpu, nodesNeededByMemory, nodesNeededTotal", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.nodesNeededByCpu).toBeGreaterThan(0);
      expect(result.value.nodesNeededByMemory).toBeGreaterThan(0);
      expect(result.value.nodesNeededTotal).toBeGreaterThanOrEqual(
        Math.max(result.value.nodesNeededByCpu, result.value.nodesNeededByMemory)
      );
    });

    it("has steps array", () => {
      const result = calculateK8sCapacity(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.steps).toBeInstanceOf(Array);
      expect(result.value.steps.length).toBeGreaterThan(0);
    });
  });
});
