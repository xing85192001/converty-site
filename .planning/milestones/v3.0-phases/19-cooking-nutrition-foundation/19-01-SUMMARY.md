---
phase: 19-cooking-nutrition-foundation
plan: 01
subsystem: cooking/units
tags: [cooking, units, conversion, density, metric, imperial]
requires:
  - Phase 01 (TypeScript strict mode)
  - Phase 02 (URL sync middleware)
provides:
  - Cooking category registered in categories.ts
  - Cooking unit converter at /[locale]/cooking/cooking-units
  - Shared cooking types for future calculators
  - Ingredient density table (30 common ingredients)
affects:
  - Phase 19-02: Recipe scaling will use cooking types
  - Phase 19-03: Nutrition calculators will use ingredient data
tech-stack:
  added:
    - INGREDIENT_DENSITIES table (30 ingredients with g/ml density)
  patterns:
    - Density-aware conversions (volume <-> weight)
    - Fractional display for imperial units (1/4, 1/2, etc.)
    - US standard measurements (240ml cup, 15ml tbsp, 5ml tsp)
key-files:
  created:
    - src/lib/converters/cooking/types.ts
    - src/lib/converters/cooking/cooking-units.ts
    - src/lib/converters/cooking/index.ts
    - src/lib/data/cooking-densities.ts
    - src/lib/registry/cooking-converters.ts
    - src/stores/cooking-units-store.ts
    - src/app/[locale]/cooking/cooking-units/page.tsx
    - src/app/[locale]/cooking/cooking-units/cooking-units-calculator.tsx
  modified:
    - src/lib/registry/categories.ts (added cooking category)
    - src/lib/registry/converters.ts (added cookingConverters)
    - src/messages/en.json (cooking translations)
    - src/messages/fr.json (cooking translations)
    - src/messages/de.json (cooking translations)
    - src/messages/it.json (cooking translations)
decisions:
  - id: COOK-UNITS-01
    title: Metric units primary (ml, g) with imperial support
    rationale: European/Swiss context, metric is standard - imperial available for convenience
    impact: Default selections are ml and g, imperial conversions available
  - id: COOK-UNITS-02
    title: US standard cup (240ml) not UK cup (284ml)
    rationale: US recipes more common internationally, clear standard for conversions
    impact: All volume conversions use 240ml cup
  - id: COOK-UNITS-03
    title: Density table required for volume/weight conversions
    rationale: Different ingredients have different densities (1 cup flour ≠ 1 cup water in weight)
    impact: Cross-type conversions require ingredient selection
  - id: COOK-UNITS-04
    title: Fractional display for imperial units
    rationale: Cooking recipes typically use fractions (1/4 cup) not decimals (0.25 cup)
    impact: Results show "1/2" instead of "0.5" for better UX
metrics:
  duration: 10m
  commits: 4
  files: 14
  tasks: 4
completed: 2026-01-24
---

# Phase 19 Plan 01: Cooking Unit Converter Summary

**One-liner:** Metric-first cooking unit converter with density-aware volume/weight conversions for 30 common ingredients

## Objective

Create a Cooking Unit Converter that handles metric-first volume/weight conversions with density-aware ingredient support, establishing the cooking category infrastructure for future recipe and nutrition calculators.

**Status:** ✅ Complete

## What Was Built

### Core Features

1. **Cooking Category Infrastructure**
   - New "Cooking" category with UtensilsCrossed icon
   - 4 subcategories: Unit Conversion, Recipe Tools, Nutrition, Food Cost
   - Registered in categories.ts and converters.ts

2. **Shared Types & Utilities**
   - VolumeUnit type (ml, l, cup, tbsp, tsp, fl-oz)
   - WeightUnit type (g, kg, oz, lb)
   - CookingUnit combined type
   - formatAsFraction() for imperial display (0.25 → "1/4")
   - isVolumeUnit() and isWeightUnit() type guards

3. **Ingredient Density Table**
   - 30 common ingredients with g/ml density
   - Categories: flour (6), sugar (5), liquid (5), dairy (4), fat (3), other (7)
   - Source: King Arthur Baking, USDA standards

4. **Conversion Logic**
   - Volume-to-volume conversions (ml ↔ cup, tbsp, tsp, etc.)
   - Weight-to-weight conversions (g ↔ oz, lb, etc.)
   - Cross-type conversions with ingredient density
   - Steps array for showing calculation work

5. **Zustand Store**
   - URL sync for amount, fromUnit, toUnit, ingredientId
   - Auto-calculate on input change
   - Swap units functionality

6. **Calculator UI**
   - Grouped unit selectors (metric/imperial, volume/weight)
   - Ingredient selector (appears only for cross-type conversions)
   - Fractional result display
   - Conversion steps breakdown
   - 4 locale support (en/fr/de/it)

### Technical Implementation

**File Structure:**
```
src/lib/converters/cooking/
  ├── types.ts                 # Shared types & utilities
  ├── cooking-units.ts         # Conversion logic
  └── index.ts                 # Exports

src/lib/data/
  └── cooking-densities.ts     # Ingredient density table

src/lib/registry/
  ├── cooking-converters.ts    # Cooking category registry
  ├── categories.ts            # + cooking category
  └── converters.ts            # + cookingConverters

src/stores/
  └── cooking-units-store.ts   # Zustand store with URL sync

src/app/[locale]/cooking/cooking-units/
  ├── page.tsx                 # Server component
  └── cooking-units-calculator.tsx  # Client component

src/messages/
  ├── en.json                  # + cooking translations
  ├── fr.json                  # + cooking translations
  ├── de.json                  # + cooking translations
  └── it.json                  # + cooking translations
```

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 18d3b8a | Set up cooking category and shared types |
| 2 | 146fcd1 | Create cooking unit conversion logic |
| 3 | f20547e | Create Zustand store and UI components |
| 4 | 39aa5ef | Add translations to all locale files |

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

**Functional verification (manual):**

✅ 1 cup water → 240 ml (volume to volume)
✅ 240 ml → 1 cup (fractional display)
✅ 1 cup all-purpose flour → 127.2 g (volume to weight with density 0.53 g/ml)
✅ 100 g all-purpose flour → 0.785 cup (weight to volume)
✅ 1 kg → 2.2 lb (weight to weight)
✅ Fractional display: 0.25 → "1/4", 2.5 → "2 1/2"
✅ Ingredient selector appears only for cross-type conversions
✅ URL sync: ?amount=2&fromUnit=cup&toUnit=ml loads correctly
✅ All 4 locales display correctly (en/fr/de/it)

**Build verification:**
- TypeScript: `npx tsc --noEmit` ✅ passes
- Biome: `npx biome check src/messages/` ✅ passes

## Next Phase Readiness

**Ready for Phase 19-02 (Recipe Scaling):**
- ✅ Cooking types available for recipe ingredient lists
- ✅ formatAsFraction() ready for recipe display
- ✅ Ingredient density table ready for scaling calculations

**Dependencies satisfied:**
- Phase 01: TypeScript strict mode (types are fully typed)
- Phase 02: URL sync middleware (store uses createUrlSyncMiddleware)

**No blockers identified.**

## Key Learnings

1. **Density matters:** Volume-to-weight conversions vary significantly by ingredient (1 cup flour ≠ 1 cup water in weight). Density table is essential for accuracy.

2. **Fractional display is expected:** Cooking recipes use "1/4 cup" not "0.25 cups" - formatAsFraction() significantly improves UX.

3. **Metric-first approach:** Defaulting to ml/g aligns with European/Swiss context while still supporting imperial for recipe compatibility.

4. **US vs UK standards:** Using 240ml cup (US) instead of 284ml cup (UK) provides clearer international standard.

## Statistics

- **Duration:** 10 minutes
- **Commits:** 4 atomic commits
- **Files created:** 8
- **Files modified:** 6
- **Lines added:** ~1,120
- **Ingredients in density table:** 30
- **Supported units:** 10 (6 volume + 4 weight)
- **Locales:** 4 (en, fr, de, it)

---

**Phase 19 Plan 01 complete.** Cooking Unit Converter operational at `/[locale]/cooking/cooking-units`.
