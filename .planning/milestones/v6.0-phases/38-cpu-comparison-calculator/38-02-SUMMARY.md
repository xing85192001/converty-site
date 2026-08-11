---
phase: 38-cpu-comparison-calculator
plan: "02"
subsystem: infrastructure-ui
tags:
  - cpu-comparison
  - react-component
  - next-js-page
  - i18n
  - url-sync
  - specint2017

dependency_graph:
  requires:
    - "38-01 (CpuComparisonInput, CpuComparisonResult, calculateCpuComparison, getFilteredCpus)"
    - "37-01 (cpu-database.json with 17 CPU entries)"
  provides:
    - "CpuComparisonCalculator client component with vendor/generation filters and multi-select CPU checkboxes"
    - "cpu-comparison-calculator/page.tsx with generateStaticParams and generateMetadata"
    - "Full UI translation keys for all 4 locales (en, fr, de, it)"
  affects:
    - "38-03 (server-refresh-calculator may reference same patterns)"
    - "39-server-refresh-calculator (uses same page/component patterns)"

tech_stack:
  added: []
  patterns:
    - "createCalculatorStore with comma-separated IDs for multi-select URL sync"
    - "useMemo for getFilteredCpus to avoid recalculation on every render"
    - "Dynamic import with CalculatorSkeleton fallback for code splitting"
    - "Responsive table with overflow-x-auto for mobile horizontal scroll"
    - "Staleness warning pattern with AlertCircle and SPEC.org link"

key-files:
  created:
    - "src/app/[locale]/infrastructure/cpu-comparison-calculator/cpu-comparison-calculator.tsx"
    - "src/app/[locale]/infrastructure/cpu-comparison-calculator/page.tsx"
  modified:
    - "src/messages/en.json (added 22 detailed UI translation keys)"
    - "src/messages/fr.json (added 22 detailed UI translation keys)"
    - "src/messages/de.json (added 22 detailed UI translation keys)"
    - "src/messages/it.json (added 22 detailed UI translation keys)"

key-decisions:
  - "Used dynamic import (code splitting) matching hyperv-consolidation page pattern rather than the older hypervisor-comparison direct import"
  - "getCategoryBySlug('infrastructure') for ConverterLayout category prop — consistent with all recent infrastructure pages"
  - "Sizing ratio row uses t('baseline') for first CPU and '{ratio}x' string for others — matches plan spec"
  - "Vendor/generation filter reset cpuIds to empty string on change to avoid stale selections across filter changes"

patterns-established:
  - "Multi-select via comma-separated IDs in single string field for URL sync compatibility"
  - "Checkbox disabled state when max count (4) reached"

requirements-completed:
  - CPUCMP-01
  - CPUCMP-02
  - CPUCMP-03
  - CPUCMP-04
  - CPUCMP-05

duration: "~5 min"
completed: "2026-02-23"
---

# Phase 38 Plan 02: CPU Comparison Calculator Component Summary

**CPU Comparison Calculator React component with vendor/generation filters, checkbox multi-select (2-4 CPUs), and SPECint2017 results table showing perf/core, perf/watt, and sizing ratio — wired to createCalculatorStore for URL sync.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-23T08:50:00Z
- **Completed:** 2026-02-23T08:56:49Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- CpuComparisonCalculator client component with vendor/generation dropdowns, checkbox CPU list, and full results table (12 metric rows per CPU, max 4 columns)
- Staleness warning banner with AlertCircle icon and SPEC.org link when data is older than 90 days
- Static page (page.tsx) with generateStaticParams, generateMetadata, setRequestLocale, ConverterLayout, and dynamic import
- Full i18n translations for all 4 locales (22 new keys per locale: filter labels, vendor/generation options, table headers, empty state, staleness warning)

## Task Commits

1. **Task 1: Create CpuComparisonCalculator client component** - `9ab8024` (feat)
2. **Task 2: Create static page with metadata and ConverterLayout** - `74ed873` (feat)

## Files Created/Modified

- `src/app/[locale]/infrastructure/cpu-comparison-calculator/cpu-comparison-calculator.tsx` - Client component: filter panel, CPU selection checkboxes, results comparison table
- `src/app/[locale]/infrastructure/cpu-comparison-calculator/page.tsx` - Server page: generateStaticParams, generateMetadata, ConverterLayout wrapper
- `src/messages/en.json` - Added 22 UI translation keys for cpu-comparison-calculator namespace
- `src/messages/fr.json` - French translations for same 22 keys
- `src/messages/de.json` - German translations for same 22 keys
- `src/messages/it.json` - Italian translations for same 22 keys

## Decisions Made

- Used `dynamic` import with `CalculatorSkeleton` fallback matching the latest infrastructure page pattern (hyperv-consolidation), not the older direct import pattern (hypervisor-comparison)
- `getCategoryBySlug("infrastructure")` for the ConverterLayout `category` prop — consistent with all recent infrastructure pages
- Vendor/generation change handlers reset `cpuIds` to `""` to prevent stale CPU selections persisting across filter changes
- Sizing ratio displays `t("baseline")` (locale-specific "1.0x (baseline)") for first CPU and `{ratio}x` for subsequent CPUs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CPU Comparison Calculator is fully functional: filters, multi-select, results table, URL sync, i18n complete
- Page is wired to ConverterLayout with correct backLink to /[locale]/infrastructure
- Ready for Phase 38-03 (server-refresh-calculator) and Phase 39 (server-refresh-calculator)

---
*Phase: 38-cpu-comparison-calculator*
*Completed: 2026-02-23*

## Self-Check: PASSED

- [x] `src/app/[locale]/infrastructure/cpu-comparison-calculator/cpu-comparison-calculator.tsx` exists (min 150 lines)
- [x] `src/app/[locale]/infrastructure/cpu-comparison-calculator/page.tsx` exists
- [x] Named export `CpuComparisonCalculator` present
- [x] `generateStaticParams`, `generateMetadata`, default export in page.tsx
- [x] `createCalculatorStore` with `CpuComparisonInput, CpuComparisonResult` generics
- [x] Import of `calculateCpuComparison`, `getFilteredCpus` from `@/lib/converters/infrastructure`
- [x] ConverterLayout with category from `getCategoryBySlug("infrastructure")`
- [x] Commit 9ab8024 verified (component + translations)
- [x] Commit 74ed873 verified (page)
- [x] `npx tsc --noEmit` reports zero errors
