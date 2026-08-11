import featuresData from "@/data/infrastructure/hypervisor-features.json";
import hypervisorData from "@/data/infrastructure/hypervisor-overhead.json";
import licensingData from "@/data/infrastructure/licensing-costs.json";
import type { CalculationResult } from "@/types";

export interface HypervisorComparisonInput {
  // Workload
  vmCount: number;
  avgVcpusPerVm: number;
  avgRamPerVm: number; // GB
  avgStoragePerVm: number; // GB

  // Host specs (standard across all platforms)
  coresPerCpu: number;
  cpusPerHost: number;
  ramPerHost: number; // GB
  storagePerHost: number; // GB

  // HA requirements
  haMode: "none" | "n_plus_1" | "n_plus_2";

  // Storage options
  enableReplica: boolean;
  enableSnapshots: boolean;

  // Overcommit ratios
  vcpuRatio: number;
  ramOvercommit: number;

  // Cost factors (per year)
  powerCostPerKwh: number; // USD
  hostPowerWatts: number;
  laborHourlyRate: number; // USD
  hardwareCostPerHost: number; // USD
  hardwareLifespanYears: number;

  // Windows Server edition (affects Hyper-V licensing)
  windowsEdition: "standard" | "datacenter";
}

export interface PlatformSizing {
  platform: string;
  platformName: string;

  // Capacity
  totalHostsRequired: number;
  effectiveHosts: number; // After HA
  cpuCapacity: {
    totalCores: number;
    usableCores: number;
    utilizationPercent: number;
  };
  ramCapacity: {
    totalGb: number;
    usableGb: number;
    utilizationPercent: number;
  };
  storageCapacity: {
    totalGb: number;
    usableGb: number;
    utilizationPercent: number;
    storageMultiplier: number;
  };

  // TCO (5-year)
  costs: {
    licensing: {
      total: number;
      annual: number;
      perVm: number;
      details: string;
    };
    hardware: {
      total: number;
      annual: number;
    };
    power: {
      total: number;
      annual: number;
      kwhPerYear: number;
    };
    labor: {
      total: number;
      annual: number;
      hoursPerYear: number;
      details: string;
    };
    total: {
      fiveYear: number;
      annual: number;
      perVm: number;
    };
  };

  // Performance
  performance: {
    cpuOverhead: number;
    memoryOverhead: number;
    effectiveCpuUtilization: number;
    effectiveRamUtilization: number;
  };
}

export interface HypervisorComparisonResult {
  platforms: PlatformSizing[];

  recommendation: {
    costLeader: string;
    performanceLeader: string;
    bestOverall: string;
    reasoning: string[];
  };

  comparison: {
    costDifference: {
      lowest: string;
      highest: string;
      savingsPercent: number;
      savingsAmount: number;
    };
    performanceDifference: {
      bestCpu: string;
      bestRam: string;
    };
  };

  features: typeof featuresData;

  warnings: string[];
}

export function calculateHypervisorComparison(
  input: HypervisorComparisonInput
): CalculationResult<HypervisorComparisonResult> {
  const platforms: PlatformSizing[] = [];
  const warnings: string[] = [];

  // Validate input
  if (input.vmCount <= 0) {
    return { ok: false, error: "VM count must be positive", code: "INVALID_INPUT" };
  }
  if (input.avgVcpusPerVm <= 0 || input.avgRamPerVm <= 0) {
    return { ok: false, error: "VM specifications must be positive", code: "INVALID_INPUT" };
  }
  if (input.coresPerCpu <= 0 || input.cpusPerHost <= 0) {
    return { ok: false, error: "Host specifications must be positive", code: "INVALID_INPUT" };
  }

  // Calculate for each platform
  const platformIds = ["vmware", "hyperv", "proxmox", "xcpng"];

  for (const platformId of platformIds) {
    // TypeScript union type issue: diskFormats vary per platform, causing incompatible Record types
    // biome-ignore lint/suspicious/noExplicitAny: Type cast needed for platform-specific diskFormats
    const platformData = (hypervisorData as any).find((p: any) => p.id === platformId);
    if (!platformData) continue;

    const platformSizing = calculatePlatformSizing(input, platformId, platformData);
    platforms.push(platformSizing);
  }

  // Find leaders
  const costLeader = platforms.reduce((min, p) =>
    p.costs.total.fiveYear < min.costs.total.fiveYear ? p : min
  );
  const costLoser = platforms.reduce((max, p) =>
    p.costs.total.fiveYear > max.costs.total.fiveYear ? p : max
  );

  const performanceLeader = platforms.reduce((best, p) =>
    p.performance.cpuOverhead < best.performance.cpuOverhead ? p : best
  );

  // Generate recommendation
  const reasoning: string[] = [];

  // Cost analysis
  if (costLeader.platform === "vmware") {
    reasoning.push(
      "VMware has highest features but also highest cost. Consider for mission-critical workloads only."
    );
  } else if (costLeader.platform === "hyperv") {
    reasoning.push(
      "Hyper-V offers good balance for Windows-centric environments with existing Windows Server licensing."
    );
  } else if (costLeader.platform === "proxmox" || costLeader.platform === "xcpng") {
    reasoning.push(
      `${costLeader.platformName} provides significant cost savings with open-source licensing.`
    );
  }

  // Performance analysis
  if (performanceLeader.platform === "hyperv") {
    reasoning.push(
      "Hyper-V shows lowest CPU overhead, ideal for performance-sensitive Windows workloads."
    );
  } else if (performanceLeader.platform === "vmware") {
    reasoning.push(
      "VMware offers excellent performance with most mature feature set and ecosystem."
    );
  }

  // Workload size analysis
  if (input.vmCount < 50) {
    reasoning.push(
      "Small workload: Proxmox or XCP-ng offer excellent value without licensing overhead."
    );
  } else if (input.vmCount < 200) {
    reasoning.push(
      "Medium workload: Consider Hyper-V for Windows shops or Proxmox for mixed environments."
    );
  } else {
    reasoning.push(
      "Large workload: Enterprise platforms (VMware/Hyper-V) provide better management at scale."
    );
  }

  // Determine best overall
  let bestOverall = costLeader.platform;
  if (input.vmCount > 200 && costLeader.platform !== "vmware" && costLeader.platform !== "hyperv") {
    bestOverall = "vmware";
    reasoning.push(
      "Despite higher cost, VMware recommended for large deployments requiring enterprise features."
    );
  }

  // Warnings
  if (input.ramOvercommit > 1.5) {
    warnings.push(
      `High RAM overcommit (${input.ramOvercommit}x) may impact performance across all platforms`
    );
  }
  if (input.vcpuRatio > 8) {
    warnings.push(
      `High vCPU ratio (${input.vcpuRatio}:1) may cause CPU contention across all platforms`
    );
  }

  // Check licensing costs staleness
  const daysOld = Math.floor(
    (Date.now() - new Date(licensingData.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysOld > licensingData.staleDays) {
    warnings.push(`Licensing costs are ${daysOld} days old. Verify current pricing with vendors.`);
  }

  return {
    ok: true,
    value: {
      platforms,
      recommendation: {
        costLeader: costLeader.platform,
        performanceLeader: performanceLeader.platform,
        bestOverall,
        reasoning,
      },
      comparison: {
        costDifference: {
          lowest: costLeader.platform,
          highest: costLoser.platform,
          savingsPercent:
            ((costLoser.costs.total.fiveYear - costLeader.costs.total.fiveYear) /
              costLoser.costs.total.fiveYear) *
            100,
          savingsAmount: costLoser.costs.total.fiveYear - costLeader.costs.total.fiveYear,
        },
        performanceDifference: {
          bestCpu: performanceLeader.platform,
          bestRam: performanceLeader.platform,
        },
      },
      features: featuresData,
      warnings,
    },
  };
}

function calculatePlatformSizing(
  input: HypervisorComparisonInput,
  platformId: string,
  platformData: {
    id: string;
    name: string;
    cpuOverhead: { description: string; percent: number; notes: string };
    memoryOverhead: {
      description: string;
      hypervisorReserved: number;
      perVmOverheadMB: number;
      notes: string;
    };
    diskFormats: Record<string, { name: string; multiplier: number; description: string }>;
  }
): PlatformSizing {
  const hostCores = input.coresPerCpu * input.cpusPerHost;

  // CPU sizing
  const totalVcpusNeeded = input.vmCount * input.avgVcpusPerVm;
  const cpuOverheadFactor = platformData.cpuOverhead.percent / 100;
  const effectiveCoresPerHost = hostCores * (1 - cpuOverheadFactor);
  const usableCoresPerHost = effectiveCoresPerHost * input.vcpuRatio;
  const hostsForCpu = Math.ceil(totalVcpusNeeded / usableCoresPerHost);

  // RAM sizing
  const totalRamNeeded = input.vmCount * input.avgRamPerVm;
  const hypervisorReservedGb = platformData.memoryOverhead.hypervisorReserved / 1024;
  const effectiveRamPerHost = input.ramPerHost - hypervisorReservedGb;
  const usableRamPerHost = effectiveRamPerHost * input.ramOvercommit;
  const hostsForRam = Math.ceil(totalRamNeeded / usableRamPerHost);

  // Storage sizing
  const baseStorage = input.vmCount * input.avgStoragePerVm;

  // Platform-specific storage multipliers
  let storageMultiplier = 1.0;

  // Thin provisioning overhead (platform-specific)
  if (platformId === "vmware") {
    storageMultiplier *= 1.5; // Thin VMDK
  } else if (platformId === "hyperv") {
    storageMultiplier *= 1.5; // Dynamic VHDX
  } else if (platformId === "proxmox") {
    storageMultiplier *= 1.4; // qcow2
  } else if (platformId === "xcpng") {
    storageMultiplier *= 1.3; // VHD
  }

  // Snapshots
  if (input.enableSnapshots) {
    storageMultiplier *= 1.15;
  }

  // Replication
  if (input.enableReplica) {
    if (platformId === "hyperv") {
      storageMultiplier *= 2.0; // Full copy for Replica
    } else {
      storageMultiplier *= 1.5; // Incremental replication
    }
  }

  const totalStorageNeeded = baseStorage * storageMultiplier;
  const hostsForStorage = Math.ceil(totalStorageNeeded / input.storagePerHost);

  // Total hosts required (max of all constraints)
  let totalHostsRequired = Math.max(hostsForCpu, hostsForRam, hostsForStorage);

  // HA overhead
  let effectiveHosts = totalHostsRequired;
  if (input.haMode === "n_plus_1") {
    totalHostsRequired += 1;
    effectiveHosts = totalHostsRequired - 1;
  } else if (input.haMode === "n_plus_2") {
    totalHostsRequired += 2;
    effectiveHosts = totalHostsRequired - 2;
  }

  // Calculate actual utilization
  const totalCores = totalHostsRequired * hostCores;
  const usableCores = effectiveHosts * effectiveCoresPerHost * input.vcpuRatio;
  const cpuUtilization = (totalVcpusNeeded / usableCores) * 100;

  const totalRam = totalHostsRequired * input.ramPerHost;
  const usableRam = effectiveHosts * usableRamPerHost;
  const ramUtilization = (totalRamNeeded / usableRam) * 100;

  const totalStorage = totalHostsRequired * input.storagePerHost;
  const usableStorage = effectiveHosts * input.storagePerHost;
  const storageUtilization = (totalStorageNeeded / usableStorage) * 100;

  // Cost calculation (5-year TCO)
  const costs = calculatePlatformCosts(
    input,
    platformId,
    totalHostsRequired,
    hostCores,
    effectiveHosts
  );

  return {
    platform: platformId,
    platformName: platformData.name,
    totalHostsRequired,
    effectiveHosts,
    cpuCapacity: {
      totalCores,
      usableCores,
      utilizationPercent: cpuUtilization,
    },
    ramCapacity: {
      totalGb: totalRam,
      usableGb: usableRam,
      utilizationPercent: ramUtilization,
    },
    storageCapacity: {
      totalGb: totalStorage,
      usableGb: usableStorage,
      utilizationPercent: storageUtilization,
      storageMultiplier,
    },
    costs,
    performance: {
      cpuOverhead: platformData.cpuOverhead.percent,
      memoryOverhead: platformData.memoryOverhead.hypervisorReserved,
      effectiveCpuUtilization: cpuUtilization,
      effectiveRamUtilization: ramUtilization,
    },
  };
}

function calculatePlatformCosts(
  input: HypervisorComparisonInput,
  platformId: string,
  totalHosts: number,
  coresPerHost: number,
  effectiveHosts: number
): PlatformSizing["costs"] {
  const yearsToCalculate = 5;

  // Licensing costs
  let licensingTotal = 0;
  let licensingDetails = "";

  if (platformId === "vmware") {
    // VCF subscription: $375/core/year
    const vcfCostPerCore = licensingData.vmware.vcf.pricePerCore;
    const totalCores = totalHosts * coresPerHost;
    licensingTotal = vcfCostPerCore * totalCores * yearsToCalculate;
    licensingDetails = `VCF: ${totalCores} cores × $${vcfCostPerCore}/core × ${yearsToCalculate} years`;
  } else if (platformId === "hyperv") {
    const licensedCoresPerHost = Math.max(coresPerHost, 16);
    const packsPerHost = licensedCoresPerHost / 2;

    if (input.windowsEdition === "datacenter") {
      // Datacenter: one license per host, unlimited VMs
      const costPerPack = licensingData.windowsServer.datacenter.pricePerCorePack;
      licensingTotal = costPerPack * packsPerHost * totalHosts;
      licensingDetails = `Datacenter: ${totalHosts} hosts × ${packsPerHost} packs × $${costPerPack}`;
    } else {
      // Standard: each license covers 2 VMs, need to stack licenses
      const costPerPack = licensingData.windowsServer.standard.pricePerCorePack;
      const vmsPerHost = Math.ceil(input.vmCount / effectiveHosts);
      const licensesPerHost = Math.ceil(vmsPerHost / 2);
      licensingTotal = costPerPack * packsPerHost * licensesPerHost * totalHosts;
      licensingDetails = `Standard: ${totalHosts} hosts × ${packsPerHost} packs × ${licensesPerHost} licenses × $${costPerPack}`;
    }
  } else if (platformId === "proxmox") {
    // Proxmox subscription (optional): ~$110/CPU/year for Premium
    const proxmoxCostPerCpu = 110;
    const totalCpus = totalHosts * input.cpusPerHost;
    licensingTotal = proxmoxCostPerCpu * totalCpus * yearsToCalculate;
    licensingDetails = `Premium subscription: ${totalCpus} CPUs × $${proxmoxCostPerCpu}/year × ${yearsToCalculate} years (optional)`;
  } else if (platformId === "xcpng") {
    // XCP-ng is free, but optional support: ~$800/host/year
    const supportCostPerHost = 800;
    licensingTotal = supportCostPerHost * totalHosts * yearsToCalculate;
    licensingDetails = `Pro support: ${totalHosts} hosts × $${supportCostPerHost}/year × ${yearsToCalculate} years (optional)`;
  }

  // Hardware costs (amortized over lifespan)
  const hardwareTotal = input.hardwareCostPerHost * totalHosts;
  const hardwareAnnual = hardwareTotal / input.hardwareLifespanYears;
  const hardwareFiveYear = hardwareAnnual * yearsToCalculate;

  // Power costs
  const hoursPerYear = 24 * 365;
  const kwhPerYear = (input.hostPowerWatts * totalHosts * hoursPerYear) / 1000;
  const powerAnnual = kwhPerYear * input.powerCostPerKwh;
  const powerFiveYear = powerAnnual * yearsToCalculate;

  // Labor costs (management overhead)
  // Estimate: VMware lowest (mature tools), open-source highest (more manual)
  let laborHoursPerYear = 0;
  let laborDetails = "";

  if (platformId === "vmware") {
    laborHoursPerYear = totalHosts * 20; // 20 hours/host/year (highly automated)
    laborDetails = "Highly automated management";
  } else if (platformId === "hyperv") {
    laborHoursPerYear = totalHosts * 30; // 30 hours/host/year
    laborDetails = "Good automation with PowerShell";
  } else if (platformId === "proxmox") {
    laborHoursPerYear = totalHosts * 40; // 40 hours/host/year
    laborDetails = "More manual configuration";
  } else if (platformId === "xcpng") {
    laborHoursPerYear = totalHosts * 35; // 35 hours/host/year
    laborDetails = "Xen Orchestra helps automation";
  }

  const laborAnnual = laborHoursPerYear * input.laborHourlyRate;
  const laborFiveYear = laborAnnual * yearsToCalculate;

  // Total TCO
  const totalFiveYear = licensingTotal + hardwareFiveYear + powerFiveYear + laborFiveYear;
  const totalAnnual = totalFiveYear / yearsToCalculate;
  const costPerVm = totalFiveYear / input.vmCount;

  return {
    licensing: {
      total: licensingTotal,
      annual: licensingTotal / yearsToCalculate,
      perVm: licensingTotal / input.vmCount,
      details: licensingDetails,
    },
    hardware: {
      total: hardwareFiveYear,
      annual: hardwareAnnual,
    },
    power: {
      total: powerFiveYear,
      annual: powerAnnual,
      kwhPerYear,
    },
    labor: {
      total: laborFiveYear,
      annual: laborAnnual,
      hoursPerYear: laborHoursPerYear,
      details: laborDetails,
    },
    total: {
      fiveYear: totalFiveYear,
      annual: totalAnnual,
      perVm: costPerVm,
    },
  };
}
