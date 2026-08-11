# ADR-014: Zod Runtime Input Validation

**Status:** Accepted
**Date:** 2026-02-26
**Proposed by:** v7.0 Framework Migration

---

## Context

All 169 calculator inputs were validated only by TypeScript at compile time. Runtime
validation was absent:

- TypeScript types guarantee shape at compile time but cannot catch bad values at runtime —
  a user pasting `"abc"` into a number field or manipulating URL parameters produces garbage
  inputs that propagate silently to converter functions
- URL parameter parsing used custom `parseNumberParam`, `parseBooleanParam`, and
  `parseStringParam` helpers that returned `null` on failure with no structured error
  information — callers could not distinguish "param absent" from "param invalid"
- Invalid inputs produced silent `null` results with no user feedback; the UI simply cleared
- The `createCalculatorStore` factory had a `validate` callback that returned a record of
  field-level errors, but no schema-first approach existed — every calculator that wanted
  validation had to implement validation logic from scratch

The project's 169 calculators span 15 categories with heterogeneous input types: numeric
health metrics, string-typed form fields (where React `<input>` always produces strings),
and number-typed finance fields. No unified validation approach existed.

## Decision

### Library: Zod

Installed `zod` as a **runtime dependency** (not `devDependency`) because schemas execute
client-side inside Zustand stores — they are part of the production bundle, not build tooling.

### Schema Organization

Zod schemas defined in `src/lib/schemas/`, one file per category:

- `health-schemas.ts`, `math-schemas.ts`, `finance-schemas.ts`, etc.
- Each schema corresponds to a calculator's `FormValues` interface
- Schemas serve dual purpose: store validation and URL parameter parsing

### Integration with createCalculatorStore

`createCalculatorStore` updated to accept an optional `schema?: ZodType` parameter:

- When `schema` is provided, `safeParse` runs on every `setValue`/`setValues` call
- Explicit `validate` callback takes precedence over `schema` when both are provided —
  backward compatibility preserved for existing calculators
- `ZodType` imported as **type-only** (`import type { ZodType }`) for Biome strict compliance;
  `z` imported as a value only in files that construct schemas (`url-params.ts`, schema files)

### String vs Number Schema Strategy

Two schema patterns are used based on calculator category:

| Category | Pattern | Reason |
|----------|---------|--------|
| Health, Math | `z.string().refine()` | React `<input>` produces strings; `FormValues` are string-typed |
| Finance | `z.number()` | Finance `FormValues` are number-typed; inputs managed as numbers |

`z.coerce.number()` was explicitly rejected for string-typed `FormValues` because it
transforms the output type to `number`, making it incompatible with `string`-typed form
values and causing TypeScript errors throughout the store.

### Coverage Gaps (documented, not defects)

- **Corpulence calculator**: Uses `useState` directly rather than `createCalculatorStore` —
  schema created in `src/lib/schemas/health-schemas.ts` for reference but not wired to any
  store (no store to attach to)
- **Finance**: Only 4 of 23 finance calculators wired with `schema`: `compound-interest`,
  `loan`, `mortgage`, `retirement` — the 4 that use `createCalculatorStore`. The remaining
  19 use `useState` or custom store patterns
- **Photo, video, automotive, cooking, network, crypto, web, physics, music, color**:
  Schemas created for reference; calculators in these categories use `useState` or custom
  stores without `createCalculatorStore`, so `schema` wiring is inapplicable
- **DateTime (9 calculators) and Data (2 calculators)**: Fully wired — these categories
  use `createCalculatorStore` throughout

### URL Parameter Validation

Zod `.safeParse()` replaces the custom `parseNumberParam`/`parseBooleanParam`/`parseStringParam`
helpers in `src/lib/utils/url-params.ts`. The new approach:

- Returns a structured `SafeParseReturnType` with `.success` discriminant and `.error.issues`
- Backward-compatible: URL state encoded by prior versions is still accepted
- Invalid URL params are rejected safely with structured error context (no silent `null`)

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Yup | Similar API surface but larger bundle; Zod is TypeScript-native and ships its own types without `@types/yup` |
| valibot | Newer and smaller, but less mature ecosystem in early 2026; fewer resources for the patterns needed |
| Custom validation only | The `validate:` callback already existed; Zod adds schema-first approach with better error messages and URL param integration |
| `z.coerce.number()` for all | Changes output type to `number`, breaking string-typed `FormValues` used in health/math categories |

## Consequences

**Positive:**

- Runtime validation catches out-of-range inputs before converter functions receive them
- Field-level error messages surface to users via `calculationError` state (not silent `null`)
- URL parameters validated via `.safeParse()` with structured error context
- Schema-first approach explicitly documents expected input shapes for each calculator
- `ZodType` as type-only import satisfies Biome strict linting with zero rule suppressions

**Negative / Trade-offs:**

- ~14KB gzipped bundle addition (Zod runtime)
- Not all calculators fully wired — `useState`-based calculators have schemas but no store
  integration; two validation paths coexist (`schema` Zod and `validate` legacy callback)
- Coverage gap is self-documenting (stored in this ADR and STATE.md decisions log)

## Implementation Details

- `src/lib/schemas/` — one schema file per category (health, math, finance, datetime, data,
  photo, video, automotive, cooking, network, crypto, web, physics, music, color)
- `src/lib/stores/calculator-store.ts` — `schema?: ZodType` added to `CalculatorStoreConfig`
  type; `safeParse` integrated into `setValue`/`setValues` action
- `src/lib/utils/url-params.ts` — Zod `.safeParse()` replaces custom helper functions

## Related ADRs

- [ADR-002](ADR-002-url-state-sync.md) — URL state sync; Zod now validates URL params that
  the sync middleware reads and writes
- [ADR-003](ADR-003-zustand-state-management.md) — Zustand state management; Zod schema
  wired into `createCalculatorStore` factory as optional config parameter
