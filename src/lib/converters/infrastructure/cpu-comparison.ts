/**
 * CPU Comparison Calculator - Pure calculation module
 * Supports Phase 38: CPU Comparison Calculator
 * SPECint2017 scores sourced from public SPEC.org submissions.
 */

import cpuDatabaseRaw from "@/lib/data/cpu-database.json";
import type { CalculationResult } from "@/types";
import type { CpuDatabase, CpuEntry, CpuGeneration, CpuVendor } from "./cpu-types";

const cpuDatabase = cpuDatabaseRaw as CpuDatabase;

export interface CpuComparisonInput {
  /** Comma-separated CPU IDs for URL sync, e.g. "intel-xeon-platinum-8592plus,amd-epyc-9654" */
  cpuIds: string;
  /** Vendor filter: "all" | "intel" | "amd" | "arm" */
  vendor: string;
  /** Generation filter: "all" | "current" | "previous" */
  generation: string;
}

export interface CpuComparisonRow {
  id: string;
  name: string;
  vendor: CpuVendor;
  family: string;
  generation: CpuGeneration;
  cores: number;
  tdpW: number;
  socketType: string;
  specint2017Base: number;
  specint2017Peak: number;
  /** specint2017Peak / cores, rounded to 2 decimal places */
  perfPerCore: number;
  /** specint2017Peak / tdpW, rounded to 2 decimal places */
  perfPerWatt: number;
  /**
   * Sizing ratio vs the first selected CPU.
   * For CPU[0]: always 1.0
   * For CPU[N]: cpu[0].specint2017Peak / cpuN.specint2017Peak
   * Interpretation: "You need N units of this CPU to match CPU[0]'s performance"
   */
  sizingRatioVsFirst: number;
  /** Optional notes from the database entry */
  notes?: string;
}

export interface CpuComparisonResult {
  rows: CpuComparisonRow[];
  /** The baseline CPU (first selected) */
  baselineCpuId: string;
  /** ISO date string of database data freshness */
  dataAsOf: string;
  /** Whether the data is older than staleDays */
  isStale: boolean;
  /** Human-readable staleness warning, only populated when isStale is true */
  staleWarning?: string;
}

/**
 * Returns CPUs from the database filtered by vendor and/or generation,
 * sorted by specint2017Peak descending (highest first).
 */
export function getFilteredCpus(vendor: string, generation: string): CpuEntry[] {
  let cpus = [...cpuDatabase.cpus];

  if (vendor !== "all") {
    cpus = cpus.filter((entry) => entry.vendor === vendor);
  }

  if (generation !== "all") {
    cpus = cpus.filter((entry) => entry.generation === generation);
  }

  return cpus.sort((a, b) => b.specint2017Peak - a.specint2017Peak);
}

/**
 * Calculates CPU comparison metrics for 2–4 selected CPUs.
 * Returns null if fewer than 2 valid CPU IDs are provided.
 */
export function calculateCpuComparison(
  input: CpuComparisonInput
): CalculationResult<CpuComparisonResult> {
  // Parse and look up CPU IDs
  const rawIds = input.cpuIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const cpus: CpuEntry[] = [];
  for (const id of rawIds) {
    const found = cpuDatabase.cpus.find((cpu) => cpu.id === id);
    if (found) {
      cpus.push(found);
    }
  }

  // Need at least 2 valid CPUs
  if (cpus.length < 2) {
    return {
      ok: false,
      error: "At least 2 valid CPU IDs are required for comparison",
      code: "INVALID_INPUT",
    };
  }

  // Clamp to 4 CPUs maximum
  const selectedCpus = cpus.slice(0, 4);

  // Build comparison rows
  const rows: CpuComparisonRow[] = selectedCpus.map((cpu, i) => {
    const perfPerCore = Math.round((cpu.specint2017Peak / cpu.cores) * 100) / 100;
    const perfPerWatt = cpu.tdpW > 0 ? Math.round((cpu.specint2017Peak / cpu.tdpW) * 100) / 100 : 0;
    const sizingRatioVsFirst =
      i === 0
        ? 1.0
        : Math.round((selectedCpus[0].specint2017Peak / cpu.specint2017Peak) * 100) / 100;

    const row: CpuComparisonRow = {
      id: cpu.id,
      name: cpu.name,
      vendor: cpu.vendor,
      family: cpu.family,
      generation: cpu.generation,
      cores: cpu.cores,
      tdpW: cpu.tdpW,
      socketType: cpu.socketType,
      specint2017Base: cpu.specint2017Base,
      specint2017Peak: cpu.specint2017Peak,
      perfPerCore,
      perfPerWatt,
      sizingRatioVsFirst,
    };

    if (cpu.notes !== undefined) {
      row.notes = cpu.notes;
    }

    return row;
  });

  // Compute staleness
  const daysOld = Math.floor((Date.now() - new Date(cpuDatabase.dataAsOf).getTime()) / 86400000);
  const isStale = daysOld > cpuDatabase.staleDays;

  return {
    ok: true,
    value: {
      rows,
      baselineCpuId: selectedCpus[0].id,
      dataAsOf: cpuDatabase.dataAsOf,
      isStale,
      staleWarning: isStale ? cpuDatabase.staleWarning : undefined,
    },
  };
}
