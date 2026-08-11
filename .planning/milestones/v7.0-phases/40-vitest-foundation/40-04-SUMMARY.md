---
phase: 40-vitest-foundation
plan: "04"
subsystem: testing
tags: [vitest, coverage, typescript, bigint, per-file-thresholds, es2020]

# Dependency graph
requires:
  - phase: 40-01
    provides: vitest config, V8 coverage setup, npm test scripts
  - phase: 40-02
    provides: bb-credit-calculator, subnet-calculator, bmi test files
  - phase: 40-03
    provides: compound-interest, molecular-weight test files with bug fix
provides:
  - npm run test:coverage exits 0 with all 5 priority converter files at >=75% coverage
  - Per-file glob thresholds in vitest.config.ts for the 5 tested converters
  - TypeScript target updated to ES2020 (enables BigInt n-suffix literals in tests)
  - Phase 40 acceptance gate fully satisfied
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-file glob thresholds: thresholds['src/lib/converters/path/file.ts'] = {lines:75,...}"
    - "Global thresholds unsuitable when only subset of included files have tests"
    - "TypeScript target ES2020 required for BigInt n-suffix literals (254n, 65534n)"

key-files:
  created: []
  modified:
    - vitest.config.ts
    - tsconfig.json

key-decisions:
  - "Replaced global 75% threshold with per-file glob thresholds for each of the 5 tested converter files — global threshold fails at 2.72% since 100+ files in include pattern have no tests yet"
  - "TypeScript target changed from ES2017 to ES2020 — subnet-calculator tests use BigInt n-suffix literals (254n) which require ES2020; source files also use BigInt() consistently"
  - "Task 2 was a no-op — all 5 priority converter files already met 75% threshold on first run (min: bmi.ts at 76.92% branch, max: bb-credit-calculator.ts at 100% all metrics)"

patterns-established:
  - "Per-file glob threshold pattern: when coverage.include is broad but tests cover only a subset, use file-specific threshold objects instead of global threshold"
  - "TypeScript incremental cache (tsconfig.tsbuildinfo) must be cleared after target changes to avoid stale error reporting"

requirements-completed: [R1.1, R1.2, R1.3, R1.4, R1.5]

# Metrics
duration: 8min
completed: 2026-02-26
---

# Phase 40 Plan 04: Vitest Foundation — Coverage Acceptance Gate Summary

**Per-file glob coverage thresholds for 5 priority converters, TypeScript ES2020 target for BigInt support, and confirmed npm run test:coverage exits 0 with all 66 tests passing at >=75% per-file coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-26T06:54:51Z
- **Completed:** 2026-02-26T07:02:00Z
- **Tasks:** 3 (Task 2 was no-op)
- **Files modified:** 2

## Accomplishments

- Fixed vitest.config.ts coverage thresholds from global (which would read 2.72% across all 100+ converters) to per-file glob thresholds for each of the 5 tested converters
- Fixed TypeScript target from ES2017 to ES2020 — eliminates TS2737 "BigInt literals not available" errors in subnet-calculator tests (5 errors, all resolved)
- Confirmed all 5 priority converter files pass 75% threshold: bb-credit-calculator (100%/83.33%/100%/100%), subnet-calculator (92.59%/75%/100%/92.3%), bmi (81.81%/76.92%/100%/82.14%), compound-interest (97.22%/85.71%/100%/97.05%), molecular-weight (97.36%/87.5%/100%/97.29%)
- Phase 40 acceptance gate satisfied: 66 tests pass, TypeScript clean, Biome clean, all per-file coverage thresholds met

## Task Commits

Each task was committed atomically:

1. **Task 1: Run full coverage and fix threshold config** - `9af4ec0` (fix)
2. **Task 2: Fix coverage gaps** - no-op (all thresholds already passed)
3. **Task 3: TypeScript and Biome lint fix** - `cb8cead` (fix)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `vitest.config.ts` — Replaced global coverage thresholds with per-file glob thresholds for 5 priority converter files; each file independently checked at 75% for lines/functions/branches/statements
- `tsconfig.json` — Updated `target` from `"ES2017"` to `"ES2020"` to support BigInt n-suffix literals in subnet-calculator tests

## Decisions Made

- Used per-file glob thresholds in vitest.config.ts rather than global thresholds — the coverage.include pattern covers all 100+ converter files, but only 5 have tests, so the global average was 2.72% (failing). Per-file glob thresholds check each specific file independently
- Updated TypeScript target to ES2020 — BigInt n-suffix literals (`254n`, `65534n`) require ES2020; source files consistently use `BigInt()` function calls which are also ES2020-dependent; upgrading target is consistent with the project's actual code
- Task 2 was a no-op — all 5 priority files were already above 75% threshold from the tests written in plans 40-02 and 40-03; no additional tests needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed global coverage threshold to per-file glob thresholds**
- **Found during:** Task 1 (Run full coverage)
- **Issue:** Global threshold checked across all 100+ converters in include pattern; 95+ untested files brought average to 2.72%, causing threshold failure even though the 5 tested files were well above 75%
- **Fix:** Replaced `thresholds: { lines: 75, ... }` with per-file glob objects for each of the 5 priority converter paths
- **Files modified:** `vitest.config.ts`
- **Verification:** `npm run test:coverage` exits 0, no "does not meet threshold" errors
- **Committed in:** `9af4ec0` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed TypeScript target for BigInt literal support**
- **Found during:** Task 3 (TypeScript check)
- **Issue:** 5 TypeScript errors TS2737 "BigInt literals are not available when targeting lower than ES2020" in subnet-calculator.test.ts; tests use 254n, 65534n, 1n, 2n literals
- **Fix:** Updated `tsconfig.json` target from `"ES2017"` to `"ES2020"`; cleared tsconfig.tsbuildinfo cache to ensure clean rebuild
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run type-check` exits 0 with zero errors
- **Committed in:** `cb8cead` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both auto-fixes necessary for correctness. The threshold config was logically wrong (global vs per-file). The TypeScript target was inconsistent with actual BigInt usage in the codebase.

## Issues Encountered

- TypeScript incremental cache (`tsconfig.tsbuildinfo`) was stale after updating target — running `rm tsconfig.tsbuildinfo` followed by `npm run type-check` was required to see clean results. The tsconfig.tsbuildinfo file does not need to be committed; it's a build artifact.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 40 Vitest Foundation is complete. All acceptance criteria satisfied:
  - `npm run test:coverage` exits 0 with >=75% coverage on all 5 priority converter files
  - 66 unit tests pass across 5 test files (zero failures)
  - `npm run type-check` passes with zero TypeScript errors
  - `npm run check` passes with zero Biome errors (19 pre-existing warnings in other files, none in test files)
- Future test phases can add tests for remaining converters using the established patterns
- The per-file glob threshold pattern is now documented for future phases adding more test files

## Self-Check: PASSED

Files verified:
- FOUND: vitest.config.ts (per-file glob thresholds for 5 converter files)
- FOUND: tsconfig.json (target ES2020)
- FOUND: .planning/phases/40-vitest-foundation/40-04-SUMMARY.md

Commits verified:
- FOUND: 9af4ec0 (fix: per-file glob thresholds)
- FOUND: cb8cead (fix: TypeScript ES2020 target)
- FOUND: f84d968 (docs: metadata commit)

Acceptance gates verified:
- npm run test:coverage: EXIT 0, 66 tests passed, no threshold errors
- npm run type-check: EXIT 0, zero TypeScript errors
- npm run check: EXIT 0, 19 pre-existing warnings (none in test files)

---
*Phase: 40-vitest-foundation*
*Completed: 2026-02-26*
