/**
 * VM Storage Calculator for Multi-Platform Virtualization
 *
 * Calculates total storage capacity requirements including:
 * - Provisioned disk capacity (thick or thin provisioning)
 * - Platform-specific swap/overhead allocation
 * - Snapshot storage allocation
 * - Configuration and log file overhead
 * - Hypervisor host installation overhead
 * - Growth headroom allocation
 *
 * Supports: VMware vSphere, Hyper-V, Proxmox VE, XCP-ng
 * Based on vendor best practices and reference implementations.
 */

import hypervisorData from "@/data/infrastructure/hypervisor-overhead.json";
import type { CalculationResult } from "@/types";
import type { HypervisorOverhead, HypervisorPlatform } from "./types";

/**
 * VM configuration profile
 */
export interface VmConfig {
  /** Provisioned disk size in GB */
  diskGb: number;
  /** Configured RAM in GB */
  ramGb: number;
  /** Number of VMs with this configuration */
  count: number;
}

/**
 * Input parameters for VM storage calculation
 */
export interface VmStorageInput {
  /** Hypervisor platform (default: "vmware" for backward compatibility) */
  platform?: HypervisorPlatform;
  /** Array of VM configuration profiles */
  vmConfigs: VmConfig[];
  /** Whether to allocate swap files (VMware: equal to RAM, others: platform-specific) */
  includeSwapFiles: boolean;
  /** Config/log overhead per VM in GB (typical: 0.25) */
  configLogGbPerVm: number;
  /** Snapshot allocation as percentage of provisioned storage (0-100) */
  snapshotPercent: number;
  /** Number of hypervisor hosts in cluster */
  hypervisorHosts: number;
  /** Hypervisor installation overhead per host in GB (VMware: 8, Hyper-V: 32, Proxmox: 16, XCP-ng: 8) */
  hypervisorStorageGbPerHost: number;
  /** Thin provisioning over-subscription percentage (0-100, 0 = thick provisioning) */
  thinProvisioningPercent: number;
  /** Future growth allocation as percentage (0-100) */
  growthPercent: number;

  /** @deprecated Use hypervisorHosts instead. Kept for backward compatibility. */
  esxHosts?: number;
  /** @deprecated Use hypervisorStorageGbPerHost instead. Kept for backward compatibility. */
  esxStorageGbPerHost?: number;
}

/**
 * Detailed breakdown of storage requirements
 */
export interface VmStorageResult {
  /** Total provisioned disk across all VMs */
  totalProvisionedGb: number;
  /** Actual used disk with thin provisioning */
  usedDiskGb: number;
  /** Over-subscribed capacity (provisioned - used) */
  overSubscribedGb: number;
  /** Snapshot allocation */
  snapshotGb: number;
  /** Swap file allocation (sum of RAM if enabled) */
  swapGb: number;
  /** Config/log files allocation */
  configLogGb: number;
  /** Total VM storage (used + snapshot + swap + configLog) */
  totalVmStorageGb: number;
  /** Hypervisor hosts overhead (ESX/Hyper-V/Proxmox/XCP-ng) */
  esxStorageGb: number;
  /** Growth headroom allocation */
  growthAllocationGb: number;
  /** Grand total required storage */
  totalRequiredGb: number;
  /** Total number of VMs */
  totalVmCount: number;
  /** Percentage breakdown of each component */
  percentages: {
    usedDisk: number;
    overSubscribed: number;
    snapshot: number;
    swap: number;
    configLog: number;
    esxOverhead: number;
    growth: number;
  };
  /** Step-by-step calculation breakdown */
  steps: string[];
}

/**
 * Calculate multi-platform virtualization storage capacity requirements
 *
 * @param input - VM storage calculation parameters
 * @returns Detailed storage breakdown or null if invalid input
 *
 * @example
 * // Calculate storage for 2 VM profiles with thin provisioning (VMware)
 * const result = calculateVmStorage({
 *   platform: "vmware", // Optional, defaults to "vmware"
 *   vmConfigs: [
 *     { diskGb: 100, ramGb: 8, count: 10 },
 *     { diskGb: 200, ramGb: 16, count: 5 }
 *   ],
 *   includeSwapFiles: true,
 *   configLogGbPerVm: 0.25,
 *   snapshotPercent: 20,
 *   hypervisorHosts: 3,
 *   hypervisorStorageGbPerHost: 8,
 *   thinProvisioningPercent: 33,
 *   growthPercent: 30
 * });
 */
export function calculateVmStorage(input: VmStorageInput): CalculationResult<VmStorageResult> {
  const steps: string[] = [];

  // Platform selection: default to VMware for backward compatibility
  const platform = input.platform || "vmware";

  // Backward compatibility: use deprecated ESX fields if new fields not provided
  const hypervisorHosts = input.hypervisorHosts ?? input.esxHosts ?? 1;
  const hypervisorStorageGbPerHost =
    input.hypervisorStorageGbPerHost ?? input.esxStorageGbPerHost ?? 8;

  // Get platform-specific data
  const platformData = (hypervisorData as unknown as HypervisorOverhead[]).find(
    (p) => p.id === platform
  );
  if (!platformData) {
    return { ok: false, error: `Unknown platform: ${platform}`, code: "INVALID_INPUT" };
  }

  const platformName = platformData.name;
  steps.push(`Platform: ${platformName}`);

  // Validation: Check for empty VM configs
  if (input.vmConfigs.length === 0) {
    return { ok: false, error: "At least one VM configuration is required", code: "INVALID_INPUT" };
  }

  // Validation: Check for negative values in VM configs
  for (const config of input.vmConfigs) {
    if (config.diskGb < 0 || config.ramGb < 0 || config.count < 0) {
      return {
        ok: false,
        error: "VM configuration values must be non-negative",
        code: "INVALID_INPUT",
      };
    }
  }

  // Validation: Check percentage ranges
  if (
    input.snapshotPercent < 0 ||
    input.snapshotPercent > 100 ||
    input.thinProvisioningPercent < 0 ||
    input.thinProvisioningPercent > 100 ||
    input.growthPercent < 0 ||
    input.growthPercent > 100
  ) {
    return {
      ok: false,
      error: "Percentage values must be between 0 and 100",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Check hypervisor hosts minimum
  if (hypervisorHosts < 1) {
    return { ok: false, error: "At least one hypervisor host is required", code: "INVALID_INPUT" };
  }

  // Step 1: Calculate total provisioned disk and VM count
  const totalProvisionedGb = input.vmConfigs.reduce(
    (sum, config) => sum + config.diskGb * config.count,
    0
  );
  const totalVmCount = input.vmConfigs.reduce((sum, config) => sum + config.count, 0);
  steps.push(
    `Total provisioned disk: ${totalProvisionedGb.toFixed(2)} GB across ${totalVmCount} VMs`
  );

  // Step 2: Calculate used disk (with thin provisioning)
  const usedDiskGb = totalProvisionedGb * (1 - input.thinProvisioningPercent / 100);
  const overSubscribedGb = totalProvisionedGb - usedDiskGb;
  if (input.thinProvisioningPercent > 0) {
    steps.push(
      `Thin provisioning (${input.thinProvisioningPercent}%): Used ${usedDiskGb.toFixed(2)} GB, over-subscribed ${overSubscribedGb.toFixed(2)} GB`
    );
  } else {
    steps.push(`Thick provisioning: ${usedDiskGb.toFixed(2)} GB (no over-subscription)`);
  }

  // Step 3: Calculate snapshot allocation
  const snapshotGb = totalProvisionedGb * (input.snapshotPercent / 100);
  steps.push(`Snapshot allocation (${input.snapshotPercent}%): ${snapshotGb.toFixed(2)} GB`);

  // Step 4: Calculate swap file allocation
  const swapGb = input.includeSwapFiles
    ? input.vmConfigs.reduce((sum, config) => sum + config.ramGb * config.count, 0)
    : 0;
  if (input.includeSwapFiles) {
    steps.push(`Swap files (equal to RAM): ${swapGb.toFixed(2)} GB`);
  } else {
    steps.push("Swap files: Not included (0 GB)");
  }

  // Step 5: Calculate config/log allocation
  const configLogGb = totalVmCount * input.configLogGbPerVm;
  steps.push(
    `Config/log files (${input.configLogGbPerVm} GB × ${totalVmCount} VMs): ${configLogGb.toFixed(2)} GB`
  );

  // Step 6: Calculate total VM storage
  const totalVmStorageGb = usedDiskGb + snapshotGb + swapGb + configLogGb;
  steps.push(`Total VM storage: ${totalVmStorageGb.toFixed(2)} GB`);

  // Step 7: Calculate hypervisor overhead
  const hypervisorOverheadGb = hypervisorHosts * hypervisorStorageGbPerHost;
  steps.push(
    `${platformName} overhead (${hypervisorStorageGbPerHost} GB × ${hypervisorHosts} hosts): ${hypervisorOverheadGb.toFixed(2)} GB`
  );

  // Step 8: Calculate subtotal before growth
  const subtotal = totalVmStorageGb + hypervisorOverheadGb;
  steps.push(`Subtotal (VM + ${platformName}): ${subtotal.toFixed(2)} GB`);

  // Step 9: Calculate growth allocation
  const growthAllocationGb = subtotal * (input.growthPercent / 100);
  steps.push(`Growth allocation (${input.growthPercent}%): ${growthAllocationGb.toFixed(2)} GB`);

  // Step 10: Calculate total required storage
  const totalRequiredGb = subtotal + growthAllocationGb;
  steps.push(`Total required storage: ${totalRequiredGb.toFixed(2)} GB`);

  // Calculate percentage breakdown
  const percentages = {
    usedDisk: (usedDiskGb / totalRequiredGb) * 100,
    overSubscribed: (overSubscribedGb / totalRequiredGb) * 100,
    snapshot: (snapshotGb / totalRequiredGb) * 100,
    swap: (swapGb / totalRequiredGb) * 100,
    configLog: (configLogGb / totalRequiredGb) * 100,
    esxOverhead: (hypervisorOverheadGb / totalRequiredGb) * 100,
    growth: (growthAllocationGb / totalRequiredGb) * 100,
  };

  return {
    ok: true,
    value: {
      totalProvisionedGb,
      usedDiskGb,
      overSubscribedGb,
      snapshotGb,
      swapGb,
      configLogGb,
      totalVmStorageGb,
      esxStorageGb: hypervisorOverheadGb, // Renamed internally but kept field name for backward compatibility
      growthAllocationGb,
      totalRequiredGb,
      totalVmCount,
      percentages,
      steps,
    },
  };
}
