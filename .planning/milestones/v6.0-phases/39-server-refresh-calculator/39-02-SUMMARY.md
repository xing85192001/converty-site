---
phase: 39-server-refresh-calculator
plan: "02"
subsystem: infra
tags: [typescript, react, next-intl, server-refresh, fleet-sizing, i18n, infrastructure, ui]

# Dependency graph
requires:
  - phase: 39-01
    provides: calculateServerRefresh, getServerRefreshCpus, ServerRefreshInput, ServerRefreshResult, FleetSummary
  - phase: 38-cpu-comparison-calculator
    provides: cpu-comparison-calculator pattern (dynamic import, staleness warning, ConverterLayout)
provides:
  - ServerRefreshCalculator React client component
  - server-refresh-calculator Next.js page (generateStaticParams, generateMetadata, default export)
  - 45 translation keys in all 4 locales (en, fr, de, it)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "4-card layout: old fleet config, new CPU target, constraints, results"
    - "Fleet delta summary table with color-coded delta cells (green=better, red=worse)"
    - "Chassis constraint disables newSocketsPerServer input with hint text"
    - "Power budget analysis section rendered conditionally when powerBudgetW > 0"
    - "Staleness warning following cpu-comparison-calculator amber card pattern"
    - "Nested translation keys (headroom.*, chassis.*) for select option labels"

key-files:
  created:
    - src/app/[locale]/infrastructure/server-refresh-calculator/server-refresh-calculator.tsx
    - src/app/[locale]/infrastructure/server-refresh-calculator/page.tsx
  modified:
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json

key-decisions:
  - "formatDelta helper with reverseColor=true for TDP (more power = red = worse)"
  - "IIFE pattern in JSX for delta rows to keep variable scoping clean without extract-to-function overhead"
  - "CalculatorSkeleton inputCount=8 (matches 8 input fields in the store)"

# Metrics
duration: ~3.5min
completed: 2026-02-23
---

# Phase 39 Plan 02: Server Refresh Calculator UI Summary

**React client component and Next.js page for server fleet refresh — 4-card UI with fleet delta summary table, staleness warning, power budget analysis, and 45 i18n keys across 4 locales**

## Performance

- **Duration:** ~3.5 min
- **Started:** 2026-02-23T15:41:14Z
- **Completed:** 2026-02-23T15:44:56Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `server-refresh-calculator.tsx` (394 lines) with full calculator UI: old fleet config, target CPU, constraints, and results (fleet required + power budget analysis + fleet delta table)
- Implemented `formatDelta` helper with `reverseColor` flag for semantic color coding (green=better, TDP reverses to red=more power)
- Created `page.tsx` following exact cpu-comparison-calculator pattern: dynamic import with CalculatorSkeleton fallback, generateStaticParams for all 4 locales, generateMetadata with 9 SEO keywords
- Added 45 leaf translation keys to all 4 locale files (en, fr, de, it), including nested `headroom.*` and `chassis.*` objects for select option labels
- Chassis constraint disables newSocketsPerServer input and shows "constrained by chassis" hint

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ServerRefreshCalculator client component and add translations** - `9c8d7cb` (feat)
2. **Task 2: Create static page with metadata and ConverterLayout** - `398473c` (feat)

## Files Created/Modified

- `src/app/[locale]/infrastructure/server-refresh-calculator/server-refresh-calculator.tsx` - Client component: 4-card layout, fleet delta table, staleness warning, power budget analysis, createCalculatorStore integration
- `src/app/[locale]/infrastructure/server-refresh-calculator/page.tsx` - Next.js page: dynamic import, generateStaticParams, generateMetadata, ConverterLayout
- `src/messages/en.json` - 45 translation keys added to server-refresh-calculator namespace
- `src/messages/fr.json` - French translations (45 keys)
- `src/messages/de.json` - German translations (45 keys)
- `src/messages/it.json` - Italian translations (45 keys)

## Decisions Made

- Used `formatDelta(delta, reverseColor=true)` for TDP row: more power is worse, so positive TDP delta renders red and negative renders green
- Used IIFE `{(() => { ... })()}` pattern for delta table rows to scope `delta`, `text`, `className` variables cleanly within each row without extracting to named functions
- `CalculatorSkeleton inputCount={8}` matches the 8 fields in the store initialValues

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- UI and i18n are complete; ready for Plan 03 (registry + build verification)
- Component correctly imports `calculateServerRefresh` and `getServerRefreshCpus` from `@/lib/converters/infrastructure`
- TypeScript strict check passes with zero errors
- All 4 locale files have 45 leaf keys each (well above the 30 minimum)

## Self-Check: PASSED

- FOUND: src/app/[locale]/infrastructure/server-refresh-calculator/server-refresh-calculator.tsx
- FOUND: src/app/[locale]/infrastructure/server-refresh-calculator/page.tsx
- FOUND: Named export `ServerRefreshCalculator` in component file
- FOUND: `generateStaticParams`, `generateMetadata`, default export in page.tsx
- FOUND: 45 leaf keys in en.json, fr.json, de.json, it.json (all equal)
- FOUND commit: 9c8d7cb (feat: component + translations)
- FOUND commit: 398473c (feat: page)
- TypeScript check: TSC_EXIT 0 (zero errors)

---
*Phase: 39-server-refresh-calculator*
*Completed: 2026-02-23*
