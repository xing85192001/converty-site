# Phase 45: Discriminated Union Result Types - Research

**Researched:** 2026-02-26
**Domain:** TypeScript discriminated unions, converter migration, Zustand store factory, Vitest test refactoring
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R5.1 | `CalculationResult<T>` type defined: `{ ok: true; value: T } \| { ok: false; error: string; code: string }` | Type definition location, export strategy documented |
| R5.2 | All converters in `src/lib/converters/` updated to return `CalculationResult<T>` | 169 converter files catalogued by category; migration strategy per-category documented |
| R5.3 | `createCalculatorStore` factory updated to handle the new result shape | Current store code fully read; exact change points identified |
| R5.4 | Calculator components updated to render typed error messages from `result.error` | Rendering pattern documented; `{result && ...}` → `{result.ok && ...}` change identified |
| R5.5 | All tests updated to use `.ok` discriminant | Current patterns (`result!.field`, `toBeNull()`) catalogued; new patterns documented |
</phase_requirements>

---

## Summary

Phase 45 migrates all 169 converters from returning `T | null` to returning `CalculationResult<T>`, a discriminated union that carries typed error information on the failure path. The type shape is locked in REQUIREMENTS.md R5.1 as `{ ok: true; value: T } | { ok: false; error: string; code: string }`.

The migration touches five distinct layers: the type definition (1 new file), converter functions (~169 files), the Zustand store factory (1 file with targeted changes), calculator components (~169 component files, each with a `{result && ...}` guard), and tests (196 test files using `result!.field` and `toBeNull()` patterns). Approximately 3 converters already use a different discriminated union (`success` instead of `ok`) — those need renaming to align with the new standard.

The correct migration strategy is wave-based by category, NOT a big-bang rewrite. The planner should group converters into 3-4 waves to keep each plan manageable (one category or related group per plan). Full migration in a single plan is unrealistic given 169 converter files + 196 test files.

**Primary recommendation:** Define `CalculationResult<T>` in `src/lib/types/calculation-result.ts`, update the store factory in a single plan, then migrate converters category by category in parallel wave plans, with tests updated in the same plan as the converters they cover.

---

## Standard Stack

### Core (already installed — no new deps needed)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| TypeScript (strict) | ~5 | Discriminated unions are native TS feature | Already configured with strict mode |
| Vitest | current | Test runner for updated assertions | Already installed from Phase 40 |
| Biome | current | Linting — no `any`, enforce type narrowing | Already configured |

### No New Dependencies Required
This phase is pure TypeScript refactoring. No new npm packages are needed.

---

## Architecture Patterns

### The `CalculationResult<T>` Type (R5.1 — EXACT SHAPE LOCKED)

From REQUIREMENTS.md:
```typescript
// src/lib/types/calculation-result.ts
export type CalculationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code: string };
```

**Important:** The `code` field is required on the failure case. It should be a short machine-readable string (e.g., `"INVALID_INPUT"`, `"DIVISION_BY_ZERO"`, `"NEGATIVE_VALUE"`).

**File location:** `src/lib/types/calculation-result.ts`
Export via `src/lib/types/index.ts` (which currently re-exports from `src/types/converter.ts`).

**Note:** `src/types/` already exists with `converter.ts` and `index.ts`. Add `calculation-result.ts` there, then re-export from `src/types/index.ts`.

### Recommended Project Structure (additions only)

```
src/
├── types/
│   ├── converter.ts              # existing
│   ├── calculation-result.ts     # NEW — CalculationResult<T> type
│   └── index.ts                  # updated to re-export CalculationResult
```

### Pattern 1: Converter Migration (T | null → CalculationResult<T>)

**Before (current pattern — all 169 converters):**
```typescript
// src/lib/converters/health/bmi.ts
export function calculateBMI(input: BMIInput): BMIResult | null {
  if (input.weight <= 0 || input.height <= 0) {
    return null;
  }
  // ... calculation
  return { bmi, category, healthyWeightRange, weightToHealthy };
}
```

**After (target pattern):**
```typescript
// src/lib/converters/health/bmi.ts
import type { CalculationResult } from "@/types";

export function calculateBMI(input: BMIInput): CalculationResult<BMIResult> {
  if (input.weight <= 0 || input.height <= 0) {
    return { ok: false, error: "Weight and height must be positive", code: "INVALID_INPUT" };
  }
  if (heightM <= 0) {
    return { ok: false, error: "Height must be positive after conversion", code: "INVALID_INPUT" };
  }
  // ... calculation
  return { ok: true, value: { bmi, category, healthyWeightRange, weightToHealthy } };
}
```

### Pattern 2: Store Factory Update (R5.3)

**Current `createCalculatorStore` signature:**
```typescript
calculate: (values: T) => R | null;
```

**Key insight:** The store currently stores `result: R | null`. After the migration, converters return `CalculationResult<R>`, but the store's `result` field should remain `R | null` for backward compatibility with all 169 component rendering guards (`{result && ...}`).

**Two valid strategies:**

**Strategy A — Adapter in store (RECOMMENDED):** Keep `result: R | null` in state. Store factory unwraps `CalculationResult<R>`:
```typescript
// Inside setValue/setValues in calculator-store.ts
const calcResult = calculate(newValues);
const result = calcResult !== null && calcResult.ok ? calcResult.value : null;
const calculationError = calcResult !== null && !calcResult.ok ? calcResult.error : undefined;
set({ values: newValues, errors, result, calculationError });
```
Add `calculationError?: string` to `CalculatorState<T, R>` for R5.4.

**Strategy B — Change result type to CalculationResult<R>:** Requires updating all 169 components from `{result && ...}` to `{result?.ok && result.value && ...}`. Higher risk, 169 component files.

Strategy A is strongly preferred: it isolates the breaking change to converters and tests only. Components are untouched.

**Updated `CalculatorState<T, R>` interface (Strategy A):**
```typescript
export interface CalculatorState<T extends object, R> {
  values: T;
  result: R | null;                    // unchanged: unwrapped value or null
  calculationError: string | undefined; // NEW: error message from CalculationResult
  errors: Partial<Record<keyof T, string>>;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: T) => void;
  reset: () => void;
}
```

**Updated `CreateCalculatorStoreOptions<T, R>`:**
```typescript
calculate: (values: T) => CalculationResult<R>; // was: R | null
```

**Store `setValue`/`setValues` unwrapping logic:**
```typescript
const calcResult = Object.keys(errors).length === 0 ? calculate(newValues) : null;
const result = calcResult?.ok ? calcResult.value : null;
const calculationError = calcResult && !calcResult.ok ? calcResult.error : undefined;

if (!calcResult?.ok && onCalculationError) {
  toast.error(onCalculationError(newValues));
}

set({ values: newValues, errors, result, calculationError });
```

**Initial state:**
```typescript
return {
  values: mergedInitialValues,
  result: null,         // unchanged
  calculationError: undefined, // new
  errors: {},
  // ...
};
```

### Pattern 3: Component Rendering (R5.4)

With Strategy A (adapter in store), most components require minimal changes. The `{result && ...}` guard still works because `result` remains `R | null`.

To surface typed error messages, add `calculationError` rendering:
```typescript
// Before (existing pattern in all components)
{result && (
  <div className="space-y-4">
    {/* ... result display */}
  </div>
)}

// After (add error display alongside existing null guard)
{result && (
  <div className="space-y-4">
    {/* ... result display — unchanged */}
  </div>
)}
{calculationError && (
  <p className="text-sm text-destructive">{calculationError}</p>
)}
```

Components that need to be updated: only those that explicitly show an error state or use `onCalculationError`. The base pattern (`{result && ...}`) is already the correct behavior — show results when present, show nothing (or an error message) when absent.

### Pattern 4: Test Migration (R5.5)

**Converters that currently return `T | null` — 166 files:**

Before:
```typescript
it("calculates BMI for 70kg at 175cm", () => {
  const result = calculateBMI({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm" });
  expect(result).not.toBeNull();
  expect(result!.bmi).toBeCloseTo(22.9, 1);
});

it("returns null for zero weight", () => {
  expect(calculateBMI({ weight: 0, weightUnit: "kg", height: 175, heightUnit: "cm" })).toBeNull();
});
```

After:
```typescript
it("calculates BMI for 70kg at 175cm", () => {
  const result = calculateBMI({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm" });
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.bmi).toBeCloseTo(22.9, 1);
  }
});

it("returns error for zero weight", () => {
  const result = calculateBMI({ weight: 0, weightUnit: "kg", height: 175, heightUnit: "cm" });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBe("INVALID_INPUT");
  }
});
```

**Converters that already use `success` discriminant — 3 files:**
- `chemistry/formula-parser.ts` — `ParseResult` with `success: true | false`
- `chemistry/equation-parser.ts` — likely same pattern
- `network/supernetting.ts` — `SupernetResult` with `success: boolean` (DIFFERENT: it's not a pure discriminant union — it has `success: boolean` inline, not a tagged union type)

These 3 converters need their return type changed from `success`/`failure` to `ok`/`CalculationResult<T>` to align with the standard. Their tests already use `result.success` checks and need updating to `result.ok`.

**Converters that throw instead of returning null — 2 files:**
- `infrastructure/hypervisor-comparison.ts` — throws for invalid inputs
- `infrastructure/hyperv-consolidation.ts` — throws for invalid inputs

Decision needed: these converters need to return `CalculationResult<R>` with `ok: false` instead of throwing. Tests currently use `toThrow()` and will need updating to `expect(result.ok).toBe(false)`.

### Pattern 5: Special Cases — converters NOT using createCalculatorStore

From Phase 43 notes, some calculators use `useState` directly (e.g., corpulence calculator). These are NOT going through `createCalculatorStore`. For these:
- The converter function still returns `CalculationResult<T>`
- The component manages state directly and must unwrap `result.ok`
- No store factory update is needed for these

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type narrowing | Custom `isOk()` helper | TypeScript discriminant (`if (result.ok)`) | TypeScript narrows type automatically inside `if (result.ok)` block |
| Error codes | Complex enum | Simple string constants | TypeScript union of string literals is sufficient; enums add overhead |
| Test helper | `unwrapResult()` helper | Inline `if (result.ok)` in test | Keeps tests readable; no abstraction needed |
| Batch migration | Script to auto-rewrite converters | Manual per-category migration | Each converter has unique error conditions that need specific error messages and codes |

**Key insight:** TypeScript discriminated union narrowing is automatic. After `if (result.ok)`, TypeScript knows `result` is `{ ok: true; value: T }`. No helper functions needed.

---

## Common Pitfalls

### Pitfall 1: Forgetting the `code` field
**What goes wrong:** Returning `{ ok: false, error: "..." }` without `code` violates the R5.1 type shape and causes TypeScript errors.
**Why it happens:** Easy to forget when migrating many converters quickly.
**How to avoid:** TypeScript strict mode will catch it at compile time. Biome will enforce no implicit `any`.
**Warning signs:** `Type '{ ok: false; error: string; }' is not assignable to type 'CalculationResult<T>'`

### Pitfall 2: Strategy confusion — changing `result` type in store state
**What goes wrong:** Changing `result: R | null` to `result: CalculationResult<R> | null` in store state forces updating all 169 components.
**Why it happens:** Seems cleaner to store the full discriminated union.
**How to avoid:** Use Strategy A (adapter pattern). Keep `result: R | null` in state. Unwrap in the store factory, store `calculationError` separately.
**Warning signs:** PR touching 169 component files.

### Pitfall 3: Chemistry/supernetting `success` vs `ok` mismatch
**What goes wrong:** `formula-parser.ts` already returns `{ success: true; ... } | { success: false; error: string }`. Tests already use `result.success`. If you update only the type alias but not the discriminant key, tests will still work but types will be inconsistent.
**Why it happens:** The chemistry converters predate the R5.1 standard.
**How to avoid:** Rename `success` to `ok` in `parseChemicalFormula`, `parseEquation`, and `aggregateNetworks`. Add `code` to failure cases. Update all 3 test files.

### Pitfall 4: Store state `calculationError` not reset on success
**What goes wrong:** After a failed calculation, user fixes input, gets valid result — but stale `calculationError` is still displayed.
**Why it happens:** Only resetting when result is null, not clearing on success.
**How to avoid:** Always set `calculationError: undefined` when `result.ok` is true. In the store:
```typescript
const calculationError = calcResult?.ok ? undefined : (calcResult?.error ?? undefined);
```

### Pitfall 5: `onCalculationError` callback signature conflict
**What goes wrong:** `onCalculationError: (values: T) => string` currently fires when `calculate()` returns null. After migration, converters return `CalculationResult`, so the check changes.
**Why it happens:** `result === null` check becomes `!calcResult.ok`.
**How to avoid:** Update the toast-firing logic in `setValue`/`setValues`:
```typescript
// Before
if (result === null && onCalculationError) {
  toast.error(onCalculationError(newValues));
}

// After
if (!calcResult?.ok && onCalculationError) {
  toast.error(onCalculationError(newValues));
}
```

### Pitfall 6: Converters that THROW (hypervisor-comparison, hyperv-consolidation)
**What goes wrong:** These throw errors instead of returning null. After migration, calling code may not expect a throw — it expects a `CalculationResult`.
**Why it happens:** Infrastructure converters were built with throw-on-invalid pattern (Phase 41 decision).
**How to avoid:** Wrap throws in `CalculationResult` at converter level:
```typescript
// Option 1 (preferred): Change converter to return CalculationResult
export function calculateHypervisorComparison(input: Input): CalculationResult<Result> {
  if (input.vmCount <= 0) {
    return { ok: false, error: "VM count must be positive", code: "INVALID_INPUT" };
  }
  // ...
}

// Option 2 (fallback): Wrap in store factory
calculate: (values) => {
  try {
    const r = calculateHypervisorComparison(values);
    return r; // already CalculationResult
  } catch (e) {
    return { ok: false, error: String(e), code: "CALCULATION_ERROR" };
  }
}
```

---

## Code Examples

### CalculationResult Type Definition
```typescript
// src/types/calculation-result.ts
/**
 * Discriminated union result type for all calculator functions.
 * Replaces `T | null` to carry typed error information on failure.
 */
export type CalculationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code: string };
```

### Store Factory Option Type (updated)
```typescript
// src/stores/calculator-store.ts
import type { CalculationResult } from "@/types";

export interface CreateCalculatorStoreOptions<T extends object, R> {
  name: string;
  initialValues: T;
  /** Calculation function — returns CalculationResult<R> instead of R | null */
  calculate: (values: T) => CalculationResult<R>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  schema?: ZodType<T>;
  syncUrl?: boolean;
  debounceMs?: number;
  onCalculationError?: (values: T) => string;
}
```

### Store State Interface (updated)
```typescript
export interface CalculatorState<T extends object, R> {
  values: T;
  result: R | null;                     // unwrapped value, null if calculation failed
  calculationError: string | undefined; // error message from CalculationResult when ok: false
  errors: Partial<Record<keyof T, string>>;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: T) => void;
  reset: () => void;
}
```

### Unwrapping in setValue (store factory)
```typescript
setValue: <K extends keyof T>(key: K, value: T[K]) => {
  const currentState = get();
  const newValues = { ...currentState.values, [key]: value };
  const errors = effectiveValidate?.(newValues) ?? {};

  const calcResult = Object.keys(errors).length === 0 ? calculate(newValues) : null;
  const result = calcResult?.ok ? calcResult.value : null;
  const calculationError = calcResult && !calcResult.ok ? calcResult.error : undefined;

  if (!calcResult?.ok && onCalculationError) {
    toast.error(onCalculationError(newValues));
  }

  set({ values: newValues, errors, result, calculationError });
},
```

### Test Pattern — success case
```typescript
it("calculates BMI for 70kg at 175cm", () => {
  const result = calculateBMI({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm" });
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.bmi).toBeCloseTo(22.9, 1);
    expect(result.value.category).toBe("normal");
  }
});
```

### Test Pattern — failure case
```typescript
it("returns error for zero weight", () => {
  const result = calculateBMI({ weight: 0, weightUnit: "kg", height: 175, heightUnit: "cm" });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBeDefined();
    expect(result.error).toBeTruthy();
  }
});
```

### Component Error Display (R5.4)
```typescript
// In calculator component, after destructuring from store:
const { values, setValue, result, calculationError, errors } = useStore();

// Results section — unchanged guard
{result && (
  <div className="space-y-4">
    {/* ... existing result display */}
  </div>
)}

// Error display — NEW, only when error message is present
{calculationError && (
  <p className="mt-2 text-sm text-destructive">{calculationError}</p>
)}
```

---

## Converter Inventory

### Total: 169 converters across 19 categories

| Category | Count | Notes |
|----------|-------|-------|
| math | ~38 | Pure arithmetic — simple null guards |
| health | ~28 | Mix of simple (return null) and complex |
| finance | ~23 | Mostly return null for invalid ranges |
| photo | ~22 | Many return null; some return objects with success fields |
| web | ~10 | Some already return objects with `success` field (url-encoder, spf-check) |
| video | ~9 | Simple null returns |
| datetime | ~10 | Some return null, some return objects |
| network | ~11 | supernetting has `success` field; subnet throws |
| chemistry | ~9 | formula-parser, equation-parser have `success` discriminant |
| infrastructure | ~10 | hypervisor-comparison, hyperv-consolidation THROW (not null) |
| engineering | ~7 | Simple null returns |
| crypto | ~4 | Simple returns |
| realestate | ~3 | Simple null returns |
| cooking | ~4 | recipe-scaler throws; food-cost throws |
| automotive | ~4 | Simple null returns |
| data | ~3 | Simple null returns |
| physics | ~1 | Simple null returns |
| music | ~1 | Simple null returns |
| color | ~1 | Simple null returns |

### Special Cases Requiring Extra Work

**Already have `success` discriminant (rename to `ok`, add `code`):**
- `src/lib/converters/chemistry/formula-parser.ts` — `ParseResult` type
- `src/lib/converters/chemistry/equation-parser.ts` — similar pattern
- `src/lib/converters/network/supernetting.ts` — `SupernetResult.success`

**Throw instead of return null (convert throws to CalculationResult):**
- `src/lib/converters/infrastructure/hypervisor-comparison.ts`
- `src/lib/converters/infrastructure/hyperv-consolidation.ts`
- `src/lib/converters/cooking/recipe-scaler.ts` (throws confirmed in tests)
- `src/lib/converters/cooking/food-cost.ts` (throws confirmed in tests)

**Web converters with inline `success` fields:**
- `src/lib/converters/web/url-encoder.ts` — has success field in result object
- `src/lib/converters/web/spf-check.ts` — has success field in result object
- Others in web/ — check if success/error patterns exist before migrating

---

## Recommended Wave Structure for Planning

The planner should structure Phase 45 as ~5 plans:

| Plan | Scope | Files |
|------|-------|-------|
| 45-01 | Type definition + store factory | 3 files: `src/types/calculation-result.ts`, `src/types/index.ts`, `src/stores/calculator-store.ts` |
| 45-02 | Health + Math converters + their tests | ~66 converter files + ~66 test files |
| 45-03 | Finance + Datetime converters + their tests | ~33 converter files + ~33 test files |
| 45-04 | Photo + Video + Data + Physics + Music + Color + Automotive + Cooking + Realestate converters | ~50 converter files + ~50 test files |
| 45-05 | Network + Chemistry + Engineering + Infrastructure + Web + Crypto + component error display | ~35 converter files + ~35 test files + store `calculationError` display in components |

**Key constraint:** Plan 45-01 must complete before all other plans (store factory change is a prerequisite). Plans 45-02 through 45-04 can run in parallel after 45-01. Plan 45-05 handles the special cases.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `T \| null` for all converters | `CalculationResult<T>` discriminated union | Phase 45 (this phase) | Error reason now propagatable; store/component surface message |
| Implicit null = "something went wrong" | Explicit `error` + `code` on failure | Phase 45 | Specific error messages possible per converter |
| `onCalculationError: (values) => string` (user provides message) | Store unwraps `result.error` automatically | Phase 45 | Components get typed error from converter itself |

---

## Open Questions

1. **`code` field value standardization**
   - What we know: R5.1 requires `code: string` — no values specified in requirements
   - What's unclear: Should codes be an enum/union type, or free-form strings?
   - Recommendation: Use free-form strings with recommended constants: `"INVALID_INPUT"`, `"DIVISION_BY_ZERO"`, `"CALCULATION_ERROR"`, `"UNSUPPORTED_INPUT"`. No enum needed — TypeScript string type is sufficient.

2. **Web converters with inline success fields**
   - What we know: `url-encoder.ts`, `spf-check.ts` and others have `success` in their result OBJECTS (not return types)
   - What's unclear: Are these returning the whole object always (never null), with `success` as a field inside the result?
   - Recommendation: Read each file before migrating. If they never return null and `success` is inside the result object, their return type changes from `ResultType` to `CalculationResult<ResultType>` and the component must unwrap `result.value.success`.

3. **`createCalculatorStore` `calculate` field backward compat**
   - What we know: All 169 stores currently pass `calculate: (values) => R | null`
   - What's unclear: When the store factory signature changes to `calculate: (values) => CalculationResult<R>`, will TypeScript catch all sites that still return `R | null`?
   - Recommendation: Yes — TypeScript strict mode will flag all non-migrated converters as type errors when passed to the updated store factory. This is actually a migration aid.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading: `src/stores/calculator-store.ts` — full store factory code
- Direct codebase reading: `src/lib/converters/health/bmi.ts` — canonical converter pattern
- Direct codebase reading: `src/lib/converters/chemistry/formula-parser.ts` — existing discriminant pattern
- Direct codebase reading: `src/lib/converters/network/supernetting.ts` — existing success pattern
- Direct codebase reading: `src/app/[locale]/health/bmi/bmi-calculator.tsx` — component rendering pattern
- Direct codebase reading: `src/__tests__/lib/converters/health/bmi.test.ts` — current test pattern
- Direct codebase reading: `src/__tests__/lib/converters/finance/compound-interest.test.ts` — current test pattern with `result!.field`
- Direct codebase reading: `.planning/REQUIREMENTS.md` — locked R5.1 type shape

### Secondary (MEDIUM confidence)
- Phase STATE.md decisions: confirms 169 converters, test counts, Phase 43 `onCalculationError` callback pattern
- Test file glob: 196 test files confirmed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps, all TypeScript built-in
- Type shape: HIGH — locked in REQUIREMENTS.md R5.1
- Store factory changes: HIGH — source code fully read, change points identified
- Converter count: HIGH — directory listing confirmed
- Test update patterns: HIGH — representative test files read
- Architecture (Strategy A vs B): HIGH — component code confirms `{result && ...}` pattern in 169 files makes Strategy B expensive

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (stable TypeScript — no expiry risk)
