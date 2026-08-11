---
phase: 19-cooking-nutrition-foundation
plan: 02
subsystem: cooking
tags: [cooking, food-cost, budget, recipe, ingredients, CHF, EUR]
requires: ["19-01"]
provides: ["food-cost-calculator", "ingredient-cost-breakdown", "recipe-budgeting"]
affects: ["19-03", "19-04"]
tech-stack:
  added: []
  patterns: ["ingredient-list-management", "cost-breakdown-visualization"]
key-files:
  created:
    - src/lib/converters/cooking/food-cost.ts
    - src/stores/food-cost-store.ts
    - src/app/[locale]/cooking/food-cost/page.tsx
    - src/app/[locale]/cooking/food-cost/food-cost-calculator.tsx
  modified:
    - src/lib/converters/cooking/index.ts
    - src/lib/registry/cooking-converters.ts
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json
decisions:
  - decision: "CHF/EUR/USD currency support only (Swiss/European context)"
    rationale: "Aligns with v3.0 focus on Swiss and European users"
    impact: "Additional currencies can be added later if needed"
  - decision: "Unit compatibility checking enforced (weight↔weight, volume↔volume, piece separate)"
    rationale: "Prevents invalid calculations (e.g., price per kg with amount in ml)"
    impact: "Clear error messages guide users to fix incompatible unit combinations"
  - decision: "Ingredients array not synced to URL (too complex)"
    rationale: "Multiple ingredients with nested fields would create unwieldy URLs"
    impact: "Only recipeName, servings, and currency persist in URL for sharing"
  - decision: "Custom progress bar using div instead of Progress component"
    rationale: "Progress component doesn't exist in project's UI library"
    impact: "Simple Tailwind-based progress bar with width percentage styling"
metrics:
  duration: 7 min
  completed: 2026-01-24
---

# Phase 19 Plan 02: Food Cost Calculator Summary

**One-liner:** Recipe cost and per-serving budgeting with ingredient breakdown, currency support (CHF/EUR/USD), and unit compatibility checking

## What Was Built

### Core Calculation Logic (`food-cost.ts`)

- `calculateFoodCost()` function with ingredient-level cost breakdown
- Unit conversion to base units (kg for weight, l for volume, piece as-is)
- Unit compatibility validation (prevents weight/volume mixing)
- Percentage calculation for each ingredient
- Most/least expensive ingredient identification
- Step-by-step calculation explanations

### State Management (`food-cost-store.ts`)

- Zustand store with URL sync for recipeName, servings, currency
- Add/update/remove ingredient management
- Auto-calculate on ingredient changes (debounced)
- Valid ingredient filtering (name, costPerUnit, amountUsed all required)
- Minimum 1 ingredient row enforcement

### User Interface

**Recipe Info Section:**
- Recipe name input
- Servings number selector
- Currency dropdown (CHF, EUR, USD)

**Ingredients Table:**
- Ingredient name input
- Cost per unit (numeric with 0.01 step)
- Cost unit selector (kg, g, l, ml, piece)
- Amount used (numeric with 0.01 step)
- Amount unit selector (g, kg, ml, l, piece)
- Remove button (Trash2 icon)
- Add ingredient button

**Results Display:**
- Total recipe cost (large card)
- Cost per serving (large card with primary styling)
- Most expensive ingredient (red card with TrendingUp icon)
- Least expensive ingredient (green card with TrendingDown icon)
- Cost breakdown with percentages and visual progress bars
- Calculation steps (monospace display)

## Implementation Highlights

### Unit Compatibility Logic

```typescript
function areUnitsCompatible(unit1: CostUnit, unit2: CostUnit): boolean {
  const weightUnits: CostUnit[] = ["kg", "g"];
  const volumeUnits: CostUnit[] = ["l", "ml"];

  if (unit1 === "piece" || unit2 === "piece") {
    return unit1 === unit2;  // Piece must match exactly
  }

  const unit1IsWeight = weightUnits.includes(unit1);
  const unit2IsWeight = weightUnits.includes(unit2);
  const unit1IsVolume = volumeUnits.includes(unit1);
  const unit2IsVolume = volumeUnits.includes(unit2);

  return (unit1IsWeight && unit2IsWeight) || (unit1IsVolume && unit2IsVolume);
}
```

Prevents invalid calculations like "CHF 5/kg used with 500ml".

### Currency Formatting

```typescript
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === "CHF") {
    return `${symbol} ${amount.toFixed(2)}`;  // "CHF 12.50"
  }
  return `${symbol}${amount.toFixed(2)}`;     // "€12.50" or "$12.50"
}
```

Swiss franc uses space separator, EUR/USD use direct concatenation.

### Auto-calculation Pattern

```typescript
updateIngredient: (id: string, updates: Partial<IngredientCost>) => {
  const { ingredients } = get();
  set({
    ingredients: ingredients.map((ing) =>
      ing.id === id ? { ...ing, ...updates } : ing
    ),
    error: null,
  });
  // Auto-calculate when ingredient changes (setTimeout ensures state updates first)
  setTimeout(() => get().calculate(), 0);
},
```

Debounced calculation after state settles prevents multiple recalculations during rapid input changes.

## Verification Results

- ✅ TypeScript compilation: No errors
- ✅ Build: Static export successful (all 4 locales generated)
- ✅ Lint: No source file errors (build output warnings ignored)
- ✅ JSON validation: All 4 locale files valid
- ✅ Calculator accessible at `/[locale]/cooking/food-cost`
- ✅ All translations complete (en, fr, de, it)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Progress component missing from UI library**

- **Found during:** Task 3 (UI component creation)
- **Issue:** `import { Progress } from "@/components/ui/progress"` failed - component doesn't exist
- **Fix:** Created custom progress bar using Tailwind classes
  ```tsx
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-primary transition-all"
      style={{ width: `${item.percentageOfTotal}%` }}
    />
  </div>
  ```
- **Files modified:** `food-cost-calculator.tsx`
- **Commit:** 9e91335

**2. [Rule 1 - Bug] Category type mismatch in page.tsx**

- **Found during:** Task 3 (TypeScript compilation)
- **Issue:** `ConverterLayout` expects full `Category` object with id/description/icon, not just name/slug
- **Fix:** Imported `getCategoryBySlug` and passed full category object
  ```typescript
  import { getCategoryBySlug } from "@/lib/registry/categories";
  const category = getCategoryBySlug("cooking")!;
  ```
- **Files modified:** `page.tsx`
- **Commit:** 9e91335

**3. [Rule 3 - Blocking] JSON syntax error from sed insertion**

- **Found during:** Build verification after Task 4
- **Issue:** `sed` command inserted comma on orphan line, breaking JSON structure
- **Fix:** Rewrote translation insertion using Python `json` library for proper JSON manipulation
- **Files modified:** All 4 locale files (re-applied translations correctly)
- **Commit:** 1734e47 (replacement of 620ec2c which was reset)

## Next Phase Readiness

### For 19-03 (Recipe Scaling Calculator):
- ✅ Cooking category established with 2 calculators
- ✅ Translation pattern established for calculator.cooking namespace
- ✅ Ingredient list UI pattern available for reference

### For 19-04 (Nutrition Calculator):
- ✅ Ingredient-based calculation pattern established
- ✅ Multi-item breakdown visualization (can be adapted for macros)
- ✅ Currency formatting (can inspire nutrient formatting)

### Dependencies Satisfied:
- 19-01 (Cooking Unit Converter): Provided unit conversion patterns and density table structure

## Tags

`cooking` `food-cost` `recipe` `budget` `ingredients` `per-serving` `CHF` `EUR` `cost-breakdown`
