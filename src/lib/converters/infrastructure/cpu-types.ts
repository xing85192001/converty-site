/**
 * CPU Database Types
 * Supports CPU Comparison (Phase 38) and Server Refresh (Phase 39) calculators.
 * SPECint2017 scores sourced from public SPEC.org submissions.
 */

export type CpuVendor = "intel" | "amd" | "arm";

export type CpuGeneration =
  | "current" // Sapphire Rapids, Emerald Rapids, Genoa, Turin, Bergamo, Altra Max
  | "previous"; // Cascade Lake, Ice Lake, Broadwell-EP, Milan, Rome, Altra Q-series

export interface CpuEntry {
  /** Unique kebab-case identifier, e.g. "intel-xeon-8592+" */
  id: string;
  vendor: CpuVendor;
  /** Marketing name, e.g. "Intel Xeon Platinum 8592+" */
  name: string;
  /** Microarchitecture family, e.g. "Sapphire Rapids", "Genoa", "Altra" */
  family: string;
  generation: CpuGeneration;
  /** Total physical core count */
  cores: number;
  /** Hardware threads per core (typically 2 for SMT/HT, 1 for no SMT) */
  threadsPerCore: number;
  /** Thermal Design Power in watts */
  tdpW: number;
  /** CPU socket type, e.g. "LGA4677", "SP5", "ALTRA" */
  socketType: string;
  /** SPECint2017 Rate Base score (1-copy baseline, lower is slower) */
  specint2017Base: number;
  /** SPECint2017 Rate Peak score (optimized compiler flags) */
  specint2017Peak: number;
  /** Year CPU was released or became available */
  releaseYear: number;
  /** Optional notes, caveats, or submission context */
  notes?: string;
}

export interface CpuDatabase {
  /** ISO 8601 date of last data curation, e.g. "2024-12-01" */
  dataAsOf: string;
  /** Number of days before the UI shows a staleness warning */
  staleDays: number;
  /** Human-readable staleness warning shown in UI after staleDays threshold */
  staleWarning: string;
  /** Source attribution */
  source: string;
  /** All curated CPU entries */
  cpus: CpuEntry[];
}
