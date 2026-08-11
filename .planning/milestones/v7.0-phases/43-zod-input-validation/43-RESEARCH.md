# Phase 43: Zod Input Validation — Research

**Researched:** 2026-02-26
**Domain:** Zod v4, runtime validation, Zustand store integration, URL parameter parsing
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R3.1 | `zod` installed | Install `zod@^4.0.0`; no peer dep conflicts with Next.js 16, React 19, TypeScript 5 |
| R3.2 | Zod schemas for each calculator's input type in `src/lib/schemas/` | Schema location strategy, input type taxonomy, factory approach for numeric inputs |
| R3.3 | `createCalculatorStore` factory updated to accept optional Zod schema for validation | Integration pattern: replace optional `validate` with `schema?: ZodType<T>`, derive `validate` from schema |
| R3.4 | URL parameter parsing helpers replaced with Zod `.safeParse()` equivalents | Coerce strategy for URL params, backward-compat fallback pattern |
| R3.5 | Validation errors surface as field-level error messages in calculator forms | `InputField` already has `error` prop; store already has `errors` state; wire them together |
| R3.6 | Out-of-range inputs produce user-visible errors (not silent null results) | Zod `.refine()` and `.min()/.max()` constraints surface via `errors` state → `InputField` error prop |
</phase_requirements>

---

## Summary

Phase 43 adds Zod v4 runtime validation to all 169 calculators. The current architecture has TypeScript compile-time types but no runtime validation: URL parameters are parsed with simple helpers (`parseNumberParam`, `parseStringParam`, `parseBooleanParam`) that silently fall back to defaults, and invalid inputs simply produce `result === null` with no user feedback.

The key insight is that the `createCalculatorStore` factory already supports an optional `validate` function that populates the `errors: Partial<Record<keyof T, string>>` state, and `InputField` already has an `error?: string` prop that renders a destructive message. The gap is that no calculator currently passes a `validate` function, and `errors` state is never consumed in component JSX. Zod fills both gaps by providing schema-derived validation and typed error extraction.

The store pattern is also important: most calculator components define their Zustand store `values` type as an **all-string FormValues** interface (weight: string, height: string, etc.) that is parsed inline via `parseFloat()` before calling the pure converter. This means Zod schemas for store inputs validate string inputs, not the domain number types directly — this is a critical distinction for schema design.

**Primary recommendation:** Install `zod@^4.0.0`. Define schemas in `src/lib/schemas/[category]/` co-located by domain. Update `createCalculatorStore` to accept an optional `schema?: ZodType<T>` and derive the `validate` function internally. Update URL parameter parsing to use `z.coerce.number()` / `z.coerce.boolean()` with `.safeParse()`. Wire `errors` state into component forms via `error={errors.fieldName}` on `InputField`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | ^4.0.0 | Runtime schema validation, type inference | Industry standard; 14x faster than v3; 57% smaller bundle; TypeScript-first |

### No Additional Libraries Needed

The project already has everything else:
- `zustand` ^5.0.10 — store layer
- `sonner` ^2.0.7 — toast notifications for error feedback (Phase 42)
- `@/components/converter/input-field.tsx` — already has `error?: string` prop

### Zod v4 vs v3 — Decision

Use **Zod v4** (`zod@^4.0.0`). Reasons:

1. No existing Zod v3 in the project — no migration cost
2. 14x faster string parsing, smaller bundle
3. Better TypeScript inference (100x fewer tsc instantiations)
4. Cleaner enum API: `z.nativeEnum()` merged into `z.enum()`
5. `z.coerce.number()` works the same as v3 for URL param coercion

**Installation:**

```bash
npm install zod@^4.0.0
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zod | valibot | Valibot is smaller but ecosystem less mature; zod has broader adoption |
| zod | yup | yup is older, worse TypeScript inference |
| zod schema in store | Manual validate function | Already supported in store; Zod is more maintainable and testable |

---

## Architecture Patterns

### Key Observation: FormValues vs ConverterInput

Most calculators use a **string-based FormValues** type in the store, not the domain converter input type:

```typescript
// Pattern in bmi-calculator.tsx (and most calculators):
interface FormValues {
  weight: string;        // string, not number
  weightUnit: WeightUnit; // union string type
  height: string;        // string, not number
  heightUnit: HeightUnit;
}

const useStore = createCalculatorStore<FormValues, BMIResult | null>({
  // ...
  calculate: (vals) => {
    const input: BMIInput = {
      weight: parseFloat(vals.weight) || 0,  // parse at calculate time
      // ...
    };
  }
});
```

**Implication:** Zod schemas validate `FormValues` (strings + union types), NOT the domain number types directly. Use `z.coerce.number()` for numeric string fields so Zod attempts to coerce the string to a number before validating range constraints.

**Exception — direct number types:** Some calculators (e.g., `compound-interest-calculator.tsx`) pass the domain type directly:
```typescript
// compound-interest-calculator.tsx passes CompoundInterestInput directly
const useStore = createCalculatorStore<CompoundInterestInput, CompoundInterestResult>({
  initialValues: { principal: 10000, interestRate: 7, ... },
  calculate: calculateCompoundInterest,
});
```
For these, use `z.number()` (not coerce).

### Recommended Project Structure

```
src/
├── lib/
│   ├── schemas/             # NEW: Zod schemas (mirrors converters/)
│   │   ├── health/
│   │   │   ├── bmi.ts       # BmiInputSchema, BmiFormSchema
│   │   │   └── ...
│   │   ├── finance/
│   │   ├── math/
│   │   ├── network/
│   │   └── [category]/
│   ├── converters/          # unchanged
│   └── utils/
│       └── url-params.ts    # updated: Zod-based parsing
├── stores/
│   └── calculator-store.ts  # updated: optional schema param
```

**Location rationale:** `src/lib/schemas/` mirrors `src/lib/converters/`. Schemas live at the lib layer (pure, no React), not co-located with components. This keeps schemas testable and importable from both stores and components.

### Pattern 1: Schema-Derived Store Validation

Update `createCalculatorStore` to accept an optional Zod schema and automatically derive the `validate` function:

```typescript
// Source: Based on Zod v4 safeParse API (https://zod.dev/api)
// src/stores/calculator-store.ts

import type { ZodType } from "zod";

export interface CreateCalculatorStoreOptions<T extends object, R> {
  name: string;
  initialValues: T;
  calculate: (values: T) => R | null;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  schema?: ZodType<T>;   // NEW: optional Zod schema
  syncUrl?: boolean;
  debounceMs?: number;
  onCalculationError?: (values: T) => string;
}
```

Inside the factory, when `schema` is provided, derive `validate` from it:

```typescript
// Internally in createCalculatorStore:
const effectiveValidate = schema
  ? (values: T): Partial<Record<keyof T, string>> => {
      const result = schema.safeParse(values);
      if (result.success) return {};
      const errors: Partial<Record<keyof T, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof T;
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      return errors;
    }
  : validate;
```

This approach:
- Is backward-compatible (existing stores without `schema` continue working)
- Does not break any of the 169 existing calculator stores
- Allows gradual rollout (add schema to priority calculators first)
- `validate` prop still works as override for complex cases

### Pattern 2: Schema for FormValues (String Fields)

For the majority of calculators that use all-string FormValues:

```typescript
// src/lib/schemas/health/bmi.ts
import { z } from "zod";

// Schema for FormValues (what the store holds — strings + union literals)
export const BmiFormSchema = z.object({
  weight: z.coerce.number().positive("Weight must be positive").max(1000, "Weight too large"),
  weightUnit: z.enum(["kg", "lb"]),
  height: z.coerce.number().positive("Height must be positive").max(300, "Height too large"),
  heightUnit: z.enum(["cm", "m", "in", "ft"]),
});

export type BmiFormValues = z.infer<typeof BmiFormSchema>;
```

Then in `bmi-calculator.tsx`:

```typescript
import { BmiFormSchema } from "@/lib/schemas/health/bmi";

const useStore = createCalculatorStore<FormValues, BMIResult | null>({
  name: "bmi-calculator",
  initialValues: { weight: "70", weightUnit: "kg", height: "175", heightUnit: "cm" },
  schema: BmiFormSchema,   // NEW
  calculate: (vals) => { /* unchanged */ },
});
```

### Pattern 3: URL Parameter Parsing with Zod Coercion

Replace the current type-inspection loop in `createCalculatorStore` with Zod-driven parsing:

```typescript
// Current (calculator-store.ts):
if (typeof originalValue === "number") {
  mergedInitialValues[key] = parseNumberParam(value, originalValue);
} else if (typeof originalValue === "string") {
  mergedInitialValues[key] = parseStringParam(value, originalValue);
}

// Replacement using Zod (when schema is provided):
if (schema) {
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  if (shape && key in shape) {
    const fieldSchema = shape[key as string];
    const parsed = fieldSchema.safeParse(value);  // value is string from URL
    if (parsed.success) {
      mergedInitialValues[key] = parsed.data;
    }
    // On failure: silently keep initialValue (backward compat)
  }
}
```

**Backward compatibility:** If parsing fails (invalid URL param), silently fall back to initial value. This preserves all existing shared URLs.

For the standalone URL param helpers (`parseNumberParam`, etc.), add Zod-based variants in `url-params.ts`:

```typescript
// src/lib/utils/url-params.ts — ADD these, don't remove existing
import { z } from "zod";

export function parseZodNumberParam(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const result = z.coerce.number().safeParse(value);
  return result.success ? result.data : fallback;
}

export function parseZodBooleanParam(value: string | null, fallback: boolean): boolean {
  if (value === null || value === "") return fallback;
  const result = z.coerce.boolean().safeParse(value);
  return result.success ? result.data : fallback;
}
```

### Pattern 4: Wiring Errors into Component Forms

The `InputField` component already accepts `error?: string`. The store already holds `errors: Partial<Record<keyof T, string>>`. The only missing piece is the component consuming `errors`:

```typescript
// In any calculator component:
const { values, setValue, result, errors } = useStore();

// Then on each InputField:
<InputField
  id="weight"
  label={t("weight")}
  value={values.weight}
  onChange={(v) => setValue("weight", v)}
  error={errors.weight}   // NEW — already renders red border + error text
/>
```

This is a mechanical change per calculator. No new UI components needed.

### Anti-Patterns to Avoid

- **Don't define schemas inline in calculator components** — schemas belong in `src/lib/schemas/` for testability and reuse
- **Don't throw from Zod validation in the store** — always use `safeParse`, never `parse`, to prevent uncaught exceptions
- **Don't block calculation on every Zod error** — only block when the specific field causing the error would make calculation meaningless (the current `Object.keys(errors).length === 0` guard is correct)
- **Don't remove existing `validate` option** — keep it for edge cases where Zod schema alone is insufficient
- **Don't validate string fields as `z.string()` alone** — always combine with `z.coerce.number()` for numeric string inputs; pure `z.string()` won't detect "abc" as invalid if you're treating it as a number
- **Don't use `z.string().email()` etc. from v3** — in Zod v4, format validators moved to top-level: `z.email()`, `z.url()`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime type coercion | Custom `typeof` switch | `z.coerce.number()`, `z.coerce.boolean()` | Handles edge cases (NaN, Infinity, empty string) |
| Error message extraction | Manual issue iteration | `result.error.issues[0].message` | Zod provides structured issue objects |
| Union type validation | Manual `includes()` check | `z.enum(["a", "b", "c"])` | Type-safe, automatic error messages |
| Range validation | Manual `if (val < 0)` | `.positive()`, `.min(0)`, `.max(100)` | Composable, error messages included |
| Schema-derived TypeScript types | Duplicate interface | `z.infer<typeof Schema>` | Single source of truth |

**Key insight:** Zod's `safeParse` is the standard because it never throws — critical in a store's `validate` function where throwing would break all calculator state updates.

---

## Common Pitfalls

### Pitfall 1: Zod v4 Enum API Change

**What goes wrong:** Code using `z.nativeEnum(MyEnum)` fails because `nativeEnum` was merged into `z.enum()` in v4.
**Why it happens:** Zod v4 consolidated enum handling.
**How to avoid:** Use `z.enum(["value1", "value2"] as const)` for string unions (which is what the converters use anyway — no TypeScript enums).
**Warning signs:** TypeScript error "Property 'nativeEnum' does not exist on typeof z"

### Pitfall 2: z.string().email() No Longer Exists in v4

**What goes wrong:** String format validators moved to top-level in Zod v4.
**Why it happens:** API redesign in v4.
**How to avoid:** Use `z.email()` not `z.string().email()`.
**Warning signs:** TypeScript error on `.email()` method on `ZodString`

### Pitfall 3: FormValues are Strings, Not Numbers

**What goes wrong:** Schema uses `z.number()` but store values are `"70"` (string), so every number field always fails validation.
**Why it happens:** Most calculator stores use `string` for numeric fields (BMI: `weight: "70"`, height: `"175"`).
**How to avoid:** Use `z.coerce.number()` for string-typed numeric fields. Check whether the store's `initialValues` uses strings or actual numbers.
**Warning signs:** All fields show validation errors immediately on page load.

### Pitfall 4: ZodObject Shape Access in v4

**What goes wrong:** Accessing `.shape` on a schema fails when the schema has transforms/refinements wrapping it.
**Why it happens:** `.shape` is only on raw `ZodObject`, not on `ZodEffects` or wrapped schemas.
**How to avoid:** When using schema-driven URL parsing, cast conservatively: `(schema as z.ZodObject<z.ZodRawShape>).shape`, or use `instanceof z.ZodObject` guard.
**Warning signs:** Runtime error "Cannot read properties of undefined (reading 'shape')"

### Pitfall 5: Validation Blocks ALL Calculators on Initial Load

**What goes wrong:** With Zod validation in `createCalculatorStore`, initial values that fail schema (e.g., `weight: ""`) block calculation immediately, so users see no results on page load.
**Why it happens:** The validate function is called on initial load to populate `errors`.
**How to avoid:** Ensure `initialValues` pass the schema. Set sensible defaults (e.g., `weight: "70"` not `weight: ""`). The `result` starts as `null` before user interaction anyway.
**Warning signs:** Calculator shows validation errors before user types anything.

### Pitfall 6: Biome Strict Mode — No `any`

**What goes wrong:** Accessing Zod schema `.shape` requires a cast that may violate Biome's no-explicit-any rule.
**Why it happens:** Biome enforces `@biomejs/biome: no-explicit-any`.
**How to avoid:** Use `z.ZodObject<z.ZodRawShape>` cast (uses Zod's own types, not `any`). Avoid `as any`.
**Warning signs:** Biome pre-commit hook fails with "Unexpected any"

### Pitfall 7: Scope of Change — 169 Calculators

**What goes wrong:** Trying to add `schema` + wire `errors` to all 169 calculators in one pass causes massive diffs that are hard to review and test.
**Why it happens:** The phase has 169 targets.
**How to avoid:** Batch by category. Each plan should handle one category. Schemas go in `src/lib/schemas/[category]/` and components get `error={errors.fieldName}` wired in.
**Warning signs:** Plan has >20 files in a single task.

---

## Code Examples

Verified patterns from official sources:

### safeParse Pattern (foundational)

```typescript
// Source: https://zod.dev/api
import { z } from "zod";

const schema = z.object({
  weight: z.coerce.number().positive(),
  height: z.coerce.number().positive().max(300),
});

const result = schema.safeParse({ weight: "70", height: "175" });
if (result.success) {
  result.data; // { weight: 70, height: 175 } — coerced to numbers
} else {
  result.error.issues; // [{ path: ["weight"], message: "..." }, ...]
}
```

### Enum Validation (Zod v4)

```typescript
// Source: https://zod.dev/api
import { z } from "zod";

// For union string types like WeightUnit = "kg" | "lb"
const WeightUnitSchema = z.enum(["kg", "lb"]);
const HeightUnitSchema = z.enum(["cm", "m", "in", "ft"]);

// z.nativeEnum() is deprecated in v4 — use z.enum()
```

### Schema for a Typical FormValues Type (string fields)

```typescript
// src/lib/schemas/health/bmi.ts
import { z } from "zod";

export const BmiFormSchema = z.object({
  weight: z.coerce.number({ error: "Weight must be a number" })
    .positive("Weight must be positive")
    .max(1000, "Weight exceeds maximum"),
  weightUnit: z.enum(["kg", "lb"]),
  height: z.coerce.number({ error: "Height must be a number" })
    .positive("Height must be positive")
    .max(300, "Height exceeds maximum"),
  heightUnit: z.enum(["cm", "m", "in", "ft"]),
});
```

### Schema for a Direct Numeric Input Type (number fields)

```typescript
// src/lib/schemas/finance/compound-interest.ts
import { z } from "zod";

export const CompoundInterestSchema = z.object({
  principal: z.number().positive("Principal must be positive"),
  interestRate: z.number().min(0).max(100, "Rate must be 0–100%"),
  years: z.number().int().min(1).max(100),
  compoundFrequency: z.enum(["annually", "semi-annually", "quarterly", "monthly", "daily"]),
  monthlyContribution: z.number().min(0),
  contributionTiming: z.enum(["beginning", "end"]),
});
```

### Error Extraction Helper

```typescript
// Extract first error per field from Zod parse result
function zodErrorsToFieldErrors<T extends object>(
  issues: z.ZodIssue[]
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof T;
    if (key !== undefined && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
```

### Updated createCalculatorStore Signature

```typescript
// src/stores/calculator-store.ts
import type { ZodType } from "zod";

export interface CreateCalculatorStoreOptions<T extends object, R> {
  name: string;
  initialValues: T;
  calculate: (values: T) => R | null;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  schema?: ZodType<T>;  // NEW — optional Zod schema
  syncUrl?: boolean;
  debounceMs?: number;
  onCalculationError?: (values: T) => string;
}
```

### Wiring Errors in a Calculator Component

```typescript
// In any *-calculator.tsx:
const { values, setValue, result, errors } = useStore();

// Pass error to each InputField:
<InputField
  id="weight"
  label={t("weight")}
  value={values.weight}
  onChange={(v) => setValue("weight", v)}
  min={0}
  error={errors.weight}   // ← wire in errors
/>
```

---

## Input Type Taxonomy

Based on code inspection of all 19 converter categories:

### Type Categories Found

| Type | Examples | Zod Approach |
|------|----------|-------------|
| Numeric string field | `weight: string` → `parseFloat(vals.weight)` | `z.coerce.number().positive().max(N)` |
| Direct number field | `principal: number`, `interestRate: number` | `z.number().positive().max(N)` |
| String union literal | `WeightUnit = "kg" \| "lb"`, `CompoundFrequency` | `z.enum(["kg", "lb"])` |
| Boolean string | URL synced booleans | `z.coerce.boolean()` |
| Date string | `birthDate: string` | `z.string().date()` (Zod v4) or regex |
| Free-form string | `ipAddress: string`, `formula: string` | `z.string().min(1)` |
| Comma-separated IDs | `cpuIds: string` | `z.string()` (validated by calculator logic) |

### Majority Pattern

Approximately 80% of calculators use all-string `FormValues` types with numeric string fields. Schemas for these use `z.coerce.number()`.

Approximately 15% (finance calculators like compound-interest, retirement) pass domain number types directly. Schemas for these use `z.number()`.

Approximately 5% (network, chemistry) have complex validation that exceeds what simple Zod schemas can express — for these, retain the `validate` function or combine schema + refine.

---

## Scope Strategy

**R3.2 scope decision:** The requirement says "Zod schemas defined for each calculator's input type." With 169 calculators, this is a large surface area. The recommended batching strategy:

| Plan | Category Batch | Calculator Count | Approach |
|------|----------------|-----------------|----------|
| 43-01 | Install + `createCalculatorStore` update + `url-params` Zod helpers | 0 calculators wired | Foundation only |
| 43-02 | Health schemas + wire errors in health components | ~28 | Category batch |
| 43-03 | Finance schemas + wire errors in finance components | ~28 | Category batch |
| 43-04 | Math schemas + wire errors in math components | ~38 | Category batch |
| 43-05 | Photo + Video + Remaining categories | ~75 | Final batch |

Each plan creates `src/lib/schemas/[category]/index.ts` (or per-file) and updates each calculator component to destructure `errors` and pass `error={errors.fieldName}`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod v3 (12.47kb gzipped) | Zod v4 (5.36kb gzipped) | 2025 | 57% smaller bundle |
| `z.string().email()` | `z.email()` | Zod v4 | Breaking API change |
| `z.nativeEnum()` | `z.enum()` | Zod v4 | Simplified API |
| TypeScript-only validation | Runtime Zod validation | This phase | Catches invalid URL params, bad user input |

**Deprecated/outdated:**
- `z.string().email()`: replaced by `z.email()` in Zod v4
- `z.nativeEnum()`: merged into `z.enum()` in Zod v4
- `z.promise()`: deprecated in Zod v4 (not relevant here)

---

## Open Questions

1. **i18n for validation error messages**
   - What we know: Zod error messages are hardcoded strings in schema files
   - What's unclear: Should messages be translated? They appear in `InputField`'s `error` prop
   - Recommendation: Start with English hardcoded messages (matches existing error pattern in the codebase). i18n of validation messages can be addressed in Phase 46 (i18n restructure) or a follow-up.

2. **Scope of `errors` wiring — how many components?**
   - What we know: There are 169 calculator components. Each uses `InputField` which has `error` prop
   - What's unclear: Some complex calculators (subnet, cpu-comparison) have custom UI not using `InputField`
   - Recommendation: Wire `error` on all `InputField` usages; skip custom UIs in first pass. Cover 95%+ of surface area.

3. **`ZodType<T>` import in calculator-store.ts**
   - What we know: `ZodType` is the correct import for the generic schema parameter
   - What's unclear: Whether `import type { ZodType } from "zod"` causes any circular dependency issues
   - Recommendation: Use `import type` (type-only import) to avoid any runtime dependency in the store. Zod itself is only a devDependency concern at type level; the actual Zod object is used in schema files and helpers.

---

## Sources

### Primary (HIGH confidence)
- https://zod.dev/api — Zod v4 API documentation; safeParse, z.object(), z.coerce, z.enum()
- https://zod.dev/v4 — Zod v4 release notes, performance benchmarks, bundle sizes
- https://zod.dev/v4/changelog — Breaking changes from v3 to v4
- `/Users/fjacquet/Projects/converty/src/stores/calculator-store.ts` — Existing store factory, `validate` option, `errors` state type
- `/Users/fjacquet/Projects/converty/src/components/converter/input-field.tsx` — `error?: string` prop already present
- `/Users/fjacquet/Projects/converty/src/lib/utils/url-params.ts` — Current `parseNumberParam`, `parseBooleanParam`, `parseStringParam`

### Secondary (MEDIUM confidence)
- https://github.com/pmndrs/zustand/discussions/1722 — Community discussion: Zod + Zustand middleware patterns
- Code inspection of 15+ calculator components confirming FormValues string pattern

### Tertiary (LOW confidence)
- Zustand+Zod middleware patterns from community (unverified for v5 zustand + v4 zod combo)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zod v4 is stable, confirmed from official docs
- Architecture: HIGH — Based on direct code inspection of the actual store factory and component patterns
- Pitfalls: HIGH — Most pitfalls confirmed by reading Zod v4 changelog and codebase conventions
- Error wiring scope: MEDIUM — 169 calculators not individually inspected; pattern confirmed on 5+ samples

**Research date:** 2026-02-26
**Valid until:** 2026-08-26 (Zod v4 is stable; no breaking changes expected for 6 months)
