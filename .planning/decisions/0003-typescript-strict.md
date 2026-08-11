# Enable TypeScript Strict Mode with noExplicitAny Enforcement

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty's codebase had type safety issues that could lead to runtime errors:

- `any` types in state management hooks (`use-converter.ts` had 2 explicit `any` types)
- URL parameter parsing used unsafe type coercion (global `isNaN()` instead of `Number.isNaN()`)
- No enforcement preventing future `any` type introduction
- TypeScript strict mode was enabled but not fully documented

With 117+ calculators processing user input and performing calculations, type safety is critical for correctness. How should we enforce type safety across the codebase?

## Decision Drivers

- **Prevent runtime errors** - Type-safe code catches errors at compile time, not production
- **URL parameter safety** - Parsing user input from URL requires careful type handling (NaN, null, empty string)
- **Developer experience** - IDE autocomplete and type inference improve productivity
- **Prevent regression** - Type safety rules must be enforced, not optional warnings
- **Maintainability** - Explicit types serve as inline documentation for future developers
- **Migration feasibility** - Must be achievable without rewriting entire codebase

## Considered Options

1. **Full strict mode immediately with noExplicitAny enforcement** - Enable all strict checks and lint rule simultaneously
2. **Gradual strict mode adoption** - Enable strict mode but allow `any` types temporarily
3. **Stay with loose mode** - Keep current configuration without additional enforcement

## Decision Outcome

Chosen option: **"Full strict mode immediately with noExplicitAny enforcement"** because the codebase was already close to strict compliance (only 2 `any` types found), and immediate enforcement prevents regression. Biome's noExplicitAny rule at error level makes type safety violations blocking.

### Consequences

**Positive:**

- **Zero explicit any types** - All state management code now has proper types
- **Type-safe URL parsing** - Created dedicated helper functions (parseNumberParam, parseStringParam, parseBooleanParam)
- **NaN safety** - Number.isNaN() prevents false positives from type coercion
- **Regression prevention** - Biome lint fails on any new `any` types (error level, not warning)
- **Better IDE support** - TypeScript knows exact types, provides accurate autocomplete
- **Self-documenting code** - Function signatures serve as inline documentation

**Negative:**

- **Initial migration effort** - Required fixing 2 `any` types and creating URL parsing helpers
- **Verbose code** - Explicit types require more code than implicit any
- **Learning curve** - Contributors must understand TypeScript strict mode rules
- **Generic complexity** - Type-safe stores use generics (e.g., `createCalculatorStore<Input, Result>`)

**Neutral:**

- **Strict mode documentation** - Added inline comments explaining enabled flags (strictNullChecks, strictFunctionTypes, etc.)
- **Helper functions required** - URL parsing centralized in `src/lib/utils/url-params.ts`

## Pros and Cons of the Options

### Full strict mode immediately with noExplicitAny enforcement

- **Good:** Immediate type safety across codebase
- **Good:** Prevents regression - new `any` types blocked by lint
- **Good:** Small migration effort (only 2 `any` types found)
- **Good:** Catches edge cases: NaN propagation, null/undefined handling, empty strings
- **Good:** Type-safe URL parsing helpers reusable across 117 calculators
- **Bad:** Requires learning TypeScript strict mode conventions
- **Bad:** More verbose code (explicit types vs implicit any)
- **Neutral:** Biome noExplicitAny at error level (not warning) makes violations blocking

### Gradual strict mode adoption

- **Good:** Less disruptive, allows incremental migration
- **Good:** Team learns TypeScript gradually
- **Bad:** Doesn't prevent regression (new `any` types could be added)
- **Bad:** Technical debt accumulates (TODO comments, @ts-ignore escapes)
- **Bad:** Partial type safety doesn't catch all errors
- **Bad:** Unclear timeline for completion

### Stay with loose mode

- **Good:** No migration effort required
- **Good:** No learning curve for TypeScript strict mode
- **Bad:** Runtime errors from type mismatches not caught at compile time
- **Bad:** IDE autocomplete less accurate (doesn't know exact types)
- **Bad:** Refactoring riskier (breaking changes not caught by compiler)
- **Bad:** URL parameter parsing bugs (NaN propagation, unsafe coercion)

## Links

- **Phase 1 Plan 1 Summary (URL Parsing):** `.planning/phases/01-type-safety-foundation/01-01-SUMMARY.md`
- **Phase 1 Plan 2 Summary (Biome Config):** `.planning/phases/01-type-safety-foundation/01-02-SUMMARY.md`
- **URL Parsing Helpers:** `src/lib/utils/url-params.ts` (parseNumberParam, parseStringParam, parseBooleanParam)
- **Biome Config:** `biome.json` (noExplicitAny: "error")
- **TypeScript Config:** `tsconfig.json` (strict: true with inline documentation)
- **STATE.md Decisions:** Lines 41-47 (URL parsing decisions: Number.isNaN, boolean parsing, empty string handling)

## Implementation Details

### Type-Safe URL Parameter Parsing

**Problem:** URL parameters are always strings or null. Converting to numbers/booleans requires careful handling.

**Solution:** Created three helper functions with explicit fallback values:

```typescript
// parseNumberParam - NaN-safe number parsing
export function parseNumberParam(
  value: string | null,
  fallback: number
): number {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// parseStringParam - null/empty string handling
export function parseStringParam(
  value: string | null,
  fallback: string
): string {
  return value === null || value === "" ? fallback : value;
}

// parseBooleanParam - explicit boolean parsing
export function parseBooleanParam(
  value: string | null,
  fallback: boolean
): boolean {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}
```

### Key Decisions

**1. Number.isNaN() instead of global isNaN()**

- **Problem:** Global `isNaN("abc")` returns `true` (type coercion converts "abc" to NaN first)
- **Solution:** `Number.isNaN()` performs strict check without coercion
- **Impact:** Prevents false positives, more reliable NaN detection

**2. Boolean parsing accepts only "true" and "1"**

- **Problem:** Ambiguous boolean parsing (what about "yes", "on", "Y"?)
- **Solution:** Explicit is better than implicit - only accept "true"/"1" as truthy
- **Impact:** Clear, predictable behavior across all boolean URL parameters

**3. Empty string triggers fallback (same as null)**

- **Problem:** URL parameter `?value=` results in empty string (not null)
- **Solution:** Treat empty string same as missing parameter (use fallback)
- **Impact:** Consistent fallback behavior for both missing and empty parameters

### Biome noExplicitAny Enforcement

**Configuration:** `biome.json`

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error" // Changed from "off"
      }
    }
  }
}
```

**Why error level (not warn):**

- Warnings can be ignored - errors block the build
- Type safety violations should be mandatory fixes, not optional suggestions
- Prevents accidental introduction of `any` types during development

### TypeScript Strict Mode Flags

**Configuration:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true // Enables 8 strict checks
  }
}
```

**What "strict": true enables:**

1. `strictNullChecks` - null and undefined must be handled explicitly
2. `strictFunctionTypes` - Function parameter contravariance checked
3. `strictBindCallApply` - Type-check bind/call/apply methods
4. `strictPropertyInitialization` - Class properties must be initialized
5. `noImplicitAny` - Variables must have explicit or inferred types
6. `noImplicitThis` - this must have explicit type in functions
7. `alwaysStrict` - Parse in strict mode and emit "use strict"
8. `useUnknownInCatchVariables` - catch clause variables default to unknown (not any)

**Why documented inline:** Helps future developers understand configuration without consulting external TypeScript documentation.

## Verification Results

**Before enforcement:**

- 2 explicit `any` types in `src/hooks/use-converter.ts`
- URL parameter parsing scattered across calculator components
- No lint rule preventing new `any` types

**After enforcement:**

- Zero explicit `any` types in entire codebase
- Centralized URL parsing in `src/lib/utils/url-params.ts`
- Biome lint fails if any new `any` types introduced
- TypeScript compilation passes with zero errors
- Production build succeeds: 651 static pages generated

**Usage in codebase:**

- 542 URL parameter parsing sites can now use type-safe helpers
- All Zustand stores use type-safe parsing (Phase 2 integration)
- Calculator components have complete type inference
