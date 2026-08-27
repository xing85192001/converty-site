/**
 * Infrastructure & Virtualization Types
 */

/**
 * Hypervisor platforms supported
 */
export type HypervisorPlatform = "vmware" | "hyperv" | "proxmox" | "xcp-ng";

/**
 * Hypervisor overhead data
 */
export interface HypervisorOverhead {
  id: HypervisorPlatform;
  name: string;
  cpuOverhead: {
    description: string;
    percent: number;
    notes: string;
  };
  memoryOverhead: {
    description: string;
    hypervisorReserved: number;
    perVmOverheadMB: number;
    notes: string;
  };
  diskFormats: Record<
    string,
    {
      name: string;
      multiplier: number;
      description: string;
    }
  >;
  snapshotOverhead: {
    multiplier: number;
    description: string;
  };
  replicationOverhead: {
    multiplier: number;
    description: string;
  };
  haOverhead: {
    n_plus_1: {
      description: string;
      formula: string;
    };
    n_plus_2: {
      description: string;
      formula: string;
    };
  };
  licensing?: {
    datacenter?: {
      coresPerLicense: number;
      minCoresPerServer: number;
      corePacks: number;
      unlimitedVms: boolean;
      description: string;
    };
    standard?: {
      coresPerLicense: number;
      minCoresPerServer: number;
      corePacks: number;
      vmsPerLicense: number;
      description: string;
    };
  };
}

/**
 * Windows Server edition
 */
export type WindowsServerEdition = "datacenter" | "standard";

/**
 * Licensing cost data
 */
export interface LicensingCosts {
  lastUpdated: string;
  currency: string;
  disclaimer: string;
  sources: {
    microsoft: string;
    broadcom: string;
  };
  windowsServer: {
    datacenter: {
      edition: string;
      pricePerCorePack: number;
      coresPerPack: number;
      minCoresPerServer: number;
      unlimitedVms: true;
      description: string;
      notes: string;
      breakEvenVms: number;
      vendorUrl: string;
    };
    standard: {
      edition: string;
      pricePerCorePack: number;
      coresPerPack: number;
      minCoresPerServer: number;
      vmsPerLicense: number;
      description: string;
      notes: string;
      breakEvenVms: number;
      vendorUrl: string;
    };
  };
  vmware: Record<string, unknown>;
  hyperv: Record<string, unknown>;
  proxmox: Record<string, unknown>;
  xcpng: Record<string, unknown>;
  staleDays: number;
  staleWarning: string;
}

/**
 * High Availability mode
 */
export type HaMode = "n_plus_1" | "n_plus_2" | "none";
