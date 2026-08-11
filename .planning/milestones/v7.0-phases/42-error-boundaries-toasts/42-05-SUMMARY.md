---
phase: 42-error-boundaries-toasts
plan: "05"
subsystem: ui
tags: [zustand, sonner, toast, calculator-store, error-handling]

# Dependency graph
requires:
  - phase: 42-01
    provides: Toaster added to root layout and sonner installed

provides:
  - createCalculatorStore factory with optional onCalculationError callback
  - toast.error integration in setValue/setValues when result is null

affects:
  - any future calculator store that opts into onCalculationError feedback

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Opt-in callback pattern — default behavior unchanged for all 169 existing calculators
    - Toast fired only from user-triggered actions (setValue/setValues), not initial mount or reset

key-files:
  created: []
  modified:
    - src/stores/calculator-store.ts

key-decisions:
  - "42-05: onCalculationError is opt-in (not default) to prevent toast spam across all 169 calculators that use null as normal incomplete-input state"
  - "42-05: toast.error NOT called from reset action or initial state — only from setValue/setValues (user-triggered changes)"
  - "42-05: Callback signature is (values: T) => string — typed, no any, caller decides message text"

patterns-established:
  - "onCalculationError pattern: provide callback to createCalculatorStore to opt-in to toast.error on null result"

requirements-completed:
  - R2.5

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 42 Plan 05: Error Boundaries & Toasts — onCalculationError Opt-In Summary

**Opt-in onCalculationError callback added to createCalculatorStore, firing toast.error in setValue/setValues when calculate() returns null after user input, leaving all 169 existing stores unaffected**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T08:59:30Z
- **Completed:** 2026-02-26T09:00:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Extended `CreateCalculatorStoreOptions<T, R>` with optional `onCalculationError?: (values: T) => string` field
- Added `import { toast } from "sonner"` to calculator-store.ts
- Toast fires in `setValue` and `setValues` when `result === null && onCalculationError` is truthy
- Initial mount (`result: null` at store creation) does NOT fire callback — no page-load toast spam
- `reset` action does NOT fire callback — reset is an intentional null state
- All 169 existing calculator stores compile and run without changes (purely additive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add onCalculationError opt-in to createCalculatorStore** - `09bfc5d` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/stores/calculator-store.ts` - Added sonner import, onCalculationError interface field, destructuring, and toast.error calls in setValue/setValues

## Decisions Made

- `onCalculationError` is opt-in (not default) to prevent toast spam on calculators where null result is a normal "not enough input yet" state
- Callback NOT invoked from `reset` or initial state creation — only from user-driven `setValue`/`setValues` calls
- Callback signature `(values: T) => string` keeps typing strict (no `any`); caller provides context-appropriate message

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- R2.5 satisfied: opt-in toast feedback available for calculators that need it
- Phase 42 complete (5/5 plans done)
- Any calculator can now opt-in by providing `onCalculationError` callback to `createCalculatorStore`

---
*Phase: 42-error-boundaries-toasts*
*Completed: 2026-02-26*
