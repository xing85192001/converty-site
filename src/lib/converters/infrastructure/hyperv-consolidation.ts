/**
 * Hyper-V Consolidation Calculator
 * Calculate host count, storage requirements, and Windows Server licensing for Hyper-V environments
 */

import hypervisorData from "@/data/infrastructure/hypervisor-overhead.json";
import type { CalcStep } from "@/lib/calc-step";
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
  steps: CalcStep[];
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

  const steps: CalcStep[] = [];
  const hypervData = hypervisorData.find((h) => h.id === "hyperv");

  if (!hypervData)
    return { ok: false, error: "Hyper-V platform data not found", code: "INVALID_INPUT" };

  // Step 1: Calculate total resource requirements
  steps.push({ key: "resourceRequirementsTitle" });

  const totalVcpus = input.vmCount * input.avgVcpusPerVm;
  const totalVmRam = input.vmCount * input.avgRamPerVm;
  const totalVmStorage = input.vmCount * input.avgStoragePerVm;

  steps.push({ key: "totalVms", params: { vmCount: input.vmCount } });
  steps.push({
    key: "totalVcpus",
    params: { totalVcpus, vmCount: input.vmCount, avgVcpusPerVm: input.avgVcpusPerVm },
  });
  steps.push({
    key: "totalVmRam",
    params: { totalVmRam, vmCount: input.vmCount, avgRamPerVm: input.avgRamPerVm },
  });
  steps.push({
    key: "totalVmStorage",
    params: { totalVmStorage, vmCount: input.vmCount, avgStoragePerVm: input.avgStoragePerVm },
  });

  // Step 2: Calculate storage with stacking
  steps.push({ key: "storageCalculationTitle" });

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

  steps.push({ key: "baseVmStorage", params: { vmStorage } });
  steps.push({
    key: "diskType",
    params: { name: diskFormat.name, thinMultiplier },
  });
  steps.push({
    key: "afterThinProvisioning",
    params: { afterThin: afterThin.toFixed(2) },
  });

  if (input.enableSnapshots) {
    steps.push({
      key: "snapshotOverhead",
      params: {
        snapshotMultiplier,
        afterSnapshots: afterSnapshots.toFixed(2),
      },
    });
  }

  if (input.enableReplica) {
    steps.push({
      key: "hypervReplica",
      params: {
        replicaMultiplier,
        totalStorage: totalStorage.toFixed(2),
      },
    });
    steps.push({ key: "hypervReplicaNote" });
  }

  const stackingFactor = thinMultiplier * snapshotMultiplier * replicaMultiplier;
  steps.push({
    key: "totalStackingFactor",
    params: {
      thinMultiplier,
      snapshotMultiplier,
      replicaMultiplier,
      stackingFactor: stackingFactor.toFixed(2),
    },
  });
  steps.push({
    key: "totalStorageRequired",
    params: { totalStorage: totalStorage.toFixed(2) },
  });

  // Step 3: Calculate host requirements
  steps.push({ key: "hostRequirementsTitle" });

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

  steps.push({
    key: "physicalCoresPerHost",
    params: {
      physicalCoresPerHost,
      cpusPerHost: input.cpusPerHost,
      coresPerCpu: input.coresPerCpu,
    },
  });
  steps.push({
    key: "hypervCpuOverhead",
    params: { percent: hypervData.cpuOverhead.percent },
  });
  steps.push({
    key: "usableCoresPerHost",
    params: { usableCoresPerHost: usableCoresPerHost.toFixed(2) },
  });
  steps.push({
    key: "vcpuRatio",
    params: {
      vcpuRatio: input.vcpuRatio,
      maxVcpusPerHost: maxVcpusPerHost.toFixed(0),
    },
  });

  steps.push({
    key: "parentPartitionMemory",
    params: { parentPartitionMemory: parentPartitionMemory.toFixed(2) },
  });
  steps.push({
    key: "perVmMemoryOverhead",
    params: {
      perVmMemoryOverhead: perVmMemoryOverhead.toFixed(2),
      vmCount: input.vmCount,
      totalVmMemoryOverhead: totalVmMemoryOverhead.toFixed(2),
    },
  });
  steps.push({
    key: "totalRamRequired",
    params: { totalRamRequired: totalRamRequired.toFixed(2) },
  });
  steps.push({
    key: "ramOvercommit",
    params: { ramOvercommit: input.ramOvercommit },
  });

  // Calculate hosts needed based on each constraint
  const hostsByCpu = Math.ceil(totalVcpus / maxVcpusPerHost);
  const hostsByRam = Math.ceil(totalRamRequired / maxRamPerHost);
  const hostsByStorage = Math.ceil(totalStorage / input.storagePerHost);

  steps.push({ key: "hostsByCpu", params: { hostsByCpu } });
  steps.push({ key: "hostsByRam", params: { hostsByRam } });
  steps.push({ key: "hostsByStorage", params: { hostsByStorage } });

  const hostsBeforeHa = Math.max(hostsByCpu, hostsByRam, hostsByStorage);
  steps.push({
    key: "minimumHostsBeforeHa",
    params: { hostsBeforeHa },
  });

  // Step 4: Apply HA
  steps.push({ key: "highAvailabilityTitle" });

  let hostsRequired = hostsBeforeHa;
  let effectiveHosts = hostsBeforeHa;
  let failoverCapacity = 0;

  if (input.haMode === "n_plus_1") {
    hostsRequired = hostsBeforeHa + 1;
    effectiveHosts = hostsBeforeHa;
    failoverCapacity = 1;
    steps.push({ key: "haModeNPlus1" });
    steps.push({
      key: "hostsRequiredNPlus1",
      params: { hostsBeforeHa, hostsRequired },
    });
  } else if (input.haMode === "n_plus_2") {
    hostsRequired = hostsBeforeHa + 2;
    effectiveHosts = hostsBeforeHa;
    failoverCapacity = 2;
    steps.push({ key: "haModeNPlus2" });
    steps.push({
      key: "hostsRequiredNPlus2",
      params: { hostsBeforeHa, hostsRequired },
    });
  } else {
    steps.push({ key: "haModeNone" });
    steps.push({
      key: "hostsRequiredNoHa",
      params: { hostsRequired },
    });
  }

  // Step 5: Windows Server Licensing
  steps.push({ key: "windowsLicensingTitle" });

  const totalCoresRequired = hostsRequired * physicalCoresPerHost;
  const minCoresPerServer = 16;
  const coresPerPack = 2;

  // Datacenter: 16-core minimum, additional in 2-core packs, unlimited VMs
  const datacenterCoresPerHost = Math.max(physicalCoresPerHost, minCoresPerServer);
  const datacenterCorePacksPerHost = datacenterCoresPerHost / coresPerPack;
  const datacenterTotalCorePacks = datacenterCorePacksPerHost * hostsRequired;
  const datacenterCost = datacenterTotalCorePacks * 6155; // $6,155 per 2-core pack

  steps.push({ key: "datacenterEditionTitle" });
  steps.push({
    key: "dcCoresPerHost",
    params: {
      physicalCoresPerHost,
      minCoresPerServer,
      datacenterCoresPerHost,
    },
  });
  steps.push({
    key: "dcCorePacksPerHost",
    params: {
      datacenterCoresPerHost,
      coresPerPack,
      datacenterCorePacksPerHost,
    },
  });
  steps.push({
    key: "dcTotalCorePacks",
    params: {
      datacenterCorePacksPerHost,
      hostsRequired,
      datacenterTotalCorePacks,
    },
  });
  steps.push({
    key: "dcCost",
    params: {
      datacenterTotalCorePacks,
      costPerPack: 6155,
      totalCost: datacenterCost.toLocaleString(),
    },
  });
  steps.push({ key: "dcVmsUnlimited" });

  // Standard: 16-core minimum, additional in 2-core packs, 2 VMs per license
  const standardCoresPerHost = Math.max(physicalCoresPerHost, minCoresPerServer);
  const standardCorePacksPerHost = standardCoresPerHost / coresPerPack;
  const standardLicensesForVms = Math.ceil(input.vmCount / 2);
  const standardCorePacksPerLicense = standardCorePacksPerHost;
  const standardTotalCorePacks = standardLicensesForVms * standardCorePacksPerLicense;
  const standardCost = standardTotalCorePacks * 1069; // $1,069 per 2-core pack

  steps.push({ key: "standardEditionTitle" });
  steps.push({
    key: "stdCoresPerHost",
    params: {
      physicalCoresPerHost,
      minCoresPerServer,
      standardCoresPerHost,
    },
  });
  steps.push({
    key: "stdCorePacksPerLicense",
    params: { standardCorePacksPerHost },
  });
  steps.push({
    key: "stdLicensesForVms",
    params: { vmCount: input.vmCount, standardLicensesForVms },
  });
  steps.push({
    key: "stdTotalCorePacks",
    params: {
      standardLicensesForVms,
      standardCorePacksPerHost,
      standardTotalCorePacks,
    },
  });
  steps.push({
    key: "stdCost",
    params: {
      standardTotalCorePacks,
      costPerPack: 1069,
      totalCost: standardCost.toLocaleString(),
    },
  });
  steps.push({
    key: "stdVms",
    params: { vmCount: input.vmCount },
  });

  const breakEvenVms = 13; // Approximate break-even point
  const recommendation = input.vmCount >= breakEvenVms ? "datacenter" : "standard";

  steps.push({
    key: "recommendation",
    params: { recommendation: recommendation.toUpperCase() },
  });
  steps.push({
    key: "breakEvenPoint",
    params: { breakEvenVms },
  });

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
