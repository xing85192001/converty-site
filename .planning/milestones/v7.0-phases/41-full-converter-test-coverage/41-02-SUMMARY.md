---
phase: 41-full-converter-test-coverage
plan: "02"
subsystem: testing
tags: [vitest, unit-tests, math-converters, coverage]
dependency_graph:
  requires:
    - 41-01 (vitest config, global 75% threshold)
  provides:
    - 26 math converter test files
    - 180 math converter tests
  affects:
    - test coverage for math category
tech_stack:
  added: []
  patterns:
    - vitest describe/it/expect with explicit imports from "vitest"
    - toBeCloseTo for floating-point assertions
    - it.each for mode coverage
    - non-null assertion result!.field (no any types)
key_files:
  created:
    - src/__tests__/lib/converters/math/area.test.ts
    - src/__tests__/lib/converters/math/average.test.ts
    - src/__tests__/lib/converters/math/basic-calculator.test.ts
    - src/__tests__/lib/converters/math/binary.test.ts
    - src/__tests__/lib/converters/math/circle.test.ts
    - src/__tests__/lib/converters/math/exponent.test.ts
    - src/__tests__/lib/converters/math/factor.test.ts
    - src/__tests__/lib/converters/math/fraction.test.ts
    - src/__tests__/lib/converters/math/gcd-lcm.test.ts
    - src/__tests__/lib/converters/math/half-life.test.ts
    - src/__tests__/lib/converters/math/hex.test.ts
    - src/__tests__/lib/converters/math/logarithm.test.ts
    - src/__tests__/lib/converters/math/percent-error.test.ts
    - src/__tests__/lib/converters/math/percentage.test.ts
    - src/__tests__/lib/converters/math/permutation-combination.test.ts
    - src/__tests__/lib/converters/math/pythagorean.test.ts
    - src/__tests__/lib/converters/math/quadratic.test.ts
    - src/__tests__/lib/converters/math/random-number.test.ts
    - src/__tests__/lib/converters/math/ratio.test.ts
    - src/__tests__/lib/converters/math/root.test.ts
    - src/__tests__/lib/converters/math/rounding.test.ts
    - src/__tests__/lib/converters/math/scientific-notation.test.ts
    - src/__tests__/lib/converters/math/slope.test.ts
    - src/__tests__/lib/converters/math/surface-area.test.ts
    - src/__tests__/lib/converters/math/volume.test.ts
    - src/__tests__/lib/converters/math/z-score.test.ts
  modified: []
decisions:
  - "Explicit vitest imports required (from 'vitest') for TypeScript compatibility — globals:true only works at runtime, tsc type-check requires explicit imports"
  - "rounding.test.ts: round(10.5)=11, difference=+0.5 (not -0.5) — fixed during development"
metrics:
  duration: 13 min
  completed: 2026-02-26
  tasks_completed: 2
  files_created: 26
  tests_added: 180
---

# Phase 41 Plan 02: Math Converter Tests (Trivial to Simple) Summary

26 math converter unit test files covering area through z-score, with 180 passing tests using explicit vitest imports and TypeScript-safe non-null assertions.

## Tasks Completed

### Task 1: Math trivial converters (area through percentage)
14 test files created covering: area, average, basic-calculator, binary, circle, exponent, factor, fraction, gcd-lcm, half-life, hex, logarithm, percent-error, percentage.

**Commit:** 7c0d739

### Task 2: Math simple converters (permutation through z-score)
12 test files created covering: permutation-combination, pythagorean, quadratic, random-number, ratio, root, rounding, scientific-notation, slope, surface-area, volume, z-score.

**Commit:** 8d40b7e

## Verification

- 26 test files under `src/__tests__/lib/converters/math/`
- `npm run test:run` (26 files, 180 tests, all passing)
- No `any` types in any test file
- No `console.log` in any test file
- Each file has minimum: null/invalid input test + correct calculation test

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Import] Added explicit vitest imports to all 26 test files**
- **Found during:** Task 1 verification (type-check)
- **Issue:** Test files used globals (`describe`, `it`, `expect`) without imports. Vitest's `globals: true` works at runtime but TypeScript's `tsc --noEmit` doesn't recognize globals unless types are declared. Pre-existing Phase 40 test files in finance/health/network use explicit imports from "vitest".
- **Fix:** Added `import { describe, expect, it } from "vitest";` as first line of all 26 test files
- **Files modified:** All 26 math test files

**2. [Rule 1 - Bug] Fixed incorrect expected value in rounding test**
- **Found during:** Task 2 test run
- **Issue:** `round(10.5)=11`, so `difference = 11 - 10.5 = +0.5`, not `-0.5` as initially coded
- **Fix:** Changed expected value from `-0.5` to `+0.5`
- **Files modified:** `src/__tests__/lib/converters/math/rounding.test.ts`

## Out-of-Scope Pre-existing Issues

The following failures existed before this plan and are not caused by our changes:
- `src/__tests__/lib/converters/health/pregnancy-due-date.test.ts` — 2 failing tests (off-by-one date)
- `src/__tests__/lib/converters/math/sample-size.test.ts` — 1 failing test (pre-existing)
- `src/__tests__/lib/converters/math/distance.test.ts` — TypeScript implicit any errors (pre-existing)
- `src/__tests__/lib/converters/math/triangle.test.ts` — TypeScript implicit any errors (pre-existing)

These are logged to deferred-items.md scope and not modified.

## Self-Check: PASSED

Files exist:
- FOUND: src/__tests__/lib/converters/math/percentage.test.ts
- FOUND: src/__tests__/lib/converters/math/area.test.ts
- FOUND: src/__tests__/lib/converters/math/z-score.test.ts

Commits exist:
- FOUND: 7c0d739 (Task 1 — 14 test files)
- FOUND: 8d40b7e (Task 2 — 12 test files)
