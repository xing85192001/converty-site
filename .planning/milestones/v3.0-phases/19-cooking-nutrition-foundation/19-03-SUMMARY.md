---
phase: 19-cooking-nutrition-foundation
plan: 03
subsystem: cooking/recipes
tags: [cooking, recipe, scaling, servings, non-linear]
requires:
  - Phase 01 (TypeScript strict mode)
  - Phase 02 (URL sync middleware)
  - Phase 19-01 (Cooking types and formatAsFraction)
provides:
  - Recipe Scaler at /[locale]/cooking/recipe-scaler
  - Non-linear scaling rules for salt, spices, leavening
  - SCALING_RULES exportable for future recipe tools
affects:
  - Future nutrition calculators can use recipe scaling
  - Meal planning tools can leverage scaling logic
tech-stack:
  added:
    - SCALING_RULES (non-linear ingredient scaling functions)
    - COMMON_UNITS (cooking unit dropdown options)
    - INGREDIENT_TYPE_LABELS (human-readable type descriptions)
  patterns:
    - Non-linear scaling formulas (salt 67-75%, spice 75%, leavening 87.5%)
    - Fractional display using formatAsFraction from types.ts
    - Dynamic ingredient table with add/remove functionality
key-files:
  created:
    - src/lib/converters/cooking/recipe-scaler.ts
    - src/stores/recipe-scaler-store.ts
    - src/app/[locale]/cooking/recipe-scaler/page.tsx
    - src/app/[locale]/cooking/recipe-scaler/recipe-scaler-calculator.tsx
  modified:
    - src/lib/converters/cooking/index.ts (+ recipe-scaler export)
    - src/lib/registry/cooking-converters.ts (+ recipe-scaler registration)
    - src/messages/en.json (recipe-scaler translations)
    - src/messages/fr.json (recipe-scaler translations)
    - src/messages/de.json (recipe-scaler translations)
    - src/messages/it.json (recipe-scaler translations)
decisions:
  - id: COOK-SCALE-01
    title: Non-linear scaling for salt at 67-75% rate
    rationale: Taste perception doesn't scale linearly; doubling recipe doesn't need double salt
    impact: Salt scales down at 67%, up at 75% to prevent over-seasoning
  - id: COOK-SCALE-02
    title: Spices and extracts scale at 75% rate
    rationale: Volatile compounds concentrate; over-scaling produces overwhelming flavor
    impact: More conservative scaling prevents overpowering flavors
  - id: COOK-SCALE-03
    title: Leavening agents scale at 87.5% rate
    rationale: Chemical reaction efficiency changes; over-leavening causes collapse
    impact: Careful scaling prevents texture issues in baked goods
  - id: COOK-SCALE-04
    title: Liquids scale down at 70%, normally up
    rationale: Evaporation rate doesn't change with quantity; large batches need less proportional liquid
    impact: Prevents over-drying when scaling down recipes
  - id: COOK-SCALE-05
    title: Fractional display for scaled amounts
    rationale: Cooking recipes use fractions (1/4, 1/2) not decimals
    impact: Both decimal and fractional columns in results table
metrics:
  duration: 19m
  commits: 4
  files: 10
  tasks: 4
completed: 2026-01-24
---

# Phase 19 Plan 03: Recipe Scaler Summary

**One-liner:** Intelligent recipe scaler with non-linear adjustments for salt (67-75%), spices (75%), and leavening (87.5%) to maintain flavor balance

## Objective

Create a Recipe Scaler that adjusts ingredient quantities with non-linear scaling rules for seasonings, leavening agents, and liquids to maintain proper flavor profiles when doubling, halving, or otherwise adjusting recipe servings.

**Status:** ✅ Complete

## What Was Built

### Core Features

1. **Non-Linear Scaling Engine**
   - SCALING_RULES with ingredient-specific multipliers
   - Standard ingredients: Linear (1:1) scaling
   - Salt: 67% scaling down, 75% scaling up
   - Spices/herbs: 75% scaling both directions
   - Leavening agents: 87.5% scaling (sensitive to over-leavening)
   - Liquids: 70% down (evaporation), 100% up (normal)
   - Extracts/flavorings: 75% scaling (concentrated)

2. **Recipe Input Interface**
   - Recipe name and servings (original → desired)
   - Dynamic ingredient table (add/remove rows)
   - Ingredient properties: name, amount, unit, type
   - Common cooking units dropdown (ml, L, cup, tbsp, tsp, g, kg, oz, lb, piece, pinch)
   - Ingredient type selector (standard, salt, spice, leavening, liquid, extract)

3. **Scaling Results Display**
   - Scale factor badge with direction indicator (up/down)
   - Scaled ingredients table with 4 columns:
     - Ingredient name with type badge (if non-linear)
     - Original amount
     - Scaled amount (decimal)
     - Fractional amount (using formatAsFraction)
   - Scaling notes (blue info card) explaining non-linear adjustments
   - Calculation steps showing work for each ingredient

4. **Zustand Store**
   - URL sync for recipeName, originalServings, desiredServings
   - Auto-calculate on servings change
   - Ingredient array (not synced to URL - too complex)
   - Dynamic ingredient CRUD operations

5. **Translation Support**
   - Complete translations for en/fr/de/it
   - Ingredient type labels localized
   - Scaling direction indicators localized

### Technical Implementation

**Scaling Formula Examples:**

**Doubling (factor 2.0):**
- Standard: 100g → 200g (2.0x)
- Salt: 1 tsp → 1.75 tsp (1 + (2-1)*0.75 = 1.75x)
- Spice: 1 tbsp → 1.75 tbsp (1.75x)
- Leavening: 1 tsp → 1.875 tsp (1 + (2-1)*0.875 = 1.875x)

**Halving (factor 0.5):**
- Standard: 100g → 50g (0.5x)
- Salt: 1 tsp → 0.665 tsp (0.5*0.67+0.33 = 0.665x)
- Spice: 1 tbsp → 0.625 tbsp (0.5*0.75+0.25 = 0.625x)
- Leavening: 1 tsp → 0.563 tsp (0.5*0.875+0.125 = 0.563x)
- Liquid: 100ml → 65ml (0.5*0.7+0.3 = 0.65x)

**File Structure:**
```
src/lib/converters/cooking/
  ├── recipe-scaler.ts         # Scaling logic + SCALING_RULES
  └── index.ts                 # + recipe-scaler export

src/lib/registry/
  └── cooking-converters.ts    # + recipe-scaler registration

src/stores/
  └── recipe-scaler-store.ts   # Zustand store with URL sync

src/app/[locale]/cooking/recipe-scaler/
  ├── page.tsx                 # Server component
  └── recipe-scaler-calculator.tsx  # Client component (235+ lines)

src/messages/
  ├── en.json                  # + recipe-scaler translations
  ├── fr.json                  # + recipe-scaler translations
  ├── de.json                  # + recipe-scaler translations
  └── it.json                  # + recipe-scaler translations
```

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 39efb07 | Create recipe scaling logic with non-linear rules |
| 2 | eba3801 | Create recipe scaler store and register calculator |
| 3 | c4642d9 | Create recipe scaler UI components |
| 4 | b081be0 | Add translations to all locale files |

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

**Functional verification (manual):**

✅ Non-linear scaling formulas verified programmatically:
- Doubling: Salt 1.750x, Spice 1.750x, Leavening 1.875x ✓
- Halving: Salt 0.665x, Spice 0.625x, Leavening 0.563x, Liquid 0.650x ✓

✅ UI functionality:
- Add/remove ingredient rows ✓
- Ingredient type selector updates non-linear scaling ✓
- Scale factor badge shows "Scaling up" / "Scaling down" ✓
- Scaling notes appear only when non-linear adjustments made ✓
- Fractional display: 1.75 → "1 3/4", 0.5 → "1/2" ✓
- Calculation steps show work for each ingredient ✓

✅ URL sync:
- ?originalServings=4&desiredServings=8 loads correctly ✓
- ?recipeName=Cookies shows in input field ✓

✅ Build verification:
- TypeScript: `npx tsc --noEmit` passes ✓
- Build: `npm run build` succeeds, 4 locale pages generated ✓
- All 4 locales display correctly (en/fr/de/it) ✓

## Next Phase Readiness

**Ready for Phase 19-04 (Nutrition Calculators):**
- ✅ Recipe ingredient structure ready for nutrition analysis
- ✅ Serving calculation logic available for meal planning
- ✅ Cooking types and units established

**Dependencies satisfied:**
- Phase 01: TypeScript strict mode (all types explicit)
- Phase 02: URL sync middleware (store uses createUrlSyncMiddleware)
- Phase 19-01: formatAsFraction used for fractional display

**No blockers identified.**

## Key Learnings

1. **Non-linear scaling is essential:** Linear scaling (2x servings = 2x ingredients) produces over-seasoned, over-leavened, or too-wet results. Research-based scaling factors prevent recipe failures.

2. **Different rules for scaling up vs. down:** Liquids need different multipliers when reducing (evaporation) vs. increasing (normal). Salt/spices have minimum thresholds when scaling down.

3. **Fractional display improves UX:** Cooking measurements use "1/2 tsp" not "0.5 tsp" - formatAsFraction from types.ts provides familiar display format.

4. **Transparency builds trust:** Showing both scaling notes and calculation steps helps users understand why 2x recipe doesn't use 2x salt.

5. **Ingredient categorization matters:** Grouping ingredients by type (standard, salt, spice, leavening, liquid, extract) enables intelligent scaling without complex per-ingredient rules.

## Statistics

- **Duration:** 19 minutes
- **Commits:** 4 atomic commits
- **Files created:** 4
- **Files modified:** 6
- **Lines added:** ~950
- **Ingredient types:** 6 (standard, salt, spice, leavening, liquid, extract)
- **Scaling rules:** 6 (one per ingredient type)
- **Common units:** 13 (ml, L, cup, tbsp, tsp, fl oz, g, kg, oz, lb, piece, pinch, to taste)
- **Locales:** 4 (en, fr, de, it)

---

**Phase 19 Plan 03 complete.** Recipe Scaler operational at `/[locale]/cooking/recipe-scaler` with intelligent non-linear scaling for professional results.
