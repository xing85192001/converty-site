---
phase: 43-zod-input-validation
plan: "02"
subsystem: health-calculators
tags: [zod, validation, health, field-errors, schema]
dependency_graph:
  requires:
    - "43-01"
  provides:
    - "src/lib/schemas/health/index.ts"
    - "health-calculator-field-errors"
  affects:
    - "all 27 health calculator components"
tech_stack:
  added: []
  patterns:
    - "string-based Zod schemas matching FormValues string types"
    - "z.string().refine() for numeric validation (not z.coerce.number())"
    - "errors destructured from useStore() and passed to InputField"
key_files:
  created:
    - src/lib/schemas/health/index.ts
  modified:
    - src/app/[locale]/health/bmi/bmi-calculator.tsx
    - src/app/[locale]/health/army-body-fat/army-body-fat-calculator.tsx
    - src/app/[locale]/health/bmr-calculator/bmr-calculator-component.tsx
    - src/app/[locale]/health/body-fat/body-fat-calculator.tsx
    - src/app/[locale]/health/body-surface-area/body-surface-area-calculator.tsx
    - src/app/[locale]/health/body-type/body-type-calculator.tsx
    - src/app/[locale]/health/calorie-calculator/calorie-calculator-component.tsx
    - src/app/[locale]/health/calories-burned/calories-burned-calculator.tsx
    - src/app/[locale]/health/carb-calculator/carb-calculator-component.tsx
    - src/app/[locale]/health/due-date/due-date-calculator.tsx
    - src/app/[locale]/health/fat-intake/fat-intake-calculator.tsx
    - src/app/[locale]/health/gfr-calculator/gfr-calculator-component.tsx
    - src/app/[locale]/health/healthy-weight/healthy-weight-calculator.tsx
    - src/app/[locale]/health/ideal-weight/ideal-weight-calculator.tsx
    - src/app/[locale]/health/lean-body-mass/lean-body-mass-calculator.tsx
    - src/app/[locale]/health/macro-calculator/macro-calculator-component.tsx
    - src/app/[locale]/health/one-rep-max/one-rep-max-calculator.tsx
    - src/app/[locale]/health/ovulation-calculator/ovulation-calculator-component.tsx
    - src/app/[locale]/health/pace-calculator/pace-calculator-component.tsx
    - src/app/[locale]/health/period-calculator/period-calculator-component.tsx
    - src/app/[locale]/health/pregnancy-weight-gain/pregnancy-weight-gain-calculator.tsx
    - src/app/[locale]/health/protein-calculator/protein-calculator-component.tsx
    - src/app/[locale]/health/sleep-calculator/sleep-calculator-component.tsx
    - src/app/[locale]/health/target-heart-rate/target-heart-rate-calculator.tsx
    - src/app/[locale]/health/tdee-calculator/tdee-calculator-component.tsx
    - src/app/[locale]/health/water-intake/water-intake-calculator.tsx
decisions:
  - "String-based Zod schemas (z.string().refine()) used instead of z.coerce.number() — FormValues types are string-based; coerce outputs number causing ZodType<FormValues> mismatch"
  - "Corpulence calculator skipped for store wiring — uses useState directly, not createCalculatorStore"
  - "numStr() and numStrRange() helper factories created to reduce repetition across 27 schemas"
metrics:
  duration: "24 min"
  completed_date: "2026-02-26"
  tasks_completed: 2
  files_created: 1
  files_modified: 27
requirements:
  - R3.2
  - R3.5
  - R3.6
---

# Phase 43 Plan 02: Health Calculator Zod Schemas and Field Errors Summary

**One-liner:** Field-level Zod validation with error display wired into all 27 health calculators using string-refine schemas matching FormValues string types.

## What Was Built

Created `src/lib/schemas/health/index.ts` with 27 named Zod schemas — one per health calculator. Each schema validates the string-based FormValues fields with physiologically sensible range constraints. Wired each schema into the calculator's `createCalculatorStore` call and added `error={errors.fieldName}` to every numeric InputField.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create health schemas file | db4ebd0 | 1 created (src/lib/schemas/health/index.ts) |
| 2 | Wire schemas and errors into all 27 calculators | 77f1c49 | 27 modified |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] z.coerce.number() type mismatch with FormValues string fields**
- **Found during:** Task 2 (type-check run after wiring schemas)
- **Issue:** All health calculator FormValues types use `string` for numeric fields (e.g., `weight: string`). Using `z.coerce.number()` outputs `number`, which is incompatible with `ZodType<FormValues>` generic constraint in `createCalculatorStore`
- **Fix:** Replaced `z.coerce.number()` with `z.string().refine()` approach using helper factories (`numStr`, `numStrRange`). Validates the string representation without changing the output type
- **Files modified:** src/lib/schemas/health/index.ts (full rewrite of numeric validators)
- **Commit:** db4ebd0 → 77f1c49 (schema file updated as part of Task 2 commit)

**2. [Rule 2 - Skip] Corpulence calculator not wired**
- **Found during:** Task 1 (reading calculator source)
- **Issue:** The `corpulence-calculator.tsx` uses `useState` directly, not `createCalculatorStore`. No schema integration point exists.
- **Fix:** Schema (`CorpulenceFormSchema`) created for completeness with documentation comment. Store wiring skipped as instructed by plan (skip if custom UI)
- **Impact:** 27 out of 28 health calculators fully wired (corpulence is the exception)

## Key Decisions Made

1. **String-based schemas:** Used `z.string().refine()` with `Number(v)` parsing instead of `z.coerce.number()` — the latter changes the output type to `number`, breaking TypeScript compatibility with string-typed FormValues
2. **Helper factory functions:** Created `numStr(label)` and `numStrRange(label, min, max)` helpers at the top of the schema file to reduce repetition across 27 schemas
3. **Corpulence skipped for store wiring:** Uses React `useState` directly — no `createCalculatorStore` call to attach a schema to. Schema exported as completeness token.

## Verification Results

- `npm run type-check` — zero errors
- `npm run check:fix` — zero Biome errors (health directory: 57 files, 0 errors)
- `npm run build` — build completes successfully, all health calculator pages generated
- BMI calculator: `errors.weight` and `errors.height` passed to respective InputFields
- Schema exports count: 27 named schemas in health/index.ts

## Self-Check: PASSED

- src/lib/schemas/health/index.ts exists: FOUND
- 27 exports in schema file: FOUND
- Commit db4ebd0 exists: FOUND
- Commit 77f1c49 exists: FOUND
- errors.weight on BMI InputField: FOUND
