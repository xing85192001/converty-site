---
phase: 43-zod-input-validation
plan: "01"
subsystem: validation
tags: [zod, validation, zustand, url-params, typescript]

# Dependency graph
requires:
  - phase: 42-error-boundaries-toasts
    provides: createCalculatorStore with onCalculationError callback
provides:
  - zod@^4.0.0 runtime dependency installed
  - schema?: ZodType<T> optional parameter in createCalculatorStore
  - parseZodNumberParam, parseZodBooleanParam, parseZodStringParam URL helpers
affects: [43-02, 43-03, 43-04, 43-05]

# Tech tracking
tech-stack:
  added: [zod@^4.3.6]
  patterns: [optional schema parameter in store factory, effectiveValidate derived from schema.safeParse]

key-files:
  created: []
  modified:
    - package.json
    - src/stores/calculator-store.ts
    - src/lib/utils/url-params.ts

key-decisions:
  - "zod installed as runtime dependency (not devDependency) since schemas run client-side in stores"
  - "schema and validate are both optional; explicit validate takes precedence over schema when both provided"
  - "effectiveValidate computed once at store creation (not per-call) for efficiency"
  - "ZodType imported as type-only (import type) for Biome strict compliance"
  - "z imported as value import in url-params.ts for coercion utilities at runtime"

patterns-established:
  - "Schema-derived validation: schema.safeParse() → fieldErrors object keyed by issue.path[0]"
  - "Zod URL helpers pattern: null/empty guard → safeParse → result.success check → fallback"

requirements-completed: [R3.1, R3.3, R3.4]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 43 Plan 01: Zod Input Validation Foundation Summary

**zod@^4.3.6 installed as runtime dep; createCalculatorStore gains optional schema?: ZodType<T> for automatic field-level validation; three Zod URL param helpers added alongside existing ones**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T12:03:15Z
- **Completed:** 2026-02-26T12:05:17Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Installed zod@^4.3.6 as runtime dependency (not devDependency)
- Added `schema?: ZodType<T>` to `CreateCalculatorStoreOptions` interface with type-only import
- Derived `effectiveValidate` from `schema.safeParse()` in `createCalculatorStore`; explicit `validate` still overrides when both provided
- Added `parseZodNumberParam`, `parseZodBooleanParam`, `parseZodStringParam` to `url-params.ts` using `z.coerce.*` patterns
- All 169 existing stores work without modification (schema is optional)
- Zero TypeScript errors, zero Biome errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Zod v4** - `886c125` (chore)
2. **Task 2: Update createCalculatorStore to accept optional Zod schema** - `c17a454` (feat)
3. **Task 3: Add Zod-based URL parameter helpers** - `198ed10` (feat)

## Files Created/Modified
- `package.json` - zod@^4.3.6 added to dependencies
- `src/stores/calculator-store.ts` - ZodType import, schema? field in interface, effectiveValidate logic, validate? calls replaced with effectiveValidate?
- `src/lib/utils/url-params.ts` - z import added, three Zod URL helper functions appended

## Decisions Made
- zod installed as runtime dependency since Zod schemas run client-side inside Zustand stores, not just at build time
- `validate` takes precedence over `schema` (ternary: `schema ? derivedFn : validate`) — explicit always wins
- `effectiveValidate` computed once at store creation time (before `storeCreator`), not inside `setState` calls
- Used `import type { ZodType }` to satisfy Biome strict mode for the store file
- Used `import { z }` (value import) in url-params.ts since z.coerce.* is called at runtime

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Zod foundation is complete and ready for plans 02-05 which add schemas per calculator category
- `schema?: ZodType<T>` available in all calculator stores
- URL helpers available for stores that need Zod-based URL param coercion

---
*Phase: 43-zod-input-validation*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: .planning/phases/43-zod-input-validation/43-01-SUMMARY.md
- FOUND: src/stores/calculator-store.ts
- FOUND: src/lib/utils/url-params.ts
- FOUND: commit 886c125 (Task 1 - chore: install zod)
- FOUND: commit c17a454 (Task 2 - feat: schema? in store)
- FOUND: commit 198ed10 (Task 3 - feat: Zod URL helpers)
