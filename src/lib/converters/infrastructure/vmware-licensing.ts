/**
 * VMware Licensing Calculator
 *
 * Calculates VMware VCF/VVF licensing costs based on core count with
 * 16-core minimum per CPU socket enforcement and vSAN entitlement calculation.
 *
 * Based on VMware/Broadcom 2026 subscription pricing model.
 * Reference: https://kb.vmware.com/s/article/95927
 */

import type { CalculationResult } from "@/types";

/**
 * VMware product pricing (2026 list prices, USD per core per year)
 */
const PRICING = {
  vcf: 350, // VMware Cloud Foundation - $350/core/year
  vvf: 135, // VMware vSphere Foundation - $135/core/year
  "vsphere-ep": 95, // vSphere Enterprise Plus - $95/core/year (estimated)
  "vsphere-std": 50, // vSphere Standard - $50/core/year (estimated)
} as const;

/**
 * vSAN storage entitlement (TiB per licensed core)
 */
const VSAN_ENTITLEMENT = {
  vcf: 1.0, // VMware Cloud Foundation: 1 TiB per core
  vvf: 0.25, // VMware vSphere Foundation: 0.25 TiB per core
} as const;

/**
 * Input parameters for VMware licensing calculation
 */
export interface VmwareLicensingInput {
  /** Number of ESX hosts */
  hostCount: number;
  /** Number of CPU sockets per host (typically 2) */
  cpusPerHost: number;
  /** Cores per CPU socket */
  coresPerCpu: number;
  /** VMware product type */
  productType: "vcf" | "vvf" | "vsphere-ep" | "vsphere-std";
  /** Subscription term in years */
  termYears: 1 | 3 | 5;
}

/**
 * Detailed breakdown of VMware licensing costs
 */
export interface VmwareLicensingResult {
  /** Total physical cores across all hosts */
  totalPhysicalCores: number;
  /** Total cores to be licensed (after 16-core minimum) */
  totalLicensedCores: number;
  /** Cores licensed per CPU (max of actual or 16) */
  coresPerCpuLicensed: number;
  /** Price per core per year */
  pricePerCorePerYear: number;
  /** Annual licensing cost */
  annualCost: number;
  /** Total cost over subscription term */
  totalCost: number;
  /** vSAN storage entitlement in TiB (null for vSphere-only products) */
  vsanEntitlementTib: number | null;
  /** True if 16-core minimum was enforced */
  minCoreEnforced: boolean;
  /** Step-by-step calculation breakdown */
  steps: string[];
}

/**
 * Calculate VMware VCF/VVF licensing costs
 *
 * Implements VMware's core-based licensing model with 16-core minimum per CPU.
 * All physical cores must be licensed, subject to minimum of 16 cores per CPU socket.
 *
 * @param input - VMware licensing calculation parameters
 * @returns Detailed cost breakdown or null if invalid input
 *
 * @example
 * // Calculate VCF licensing for 4 hosts, 2 CPUs, 16 cores per CPU, 3-year term
 * const result = calculateVmwareLicensing({
 *   hostCount: 4,
 *   cpusPerHost: 2,
 *   coresPerCpu: 16,
 *   productType: "vcf",
 *   termYears: 3
 * });
 */
export function calculateVmwareLicensing(
  input: VmwareLicensingInput
): CalculationResult<VmwareLicensingResult> {
  const steps: string[] = [];

  // Validation: Positive host configuration
  if (input.hostCount <= 0 || input.cpusPerHost <= 0 || input.coresPerCpu <= 0) {
    return {
      ok: false,
      error: "Host count, CPUs per host, and cores per CPU must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Validation: Valid product type
  if (!Object.hasOwn(PRICING, input.productType)) {
    return {
      ok: false,
      error: `Unknown product type: ${input.productType}`,
      code: "INVALID_INPUT",
    };
  }

  // Validation: Valid term years
  if (![1, 3, 5].includes(input.termYears)) {
    return { ok: false, error: "Term years must be 1, 3, or 5", code: "INVALID_INPUT" };
  }

  // Step 1: Calculate total physical cores
  const totalPhysicalCores = input.hostCount * input.cpusPerHost * input.coresPerCpu;

  steps.push(
    `Total physical cores: ${input.hostCount} hosts × ${input.cpusPerHost} CPUs × ${input.coresPerCpu} cores = ${totalPhysicalCores} cores`
  );

  // Step 2: Apply 16-core minimum per CPU
  const coresPerCpuLicensed = Math.max(input.coresPerCpu, 16);
  const minCoreEnforced = input.coresPerCpu < 16;

  if (minCoreEnforced) {
    steps.push(
      `16-core minimum per CPU: ${input.coresPerCpu} cores → ${coresPerCpuLicensed} cores (minimum enforced)`
    );
  } else {
    steps.push(`Cores per CPU (licensed): ${coresPerCpuLicensed} cores`);
  }

  // Step 3: Calculate total licensed cores
  const totalLicensedCores = input.hostCount * input.cpusPerHost * coresPerCpuLicensed;

  steps.push(
    `Total licensed cores: ${input.hostCount} hosts × ${input.cpusPerHost} CPUs × ${coresPerCpuLicensed} cores = ${totalLicensedCores} cores`
  );

  // Step 4: Get pricing for product type
  const pricePerCorePerYear = PRICING[input.productType];

  const productNames: Record<typeof input.productType, string> = {
    vcf: "VMware Cloud Foundation",
    vvf: "VMware vSphere Foundation",
    "vsphere-ep": "vSphere Enterprise Plus",
    "vsphere-std": "vSphere Standard",
  };

  steps.push(`${productNames[input.productType]}: $${pricePerCorePerYear}/core/year`);

  // Step 5: Calculate annual cost
  const annualCost = totalLicensedCores * pricePerCorePerYear;

  steps.push(
    `Annual cost: ${totalLicensedCores} cores × $${pricePerCorePerYear} = $${annualCost.toLocaleString()}`
  );

  // Step 6: Calculate total cost over term
  const totalCost = annualCost * input.termYears;

  steps.push(
    `Total cost (${input.termYears}-year term): $${annualCost.toLocaleString()} × ${input.termYears} = $${totalCost.toLocaleString()}`
  );

  // Step 7: Calculate vSAN entitlement (if applicable)
  const vsanEntitlementTib =
    input.productType in VSAN_ENTITLEMENT
      ? totalLicensedCores * VSAN_ENTITLEMENT[input.productType as keyof typeof VSAN_ENTITLEMENT]
      : null;

  if (vsanEntitlementTib !== null) {
    steps.push(
      `vSAN entitlement: ${totalLicensedCores} cores × ${VSAN_ENTITLEMENT[input.productType as keyof typeof VSAN_ENTITLEMENT]} TiB/core = ${vsanEntitlementTib.toFixed(2)} TiB`
    );
  } else {
    steps.push(
      `vSAN entitlement: Not included (${productNames[input.productType]} does not include vSAN)`
    );
  }

  return {
    ok: true,
    value: {
      totalPhysicalCores,
      totalLicensedCores,
      coresPerCpuLicensed,
      pricePerCorePerYear,
      annualCost,
      totalCost,
      vsanEntitlementTib,
      minCoreEnforced,
      steps,
    },
  };
}
