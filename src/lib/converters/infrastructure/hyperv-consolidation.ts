/**
 * Hyper-V Consolidation Calculator
 * Calculate host count, storage requirements, and Windows Server licensing for Hyper-V environments
 */

import hypervisorData from "@/data/infrastructure/hypervisor-overhead.json";
import type { CalculationResult } from "@/types";
import type { HaMode } from "./types";

/**
 * Input for Hyper-V consolidation calculation
 */
export interface HypervConsolidationInput {
  /** Number of VMs to consolidate */
  vmCount: number;
  /** Average vCPUs per VM */
  avgVcpusPerVm: number;
  /** Average RAM per VM in GB */
  avgRamPerVm: number;
  /** Average storage per VM in GB */
  avgStoragePerVm: number;
  /** High availability mode */
  haMode: HaMode;
  /** Enable Hyper-V Replica for DR */
  enableReplica: boolean;
  /** Disk provisioning type */
  diskType: "fixed" | "dynamic";
  /** Enable snapshots/checkpoints */
  enableSnapshots: boolean;
  /** Physical cores per host CPU */
  coresPerCpu: number;
  /** Number of CPUs per host */
  cpusPerHost: number;
  /** RAM per host in GB */
  ramPerHost: number;
  /** Storage per host in GB */
  storagePerHost: number;
  /** vCPU to physical core ratio */
  vcpuRatio: number;
  /** RAM overcommit ratio */
  ramOvercommit: number;
}

/**
 * Result of Hyper-V consolidation calculation
 */
export interface HypervConsolidationResult {
  /** Number of hosts required */
  hostsRequired: number;
  /** Total physical cores required */
  totalCoresRequired: number;
  /** Total RAM required in GB */
  totalRamRequired: number;
  /** Total storage required in GB */
  totalStorageRequired: number;
  /** Storage breakdown */
  storageBreakdown: {
    vmStorage: number;
    thinProvisioning: number;
    snapshots: number;
    replica: number;
    total: number;
  };
  /** Windows Server licensing */
  licensing: {
    datacenter: {
      licensesRequired: number;
      corePacksRequired: number;
      totalCost: number;
    };
    standard: {
      licensesRequired: number;
      corePacksRequired: number;
      totalCost: number;
    };
    recommendation: "datacenter" | "standard";
    breakEvenVms: number;
  };
  /** HA configuration */
  ha: {
    mode: HaMode;
    failoverCapacity: number;
    effectiveHosts: number;
  };
  /** Capacity per host */
  perHost: {
    vms: number;
    vcpus: number;
    ramGB: number;
    storageGB: number;
  };
  /** Calculation steps */
  steps: string[];
}

/**
 * Calculate Hyper-V consolidation
 */
export function calculateHypervConsolidation(
  input: HypervConsolidationInput
): CalculationResult<HypervConsolidationResult> {
  if (
    input.vmCount <= 0 ||
    input.avgVcpusPerVm <= 0 ||
    input.avgRamPerVm <= 0 ||
    input.avgStoragePerVm <= 0 ||
    input.coresPerCpu <= 0 ||
    input.cpusPerHost <= 0 ||
    input.ramPerHost <= 0 ||
    input.storagePerHost <= 0 ||
    input.vcpuRatio <= 0 ||
    input.ramOvercommit <= 0
  ) {
    return { ok: false, error: "All consolidation inputs must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  const hypervData = hypervisorData.find((h) => h.id === "hyperv");

  if (!hypervData)
    return { ok: false, error: "Hyper-V platform data not found", code: "INVALID_INPUT" };

  // Step 1: Calculate total resource requirements
  steps.push("=== Resource Requirements ===");

  const totalVcpus = input.vmCount * input.avgVcpusPerVm;
  const totalVmRam = input.vmCount * input.avgRamPerVm;
  const totalVmStorage = input.vmCount * input.avgStoragePerVm;

  steps.push(`Total VMs: ${input.vmCount}`);
  steps.push(`Total vCPUs: ${totalVcpus} (${input.vmCount} × ${input.avgVcpusPerVm})`);
  steps.push(`Total VM RAM: ${totalVmRam} GB (${input.vmCount} × ${input.avgRamPerVm} GB)`);
  steps.push(
    `Total VM Storage: ${totalVmStorage} GB (${input.vmCount} × ${input.avgStoragePerVm} GB)`
  );

  // Step 2: Calculate storage with stacking
  steps.push("\n=== Storage Calculation ===");

  const diskFormat = hypervData.diskFormats[input.diskType];
  if (!diskFormat) {
    return { ok: false, error: `Unknown disk type: ${input.diskType}`, code: "INVALID_INPUT" };
  }
  const thinMultiplier = diskFormat.multiplier;
  const snapshotMultiplier = input.enableSnapshots ? hypervData.snapshotOverhead.multiplier : 1.0;
  const replicaMultiplier = input.enableReplica ? hypervData.replicationOverhead.multiplier : 1.0;

  const vmStorage = totalVmStorage;
  const afterThin = vmStorage * thinMultiplier;
  const afterSnapshots = afterThin * snapshotMultiplier;
  const totalStorage = afterSnapshots * replicaMultiplier;

  const storageBreakdown = {
    vmStorage,
    thinProvisioning: afterThin,
    snapshots: afterSnapshots,
    replica: totalStorage,
    total: totalStorage,
  };

  steps.push(`Base VM storage: ${vmStorage} GB`);
  steps.push(`Disk type: ${diskFormat.name} (${thinMultiplier}×)`);
  steps.push(`After thin provisioning: ${afterThin.toFixed(2)} GB`);

  if (input.enableSnapshots) {
    steps.push(`Snapshot overhead: ${snapshotMultiplier}× → ${afterSnapshots.toFixed(2)} GB`);
  }

  if (input.enableReplica) {
    steps.push(`Hyper-V Replica: ${replicaMultiplier}× → ${totalStorage.toFixed(2)} GB`);
    steps.push(`Note: Hyper-V Replica stores full copy locally (2× space requirement)`);
  }

  const stackingFactor = thinMultiplier * snapshotMultiplier * replicaMultiplier;
  steps.push(
    `Total stacking factor: ${thinMultiplier}× × ${snapshotMultiplier}× × ${replicaMultiplier}× = ${stackingFactor.toFixed(2)}×`
  );
  steps.push(`Total storage required: ${totalStorage.toFixed(2)} GB`);

  // Step 3: Calculate host requirements
  steps.push("\n=== Host Requirements ===");

  const physicalCoresPerHost = input.coresPerCpu * input.cpusPerHost;
  const usableCpuPercent = (100 - hypervData.cpuOverhead.percent) / 100;
  const usableCoresPerHost = physicalCoresPerHost * usableCpuPercent;
  const maxVcpusPerHost = usableCoresPerHost * input.vcpuRatio;

  const parentPartitionMemory = hypervData.memoryOverhead.hypervisorReserved / 1024; // Convert to GB
  const perVmMemoryOverhead = hypervData.memoryOverhead.perVmOverheadMB / 1024; // Convert to GB
  const totalVmMemoryOverhead = input.vmCount * perVmMemoryOverhead;
  const totalRamRequired = totalVmRam + parentPartitionMemory + totalVmMemoryOverhead;
  const usableRamPerHost = input.ramPerHost - parentPartitionMemory;
  const maxRamPerHost = usableRamPerHost * input.ramOvercommit;

  steps.push(
    `Physical cores per host: ${physicalCoresPerHost} (${input.cpusPerHost} CPUs × ${input.coresPerCpu} cores)`
  );
  steps.push(`Hyper-V CPU overhead: ${hypervData.cpuOverhead.percent}%`);
  steps.push(`Usable cores per host: ${usableCoresPerHost.toFixed(2)}`);
  steps.push(`vCPU ratio: ${input.vcpuRatio}:1 → ${maxVcpusPerHost.toFixed(0)} max vCPUs per host`);

  steps.push(`\nParent partition memory: ${parentPartitionMemory.toFixed(2)} GB`);
  steps.push(
    `Per-VM memory overhead: ${perVmMemoryOverhead.toFixed(2)} GB × ${input.vmCount} VMs = ${totalVmMemoryOverhead.toFixed(2)} GB`
  );
  steps.push(`Total RAM required: ${totalRamRequired.toFixed(2)} GB`);
  steps.push(`RAM overcommit: ${input.ramOvercommit}:1`);

  // Calculate hosts needed based on each constraint
  const hostsByCpu = Math.ceil(totalVcpus / maxVcpusPerHost);
  const hostsByRam = Math.ceil(totalRamRequired / maxRamPerHost);
  const hostsByStorage = Math.ceil(totalStorage / input.storagePerHost);

  steps.push(`\nHosts by CPU: ${hostsByCpu}`);
  steps.push(`Hosts by RAM: ${hostsByRam}`);
  steps.push(`Hosts by Storage: ${hostsByStorage}`);

  const hostsBeforeHa = Math.max(hostsByCpu, hostsByRam, hostsByStorage);
  steps.push(`Minimum hosts (before HA): ${hostsBeforeHa}`);

  // Step 4: Apply HA
  steps.push("\n=== High Availability ===");

  let hostsRequired = hostsBeforeHa;
  let effectiveHosts = hostsBeforeHa;
  let failoverCapacity = 0;

  if (input.haMode === "n_plus_1") {
    hostsRequired = hostsBeforeHa + 1;
    effectiveHosts = hostsBeforeHa;
    failoverCapacity = 1;
    steps.push(`HA mode: N+1 (1 host failure tolerance)`);
    steps.push(`Hosts required: ${hostsBeforeHa} + 1 = ${hostsRequired}`);
  } else if (input.haMode === "n_plus_2") {
    hostsRequired = hostsBeforeHa + 2;
    effectiveHosts = hostsBeforeHa;
    failoverCapacity = 2;
    steps.push(`HA mode: N+2 (2 host failure tolerance)`);
    steps.push(`Hosts required: ${hostsBeforeHa} + 2 = ${hostsRequired}`);
  } else {
    steps.push(`HA mode: None`);
    steps.push(`Hosts required: ${hostsRequired}`);
  }

  // Step 5: Windows Server Licensing
  steps.push("\n=== Windows Server Licensing ===");

  const totalCoresRequired = hostsRequired * physicalCoresPerHost;
  const minCoresPerServer = 16;
  const coresPerPack = 2;

  // Datacenter: 16-core minimum, additional in 2-core packs, unlimited VMs
  const datacenterCoresPerHost = Math.max(physicalCoresPerHost, minCoresPerServer);
  const datacenterCorePacksPerHost = datacenterCoresPerHost / coresPerPack;
  const datacenterTotalCorePacks = datacenterCorePacksPerHost * hostsRequired;
  const datacenterCost = datacenterTotalCorePacks * 6155; // $6,155 per 2-core pack

  steps.push(`Datacenter Edition:`);
  steps.push(
    `  - Cores per host: max(${physicalCoresPerHost}, ${minCoresPerServer}) = ${datacenterCoresPerHost}`
  );
  steps.push(
    `  - Core packs per host: ${datacenterCoresPerHost} / ${coresPerPack} = ${datacenterCorePacksPerHost}`
  );
  steps.push(
    `  - Total core packs: ${datacenterCorePacksPerHost} × ${hostsRequired} hosts = ${datacenterTotalCorePacks}`
  );
  steps.push(
    `  - Cost: ${datacenterTotalCorePacks} × $6,155 = $${datacenterCost.toLocaleString()}`
  );
  steps.push(`  - VMs: Unlimited`);

  // Standard: 16-core minimum, additional in 2-core packs, 2 VMs per license
  const standardCoresPerHost = Math.max(physicalCoresPerHost, minCoresPerServer);
  const standardCorePacksPerHost = standardCoresPerHost / coresPerPack;
  const standardLicensesForVms = Math.ceil(input.vmCount / 2);
  const standardCorePacksPerLicense = standardCorePacksPerHost;
  const standardTotalCorePacks = standardLicensesForVms * standardCorePacksPerLicense;
  const standardCost = standardTotalCorePacks * 1069; // $1,069 per 2-core pack

  steps.push(`\nStandard Edition:`);
  steps.push(
    `  - Cores per host: max(${physicalCoresPerHost}, ${minCoresPerServer}) = ${standardCoresPerHost}`
  );
  steps.push(`  - Core packs per license: ${standardCorePacksPerHost}`);
  steps.push(`  - Licenses for VMs: ceil(${input.vmCount} / 2) = ${standardLicensesForVms}`);
  steps.push(
    `  - Total core packs: ${standardLicensesForVms} × ${standardCorePacksPerHost} = ${standardTotalCorePacks}`
  );
  steps.push(`  - Cost: ${standardTotalCorePacks} × $1,069 = $${standardCost.toLocaleString()}`);
  steps.push(`  - VMs: ${input.vmCount} (2 per license)`);

  const breakEvenVms = 13; // Approximate break-even point
  const recommendation = input.vmCount >= breakEvenVms ? "datacenter" : "standard";

  steps.push(`\nRecommendation: ${recommendation.toUpperCase()}`);
  steps.push(`Break-even point: ~${breakEvenVms} VMs per host`);

  // Per-host calculations
  const vmsPerHost = Math.ceil(input.vmCount / effectiveHosts);
  const vcpusPerHost = totalVcpus / effectiveHosts;
  const ramPerHost = totalRamRequired / effectiveHosts;
  const storagePerHost = totalStorage / effectiveHosts;

  return {
    ok: true,
    value: {
      hostsRequired,
      totalCoresRequired,
      totalRamRequired,
      totalStorageRequired: totalStorage,
      storageBreakdown,
      licensing: {
        datacenter: {
          licensesRequired: hostsRequired,
          corePacksRequired: datacenterTotalCorePacks,
          totalCost: datacenterCost,
        },
        standard: {
          licensesRequired: standardLicensesForVms,
          corePacksRequired: standardTotalCorePacks,
          totalCost: standardCost,
        },
        recommendation,
        breakEvenVms,
      },
      ha: {
        mode: input.haMode,
        failoverCapacity,
        effectiveHosts,
      },
      perHost: {
        vms: vmsPerHost,
        vcpus: vcpusPerHost,
        ramGB: ramPerHost,
        storageGB: storagePerHost,
      },
      steps,
    },
  };
}
