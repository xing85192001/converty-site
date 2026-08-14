/**
 * Windows Server Licensing Calculator
 * Calculate Windows Server Datacenter vs Standard licensing costs
 */

import licensingData from "@/data/infrastructure/licensing-costs.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import type { WindowsServerEdition } from "./types";

/**
 * Input for Windows Server licensing calculation
 */
export interface WindowsLicensingInput {
  /** Number of physical hosts */
  hostCount: number;
  /** Physical cores per CPU socket */
  coresPerCpu: number;
  /** Number of CPU sockets per host */
  socketsPerHost: number;
  /** Number of VMs to license */
  vmCount: number;
  /** Calculate for specific edition, or compare both */
  calculationMode: "datacenter" | "standard" | "compare";
}

/**
 * Result of Windows Server licensing calculation
 */
export interface WindowsLicensingResult {
  /** Datacenter licensing details */
  datacenter: {
    edition: string;
    totalCores: number;
    coresPerHost: number;
    corePacksPerHost: number;
    totalCorePacks: number;
    costPerCorePack: number;
    totalCost: number;
    vmsIncluded: string;
    notes: string[];
  };
  /** Standard licensing details */
  standard: {
    edition: string;
    totalCores: number;
    coresPerHost: number;
    corePacksPerHost: number;
    licensesRequired: number;
    totalCorePacks: number;
    costPerCorePack: number;
    totalCost: number;
    vmsIncluded: number;
    notes: string[];
  };
  /** Comparison and recommendation */
  comparison: {
    savings: number;
    savingsPercent: number;
    recommendation: WindowsServerEdition;
    breakEvenVms: number;
    currentVmsPerHost: number;
  };
  /** Pricing staleness warning */
  pricingWarning?: {
    lastUpdated: string;
    daysOld: number;
    warning: string;
    vendorUrl: string;
  };
  /** Calculation steps */
  steps: CalcStep[];
}

/**
 * Check if pricing data is stale
 */
function checkPricingStaleness(lastUpdated: string, staleDays: number) {
  const updateDate = new Date(lastUpdated);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isStale: daysDiff > staleDays,
    daysOld: daysDiff,
  };
}

/**
 * Calculate Windows Server licensing
 */
export function calculateWindowsLicensing(
  input: WindowsLicensingInput
): CalculationResult<WindowsLicensingResult> {
  if (
    input.hostCount <= 0 ||
    input.coresPerCpu <= 0 ||
    input.socketsPerHost <= 0 ||
    input.vmCount <= 0
  ) {
    return {
      ok: false,
      error: "Host count, cores per CPU, sockets per host, and VM count must be positive",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];
  const { windowsServer } = licensingData;

  steps.push({ key: "calculatorTitle" });
  steps.push({ key: "inputHosts", params: { hostCount: input.hostCount } });
  steps.push({ key: "inputCoresPerCpu", params: { coresPerCpu: input.coresPerCpu } });
  steps.push({ key: "inputSocketsPerHost", params: { socketsPerHost: input.socketsPerHost } });
  steps.push({ key: "inputVmCount", params: { vmCount: input.vmCount } });

  // Calculate total cores
  const physicalCoresPerHost = input.coresPerCpu * input.socketsPerHost;
  const totalPhysicalCores = physicalCoresPerHost * input.hostCount;

  steps.push({
    key: "physicalCoresPerHost",
    params: {
      coresPerCpu: input.coresPerCpu,
      socketsPerHost: input.socketsPerHost,
      physicalCoresPerHost,
    },
  });
  steps.push({
    key: "totalPhysicalCores",
    params: {
      physicalCoresPerHost,
      hostCount: input.hostCount,
      totalPhysicalCores,
    },
  });

  // Datacenter Edition
  steps.push({ key: "datacenterTitle" });

  const minCores = windowsServer.datacenter.minCoresPerServer;
  const datacenterCoresPerHost = Math.max(physicalCoresPerHost, minCores);
  const datacenterCorePacksPerHost = datacenterCoresPerHost / windowsServer.datacenter.coresPerPack;
  const datacenterTotalCorePacks = datacenterCorePacksPerHost * input.hostCount;
  const datacenterTotalCost = datacenterTotalCorePacks * windowsServer.datacenter.pricePerCorePack;

  steps.push({ key: "dcMinCores", params: { minCores } });
  steps.push({
    key: "dcLicensedCoresPerHost",
    params: {
      physicalCoresPerHost,
      minCores,
      datacenterCoresPerHost,
    },
  });
  steps.push({
    key: "dcCorePacksPerHost",
    params: {
      datacenterCoresPerHost,
      coresPerPack: windowsServer.datacenter.coresPerPack,
      datacenterCorePacksPerHost,
    },
  });
  steps.push({
    key: "dcTotalCorePacks",
    params: {
      datacenterCorePacksPerHost,
      hostCount: input.hostCount,
      datacenterTotalCorePacks,
    },
  });
  steps.push({
    key: "dcCostPerCorePack",
    params: {
      pricePerCorePack: windowsServer.datacenter.pricePerCorePack.toLocaleString(),
    },
  });
  steps.push({
    key: "dcTotalCost",
    params: {
      datacenterTotalCorePacks,
      pricePerCorePack: windowsServer.datacenter.pricePerCorePack.toLocaleString(),
      totalCost: datacenterTotalCost.toLocaleString(),
    },
  });
  steps.push({ key: "dcVmsIncluded" });

  const datacenterNotes = [
    "One license per physical server (regardless of VM count)",
    "16-core minimum per physical server enforced",
    "Additional cores licensed in 2-core packs",
    "Unlimited Windows Server VMs on licensed host",
    "Ideal for high-density virtualization (13+ VMs per host)",
  ];

  // Standard Edition
  steps.push({ key: "standardTitle" });

  const standardCoresPerHost = Math.max(physicalCoresPerHost, minCores);
  const standardCorePacksPerHost = standardCoresPerHost / windowsServer.standard.coresPerPack;
  const standardLicensesRequired = Math.ceil(input.vmCount / windowsServer.standard.vmsPerLicense);
  const standardTotalCorePacks = standardLicensesRequired * standardCorePacksPerHost;
  const standardTotalCost = standardTotalCorePacks * windowsServer.standard.pricePerCorePack;

  steps.push({ key: "stdMinCores", params: { minCores } });
  steps.push({
    key: "stdLicensedCoresPerHost",
    params: {
      physicalCoresPerHost,
      minCores,
      standardCoresPerHost,
    },
  });
  steps.push({
    key: "stdCorePacksPerLicense",
    params: {
      standardCoresPerHost,
      coresPerPack: windowsServer.standard.coresPerPack,
      standardCorePacksPerHost,
    },
  });
  steps.push({
    key: "stdVmsPerLicense",
    params: { vmsPerLicense: windowsServer.standard.vmsPerLicense },
  });
  steps.push({
    key: "stdLicensesRequired",
    params: {
      vmCount: input.vmCount,
      vmsPerLicense: windowsServer.standard.vmsPerLicense,
      standardLicensesRequired,
    },
  });
  steps.push({
    key: "stdTotalCorePacks",
    params: {
      standardLicensesRequired,
      standardCorePacksPerHost,
      standardTotalCorePacks,
    },
  });
  steps.push({
    key: "stdCostPerCorePack",
    params: {
      pricePerCorePack: windowsServer.standard.pricePerCorePack.toLocaleString(),
    },
  });
  steps.push({
    key: "stdTotalCost",
    params: {
      standardTotalCorePacks,
      pricePerCorePack: windowsServer.standard.pricePerCorePack.toLocaleString(),
      totalCost: standardTotalCost.toLocaleString(),
    },
  });
  steps.push({
    key: "stdVmsIncluded",
    params: {
      vmCount: input.vmCount,
      vmsPerLicense: windowsServer.standard.vmsPerLicense,
    },
  });

  const standardNotes = [
    "Each license covers 2 Windows Server VMs",
    "16-core minimum per physical server enforced",
    "Additional cores licensed in 2-core packs",
    `Requires ${standardLicensesRequired} licenses for ${input.vmCount} VMs`,
    "More cost-effective for low-density virtualization (<13 VMs per host)",
  ];

  // Comparison
  steps.push({ key: "comparisonTitle" });

  const savings = standardTotalCost - datacenterTotalCost;
  const savingsPercent = (savings / standardTotalCost) * 100;
  const recommendation: WindowsServerEdition =
    datacenterTotalCost < standardTotalCost ? "datacenter" : "standard";
  const breakEvenVms = windowsServer.datacenter.breakEvenVms;
  const currentVmsPerHost = input.vmCount / input.hostCount;

  steps.push({
    key: "comparisonDatacenterTotal",
    params: { totalCost: datacenterTotalCost.toLocaleString() },
  });
  steps.push({
    key: "comparisonStandardTotal",
    params: { totalCost: standardTotalCost.toLocaleString() },
  });

  if (recommendation === "datacenter") {
    steps.push({
      key: "savingsWithDatacenter",
      params: {
        savings: Math.abs(savings).toLocaleString(),
        savingsPercent: Math.abs(savingsPercent).toFixed(1),
      },
    });
    steps.push({ key: "recommendationDatacenter" });
  } else {
    steps.push({
      key: "savingsWithStandard",
      params: {
        savings: Math.abs(savings).toLocaleString(),
        savingsPercent: Math.abs(savingsPercent).toFixed(1),
      },
    });
    steps.push({ key: "recommendationStandard" });
  }

  steps.push({ key: "breakEvenPoint", params: { breakEvenVms } });
  steps.push({
    key: "currentDensity",
    params: { currentVmsPerHost: currentVmsPerHost.toFixed(1) },
  });

  if (currentVmsPerHost >= breakEvenVms) {
    steps.push({
      key: "densityExceedsBreakEven",
      params: {
        currentVmsPerHost: currentVmsPerHost.toFixed(1),
        breakEvenVms,
      },
    });
    steps.push({ key: "datacenterMoreCostEffective" });
  } else {
    steps.push({
      key: "densityBelowBreakEven",
      params: {
        currentVmsPerHost: currentVmsPerHost.toFixed(1),
        breakEvenVms,
      },
    });
    steps.push({ key: "standardMoreCostEffective" });
  }

  // Check pricing staleness
  const staleness = checkPricingStaleness(licensingData.lastUpdated, licensingData.staleDays);

  let pricingWarning:
    | { lastUpdated: string; daysOld: number; warning: string; vendorUrl: string }
    | undefined;
  if (staleness.isStale) {
    pricingWarning = {
      lastUpdated: licensingData.lastUpdated,
      daysOld: staleness.daysOld,
      warning: licensingData.staleWarning,
      vendorUrl: windowsServer.datacenter.vendorUrl,
    };

    steps.push({
      key: "pricingStaleWarning",
      params: {
        daysOld: staleness.daysOld,
        lastUpdated: licensingData.lastUpdated,
      },
    });
    steps.push({
      key: "pricingVerifyUrl",
      params: { vendorUrl: windowsServer.datacenter.vendorUrl },
    });
  }

  return {
    ok: true,
    value: {
      datacenter: {
        edition: windowsServer.datacenter.edition,
        totalCores: totalPhysicalCores,
        coresPerHost: datacenterCoresPerHost,
        corePacksPerHost: datacenterCorePacksPerHost,
        totalCorePacks: datacenterTotalCorePacks,
        costPerCorePack: windowsServer.datacenter.pricePerCorePack,
        totalCost: datacenterTotalCost,
        vmsIncluded: "Unlimited",
        notes: datacenterNotes,
      },
      standard: {
        edition: windowsServer.standard.edition,
        totalCores: totalPhysicalCores,
        coresPerHost: standardCoresPerHost,
        corePacksPerHost: standardCorePacksPerHost,
        licensesRequired: standardLicensesRequired,
        totalCorePacks: standardTotalCorePacks,
        costPerCorePack: windowsServer.standard.pricePerCorePack,
        totalCost: standardTotalCost,
        vmsIncluded: input.vmCount,
        notes: standardNotes,
      },
      comparison: {
        savings: Math.abs(savings),
        savingsPercent: Math.abs(savingsPercent),
        recommendation,
        breakEvenVms,
        currentVmsPerHost,
      },
      pricingWarning,
      steps,
    },
  };
}
