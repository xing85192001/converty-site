---
phase: 02-url-sync-infrastructure
plan: 01
subsystem: state-management
tags: [zustand, url-sync, middleware, typescript, closure-pattern]

# Dependency graph
requires:
  - phase: 01-type-safety-foundation
    provides: Type-safe URL parameter parsing helpers (parseNumberParam, parseStringParam)
provides:
  - URL sync middleware factory with per-instance timer isolation
  - Consolidated URL sync logic (eliminates code duplication across stores)
  - Closure-based pattern preventing global timer conflicts
affects: [calculator-stores, state-management, future-phases-using-zustand]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand middleware factory pattern with closure-captured state"
    - "Per-instance debounce timer isolation via JavaScript closures"
    - "Selective state sync using selectState option"

key-files:
  created:
    - src/lib/middleware/url-sync.ts
  modified:
    - src/stores/calculator-store.ts

key-decisions:
  - "Use closure pattern (not WeakMap) for timer isolation - simpler, more explicit"
  - "Use replaceState (not pushState) to avoid browser history pollution"
  - "Add selectState option to sync only values (not result/errors/methods)"
  - "Include/exclude options for fine-grained control over synced keys"

patterns-established:
  - "Middleware factory pattern: Each createUrlSyncMiddleware() call creates new closure with isolated timer"
  - "State selection: selectState option enables syncing nested state (e.g., values from CalculatorState)"
  - "Type-safe parsing: URL params loaded with parseNumberParam/parseStringParam from Phase 1"

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 2 Plan 1: URL Sync Infrastructure Summary

**Closure-based URL sync middleware eliminates global timer conflicts, enabling multiple calculator instances with independent debounce timers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-17T11:57:37Z
- **Completed:** 2026-01-17T12:01:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 2

## Accomplishments

- Created reusable URL sync middleware with closure-scoped timers (STATE-04 fixed)
- Eliminated 60+ lines of duplicated URL sync logic across stores (STATE-03 fixed)
- Maintained full backward compatibility - existing calculator stores work unchanged
- Added selectState option for syncing nested state objects

## Task Commits

Each task was committed atomically:

1. **Task 1: Create URL Sync Middleware with Closure-Based Timer** - `8f03527` (feat)
2. **Task 2: Integrate Middleware into Calculator Store** - `76bf93a` (refactor)
3. **Task 3: Verification checkpoint** - User approved (no commit)

## Files Created/Modified

- `src/lib/middleware/url-sync.ts` (135 lines) - URL sync middleware factory with closure-based timer, include/exclude options, selectState support
- `src/stores/calculator-store.ts` - Removed global timer and inline URL sync logic (49 lines deleted, 25 added), integrated middleware conditionally

## Decisions Made

**1. Closure pattern over WeakMap for timer isolation**

- **Rationale:** Simpler mental model, more explicit, easier to debug. Factory function scope naturally creates closure per invocation.

**2. Use replaceState instead of pushState**

- **Rationale:** Avoids flooding browser history with every keystroke. Calculator URL changes are state updates, not navigation events.

**3. Add selectState option to middleware**

- **Rationale:** Calculator store has nested structure (values, result, errors, methods). Only values should sync to URL. This allows middleware to extract the relevant portion.

**4. Keep type-safe URL parameter loading in store**

- **Rationale:** Middleware handles sync TO url. Store initialization handles loading FROM url with type-safe parsing (parseNumberParam/parseStringParam). Clear separation of concerns.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added selectState option to middleware**

- **Found during:** Task 2 (Integrating middleware into calculator store)
- **Issue:** CalculatorState has nested structure: `{ values: T, result: R, errors: {}, setValue: fn, ... }`. Plan's middleware would sync entire state including functions, errors, and result to URL. Only the `values` object should be synced.
- **Fix:** Added `selectState?: (state: T) => object` option to UrlSyncOptions, allowing stores to specify which part of state to sync. Calculator store passes `selectState: (state) => state.values`.
- **Files modified:** src/lib/middleware/url-sync.ts (added option), src/stores/calculator-store.ts (used option)
- **Verification:** URL params only contain calculator input values, not result/errors/functions
- **Committed in:** 76bf93a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing critical functionality)
**Impact on plan:** Essential for correctness - without selectState, URL would contain result/error objects and fail on reload. No scope creep.

## Issues Encountered

None - implementation followed plan smoothly.

## Verification Results

**Code Quality:**

- TypeScript compilation: PASS (npx tsc --noEmit)
- Biome lint: PASS (npm run lint)
- No global debounceTimeout variable: VERIFIED

**Functional Testing:**

- Single calculator URL sync: APPROVED by user
- Multiple calculators (no timer conflicts): APPROVED by user
- Fast navigation (no lost updates): APPROVED by user
- Debounce delay works correctly: APPROVED by user

**Architecture Review:**

- Timer in factory scope (not module scope): VERIFIED (line 47 in url-sync.ts)
- Each store gets own middleware instance: VERIFIED (conditional apply in calculator-store.ts:154-160)
- Closure creates isolated timer per invocation: VERIFIED

## Next Phase Readiness

**Ready for Phase 2 Plan 2:**

- URL sync infrastructure complete
- Calculator stores can now use `createCalculatorStore({ syncUrl: true })` without implementing URL logic
- Per-store timer isolation prevents conflicts when multiple calculators exist

**Key patterns for future use:**

- Import `createUrlSyncMiddleware` from `@/lib/middleware/url-sync`
- Apply conditionally: `if (syncUrl) { return create()(middleware(storeCreator)) }`
- Use `selectState` option for nested state structures
- Use `include`/`exclude` for fine-grained control

**No blockers** - ready to proceed with Phase 2 remaining plans.

---

_Phase: 02-url-sync-infrastructure_
_Completed: 2026-01-17_
