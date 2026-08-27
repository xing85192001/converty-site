/**
 * Server Refresh Calculator - Pure calculation module
 * Supports Phase 39: Server Refresh Calculator
 * Models a server fleet migration using SPECint2017 throughput matching.
 */

import cpuDatabaseRaw from "@/lib/data/cpu-database.json";
import type { CalculationResult } from "@/types";
import type { CpuDatabase, CpuEntry } from "./cpu-types";

const cpuDatabase = cpuDatabaseRaw as CpuDatabase;

/**
 * Input for the server refresh calculator.
 * All fields are strings for URL sync compatibility with createCalculatorStore.
 */
export interface ServerRefreshInput {
  /** CPU ID from the database for the old fleet */
  oldCpuId: string;
  /** Sockets per old server (e.g. "2") */
  oldSocketsPerServer: string;
  /** Number of old servers (e.g. "20") */
  oldServerCount: string;
  /** Target CPU ID for the new fleet */
  newCpuId: string;
  /** Sockets per new server ("1" or "2"), constrained by chassis */
  newSocketsPerServer: string;
  /** Growth buffer percentage as integer string (e.g. "25" for 25%) */
  headroomPct: string;
  /** Chassis constraint: "none" | "1u-single" | "2u-dual" */
  chassisConstraint: string;
  /** Watts per rack budget (e.g. "10000"), "0" means no budget */
  powerBudgetW: string;
}

/**
 * Summary of a server fleet (old or new).
 */
export interface FleetSummary {
  serverCount: number;
  socketsPerServer: number;
  totalSockets: number;
  totalCores: number;
  totalTdpW: number;
  /** Total SPECint2017 peak (totalSockets × CPU specint2017Peak) */
  totalSpecint: number;
}

/**
 * Result of the server refresh calculation.
 */
export interface ServerRefreshResult {
  oldFleet: FleetSummary;
  newFleet: FleetSummary;
  /** oldFleet.totalSpecint × (1 + headroomPct/100) */
  requiredSpecint: number;
  /** Minimum number of new servers to meet requiredSpecint */
  minNewServerCount: number;
  /** newCpu.specint2017Peak × effectiveSockets */
  specintPerNewServer: number;
  headroomPct: number;
  /** 0 if no power budget specified */
  powerBudgetW: number;
  /** Math.floor(powerBudgetW / singleServerTdpW), or null if no budget */
  serversPerRack: number | null;
  /** Math.ceil(newFleet.serverCount / serversPerRack), or null if no budget */
  racksNeeded: number | null;
  dataAsOf: string;
  isStale: boolean;
  staleWarning?: string;
}

/**
 * Returns all CPUs from the database sorted by specint2017Peak descending.
 * Used for both old and new CPU selectors in the server refresh calculator.
 */
export function getServerRefreshCpus(): CpuEntry[] {
  return [...cpuDatabase.cpus].sort((a, b) => b.specint2017Peak - a.specint2017Peak);
}

/**
 * Calculates the minimum new server fleet needed to replace an old fleet
 * while matching (or exceeding) its total SPECint2017 throughput.
 *
 * Returns null for invalid inputs (unknown CPU IDs, server count <= 0,
 * division by zero, etc.).
 */
export function calculateServerRefresh(
  input: ServerRefreshInput
): CalculationResult<ServerRefreshResult> {
  // Parse all string inputs to numbers
  const oldSocketsPerServer = Number.parseInt(input.oldSocketsPerServer, 10);
  const oldServerCount = Number.parseInt(input.oldServerCount, 10);
  const newSocketsPerServerRaw = Number.parseInt(input.newSocketsPerServer, 10);
  const headroomPct = Number.parseFloat(input.headroomPct);
  const powerBudgetW = Number.parseFloat(input.powerBudgetW);

  // Validate parsed inputs
  if (
    !Number.isFinite(oldSocketsPerServer) ||
    oldSocketsPerServer <= 0 ||
    !Number.isFinite(oldServerCount) ||
    oldServerCount <= 0 ||
    !Number.isFinite(newSocketsPerServerRaw) ||
    newSocketsPerServerRaw <= 0 ||
    !Number.isFinite(headroomPct) ||
    !Number.isFinite(powerBudgetW)
  ) {
    return {
      ok: false,
      error: "Invalid server refresh inputs — check socket counts and headroom values",
      code: "INVALID_INPUT",
    };
  }

  // Look up CPUs from database
  const oldCpu = cpuDatabase.cpus.find((cpu) => cpu.id === input.oldCpuId);
  const newCpu = cpuDatabase.cpus.find((cpu) => cpu.id === input.newCpuId);

  if (!oldCpu || !newCpu) {
    return { ok: false, error: "One or both CPU IDs not found in database", code: "INVALID_INPUT" };
  }

  // Apply chassis constraint to effective sockets per new server
  let effectiveSockets: number;
  switch (input.chassisConstraint) {
    case "1u-single":
      effectiveSockets = 1;
      break;
    case "2u-dual":
      effectiveSockets = Math.min(newSocketsPerServerRaw, 2);
      break;
    default:
      // "none" or any unrecognized value → use parsed value as-is
      effectiveSockets = newSocketsPerServerRaw;
      break;
  }

  // Compute old fleet summary
  const oldTotalSockets = oldSocketsPerServer * oldServerCount;
  const oldTotalCores = oldTotalSockets * oldCpu.cores;
  const oldTotalTdpW = Math.round(oldServerCount * (oldSocketsPerServer * oldCpu.tdpW));
  const oldTotalSpecint = Math.round(oldTotalSockets * oldCpu.specint2017Peak);

  const oldFleet: FleetSummary = {
    serverCount: oldServerCount,
    socketsPerServer: oldSocketsPerServer,
    totalSockets: oldTotalSockets,
    totalCores: oldTotalCores,
    totalTdpW: oldTotalTdpW,
    totalSpecint: oldTotalSpecint,
  };

  // Compute required SPECint with headroom buffer
  const requiredSpecint = oldFleet.totalSpecint * (1 + headroomPct / 100);

  // Compute SPECint delivered per new server
  const specintPerNewServer = effectiveSockets * newCpu.specint2017Peak;

  // Guard against division by zero
  if (specintPerNewServer === 0) {
    return {
      ok: false,
      error: "New CPU has zero SPECint score — cannot calculate sizing",
      code: "INVALID_INPUT",
    };
  }

  // Compute minimum new server count
  const minNewServerCount = Math.ceil(requiredSpecint / specintPerNewServer);

  // Build new fleet summary
  const newTotalSockets = effectiveSockets * minNewServerCount;
  const newTotalCores = newTotalSockets * newCpu.cores;
  const newTotalTdpW = Math.round(minNewServerCount * (effectiveSockets * newCpu.tdpW));
  const newTotalSpecint = Math.round(newTotalSockets * newCpu.specint2017Peak);

  const newFleet: FleetSummary = {
    serverCount: minNewServerCount,
    socketsPerServer: effectiveSockets,
    totalSockets: newTotalSockets,
    totalCores: newTotalCores,
    totalTdpW: newTotalTdpW,
    totalSpecint: newTotalSpecint,
  };

  // Power budget calculations
  let serversPerRack: number | null = null;
  let racksNeeded: number | null = null;

  if (powerBudgetW > 0) {
    const singleServerTdpW = effectiveSockets * newCpu.tdpW;
    if (singleServerTdpW > 0) {
      serversPerRack = Math.floor(powerBudgetW / singleServerTdpW);
      if (serversPerRack > 0) {
        racksNeeded = Math.ceil(minNewServerCount / serversPerRack);
      }
    }
  }

  // Staleness check (same pattern as cpu-comparison.ts)
  const daysOld = Math.floor((Date.now() - new Date(cpuDatabase.dataAsOf).getTime()) / 86400000);
  const isStale = daysOld > cpuDatabase.staleDays;

  return {
    ok: true,
    value: {
      oldFleet,
      newFleet,
      requiredSpecint: Math.round(requiredSpecint),
      minNewServerCount,
      specintPerNewServer,
      headroomPct,
      powerBudgetW,
      serversPerRack,
      racksNeeded,
      dataAsOf: cpuDatabase.dataAsOf,
      isStale,
      staleWarning: isStale ? cpuDatabase.staleWarning : undefined,
    },
  };
}
