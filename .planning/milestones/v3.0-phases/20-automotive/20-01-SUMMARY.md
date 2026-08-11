---
phase: 20-automotive
plan: 01
subsystem: calculators
tags: [fuel-efficiency, automotive, l/100km, mpg, zustand, url-sync, i18n]

# Dependency graph
requires:
  - phase: 18-real-estate-foundation
    provides: Category registration pattern, calculator page structure
  - phase: 19-cooking-nutrition-foundation
    provides: Zustand store pattern with URL sync, multi-mode calculator UI
provides:
  - Automotive category with 4 subcategories (fuel, tires, maintenance, financing)
  - Fuel efficiency calculation engine (L/100km primary, km/L and MPG conversions)
  - Trip cost and annual fuel cost estimation with CHF/EUR support
  - Swiss fuel price data (CHF/EUR for petrol_95/98, diesel, electric)
  - Three-mode calculator UI (consumption, trip planning, comparison)
affects: [20-02, 20-03, 20-04, future automotive calculators]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "L/100km as primary fuel efficiency metric (European standard)"
    - "Three-mode calculator with tabs (consumption, trip planning, comparison)"
    - "Efficiency rating system (excellent/good/average/poor) based on L/100km thresholds"

key-files:
  created:
    - src/lib/registry/automotive-converters.ts
    - src/lib/converters/automotive/types.ts
    - src/lib/converters/automotive/fuel-efficiency.ts
    - src/lib/converters/automotive/index.ts
    - src/lib/data/swiss-fuel-prices.json
    - src/stores/fuel-efficiency-store.ts
    - src/app/[locale]/automotive/page.tsx
    - src/app/[locale]/automotive/fuel-efficiency/page.tsx
    - src/app/[locale]/automotive/fuel-efficiency/fuel-efficiency-calculator.tsx
  modified:
    - src/lib/registry/categories.ts
    - src/lib/registry/converters.ts
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json

key-decisions:
  - "L/100km as primary metric (lower is better) for European/Swiss context"
  - "Support MPG (US) and MPG (UK) conversions for international users"
  - "CHF/EUR currency support only (Swiss/European context for v3.0)"
  - "Default Swiss fuel prices: CHF 1.85/L petrol_95, CHF 1.90/L diesel, CHF 0.30/kWh electric"
  - "Three calculation modes: consumption (calculate L/100km), trip planning (estimate fuel needed), comparison (compare vehicles)"
  - "Efficiency rating thresholds: excellent <5, good 5-7, average 7-9, poor >9 L/100km"

patterns-established:
  - "Automotive calculator pattern: shared types.ts, category-specific converters"
  - "Fuel price data pattern: JSON file with timestamp and source metadata"
  - "Multi-mode calculator with Tabs component and mode-specific input cards"

# Metrics
duration: 38min
completed: 2026-01-24
---

# Phase 20 Plan 01: Fuel Efficiency Calculator Summary

**L/100km fuel efficiency calculator with MPG conversions, trip cost estimation, and vehicle comparison using Swiss fuel prices**

## Performance

- **Duration:** 38 min
- **Started:** 2026-01-24T16:33:06Z
- **Completed:** 2026-01-24T17:10:47Z
- **Tasks:** 6
- **Files modified:** 22

## Accomplishments
- Automotive category registered with 4 subcategories and 4 calculator placeholders
- Fuel efficiency calculation engine with L/100km primary metric, km/L and MPG (US/UK) conversions
- Trip planning mode calculates fuel needed and cost for a journey
- Comparison mode compares two vehicles and calculates annual savings
- Swiss fuel price data (CHF 1.85/L petrol_95) integrated with currency switching
- Complete i18n coverage for all 4 locales (en/fr/de/it)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create automotive category and registry infrastructure** - `79fe154` (feat)
2. **Task 2: Create shared automotive types and fuel price data** - `73bc06a` (feat)
3. **Task 3: Create fuel efficiency calculation logic** - `29c28aa` (feat)
4. **Task 4: Create Zustand store with URL sync** - `8441b03` (feat)
5. **Task 5: Create page.tsx and calculator component** - `89ae558` (feat)
6. **Task 6: Add translations to all locale files** - `9da425a` (feat)

## Files Created/Modified

**Created:**
- `src/lib/registry/automotive-converters.ts` - Registry for 4 automotive calculators
- `src/lib/converters/automotive/types.ts` - Shared types: Currency, FuelType, EfficiencyRating
- `src/lib/converters/automotive/fuel-efficiency.ts` - Core calculation logic with 3 modes
- `src/lib/converters/automotive/index.ts` - Barrel exports
- `src/lib/data/swiss-fuel-prices.json` - CHF/EUR fuel prices with metadata
- `src/stores/fuel-efficiency-store.ts` - Zustand store with URL sync
- `src/app/[locale]/automotive/page.tsx` - Category page with grid layout
- `src/app/[locale]/automotive/fuel-efficiency/page.tsx` - Calculator page metadata
- `src/app/[locale]/automotive/fuel-efficiency/fuel-efficiency-calculator.tsx` - UI component

**Modified:**
- `src/lib/registry/categories.ts` - Added automotive category with Car icon
- `src/lib/registry/converters.ts` - Added automotiveConverters spread
- `src/messages/en.json` - Added automotive category, subcategories, converter, calculator translations
- `src/messages/fr.json` - Added automotive category, subcategories, converter, calculator translations
- `src/messages/de.json` - Added automotive category, subcategories, converter, calculator translations
- `src/messages/it.json` - Added automotive category, subcategories, converter, calculator translations

## Decisions Made

1. **L/100km as primary metric** - European/Swiss standard where lower is better, more intuitive than MPG
2. **MPG conversions for both US and UK** - US gallon (235.21 constant) differs from UK imperial gallon (282.48 constant)
3. **CHF/EUR currency support only** - Aligns with v3.0 Swiss/European focus, additional currencies can be added later
4. **Three calculation modes**:
   - Consumption: Calculate L/100km from distance traveled and fuel used
   - Trip Planning: Estimate fuel needed and cost for a journey
   - Comparison: Compare two vehicles and show annual savings
5. **Efficiency rating thresholds** - Based on modern European standards: excellent <5, good 5-7, average 7-9, poor >9 L/100km
6. **Swiss fuel prices as defaults** - CHF 1.85/L petrol_95, CHF 1.90/L diesel, CHF 0.30/kWh electric (2026-01-24 averages)
7. **Currency auto-updates fuel price** - When switching currency, fuel price updates to match (CHF 1.85 → EUR 1.65)
8. **Annual distance default: 15,000 km** - Typical European annual mileage

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully without problems.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for phase 20-02 (Tire Sizing Calculator):**
- Automotive category established and accessible
- Shared automotive types available for reuse
- Category page structure in place
- Translation pattern established for automotive calculators

**No blockers or concerns**

---
*Phase: 20-automotive*
*Completed: 2026-01-24*
