---
phase: 38-cpu-comparison-calculator
plan: "01"
subsystem: infrastructure-converters
tags:
  - cpu-comparison
  - pure-functions
  - typescript
  - specint2017
dependency_graph:
  requires:
    - "37-01 (CpuEntry, CpuVendor, CpuGeneration types in cpu-types.ts)"
    - "37-01 (cpu-database.json with 17 CPU entries)"
  provides:
    - "CpuComparisonInput interface"
    - "CpuComparisonRow interface"
    - "CpuComparisonResult interface"
    - "calculateCpuComparison function"
    - "getFilteredCpus function"
  affects:
    - "src/lib/converters/infrastructure/index.ts (re-exports)"
tech_stack:
  added: []
  patterns:
    - "Pure TypeScript calculation module (no React)"
    - "Static JSON import cast to typed interface"
    - "Staleness detection via dataAsOf + staleDays threshold"
    - "Null return for insufficient CPU count (<2 valid IDs)"
key_files:
  created:
    - "src/lib/converters/infrastructure/cpu-comparison.ts"
  modified:
    - "src/lib/converters/infrastructure/index.ts"
decisions:
  - "sizingRatioVsFirst formula: cpu[0].specint2017Peak / cpuN.specint2017Peak — means N units of cpuN needed to match cpu[0]"
  - "Clamp to 4 CPUs maximum to limit UI table width"
  - "Return null (not throw) for <2 valid IDs, consistent with project converter pattern"
  - "Import cpu-database.json as default import cast to CpuDatabase (static export constraint)"
metrics:
  duration: "~1.3 min"
  completed: "2026-02-23"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 38 Plan 01: CPU Comparison Pure Calculation Module Summary

**One-liner:** Pure TypeScript CPU comparison module with SPECint2017-based perf/core, perf/watt, and sizing-ratio calculations backed by static JSON database.

## What Was Built

Created `src/lib/converters/infrastructure/cpu-comparison.ts` — a framework-agnostic TypeScript module providing all comparison math for the CPU Comparison Calculator (Phase 38).

### Interfaces

- **`CpuComparisonInput`** — URL-syncable input: comma-separated cpuIds, vendor filter, generation filter
- **`CpuComparisonRow`** — One row per selected CPU with all raw fields plus computed: perfPerCore, perfPerWatt, sizingRatioVsFirst
- **`CpuComparisonResult`** — Rows array + baselineCpuId + staleness data (dataAsOf, isStale, staleWarning)

### Functions

- **`getFilteredCpus(vendor, generation)`** — Filters cpuDatabase.cpus by optional vendor/generation, returns sorted by specint2017Peak descending
- **`calculateCpuComparison(input)`** — Parses cpuIds, looks up each in database, builds rows with derived metrics, checks staleness, returns null for <2 valid CPUs

### Calculation Formulas

| Metric | Formula |
|--------|---------|
| perfPerCore | `Math.round((specint2017Peak / cores) * 100) / 100` |
| perfPerWatt | `Math.round((specint2017Peak / tdpW) * 100) / 100` |
| sizingRatioVsFirst | `1.0` for CPU[0]; `Math.round((cpu[0].peak / cpuN.peak) * 100) / 100` for others |

### Verified Behavior

- `calculateCpuComparison({ cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654", ... })` returns row[0].sizingRatioVsFirst === 1.0, row[1].sizingRatioVsFirst === 0.72 (430/600 = 0.7166... → 0.72)
- `calculateCpuComparison({ cpuIds: "only-one-cpu", ... })` returns null
- `getFilteredCpus("amd", "current")` returns 5 AMD current-gen entries sorted by peak score desc (9965, 9755, 9654, 9754, 9554)

## Commits

| Hash | Message |
|------|---------|
| 8cbb9af | feat(38-cpu-comparison-calculator): create cpu-comparison.ts pure calculation module |
| 058deff | feat(38-cpu-comparison-calculator): re-export cpu-comparison from infrastructure index |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/lib/converters/infrastructure/cpu-comparison.ts` exists
- [x] All 5 exports present: CpuComparisonInput, CpuComparisonRow, CpuComparisonResult, calculateCpuComparison, getFilteredCpus
- [x] `src/lib/converters/infrastructure/index.ts` includes `export * from "./cpu-comparison"`
- [x] `npx tsc --noEmit` reports zero errors
- [x] Both commits verified: 8cbb9af and 058deff
