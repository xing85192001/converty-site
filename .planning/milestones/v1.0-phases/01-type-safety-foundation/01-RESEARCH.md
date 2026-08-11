# Phase 1: Type Safety Foundation - Research

**Researched:** 2026-01-17
**Domain:** TypeScript strict mode, type-safe URL parameter parsing, Biome linting
**Confidence:** HIGH

## Summary

This phase focuses on eliminating all `any` types from the codebase and implementing type-safe URL parameter parsing. The good news: TypeScript strict mode is already enabled (`"strict": true` in tsconfig.json). The work involves:

1. **Biome Configuration**: Change `noExplicitAny` from "off" to "error" (one-line change)
2. **URL Parameter Parsing**: Replace unsafe `Number(param)` coercion (542 occurrences across 153 files) with validated helper functions
3. **Generic Type Parameters**: Replace `any` in `useConverter` hook with proper generic constraints
4. **Zustand Stores**: Already well-typed, but need to fix URL parsing within store initialization

The codebase shows good type safety practices already (22 files use `Number.isNaN()` for validation). The main issue is the legacy `useConverter` hook using `any` for result types, and widespread unsafe URL parameter parsing that can produce `NaN` values at runtime.

**Primary recommendation:** Create simple, reusable URL parameter parsing helpers (parseNumberParam, parseStringParam, parseBooleanParam) with fallback values. Do NOT add Zod or other validation libraries for this phase—the overhead isn't justified for simple URL parameter parsing.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library    | Version | Purpose                           | Why Standard                           |
| ---------- | ------- | --------------------------------- | -------------------------------------- |
| TypeScript | 5.9.3   | Type system and compiler          | Already installed, strict mode enabled |
| Biome      | 2.3.11  | Fast linter/formatter             | Already configured, replaces ESLint    |
| Next.js    | 16.1.1  | Framework with TypeScript support | Project framework                      |
| Zustand    | 5.0.10  | State management with TypeScript  | Already used for stores                |

### Supporting

| Library         | Version | Purpose                     | When to Use                          |
| --------------- | ------- | --------------------------- | ------------------------------------ |
| URLSearchParams | Native  | Browser API for URL parsing | Already used in useUrlState hook     |
| Number.isNaN()  | Native  | NaN validation              | Better than isNaN() (doesn't coerce) |

### Alternatives Considered

| Instead of     | Could Use    | Tradeoff                                                                     |
| -------------- | ------------ | ---------------------------------------------------------------------------- |
| Simple helpers | Zod          | Zod adds 8kb, runtime overhead for 200+ calculators; overkill for URL params |
| Simple helpers | Valibot      | Smaller than Zod (1kb) but still unnecessary dependency                      |
| Number()       | parseInt()   | parseInt requires radix parameter, more verbose                              |
| Number()       | parseFloat() | Already used in calculators (safe), Number() better for integers             |

**Installation:**
No new dependencies needed. All required tools are already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── utils/
│       ├── url-params.ts         # New: Type-safe URL parameter parsing
│       └── format.ts              # Existing: Number formatting
├── hooks/
│   ├── use-converter.ts           # Fix: Replace any with generic constraints
│   └── use-url-state.ts           # Fix: Use new parsing helpers
└── stores/
    └── calculator-store.ts        # Fix: Use new parsing helpers
```

### Pattern 1: Type-Safe URL Parameter Parsing

**What:** Helper functions that parse URL parameters with type safety and fallback values
**When to use:** Any time you read from URLSearchParams
**Example:**

```typescript
// src/lib/utils/url-params.ts
export function parseNumberParam(
  value: string | null,
  fallback: number
): number {
  if (value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function parseStringParam(
  value: string | null,
  fallback: string
): string {
  return value === null || value === "" ? fallback : value;
}

export function parseBooleanParam(
  value: string | null,
  fallback: boolean
): boolean {
  if (value === null || value === "") {
    return fallback;
  }
  return value === "true" || value === "1";
}

// Usage in calculator-store.ts
const urlParams = getUrlParams();
const numValue = parseNumberParam(urlParams.amount, 100);
```

### Pattern 2: Generic Type Constraints (Not Any)

**What:** Use proper generic constraints instead of `any` for type parameters
**When to use:** When creating reusable hooks or stores with unknown result types
**Example:**

```typescript
// BEFORE (uses any)
export interface UseConverterOptions<T extends object, R = any> {
  calculate: (values: T) => ConverterResult<R> | null;
}

// AFTER (uses generic constraint)
export interface UseConverterOptions<T extends object, R = unknown> {
  calculate: (values: T) => ConverterResult<R> | null;
}

// Even better: Remove the default entirely
export interface UseConverterOptions<T extends object, R> {
  calculate: (values: T) => ConverterResult<R> | null;
}
```

### Pattern 3: Zustand Store with TypeScript

**What:** Type-safe Zustand store creation with explicit generic parameters
**When to use:** Creating calculator stores (already the standard pattern)
**Example:**

```typescript
// Already correct pattern in codebase
const useMyStore = createCalculatorStore<FormValues, ResultType>({
  name: "my-calculator",
  initialValues: { amount: "100" },
  calculate: (values) => calculateResult(values),
});

// TypeScript infers types correctly:
const { values, setValue, result } = useMyStore();
// values: FormValues
// result: ResultType | null
```

### Anti-Patterns to Avoid

- **Unsafe Number() coercion:** `Number(param)` returns `NaN` for invalid input, causing silent failures
- **Using `any` as default type parameter:** Defeats the purpose of TypeScript generics
- **parseInt() without radix:** Browser inconsistencies with leading zeros (octal interpretation)
- **Overusing optional operators:** Adding `?` to every field during strict mode migration instead of proper initialization

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                    | Don't Build                    | Use Instead                                | Why                                                    |
| -------------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------------------ |
| URL parameter parsing      | Custom parsing per calculator  | Reusable parseNumberParam/parseStringParam | 542 parsing sites need consistent behavior             |
| NaN validation             | `value !== value` or `isNaN()` | `Number.isNaN()`                           | Old `isNaN()` coerces types (false positives)          |
| Generic type parameters    | `any` or `unknown` everywhere  | Proper generic constraints                 | TypeScript can infer types when generics are specific  |
| Schema validation for URLs | Full Zod schemas               | Simple helper functions                    | URL params are trusted internal data, not external API |

**Key insight:** URL parameter parsing is the biggest risk. 542 occurrences of parseFloat/parseInt/Number() across 153 files means any unsafe parsing pattern gets replicated hundreds of times. One reusable helper function prevents hundreds of potential bugs.

## Common Pitfalls

### Pitfall 1: Number() Returns NaN Silently

**What goes wrong:** `Number("abc")` returns `NaN`, which propagates through calculations producing invalid results
**Why it happens:** Number() doesn't throw errors for invalid input, and `NaN !== NaN` makes it hard to detect
**How to avoid:** Always validate with `Number.isNaN()` and provide fallback values
**Warning signs:** Calculator shows "NaN" in output, or calculations produce `Infinity`

### Pitfall 2: parseInt() Without Radix Parameter

**What goes wrong:** `parseInt("08")` returns 8 in modern browsers but returned 0 in older browsers (octal interpretation)
**Why it happens:** ECMAScript legacy behavior treated leading zeros as octal (base 8)
**How to avoid:** Always use `parseInt(value, 10)` with explicit radix, or prefer `Number()` for decimal parsing
**Warning signs:** Inconsistent results with numbers like "08", "09" in different browsers

### Pitfall 3: Overusing Optional Operators During Migration

**What goes wrong:** Adding `?` to all fields just to pass strict mode without thinking about actual nullability
**Why it happens:** Shortcut to fix TypeScript errors quickly during migration
**How to avoid:** Ask "should this actually be optional?" Arrays should almost never be `undefined`, use `[]` default instead
**Warning signs:** Code has `value?.property?.nested?.access` chains everywhere

### Pitfall 4: Implicit Any in Catch Clauses

**What goes wrong:** TypeScript 4.4+ types catch variables as `unknown` (with useUnknownInCatchVariables), causing errors like `error.message`
**Why it happens:** Strict mode enables useUnknownInCatchVariables flag
**How to avoid:** Type narrow catch variables: `if (error instanceof Error) { error.message }`
**Warning signs:** Errors like "Object is of type 'unknown'" in catch blocks

### Pitfall 5: Uninitialized Class Properties

**What goes wrong:** Class property declared with type but not initialized in constructor, runtime errors when accessed
**Why it happens:** strictPropertyInitialization flag requires initialization or definite assignment assertion
**How to avoid:** Initialize in constructor, use `!` assertion only when truly initialized elsewhere, or make optional
**Warning signs:** TypeScript errors like "Property 'x' has no initializer and is not definitely assigned"

## Code Examples

Verified patterns from official sources and codebase analysis:

### URL Parameter Parsing (Type-Safe)

```typescript
// Source: Derived from URLSearchParams Web API + TypeScript best practices
// Location: src/lib/utils/url-params.ts

/**
 * Parse a number from URL parameter with fallback
 * @param value - URL parameter value (string | null)
 * @param fallback - Default value if parsing fails
 * @returns Parsed number or fallback
 */
export function parseNumberParam(
  value: string | null,
  fallback: number
): number {
  if (value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// Usage
const searchParams = new URLSearchParams(window.location.search);
const amount = parseNumberParam(searchParams.get("amount"), 100);
const rate = parseNumberParam(searchParams.get("rate"), 5);
```

### Replacing Any with Generic Constraints

```typescript
// Source: TypeScript Handbook - Generics
// Location: src/hooks/use-converter.ts

// BEFORE
export interface UseConverterOptions<T extends object, R = any> {
  calculate: (values: T) => ConverterResult<R> | null;
}

// AFTER - Option 1: Use unknown as safer default
export interface UseConverterOptions<T extends object, R = unknown> {
  calculate: (values: T) => ConverterResult<R> | null;
}

// AFTER - Option 2: Require explicit type (best)
export interface UseConverterOptions<T extends object, R> {
  calculate: (values: T) => ConverterResult<R> | null;
}
```

### Zustand Store TypeScript Pattern

```typescript
// Source: https://zustand.docs.pmnd.rs/guides/advanced-typescript
// Location: src/stores/calculator-store.ts (already correct)

import { create, type StateCreator } from 'zustand';

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

// Use create<T>()(...) with extra parentheses
const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

// TypeScript infers parameter and state types correctly
// No manual annotations needed in the callback
```

### Number Validation Pattern

```typescript
// Source: MDN Web Docs - Number.isNaN()
// Already used in 22 files in codebase

// WRONG - isNaN coerces types
isNaN("hello"); // true
isNaN(undefined); // true
isNaN({}); // true

// CORRECT - Number.isNaN only true for actual NaN
Number.isNaN("hello"); // false
Number.isNaN(undefined); // false
Number.isNaN(NaN); // true
Number.isNaN(Number("hello")); // true

// Usage pattern
function safeParseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
```

## State of the Art

| Old Approach         | Current Approach          | When Changed                  | Impact                          |
| -------------------- | ------------------------- | ----------------------------- | ------------------------------- |
| `any` everywhere     | `unknown` or generics     | TypeScript 3.0 (2018)         | unknown forces type narrowing   |
| isNaN() global       | Number.isNaN()            | ES2015                        | No type coercion, more accurate |
| Manual type guards   | `unknown` in catch        | TypeScript 4.4 (2021)         | Safer error handling            |
| implicit any allowed | strict mode on by default | TypeScript 6.0 (planned 2026) | Strictness by default           |
| Inline URL parsing   | Centralized helpers       | Modern pattern                | Reusability, consistency        |

**Deprecated/outdated:**

- `isNaN()` global function: Use `Number.isNaN()` instead (no type coercion)
- `parseInt()` without radix: Always specify radix `parseInt(value, 10)`
- `any` as catch variable type: TypeScript 4.4+ uses `unknown` (with strict mode)
- Suppressing noExplicitAny with eslint-disable: Fix the types instead

## Open Questions

Things that couldn't be fully resolved:

1. **Should useConverter hook be deleted entirely?**

   - What we know: ARCHITECTURE.md says "legacy, prefer Zustand" and STATE-02 requirement mentions potential deletion
   - What's unclear: Are there calculators still using it that aren't migrated?
   - Recommendation: Count usage, if <5 calculators use it, migrate them and delete hook

2. **Boolean URL parameter parsing edge cases**

   - What we know: Different conventions exist ("true", "1", "yes", "on")
   - What's unclear: Which convention does this project prefer?
   - Recommendation: Support "true" and "1" only (simplest, most common)

3. **Number precision for URL parameters**
   - What we know: Number() may lose precision for very large integers (beyond Number.MAX_SAFE_INTEGER)
   - What's unclear: Do any calculators use BigInt or require arbitrary precision?
   - Recommendation: Start with Number(), add BigInt parsing only if needed

## Sources

### Primary (HIGH confidence)

- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/) - Strict mode flags documentation
- [Biome noExplicitAny Rule](https://biomejs.dev/linter/rules/no-explicit-any/) - Official Biome documentation
- [Zustand Advanced TypeScript Guide](https://zustand.docs.pmnd.rs/guides/advanced-typescript) - Official TypeScript patterns
- [MDN Number.isNaN()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN) - Web standard

### Secondary (MEDIUM confidence)

- [TypeScript Strict Mode Guide - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/typescript-strict-option/) - Migration patterns
- [Controlling Type Checking Strictness](https://carlrippon.com/controlling-type-checking-strictness-in-typescript/) - Strict flags explained
- [TypeScript vs Zod - LogRocket](https://blog.logrocket.com/when-use-zod-typescript-both-developers-guide/) - When to use validation libraries
- [Replace any with generics - TinyTip](https://tinytip.co/tips/ts-replace-any/) - Generic type patterns
- [parseInt() can be dangerous - Coderwall](https://coderwall.com/p/4eaixa/parseint-can-be-dangerous) - Radix gotchas

### Tertiary (LOW confidence)

- [TypeScript 6.0 strict by default](https://github.com/microsoft/TypeScript/issues/62333) - Planned feature, not released
- [Bitwarden TypeScript Strict ADR](https://contributing.bitwarden.com/architecture/adr/typescript-strict/) - Migration case study
- [Incremental Angular strict migration](https://www.bitovi.com/blog/how-to-incrementally-migrate-an-angular-project-to-typescript-strict-mode) - Large codebase patterns

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All tools already installed and configured
- Architecture: HIGH - Patterns verified in codebase and official docs
- Pitfalls: HIGH - Based on official TypeScript docs and common migration issues
- URL parsing: MEDIUM - Simple pattern but 542 occurrences means high impact

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - TypeScript and Biome are stable)

**Codebase statistics:**

- TypeScript strict mode: Already enabled ✓
- Biome noExplicitAny: Currently "off" (needs change)
- Files using `any`: 33 files
- Unsafe parsing occurrences: 542 across 153 files
- Files using Number.isNaN(): 22 (good pattern already present)
