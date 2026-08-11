---
phase: 40-vitest-foundation
plan: "03"
subsystem: testing
tags: [vitest, typescript, compound-interest, molecular-weight, chemistry, finance, unit-tests]

# Dependency graph
requires:
  - phase: 40-vitest-foundation/40-01
    provides: vitest.config.ts with vite-tsconfig-paths for @/ alias resolution

provides:
  - Compound interest calculator unit tests (16 tests) covering null guards, precision, frequencies, breakdown
  - Molecular weight calculator unit tests (13 tests) using real periodic-table.json, no mocks
  - Bug fix for compound interest calculation — non-monthly compounding frequencies now use correct fractional exponentiation

affects:
  - 40-04 (remaining converter test plans)
  - Any code that uses calculateCompoundInterest with annually/semi-annually/quarterly/daily frequencies

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "toBeCloseTo(value, decimalPlaces) for all floating-point financial results — never strict toBe"
    - "No mocking of JSON data imports — vite-tsconfig-paths resolves real periodic-table.json"
    - "it.each(['annually', 'semi-annually', ...] as const) for parameterized frequency tests"

key-files:
  created:
    - src/__tests__/lib/converters/finance/compound-interest.test.ts
    - src/__tests__/lib/converters/chemistry/molecular-weight.test.ts
  modified:
    - src/lib/converters/finance/compound-interest.ts

key-decisions:
  - "Bug fix: compound-interest.ts inner compound loop replaced integer iteration with fractional exponentiation (1+r)^(n/12) — fixes annual/semi-annual/quarterly/daily frequencies applying full-period rate each month"
  - "No mocking for periodic-table.json — vite-tsconfig-paths alias resolution validated by having tests import the real JSON"
  - "toBeCloseTo precision: 0 decimal places for large sums (finalBalance ~1100), 2 for chemistry precision (molarMass H2O 18.015)"

patterns-established:
  - "Financial precision pattern: toBeCloseTo(value, 0) for large round-number results, toBeCloseTo(value, 2) for precise chemistry values"
  - "Chemistry tests use real data: no mocking periodic-table.json or formula-parser — integration-style unit tests"

requirements-completed:
  - R1.5

# Metrics
duration: 8min
completed: 2026-02-26
---

# Phase 40 Plan 03: Priority Converter Tests (Compound Interest + Molecular Weight) Summary

**29 unit tests for compound interest and molecular weight calculators using real data imports and toBeCloseTo precision, plus a bug fix for non-monthly compounding frequency calculations**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-26T09:30:53Z
- **Completed:** 2026-02-26T09:39:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created compound interest test suite: 16 tests covering null guards (zero years, negative principal, negative years), basic math with toBeCloseTo, yearly breakdown structure, all 5 compounding frequencies, and contribution impact
- Created molecular weight test suite: 13 tests covering null guards (empty/whitespace/invalid formula), simple molecules (H2O/CO2/NaCl), complex formulas (Ca(OH)2 parentheses, CuSO4.5H2O hydrate, glucose C6H12O6), and element breakdown
- Fixed compound interest calculation bug where non-monthly frequencies (annually, semi-annually, quarterly, daily) applied the full period rate 12 times per year instead of once per year — replaced integer loop with `(1 + ratePerPeriod) ** periodsThisMonth`

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Compound Interest Calculator tests** - `bd247ce` (feat)
2. **Task 2: Write Molecular Weight Calculator tests** - `5b75a68` (feat)

## Files Created/Modified

- `src/__tests__/lib/converters/finance/compound-interest.test.ts` - 16 unit tests for compound interest calculator
- `src/__tests__/lib/converters/chemistry/molecular-weight.test.ts` - 13 unit tests for molecular weight calculator using real periodic table JSON
- `src/lib/converters/finance/compound-interest.ts` - Bug fix: fractional exponentiation replaces integer loop for compound periods

## Decisions Made

- toBeCloseTo precision levels: 0 decimal places for large sums (avoiding off-by-half-dollar failures), 2 decimal places for chemistry values requiring 3-digit precision (H2O 18.015)
- Real data approach for molecular weight tests: no mocking of periodic-table.json validates that vite-tsconfig-paths alias resolution works end-to-end
- Bug fix for compound interest was necessary to make tests accurate rather than testing incorrect behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed compound interest calculation for non-monthly compounding frequencies**
- **Found during:** Task 1 (Write Compound Interest Calculator tests)
- **Issue:** The inner compound loop `for (let p = 0; p < periodsThisMonth; p++)` executed once per month for all frequencies because `periodsThisMonth = periodsPerYear / 12` is always > 0 (e.g., 1/12 ≈ 0.083). This caused the full period rate to be applied 12 times per year for annual compounding, giving 1000 * (1.10)^12 = 3138.43 instead of correct 1100.00 for 10% annual.
- **Fix:** Replaced the integer loop with fractional exponentiation: `balance *= (1 + ratePerPeriod) ** periodsThisMonth`
- **Files modified:** `src/lib/converters/finance/compound-interest.ts`
- **Verification:** All 16 compound interest tests pass, including "more frequent compounding yields higher balance" which validates the relative ordering is now mathematically correct
- **Committed in:** `bd247ce` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Bug fix was essential for tests to be correct. Without it, tests would have needed to assert wrong values or be written to match broken behavior.

## Issues Encountered

None beyond the bug discovered during test implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- R1.5 satisfied: all 5 priority converters now have unit tests (subnet, credit-grade, BMI, compound-interest, molecular-weight)
- Ready for Phase 40-04: remaining converter tests or coverage reporting
- Compound interest fix improves correctness for end users who use annual/quarterly/daily compounding frequencies

## Self-Check: PASSED

- FOUND: src/__tests__/lib/converters/finance/compound-interest.test.ts
- FOUND: src/__tests__/lib/converters/chemistry/molecular-weight.test.ts
- FOUND: .planning/phases/40-vitest-foundation/40-03-SUMMARY.md
- FOUND commit: bd247ce (Task 1 - compound interest tests)
- FOUND commit: 5b75a68 (Task 2 - molecular weight tests)

---
*Phase: 40-vitest-foundation*
*Completed: 2026-02-26*
