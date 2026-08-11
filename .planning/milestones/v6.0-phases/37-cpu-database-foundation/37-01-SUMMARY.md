---
phase: 37-cpu-database-foundation
plan: "01"
subsystem: infrastructure
tags: [cpu, database, types, spec, infrastructure, typescript]
dependency_graph:
  requires: []
  provides:
    - CpuEntry interface (cpu-types.ts)
    - CpuDatabase interface (cpu-types.ts)
    - cpu-database.json with 17 CPU entries
  affects:
    - Phase 38 (CPU Comparison Calculator)
    - Phase 39 (Server Refresh Calculator)
tech_stack:
  added: []
  patterns:
    - Static JSON data file with staleness metadata (dataAsOf + staleDays pattern)
    - Strict TypeScript union types for vendor and generation
    - CpuEntry interface with optional notes field
key_files:
  created:
    - src/lib/converters/infrastructure/cpu-types.ts
    - src/lib/data/cpu-database.json
  modified: []
decisions:
  - CPU data sourced from public SPEC.org SPECint2017 Rate submissions, curated as build-time JSON
  - 90-day staleness threshold with staleWarning field following v4.0 licensing calculator precedent
  - CpuGeneration union type with "current" and "previous" to simplify server refresh comparisons
  - ARM/Ampere entries use vendor "arm" (not "ampere") to keep vendor enum minimal
metrics:
  duration: "~2 minutes"
  completed: "2026-02-23"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 37 Plan 01: CPU Database Foundation Summary

**One-liner:** CpuEntry TypeScript interface and 17-entry SPEC.org-sourced CPU database covering Intel Xeon Scalable, AMD EPYC, and ARM/Ampere across current and previous generations.

## What Was Built

Created the foundational CPU data layer required by Phase 38 (CPU Comparison) and Phase 39 (Server Refresh) calculators.

### Task 1: CpuEntry TypeScript Types (commit 59757c3)

Created `src/lib/converters/infrastructure/cpu-types.ts` with four exports:

- `CpuVendor` — union type: `"intel" | "amd" | "arm"`
- `CpuGeneration` — union type: `"current" | "previous"`
- `CpuEntry` — interface with all required fields plus optional `notes`
- `CpuDatabase` — interface with root metadata fields and `cpus: CpuEntry[]`

Zero `any` types. Strict TypeScript. Type-check passes with zero errors.

### Task 2: CPU Reference Data (commit dfa9b54)

Created `src/lib/data/cpu-database.json` with 17 CPU entries covering all 4 required families:

| Family | Vendor | Generation | Count |
|--------|--------|------------|-------|
| Sapphire Rapids (4th Gen Xeon) | Intel | current | 2 |
| Emerald Rapids (5th Gen Xeon) | Intel | current | 1 |
| Cascade Lake (2nd Gen Xeon) | Intel | previous | 1 |
| Ice Lake (3rd Gen Xeon) | Intel | previous | 1 |
| Broadwell-EP (1st Gen Xeon) | Intel | previous | 1 |
| Genoa (EPYC 9004) | AMD | current | 2 |
| Turin (EPYC 9005) | AMD | current | 2 |
| Bergamo (EPYC density variant) | AMD | current | 1 |
| Milan (EPYC 7003) | AMD | previous | 2 |
| Rome (EPYC 7002) | AMD | previous | 1 |
| Altra Q-series | ARM/Ampere | previous | 2 |
| Altra Max | ARM/Ampere | current | 1 |

Root metadata: `dataAsOf: "2024-12-01"`, `staleDays: 90`, `staleWarning`, `source` (spec.org URL).

## Verification Results

All success criteria met:
- `npm run type-check` passes with zero errors
- 17 entries in cpu-database.json (requirement: 15+)
- Vendors represented: amd, arm, intel
- Generations represented: current, previous
- Zero `any` types in cpu-types.ts

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files Verified

- FOUND: src/lib/converters/infrastructure/cpu-types.ts
- FOUND: src/lib/data/cpu-database.json

### Commits Verified

- FOUND: 59757c3 — feat(37-01): add CpuEntry TypeScript type definitions
- FOUND: dfa9b54 — feat(37-01): add CPU reference database with 17 entries covering all 4 families

## Self-Check: PASSED
