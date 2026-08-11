---
phase: 39-server-refresh-calculator
plan: "01"
subsystem: infra
tags: [typescript, specint2017, cpu, server-refresh, fleet-sizing, infrastructure]

# Dependency graph
requires:
  - phase: 37-cpu-database-foundation
    provides: CpuDatabase, CpuEntry types and cpu-database.json data file
  - phase: 38-cpu-comparison-calculator
    provides: cpu-comparison.ts staleness pattern and getFilteredCpus precedent
provides:
  - ServerRefreshInput, FleetSummary, ServerRefreshResult TypeScript interfaces
  - calculateServerRefresh pure function (throughput matching, headroom, chassis, power budget)
  - getServerRefreshCpus helper returning all CPUs sorted by SPECint2017 peak
  - Re-export from infrastructure/index.ts
affects: [39-server-refresh-ui, 39-server-refresh-i18n]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "String-typed inputs for URL sync compatibility with createCalculatorStore"
    - "Null return for invalid inputs (division by zero, unknown CPU IDs, zero counts)"
    - "Staleness check via daysOld > staleDays from cpu-database.json"
    - "Chassis constraint switch block: 1u-single forces sockets=1, 2u-dual caps at 2"

key-files:
  created:
    - src/lib/converters/infrastructure/server-refresh.ts
  modified:
    - src/lib/converters/infrastructure/index.ts

key-decisions:
  - "Used getServerRefreshCpus() (not re-exporting getFilteredCpus) to avoid naming conflicts and serve single combined list without vendor/generation filter"
  - "effectiveSockets derived from chassisConstraint at calculation time, not stored separately"
  - "serversPerRack and racksNeeded are null (not 0) when powerBudgetW <= 0 for clean UI conditional rendering"

patterns-established:
  - "Power budget produces serversPerRack/racksNeeded null pair when not applicable"
  - "Math.round for totals (TDP, SPECint), Math.ceil for counts (servers, racks)"

requirements-completed: [REFRESH-01, REFRESH-02, REFRESH-03, REFRESH-04, REFRESH-05, REFRESH-06, REFRESH-07]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 39 Plan 01: Server Refresh Calculator Summary

**SPECint2017 fleet refresh calculation module with throughput matching, headroom buffer, chassis constraints, and per-rack power budget — pure TypeScript, null-safe, URL-sync ready**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-23T15:37:10Z
- **Completed:** 2026-02-23T15:38:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `server-refresh.ts` with full TypeScript interfaces and calculation logic for server fleet refresh
- Implemented `calculateServerRefresh` with SPECint2017 throughput matching, headroom buffer, chassis constraint enforcement, and optional power budget / rack density calculation
- Implemented `getServerRefreshCpus` returning all CPU entries sorted by SPECint2017 peak for dropdown selectors
- Added re-export to `infrastructure/index.ts` with zero naming conflicts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create server-refresh.ts pure calculation module** - `390c1e5` (feat)
2. **Task 2: Re-export server-refresh from infrastructure index** - `baae93d` (feat)

## Files Created/Modified

- `src/lib/converters/infrastructure/server-refresh.ts` - Pure calculation module: ServerRefreshInput, FleetSummary, ServerRefreshResult interfaces; calculateServerRefresh and getServerRefreshCpus functions
- `src/lib/converters/infrastructure/index.ts` - Added `export * from "./server-refresh"` re-export line

## Decisions Made

- Used `getServerRefreshCpus()` (dedicated function) instead of re-exporting `getFilteredCpus` from cpu-comparison to avoid naming conflicts and to serve a single unfiltered list (server refresh allows picking any CPU model)
- `serversPerRack` and `racksNeeded` are typed as `number | null` (null when powerBudgetW is 0) rather than 0, enabling clean conditional rendering in the UI component
- Chassis constraint applied as a switch block at calculation time; `effectiveSockets` is the resolved value used for all fleet math

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Pure calculation layer complete; ready for Plan 02 (UI component) and Plan 03 (i18n)
- `calculateServerRefresh` returns `null` for invalid inputs, matching the pattern used by `calculateCpuComparison` for safe UI rendering
- `getServerRefreshCpus()` provides the full CPU list for old/new CPU selector dropdowns

## Self-Check: PASSED

- FOUND: src/lib/converters/infrastructure/server-refresh.ts
- FOUND: src/lib/converters/infrastructure/index.ts (with server-refresh re-export)
- FOUND: .planning/phases/39-server-refresh-calculator/39-01-SUMMARY.md
- FOUND commit: 390c1e5 (feat: create server-refresh.ts)
- FOUND commit: baae93d (feat: re-export server-refresh from index)
- TypeScript check: TSC_EXIT 0 (zero errors)

---
*Phase: 39-server-refresh-calculator*
*Completed: 2026-02-23*
