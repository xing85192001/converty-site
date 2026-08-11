/**
 * Windows Server Licensing Calculator
 * Calculate Windows Server Datacenter vs Standard licensing costs
 */

import licensingData from "@/data/infrastructure/licensing-costs.json";
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
  steps: string[];
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

  const steps: string[] = [];
  const { windowsServer } = licensingData;

  steps.push("=== Windows Server Licensing Calculator ===");
  steps.push(`Hosts: ${input.hostCount}`);
  steps.push(`Cores per CPU: ${input.coresPerCpu}`);
  steps.push(`Sockets per host: ${input.socketsPerHost}`);
  steps.push(`VMs to license: ${input.vmCount}`);

  // Calculate total cores
  const physicalCoresPerHost = input.coresPerCpu * input.socketsPerHost;
  const totalPhysicalCores = physicalCoresPerHost * input.hostCount;

  steps.push(
    `\nPhysical cores per host: ${input.coresPerCpu} × ${input.socketsPerHost} = ${physicalCoresPerHost}`
  );
  steps.push(
    `Total physical cores: ${physicalCoresPerHost} × ${input.hostCount} = ${totalPhysicalCores}`
  );

  // Datacenter Edition
  steps.push("\n=== Datacenter Edition ===");

  const minCores = windowsServer.datacenter.minCoresPerServer;
  const datacenterCoresPerHost = Math.max(physicalCoresPerHost, minCores);
  const datacenterCorePacksPerHost = datacenterCoresPerHost / windowsServer.datacenter.coresPerPack;
  const datacenterTotalCorePacks = datacenterCorePacksPerHost * input.hostCount;
  const datacenterTotalCost = datacenterTotalCorePacks * windowsServer.datacenter.pricePerCorePack;

  steps.push(`Minimum cores per server: ${minCores}`);
  steps.push(
    `Licensed cores per host: max(${physicalCoresPerHost}, ${minCores}) = ${datacenterCoresPerHost}`
  );
  steps.push(
    `Core packs per host: ${datacenterCoresPerHost} / ${windowsServer.datacenter.coresPerPack} = ${datacenterCorePacksPerHost}`
  );
  steps.push(
    `Total core packs: ${datacenterCorePacksPerHost} × ${input.hostCount} hosts = ${datacenterTotalCorePacks}`
  );
  steps.push(`Cost per core pack: $${windowsServer.datacenter.pricePerCorePack.toLocaleString()}`);
  steps.push(
    `Total cost: ${datacenterTotalCorePacks} × $${windowsServer.datacenter.pricePerCorePack.toLocaleString()} = $${datacenterTotalCost.toLocaleString()}`
  );
  steps.push(`VMs included: Unlimited`);

  const datacenterNotes = [
    "One license per physical server (regardless of VM count)",
    "16-core minimum per physical server enforced",
    "Additional cores licensed in 2-core packs",
    "Unlimited Windows Server VMs on licensed host",
    "Ideal for high-density virtualization (13+ VMs per host)",
  ];

  // Standard Edition
  steps.push("\n=== Standard Edition ===");

  const standardCoresPerHost = Math.max(physicalCoresPerHost, minCores);
  const standardCorePacksPerHost = standardCoresPerHost / windowsServer.standard.coresPerPack;
  const standardLicensesRequired = Math.ceil(input.vmCount / windowsServer.standard.vmsPerLicense);
  const standardTotalCorePacks = standardLicensesRequired * standardCorePacksPerHost;
  const standardTotalCost = standardTotalCorePacks * windowsServer.standard.pricePerCorePack;

  steps.push(`Minimum cores per server: ${minCores}`);
  steps.push(
    `Licensed cores per host: max(${physicalCoresPerHost}, ${minCores}) = ${standardCoresPerHost}`
  );
  steps.push(
    `Core packs per license: ${standardCoresPerHost} / ${windowsServer.standard.coresPerPack} = ${standardCorePacksPerHost}`
  );
  steps.push(`VMs per license: ${windowsServer.standard.vmsPerLicense}`);
  steps.push(
    `Licenses required: ceil(${input.vmCount} / ${windowsServer.standard.vmsPerLicense}) = ${standardLicensesRequired}`
  );
  steps.push(
    `Total core packs: ${standardLicensesRequired} × ${standardCorePacksPerHost} = ${standardTotalCorePacks}`
  );
  steps.push(`Cost per core pack: $${windowsServer.standard.pricePerCorePack.toLocaleString()}`);
  steps.push(
    `Total cost: ${standardTotalCorePacks} × $${windowsServer.standard.pricePerCorePack.toLocaleString()} = $${standardTotalCost.toLocaleString()}`
  );
  steps.push(
    `VMs included: ${input.vmCount} (${windowsServer.standard.vmsPerLicense} per license)`
  );

  const standardNotes = [
    "Each license covers 2 Windows Server VMs",
    "16-core minimum per physical server enforced",
    "Additional cores licensed in 2-core packs",
    `Requires ${standardLicensesRequired} licenses for ${input.vmCount} VMs`,
    "More cost-effective for low-density virtualization (<13 VMs per host)",
  ];

  // Comparison
  steps.push("\n=== Cost Comparison ===");

  const savings = standardTotalCost - datacenterTotalCost;
  const savingsPercent = (savings / standardTotalCost) * 100;
  const recommendation: WindowsServerEdition =
    datacenterTotalCost < standardTotalCost ? "datacenter" : "standard";
  const breakEvenVms = windowsServer.datacenter.breakEvenVms;
  const currentVmsPerHost = input.vmCount / input.hostCount;

  steps.push(`Datacenter total: $${datacenterTotalCost.toLocaleString()}`);
  steps.push(`Standard total: $${standardTotalCost.toLocaleString()}`);

  if (recommendation === "datacenter") {
    steps.push(
      `Savings with Datacenter: $${Math.abs(savings).toLocaleString()} (${Math.abs(savingsPercent).toFixed(1)}%)`
    );
    steps.push(`✓ RECOMMENDATION: Datacenter Edition`);
  } else {
    steps.push(
      `Savings with Standard: $${Math.abs(savings).toLocaleString()} (${Math.abs(savingsPercent).toFixed(1)}%)`
    );
    steps.push(`✓ RECOMMENDATION: Standard Edition`);
  }

  steps.push(`\nBreak-even point: ~${breakEvenVms} VMs per host`);
  steps.push(`Current density: ${currentVmsPerHost.toFixed(1)} VMs per host`);

  if (currentVmsPerHost >= breakEvenVms) {
    steps.push(
      `Your VM density (${currentVmsPerHost.toFixed(1)}) exceeds break-even (${breakEvenVms})`
    );
    steps.push(`Datacenter Edition is more cost-effective`);
  } else {
    steps.push(
      `Your VM density (${currentVmsPerHost.toFixed(1)}) is below break-even (${breakEvenVms})`
    );
    steps.push(`Standard Edition is more cost-effective`);
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

    steps.push(
      `\n⚠️  WARNING: Pricing data is ${staleness.daysOld} days old (last updated: ${licensingData.lastUpdated})`
    );
    steps.push(`Please verify current prices at: ${windowsServer.datacenter.vendorUrl}`);
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
