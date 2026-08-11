---
phase: 41-full-converter-test-coverage
plan: "01"
subsystem: test-infrastructure
tags: [vitest, coverage, ci, configuration]
dependency_graph:
  requires: []
  provides: [global-coverage-threshold, ci-test-gate]
  affects: [vitest.config.ts, .github/workflows/static.yml]
tech_stack:
  added: []
  patterns: [global-coverage-threshold, ci-test-gate]
key_files:
  created: []
  modified:
    - vitest.config.ts
    - .github/workflows/static.yml
decisions:
  - "Global 75% threshold replaces 5 per-file blocks — applies once all converters have tests (Wave 4)"
  - "cpu-types.ts excluded from coverage — interfaces/unions only, no testable functions"
  - "CI uses npm run test:run not npm test — interactive watch mode would hang pipeline"
metrics:
  duration: "~5 minutes"
  completed: 2026-02-26
  tasks_completed: 2
  files_modified: 2
---

# Phase 41 Plan 01: Coverage Config & CI Gate Summary

Global 75% coverage threshold replacing per-file blocks, cpu-types.ts excluded, and Test CI gate inserted before Build in static.yml.

## Objective

Replace 5 per-file coverage threshold entries in vitest.config.ts with a single global 75% threshold block, add cpu-types.ts to the coverage exclude list, and insert a Test step in static.yml CI pipeline before the Build step.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update vitest.config.ts — global threshold + cpu-types exclude | 78cdfc4 | vitest.config.ts |
| 2 | Add Test CI gate to static.yml | 2892546 | .github/workflows/static.yml |

## Key Changes

### vitest.config.ts

- Replaced 5 per-file threshold entries (bb-credit-calculator, subnet-calculator, bmi, compound-interest, molecular-weight) with a single global threshold block
- Global threshold: lines: 75, functions: 75, branches: 75, statements: 75
- Added `src/lib/converters/infrastructure/cpu-types.ts` to the coverage exclude list (interfaces/unions only — not caught by the existing `**/types.ts` glob)

### .github/workflows/static.yml

- Inserted Test step between Lint and Build steps
- Uses `npm run test:run` (vitest --run, non-interactive, exits after results)
- CI now enforces: Type check → Lint → Test → Build → Deploy

## Verification Results

1. `npm run test:run` exits 0 — all 66 Phase 40 tests pass with new config
2. vitest.config.ts shows single global threshold block, no per-file entries, cpu-types.ts in exclude
3. static.yml shows Test step between Lint and Build using `npm run test:run`
4. `npm run type-check` exits 0 — no TypeScript regressions

## Decisions Made

- **Global threshold deferred**: The global 75% threshold will fail during Waves 2-3 when most converters have 0% coverage. It is intentionally written now but only enforced in Wave 4 (plan 41-10) via `npm run test:coverage`. Wave 1 writes the config only.
- **cpu-types.ts excluded**: This file contains only TypeScript type definitions (union types, interfaces) with no executable code. It was not caught by the existing `**/types.ts` glob because its filename is `cpu-types.ts`.
- **npm run test:run in CI**: `npm test` launches interactive watch mode in CI which hangs the pipeline indefinitely. The `test:run` script (added in Phase 40) runs vitest with `--run` flag for non-interactive execution.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- vitest.config.ts modified with global threshold block — FOUND
- .github/workflows/static.yml has Test step — FOUND
- Commit 78cdfc4 exists — FOUND
- Commit 2892546 exists — FOUND
- 66 tests pass — VERIFIED
