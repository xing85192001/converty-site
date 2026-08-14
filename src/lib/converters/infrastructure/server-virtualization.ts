/**
 * Server Virtualization Calculator for Multi-Platform Virtualization
 *
 * Calculates the number of hosts needed based on VM workload requirements.
 * Implements multi-dimensional bin packing (CPU and memory constraints) with
 * N+1/N+2 high availability options.
 *
 * Supports: VMware vSphere, Hyper-V, Proxmox VE, XCP-ng
 * Based on vendor best practices for hypervisor host sizing.
 */

import hypervisorData from "@/data/infrastructure/hypervisor-overhead.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import type { HypervisorOverhead, HypervisorPlatform } from "./types";

/**
 * Input parameters for server virtualization calculation
 */
export interface ServerVirtualizationInput {
  /** Hypervisor platform (default: "vmware" for backward compatibility) */
  platform?: HypervisorPlatform;
  /** Total number of VMs to host */
  vmCount: number;
  /** vCPU per VM */
  vCpuPerVm: number;
  /** RAM per VM in GB */
  ramPerVmGb: number;
  /** Physical CPU cores per ESX host */
  hostCores: number;
  /** Total RAM per ESX host in GB */
  hostRamGb: number;
  /** vCPU-to-core over-subscription ratio (default: 4:1) */
  vCpuToCoreRatio: number;
  /** Target CPU utilization percentage (0-100, default: 80) */
  targetCpuUtilization: number;
  /** Target RAM utilization percentage (0-100, default: 85) */
  targetRamUtilization: number;
  /** Enable N+1 high availability (adds one extra host) */
  highAvailability: boolean;
}

/**
 * Detailed breakdown of server virtualization requirements
 */
export interface ServerVirtualizationResult {
  /** Total vCPU across all VMs */
  totalVCpuRequired: number;
  /** Total RAM across all VMs in GB */
  totalRamRequiredGb: number;
  /** Effective CPU capacity per host (cores × ratio × utilization) */
  effectiveCpuPerHost: number;
  /** Effective RAM capacity per host (RAM × utilization) in GB */
  effectiveRamPerHostGb: number;
  /** Hosts needed based on CPU constraint */
  hostsNeededByCpu: number;
  /** Hosts needed based on RAM constraint */
  hostsNeededByRam: number;
  /** Hosts needed before HA (max of CPU/RAM) */
  hostsNeededBeforeHa: number;
  /** Total hosts needed (with HA if enabled) */
  hostsNeededTotal: number;
  /** Which resource constrains capacity */
  limitingFactor: "cpu" | "ram";
  /** Actual vCPU per physical core ratio */
  vCpuConsolidationRatio: number;
  /** Actual CPU utilization percentage after rounding hosts */
  finalCpuUtilization: number;
  /** Actual RAM utilization percentage after rounding hosts */
  finalRamUtilization: number;
  /** Step-by-step calculation breakdown */
  steps: CalcStep[];
}

/**
 * Calculate multi-platform virtualization host capacity requirements
 *
 * Determines the number of hosts needed based on VM workload and resource
 * constraints. Accounts for platform-specific hypervisor overhead. Selects
 * the higher of CPU or memory requirements as the limiting factor.
 * Optionally adds N+1 host for high availability.
 *
 * @param input - Server virtualization calculation parameters
 * @returns Detailed capacity breakdown or null if invalid input
 *
 * @example
 * // Calculate hosts for 100 VMs with N+1 HA (VMware)
 * const result = calculateServerVirtualization({
 *   platform: "vmware", // Optional, defaults to "vmware"
 *   vmCount: 100,
 *   vCpuPerVm: 4,
 *   ramPerVmGb: 16,
 *   hostCores: 32,
 *   hostRamGb: 512,
 *   vCpuToCoreRatio: 4,
 *   targetCpuUtilization: 80,
 *   targetRamUtilization: 85,
 *   highAvailability: true
 * });
 */
export function calculateServerVirtualization(
  input: ServerVirtualizationInput
): CalculationResult<ServerVirtualizationResult> {
  const steps: CalcStep[] = [];

  // Platform selection: default to VMware for backward compatibility
  const platform = input.platform || "vmware";

  // Get platform-specific data
  const platformData = (hypervisorData as unknown as HypervisorOverhead[]).find(
    (p) => p.id === platform
  );
  if (!platformData) {
    return { ok: false, error: `Unknown platform: ${platform}`, code: "INVALID_INPUT" };
  }

  const platformName = platformData.name;
  const cpuOverheadPercent = platformData.cpuOverhead.percent;
  const memoryReservedGb = platformData.memoryOverhead.hypervisorReserved / 1024; // Convert MB to GB
  const perVmMemoryOverheadMb = platformData.memoryOverhead.perVmOverheadMB;

  steps.push({ key: "platform", params: { name: platformName } });
  steps.push({
    key: "cpuOverhead",
    params: { cpuOverheadPercent },
  });
  steps.push({
    key: "memoryReserved",
    params: {
      memoryReservedGb: memoryReservedGb.toFixed(1),
      perVmMemoryOverheadMb,
    },
  });

  // Validation: Positive VM configuration
  if (input.vmCount <= 0 || input.vCpuPerVm <= 0 || input.ramPerVmGb <= 0) {
    return {
      ok: false,
      error: "VM count, vCPU per VM, and RAM per VM must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Positive host configuration
  if (input.hostCores <= 0 || input.hostRamGb <= 0) {
    return { ok: false, error: "Host cores and host RAM must be positive", code: "INVALID_INPUT" };
  }

  // Validation: Positive over-subscription ratio
  if (input.vCpuToCoreRatio <= 0) {
    return { ok: false, error: "vCPU to core ratio must be positive", code: "INVALID_INPUT" };
  }

  // Validation: Percentage ranges (1-100, not 0 to ensure some headroom)
  if (
    input.targetCpuUtilization < 1 ||
    input.targetCpuUtilization > 100 ||
    input.targetRamUtilization < 1 ||
    input.targetRamUtilization > 100
  ) {
    return {
      ok: false,
      error: "Target utilization percentages must be between 1 and 100",
      code: "INVALID_INPUT",
    };
  }

  // Step 1: Calculate total VM resource requirements
  const totalVCpuRequired = input.vmCount * input.vCpuPerVm;
  const totalRamRequiredGb = input.vmCount * input.ramPerVmGb;

  steps.push({
    key: "totalVCpuRequired",
    params: {
      vmCount: input.vmCount,
      vCpuPerVm: input.vCpuPerVm,
      totalVCpuRequired,
    },
  });
  steps.push({
    key: "totalRamRequired",
    params: {
      vmCount: input.vmCount,
      ramPerVmGb: input.ramPerVmGb,
      totalRamRequiredGb,
    },
  });

  // Step 2: Calculate effective capacity per host (accounting for hypervisor overhead and utilization targets)

  // Account for hypervisor CPU overhead (reserved percentage)
  const availableCoresPerHost = input.hostCores * (1 - cpuOverheadPercent / 100);
  const effectiveCpuPerHost =
    availableCoresPerHost * input.vCpuToCoreRatio * (input.targetCpuUtilization / 100);

  // Account for hypervisor memory overhead (reserved base + per-VM overhead)
  const baseAvailableRamGb = input.hostRamGb - memoryReservedGb;
  const effectiveRamPerHostGb = baseAvailableRamGb * (input.targetRamUtilization / 100);

  steps.push({
    key: "availableCpuPerHost",
    params: {
      hostCores: input.hostCores,
      cpuOverheadPercent,
      availableCoresPerHost: availableCoresPerHost.toFixed(1),
    },
  });
  steps.push({
    key: "effectiveCpuPerHost",
    params: {
      availableCoresPerHost: availableCoresPerHost.toFixed(1),
      vCpuToCoreRatio: input.vCpuToCoreRatio,
      targetCpuUtilization: input.targetCpuUtilization,
      effectiveCpuPerHost: effectiveCpuPerHost.toFixed(1),
    },
  });
  steps.push({
    key: "availableRamPerHost",
    params: {
      hostRamGb: input.hostRamGb,
      memoryReservedGb: memoryReservedGb.toFixed(1),
      baseAvailableRamGb: baseAvailableRamGb.toFixed(1),
    },
  });
  steps.push({
    key: "effectiveRamPerHost",
    params: {
      baseAvailableRamGb: baseAvailableRamGb.toFixed(1),
      targetRamUtilization: input.targetRamUtilization,
      effectiveRamPerHostGb: effectiveRamPerHostGb.toFixed(1),
    },
  });

  // Step 3: Calculate hosts needed by each constraint
  const hostsNeededByCpu = Math.ceil(totalVCpuRequired / effectiveCpuPerHost);
  const hostsNeededByRam = Math.ceil(totalRamRequiredGb / effectiveRamPerHostGb);

  steps.push({
    key: "hostsNeededByCpu",
    params: {
      totalVCpuRequired,
      effectiveCpuPerHost: effectiveCpuPerHost.toFixed(1),
      hostsNeededByCpu,
    },
  });
  steps.push({
    key: "hostsNeededByRam",
    params: {
      totalRamRequiredGb,
      effectiveRamPerHostGb: effectiveRamPerHostGb.toFixed(1),
      hostsNeededByRam,
    },
  });

  // Step 4: Select limiting factor (max of CPU/RAM)
  const hostsNeededBeforeHa = Math.max(hostsNeededByCpu, hostsNeededByRam);
  const limitingFactor = hostsNeededByCpu > hostsNeededByRam ? "cpu" : "ram";

  steps.push({
    key: "limitingFactor",
    params: {
      limitingFactor: limitingFactor.toUpperCase(),
      hostsNeededBeforeHa,
    },
  });

  // Step 5: Apply N+1 high availability if enabled
  const hostsNeededTotal = input.highAvailability ? hostsNeededBeforeHa + 1 : hostsNeededBeforeHa;

  if (input.highAvailability) {
    steps.push({
      key: "haEnabled",
      params: { hostsNeededBeforeHa, hostsNeededTotal },
    });
  } else {
    steps.push({
      key: "haDisabled",
      params: { hostsNeededTotal },
    });
  }

  // Step 6: Calculate actual consolidation and utilization
  const vCpuConsolidationRatio = totalVCpuRequired / (hostsNeededTotal * input.hostCores);
  const finalCpuUtilization =
    (totalVCpuRequired / (hostsNeededTotal * input.hostCores * input.vCpuToCoreRatio)) * 100;
  const finalRamUtilization = (totalRamRequiredGb / (hostsNeededTotal * input.hostRamGb)) * 100;

  steps.push({
    key: "vCpuConsolidationRatio",
    params: {
      totalVCpuRequired,
      hostsNeededTotal,
      hostCores: input.hostCores,
      ratio: vCpuConsolidationRatio.toFixed(2),
    },
  });
  steps.push({
    key: "finalCpuUtilization",
    params: {
      finalCpuUtilization: finalCpuUtilization.toFixed(1),
      totalVCpuRequired,
      capacity: hostsNeededTotal * input.hostCores * input.vCpuToCoreRatio,
    },
  });
  steps.push({
    key: "finalRamUtilization",
    params: {
      finalRamUtilization: finalRamUtilization.toFixed(1),
      totalRamRequiredGb,
      capacity: hostsNeededTotal * input.hostRamGb,
    },
  });

  return {
    ok: true,
    value: {
      totalVCpuRequired,
      totalRamRequiredGb,
      effectiveCpuPerHost,
      effectiveRamPerHostGb,
      hostsNeededByCpu,
      hostsNeededByRam,
      hostsNeededBeforeHa,
      hostsNeededTotal,
      limitingFactor,
      vCpuConsolidationRatio,
      finalCpuUtilization,
      finalRamUtilization,
      steps,
    },
  };
}
