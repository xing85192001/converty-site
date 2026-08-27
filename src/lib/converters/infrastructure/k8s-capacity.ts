/**
 * Kubernetes Capacity Calculator
 *
 * Calculates cluster node requirements based on:
 * - Pod workload CPU and memory requests
 * - System reserved resources (OS + Kubernetes)
 * - DaemonSet overhead per node
 * - Target utilization thresholds
 *
 * Based on Kubernetes official documentation and managed provider best practices (AKS, GKE).
 * Implements multi-dimensional bin packing (CPU and memory constraints).
 */

import type { CalculationResult } from "@/types";

/**
 * Input parameters for Kubernetes capacity calculation
 */
export interface K8sCapacityInput {
  /** CPU request per pod in millicores (1000m = 1 core) */
  podCpuRequest: number;
  /** Memory request per pod in MiB */
  podMemoryRequest: number;
  /** Number of pod instances (replicas) */
  podReplicas: number;

  /** DaemonSet CPU overhead per node in millicores */
  daemonSetCpuPerNode: number;
  /** DaemonSet memory overhead per node in MiB */
  daemonSetMemoryPerNode: number;

  /** Total CPU cores per node */
  nodeCpuCores: number;
  /** Total memory per node in MB */
  nodeMemoryMb: number;

  /** System reserved CPU in millicores (OS + kubelet + runtime) */
  systemReservedCpu: number;
  /** System reserved memory in MiB (OS + K8s + eviction threshold) */
  systemReservedMemory: number;

  /** Target CPU utilization percentage (0-100, typical: 70) */
  targetCpuUtilization: number;
  /** Target memory utilization percentage (0-100, typical: 80) */
  targetMemoryUtilization: number;
}

/**
 * Detailed breakdown of Kubernetes capacity requirements
 */
export interface K8sCapacityResult {
  /** Allocatable CPU per node in millicores (after system/DaemonSet overhead) */
  allocatableCpuPerNode: number;
  /** Allocatable memory per node in MiB (after system/DaemonSet overhead) */
  allocatableMemoryPerNode: number;

  /** Total CPU required for all pods in millicores */
  totalPodCpuRequired: number;
  /** Total memory required for all pods in MiB */
  totalPodMemoryRequired: number;

  /** Target CPU per node accounting for utilization in millicores */
  targetCpuPerNode: number;
  /** Target memory per node accounting for utilization in MiB */
  targetMemoryPerNode: number;

  /** Number of nodes needed based on CPU constraint */
  nodesNeededByCpu: number;
  /** Number of nodes needed based on memory constraint */
  nodesNeededByMemory: number;
  /** Total nodes needed (max of CPU/memory constraints) */
  nodesNeededTotal: number;

  /** Which resource constrains capacity */
  limitingFactor: "cpu" | "memory";

  /** Actual CPU utilization percentage after rounding nodes */
  finalCpuUtilization: number;
  /** Actual memory utilization percentage after rounding nodes */
  finalMemoryUtilization: number;

  /** True if either resource exceeds 80% utilization */
  overUtilized: boolean;

  /** Step-by-step calculation breakdown */
  steps: string[];
}

/**
 * Calculate Kubernetes cluster node capacity requirements
 *
 * Implements multi-dimensional bin packing to determine the number of nodes
 * needed based on both CPU and memory constraints. Selects the higher node
 * count as the limiting factor.
 *
 * @param input - Kubernetes capacity calculation parameters
 * @returns Detailed capacity breakdown or null if invalid input
 *
 * @example
 * // Calculate nodes for 10 web server pods
 * const result = calculateK8sCapacity({
 *   podCpuRequest: 500,        // 0.5 CPU per pod
 *   podMemoryRequest: 512,     // 512 MiB per pod
 *   podReplicas: 10,
 *   daemonSetCpuPerNode: 300,
 *   daemonSetMemoryPerNode: 384,
 *   nodeCpuCores: 8,
 *   nodeMemoryMb: 16384,
 *   systemReservedCpu: 700,
 *   systemReservedMemory: 1024,
 *   targetCpuUtilization: 70,
 *   targetMemoryUtilization: 80
 * });
 */
export function calculateK8sCapacity(
  input: K8sCapacityInput
): CalculationResult<K8sCapacityResult> {
  const steps: string[] = [];

  // Validation: Positive counts
  if (input.podReplicas < 1 || input.nodeCpuCores < 1 || input.nodeMemoryMb < 1) {
    return {
      ok: false,
      error: "Pod replicas, node CPU cores, and node memory must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Positive pod requests
  if (input.podCpuRequest <= 0 || input.podMemoryRequest <= 0) {
    return {
      ok: false,
      error: "Pod CPU and memory requests must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Percentage ranges (1-100, not 0 to ensure some headroom)
  if (
    input.targetCpuUtilization < 1 ||
    input.targetCpuUtilization > 100 ||
    input.targetMemoryUtilization < 1 ||
    input.targetMemoryUtilization > 100
  ) {
    return {
      ok: false,
      error: "Target utilization must be between 1 and 100",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Non-negative overhead
  if (
    input.systemReservedCpu < 0 ||
    input.systemReservedMemory < 0 ||
    input.daemonSetCpuPerNode < 0 ||
    input.daemonSetMemoryPerNode < 0
  ) {
    return {
      ok: false,
      error: "System reserved and DaemonSet overhead must be non-negative",
      code: "INVALID_INPUT",
    };
  }

  // Step 1: Calculate allocatable resources per node
  // Formula: Allocatable = Capacity - SystemReserved - DaemonSets
  const allocatableCpuPerNode =
    input.nodeCpuCores * 1000 - input.systemReservedCpu - input.daemonSetCpuPerNode;
  const allocatableMemoryPerNode =
    input.nodeMemoryMb - input.systemReservedMemory - input.daemonSetMemoryPerNode;

  // Validation: Sufficient allocatable resources
  if (allocatableCpuPerNode <= 0 || allocatableMemoryPerNode <= 0) {
    return {
      ok: false,
      error:
        "System overhead exceeds node capacity — reduce reserved resources or use larger nodes",
      code: "INVALID_INPUT",
    };
  }

  steps.push(
    `Node allocatable CPU: ${input.nodeCpuCores * 1000}m - ${input.systemReservedCpu}m (system) - ${input.daemonSetCpuPerNode}m (DaemonSets) = ${allocatableCpuPerNode}m`
  );
  steps.push(
    `Node allocatable memory: ${input.nodeMemoryMb} MiB - ${input.systemReservedMemory} MiB (system) - ${input.daemonSetMemoryPerNode} MiB (DaemonSets) = ${allocatableMemoryPerNode} MiB`
  );

  // Step 2: Calculate total pod requirements
  const totalPodCpuRequired = input.podCpuRequest * input.podReplicas;
  const totalPodMemoryRequired = input.podMemoryRequest * input.podReplicas;

  steps.push(
    `Total pod CPU required: ${input.podCpuRequest}m × ${input.podReplicas} pods = ${totalPodCpuRequired}m`
  );
  steps.push(
    `Total pod memory required: ${input.podMemoryRequest} MiB × ${input.podReplicas} pods = ${totalPodMemoryRequired} MiB`
  );

  // Step 3: Calculate target allocatable (accounting for utilization)
  const targetCpuPerNode = allocatableCpuPerNode * (input.targetCpuUtilization / 100);
  const targetMemoryPerNode = allocatableMemoryPerNode * (input.targetMemoryUtilization / 100);

  steps.push(
    `Target CPU per node (${input.targetCpuUtilization}% utilization): ${allocatableCpuPerNode}m × ${(input.targetCpuUtilization / 100).toFixed(2)} = ${targetCpuPerNode.toFixed(0)}m`
  );
  steps.push(
    `Target memory per node (${input.targetMemoryUtilization}% utilization): ${allocatableMemoryPerNode} MiB × ${(input.targetMemoryUtilization / 100).toFixed(2)} = ${targetMemoryPerNode.toFixed(0)} MiB`
  );

  // Step 4: Calculate nodes needed by each constraint
  const nodesNeededByCpu = Math.ceil(totalPodCpuRequired / targetCpuPerNode);
  const nodesNeededByMemory = Math.ceil(totalPodMemoryRequired / targetMemoryPerNode);

  steps.push(
    `Nodes needed (CPU constraint): ceil(${totalPodCpuRequired}m / ${targetCpuPerNode.toFixed(0)}m) = ${nodesNeededByCpu}`
  );
  steps.push(
    `Nodes needed (memory constraint): ceil(${totalPodMemoryRequired} MiB / ${targetMemoryPerNode.toFixed(0)} MiB) = ${nodesNeededByMemory}`
  );

  // Step 5: Select limiting factor (max of CPU/memory)
  const nodesNeededTotal = Math.max(nodesNeededByCpu, nodesNeededByMemory);
  const limitingFactor = nodesNeededByCpu > nodesNeededByMemory ? "cpu" : "memory";

  steps.push(
    `Limiting factor: ${limitingFactor.toUpperCase()} (requires ${nodesNeededTotal} nodes)`
  );

  // Step 6: Calculate final utilization with rounded node count
  const finalCpuUtilization =
    (totalPodCpuRequired / (allocatableCpuPerNode * nodesNeededTotal)) * 100;
  const finalMemoryUtilization =
    (totalPodMemoryRequired / (allocatableMemoryPerNode * nodesNeededTotal)) * 100;

  steps.push(
    `Final CPU utilization: ${totalPodCpuRequired}m / (${allocatableCpuPerNode}m × ${nodesNeededTotal} nodes) = ${finalCpuUtilization.toFixed(1)}%`
  );
  steps.push(
    `Final memory utilization: ${totalPodMemoryRequired} MiB / (${allocatableMemoryPerNode} MiB × ${nodesNeededTotal} nodes) = ${finalMemoryUtilization.toFixed(1)}%`
  );

  // Step 7: Check for over-utilization warning
  const overUtilized = finalCpuUtilization > 80 || finalMemoryUtilization > 80;
  if (overUtilized) {
    steps.push(
      `⚠️ WARNING: Utilization exceeds 80% (CPU: ${finalCpuUtilization.toFixed(1)}%, Memory: ${finalMemoryUtilization.toFixed(1)}%)`
    );
  }

  return {
    ok: true,
    value: {
      allocatableCpuPerNode,
      allocatableMemoryPerNode,
      totalPodCpuRequired,
      totalPodMemoryRequired,
      targetCpuPerNode,
      targetMemoryPerNode,
      nodesNeededByCpu,
      nodesNeededByMemory,
      nodesNeededTotal,
      limitingFactor,
      finalCpuUtilization,
      finalMemoryUtilization,
      overUtilized,
      steps,
    },
  };
}
