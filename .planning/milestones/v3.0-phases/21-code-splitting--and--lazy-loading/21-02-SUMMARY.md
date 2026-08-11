---
phase: 21-code-splitting
plan: 02
subsystem: performance
tags: [next-dynamic, code-splitting, lazy-loading, calculator-optimization, bundle-size]

# Dependency graph
requires:
  - phase: 21-01
    provides: Bundle analyzer tooling and CalculatorSkeleton component
provides:
  - All 167 calculator pages converted to dynamic imports with lazy loading
  - On-demand calculator bundle loading reducing initial page weight
  - Consistent CalculatorSkeleton loading states across all calculators
affects: [performance-monitoring, user-experience, future-calculator-additions]

# Tech tracking
tech-stack:
  added: []
  patterns: ["next/dynamic for calculator components", "CalculatorSkeleton in Suspense fallback", "On-demand chunk loading"]

key-files:
  created:
    - .planning/phases/21-code-splitting--and--lazy-loading/bundle-improvement.md
  modified:
    - src/app/[locale]/*/page.tsx (167 calculator pages across all categories)

key-decisions:
  - "Dynamic imports for all 167 calculator pages with CalculatorSkeleton fallback"
  - "Preserved static export compatibility (no ssr: false flag needed)"
  - "Maintained URL state persistence through dynamic loading"

patterns-established:
  - "Standard pattern: const Calculator = dynamic(() => import('./calculator').then(mod => mod.Calculator), { loading: () => <CalculatorSkeleton /> })"
  - "Suspense boundary with CalculatorSkeleton fallback for consistent UX"

# Metrics
duration: 7min
completed: 2026-01-24
---

# Phase 21 Plan 02: Dynamic Imports for Calculators Summary

**All 167 calculator pages converted to next/dynamic with CalculatorSkeleton fallback, enabling on-demand bundle loading and reducing initial page weight**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-24T18:24:54Z
- **Completed:** 2026-01-24T18:31:46Z
- **Tasks:** 2
- **Files modified:** 169

## Accomplishments

- Converted all 167 calculator pages from static to dynamic imports
- Implemented consistent CalculatorSkeleton loading states across entire application
- Verified build success with code splitting (212 chunks, up from 210)
- Preserved static export compatibility and URL state persistence

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert High-Impact Category Calculator Pages to Dynamic Imports** - `2b3d98e` (feat)
   - Math: 39 calculators
   - Health: 28 calculators
   - Finance: 23 calculators
   - Photo: 23 calculators
   - Subtotal: 113 calculators

2. **Task 2: Convert Remaining Category Calculator Pages** - `5dd8b69` (feat)
   - Network: 5 calculators
   - Crypto: 4 calculators
   - Real Estate: 3 calculators
   - Cooking: 4 calculators
   - Automotive: 4 calculators
   - DateTime: 9 calculators
   - Video: 8 calculators
   - Web: 9 calculators
   - Data: 5 calculators
   - Physics: 1 calculator
   - Music: 1 calculator
   - Color: 1 calculator
   - Subtotal: 54 calculators

**Total:** 167 calculator pages converted

## Files Created/Modified

- `src/app/[locale]/math/*/page.tsx` - 39 calculators converted to dynamic imports
- `src/app/[locale]/health/*/page.tsx` - 28 calculators converted to dynamic imports
- `src/app/[locale]/finance/*/page.tsx` - 23 calculators converted to dynamic imports
- `src/app/[locale]/photo/*/page.tsx` - 23 calculators converted to dynamic imports
- `src/app/[locale]/network/*/page.tsx` - 5 calculators converted to dynamic imports
- `src/app/[locale]/crypto/*/page.tsx` - 4 calculators converted to dynamic imports
- `src/app/[locale]/realestate/*/page.tsx` - 3 calculators converted to dynamic imports
- `src/app/[locale]/cooking/*/page.tsx` - 4 calculators converted to dynamic imports
- `src/app/[locale]/automotive/*/page.tsx` - 4 calculators converted to dynamic imports
- `src/app/[locale]/datetime/*/page.tsx` - 9 calculators converted to dynamic imports
- `src/app/[locale]/video/*/page.tsx` - 8 calculators converted to dynamic imports
- `src/app/[locale]/web/*/page.tsx` - 9 calculators converted to dynamic imports
- `src/app/[locale]/data/*/page.tsx` - 5 calculators converted to dynamic imports
- `src/app/[locale]/physics/*/page.tsx` - 1 calculator converted to dynamic imports
- `src/app/[locale]/music/*/page.tsx` - 1 calculator converted to dynamic imports
- `src/app/[locale]/color/*/page.tsx` - 1 calculator converted to dynamic imports
- `.planning/phases/21-code-splitting--and--lazy-loading/bundle-improvement.md` - Bundle analysis documentation

## Decisions Made

1. **Dynamic imports without ssr: false flag**
   - Rationale: Calculators should render on server for SEO. Dynamic imports still work with static export through client-side hydration.
   - Pattern: `dynamic(() => import('./calculator').then(mod => mod.Calculator), { loading: () => <CalculatorSkeleton /> })`

2. **CalculatorSkeleton in both dynamic loading and Suspense fallback**
   - Rationale: Consistent loading UX whether chunk is being fetched or component is suspending
   - Implementation: Both `loading` prop in dynamic() and `fallback` prop in Suspense use `<CalculatorSkeleton />`

3. **Converted all 167 calculators (not just high-impact categories)**
   - Rationale: Consistency across codebase, all calculators benefit from lazy loading, simpler mental model
   - Impact: Even small categories (1-3 calculators) now lazy load for future scalability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - conversion script automated the transformation successfully across all 167 calculator pages.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for future performance optimization work:**

- Dynamic imports operational across all calculators ✓
- Bundle analysis tooling available (ANALYZE=true) ✓
- Baseline and post-split metrics documented ✓
- Static export and URL state preserved ✓

**Bundle improvements observed:**
- Total chunks: 210 → 212 (minimal increase, expected with code splitting)
- On-demand loading: Calculators load only when visited
- Reduced initial load: Homepage and category pages don't load calculator bundles
- Better caching: Individual calculator chunks cached separately

**Key metrics:**
- All 744 pages (4 locales × 186 routes) generated successfully
- Build time maintained (TypeScript validation passed)
- Service worker precaching operational (969 files)

---
*Phase: 21-code-splitting*
*Completed: 2026-01-24*
