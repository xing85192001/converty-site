---
phase: 43-zod-input-validation
plan: "04"
subsystem: math
tags: [zod, validation, math, forms, input-validation, error-display]

# Dependency graph
requires:
  - phase: 43-01
    provides: createCalculatorStore with optional schema: ZodType<T> parameter and errors: Partial<Record<keyof T, string>> return value

provides:
  - src/lib/schemas/math/index.ts with 38 Zod schemas for all math calculator FormValues types
  - Field-level validation error display wired into all 30 math calculators using createCalculatorStore

affects: [math calculators, 43-zod-input-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "String-based Zod schemas using z.string().refine() — NOT z.coerce.number() — to match string-typed FormValues"
    - "Helper factories (numStr, posNumStr, nonNegNumStr, posIntStr, numStrRange, probabilityStr) for reusable validations"
    - "Non-zero refine on denominators, theoretical values, divisor, and coefficient a to prevent division-by-zero"
    - "Regex validation for binary (/^[01]+$/) and hex (/^[0-9a-fA-F#]+$/) input fields"
    - "error={errors.fieldName} prop pattern on all InputField components"

key-files:
  created:
    - src/lib/schemas/math/index.ts
  modified:
    - src/app/[locale]/math/area-calculator/area-calculator.tsx
    - src/app/[locale]/math/binary-calculator/binary-calculator.tsx
    - src/app/[locale]/math/circle-calculator/circle-calculator.tsx
    - src/app/[locale]/math/confidence-interval-calculator/confidence-interval-calculator.tsx
    - src/app/[locale]/math/distance-calculator/distance-calculator.tsx
    - src/app/[locale]/math/exponent-calculator/exponent-calculator.tsx
    - src/app/[locale]/math/factor-calculator/factor-calculator.tsx
    - src/app/[locale]/math/fraction-calculator/fraction-calculator.tsx
    - src/app/[locale]/math/half-life-calculator/half-life-calculator.tsx
    - src/app/[locale]/math/hex-calculator/hex-calculator.tsx
    - src/app/[locale]/math/logarithm-calculator/logarithm-calculator.tsx
    - src/app/[locale]/math/long-division/long-division-calculator.tsx
    - src/app/[locale]/math/p-value-calculator/p-value-calculator.tsx
    - src/app/[locale]/math/percent-error-calculator/percent-error-calculator.tsx
    - src/app/[locale]/math/percentage-calculator/percentage-calculator.tsx
    - src/app/[locale]/math/permutation-combination-calculator/permutation-combination-calculator.tsx
    - src/app/[locale]/math/prime-factorization-calculator/prime-factorization-calculator.tsx
    - src/app/[locale]/math/probability-calculator/probability-calculator.tsx
    - src/app/[locale]/math/pythagorean-calculator/pythagorean-calculator.tsx
    - src/app/[locale]/math/quadratic-calculator/quadratic-calculator.tsx
    - src/app/[locale]/math/ratio-calculator/ratio-calculator.tsx
    - src/app/[locale]/math/root-calculator/root-calculator.tsx
    - src/app/[locale]/math/rounding-calculator/rounding-calculator.tsx
    - src/app/[locale]/math/sample-size-calculator/sample-size-calculator.tsx
    - src/app/[locale]/math/scientific-notation/scientific-notation.tsx
    - src/app/[locale]/math/slope-calculator/slope-calculator.tsx
    - src/app/[locale]/math/surface-area-calculator/surface-area-calculator.tsx
    - src/app/[locale]/math/triangle-calculator/triangle-calculator.tsx
    - src/app/[locale]/math/volume-calculator/volume-calculator.tsx
    - src/app/[locale]/math/z-score-calculator/z-score-calculator.tsx

key-decisions:
  - "String-based Zod schemas (z.string().refine()) used instead of z.coerce.number() — consistent with health/finance pattern, required because FormValues use string fields"
  - "8 math calculators using useState directly (average, big-number, gcd-lcm, matrix, number-sequence, standard-deviation, statistics, random-number) have schemas created but not wired to stores"
  - "Non-zero refinements added to denominators (fraction), divisor (long-division), theoretical value (percent-error), and coefficient a (quadratic) to prevent mathematical errors at validation layer"
  - "Hex schema allows # character to support color code input (#FF8040)"

patterns-established:
  - "Schema wiring pattern: import schema → add schema: XxxFormSchema to createCalculatorStore → destructure errors → add error={errors.fieldName} to each InputField"
  - "Helper numStrRange() used for bounded values (probabilities 0-1, angles, percentages, RGB channels)"

requirements-completed: []

# Metrics
duration: 45min
completed: 2026-02-26
---

# Phase 43 Plan 04: Math Zod Schemas and Field-Error Wiring Summary

**38 Zod string-based schemas created for math category and wired into 30 createCalculatorStore-based math calculators with field-level error display.**

## Performance

- **Duration:** 45 min
- **Completed:** 2026-02-26T12:57:10Z
- **Tasks:** 2/2
- **Files modified:** 31 (1 created, 30 modified)

## Accomplishments

### Task 1: Create Math Schemas File

Created `/Users/fjacquet/Projects/converty/src/lib/schemas/math/index.ts` with 38 exported Zod schemas:

- Helper factories: `numStr`, `posNumStr`, `nonNegNumStr`, `posIntStr`, `numStrRange`, `probabilityStr`
- All schemas use `z.string().refine()` pattern (not `z.coerce.number()`) to match string-typed FormValues
- Special validations: binary regex, hex regex (with # for color codes), non-zero denominators/divisors
- 8 useState-based calculators included with schema definitions but noted as not wired to stores

### Task 2: Wire Schemas Into Math Calculator Components

Applied three-step wiring pattern to 30 math calculator components:
1. Import schema from `@/lib/schemas/math`
2. Add `schema: XxxFormSchema` to `createCalculatorStore` call
3. Destructure `errors` from store hook and add `error={errors.fieldName}` to all InputField components

Components wired: area, binary, circle, confidence-interval, distance, exponent, factor, fraction, half-life, hex, logarithm, long-division, p-value, percent-error, percentage, permutation-combination, prime-factorization, probability, pythagorean, quadratic, ratio, root, rounding, sample-size, scientific-notation, slope, surface-area, triangle, volume, z-score.

## Deviations from Plan

None - plan executed exactly as written. The distinction between createCalculatorStore-based and useState-based calculators was already identified in STATE.md decisions from prior plans.

## Commits

- `b63d6ef`: feat(43-04): create math schemas file with 38 Zod schemas
- `8d1186b`: feat(43-04): wire Zod schemas and field errors into all math calculator components

## Self-Check: PASSED

- src/lib/schemas/math/index.ts: FOUND
- Commits b63d6ef and 8d1186b: FOUND (git log confirms)
- TypeScript type check: PASSED (npm run type-check returned clean)
- Biome check: PASSED (only pre-existing unrelated errors in FeatureMatrixTable.tsx)
