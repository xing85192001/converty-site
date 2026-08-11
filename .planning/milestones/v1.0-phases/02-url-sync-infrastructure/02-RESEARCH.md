# Phase 2: URL Sync Infrastructure - Research

**Researched:** 2026-01-17
**Domain:** Zustand middleware, URL state management, debouncing
**Confidence:** HIGH

## Summary

This phase consolidates URL sync logic into reusable Zustand middleware and fixes the global debounce timer bug (STATE-04). The current implementation in `src/stores/calculator-store.ts` uses a global `debounceTimeout` variable (line 48) shared across all store instances, causing timer conflicts when multiple calculators exist on the same page or users navigate quickly between calculators.

The solution requires implementing Zustand middleware that uses closures to maintain per-store debounce timers. Zustand middleware is a higher-order function pattern that wraps the state creator, allowing each store instance to maintain isolated state (including timers) through JavaScript closures.

The project uses Zustand 5.0.10 (latest stable) and Next.js 16 with static site generation (`output: "export"`). URL updates use `window.history.replaceState()` which Next.js monkey-patches to integrate with `usePathname()` and `useSearchParams()`.

**Primary recommendation:** Create `src/lib/middleware/url-sync.ts` exporting a factory function that returns middleware with a closure-captured debounce timer. Each call to the factory creates a new middleware instance with its own timer, ensuring per-store isolation.

## Standard Stack

### Core

| Library    | Version | Purpose          | Why Standard                                                   |
| ---------- | ------- | ---------------- | -------------------------------------------------------------- |
| zustand    | 5.0.10  | State management | Already in use, v5 is stable, middleware-friendly architecture |
| TypeScript | 5.9.3   | Type safety      | Already in use, critical for middleware typing                 |

### Supporting

| Library         | Version | Purpose                    | When to Use                                       |
| --------------- | ------- | -------------------------- | ------------------------------------------------- |
| URLSearchParams | Native  | URL manipulation           | All URL parameter operations (already used)       |
| window.history  | Native  | URL updates without reload | replaceState for parameter updates (already used) |

### Alternatives Considered

| Instead of        | Could Use              | Tradeoff                                                                                                            |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Custom middleware | nuqs library           | nuqs provides type-safe URL state but adds dependency; overkill for this use case since we only need basic URL sync |
| Closure timers    | WeakMap-based timers   | WeakMap approach more complex, closure is idiomatic JavaScript pattern                                              |
| Middleware        | Inline logic per store | Middleware eliminates duplication, easier to maintain                                                               |

**Installation:**
No new packages needed. This phase uses existing dependencies.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── middleware/
│   │   └── url-sync.ts          # URL sync middleware factory
│   └── utils/
│       └── url-params.ts        # Type-safe parsers (from Phase 1)
└── stores/
    └── calculator-store.ts      # Store factory using middleware
```

### Pattern 1: Middleware Factory with Closure-Captured Timer

**What:** A factory function that returns Zustand middleware, with each invocation creating a new closure containing an isolated debounce timer.

**When to use:** When middleware needs per-instance state that must be isolated across store instances.

**Example:**

```typescript
// Source: Zustand closure patterns + debouncing best practices
// https://www.shdev.blog/en/post/zustand-closure-deep-dive

export function createUrlSyncMiddleware<T extends object>(options: {
  debounceMs?: number;
}) {
  // CRITICAL: Timer declared in factory scope creates closure
  // Each call to createUrlSyncMiddleware creates NEW closure with NEW timer
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Return middleware function (standard Zustand signature)
  return (config: StateCreator<T, [], []>): StateCreator<T, [], []> => {
    return (set, get, api) => {
      // Wrap original setState to add URL sync
      const originalSet = api.setState;

      api.setState = (update, replace, actionName) => {
        // Call original setState first
        originalSet(update, replace, actionName);

        // Then sync to URL (debounced)
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const state = get();
          // Update URL logic here
        }, options.debounceMs ?? 150);
      };

      return config(set, get, api);
    };
  };
}
```

### Pattern 2: Atomic Multi-Parameter URL Updates

**What:** Batch multiple URL parameter changes into a single `replaceState` call to avoid intermediate states.

**When to use:** When a single state update affects multiple URL parameters.

**Example:**

```typescript
// Source: Next.js and URLSearchParams best practices
function syncToUrl(values: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams();

  // Build all parameters before updating URL (atomic)
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const newSearch = searchParams.toString();
  const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;

  // Single replaceState call = atomic update
  window.history.replaceState({}, "", newUrl);
}
```

### Pattern 3: Middleware with Options

**What:** Middleware factory accepts configuration options, allowing per-store customization.

**When to use:** When different stores need different middleware behavior (e.g., different debounce times).

**Example:**

```typescript
// Source: Zustand devtools middleware pattern
const useFastStore = create<State>()(
  createUrlSyncMiddleware({ debounceMs: 50 })((set) => ({
    /* state */
  }))
);

const useSlowStore = create<State>()(
  createUrlSyncMiddleware({ debounceMs: 500 })((set) => ({
    /* state */
  }))
);
```

### Anti-Patterns to Avoid

- **Global timer variables:** Never declare timers at module scope - causes cross-store interference
- **Debouncing after replaceState:** Debounce before URL update, not after
- **pushState for parameter updates:** Use replaceState to avoid flooding browser history
- **Skipping TypeScript generics:** Middleware must preserve store type information
- **Immediate URL updates:** Always debounce to avoid performance issues

## Don't Hand-Roll

| Problem               | Don't Build                       | Use Instead                                                    | Why                                                                       |
| --------------------- | --------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| URL parameter parsing | String parsing with split/indexOf | URLSearchParams API                                            | Handles encoding, edge cases, widely supported                            |
| Debouncing            | Manual setTimeout tracking        | Closure-based debounce pattern                                 | Proven pattern, avoids memory leaks                                       |
| Type-safe parsers     | Generic parse function            | Specific parseNumberParam, parseStringParam, parseBooleanParam | Type inference works better, clearer intent (already exists from Phase 1) |
| Middleware typing     | any or unknown everywhere         | StateCreator<T, [], []> pattern                                | Preserves type safety through middleware chain                            |

**Key insight:** Zustand middleware is a userland pattern without official API documentation. The pattern is simple (higher-order function) but TypeScript typing is complex. Learn from existing middleware (devtools, persist) rather than inventing new patterns.

## Common Pitfalls

### Pitfall 1: Global Timer Variables

**What goes wrong:** Declaring `let debounceTimeout` at module scope causes all stores to share the same timer. When Store A updates, it clears Store B's pending timeout.

**Why it happens:** Module-level variables are shared across all imports. JavaScript closures aren't created unless the timer is declared inside a function scope.

**How to avoid:** Declare timer inside the middleware factory function, creating a new closure per factory invocation.

**Warning signs:**

- URL updates randomly missing when switching between calculators
- Last calculator to update "wins" and others lose their changes
- Difficult to reproduce (timing-dependent race condition)

### Pitfall 2: Middleware Order Confusion

**What goes wrong:** Middleware order matters. `devtools(urlSync(...))` works differently than `urlSync(devtools(...))`. Some middleware mutate the `api.setState` function, and order determines which mutations happen first.

**Why it happens:** Each middleware wraps the next in the chain. The outermost middleware sees the setState modified by inner middleware.

**How to avoid:**

- Apply devtools middleware last (outermost) when combining multiple middleware
- Document middleware order in code comments
- Test combined middleware behavior

**Warning signs:**

- DevTools shows wrong state transitions
- setState calls behave unexpectedly
- TypeScript errors about incompatible setState signatures

### Pitfall 3: Forgetting SSR/SSG Guards

**What goes wrong:** Calling `window.history.replaceState()` during server-side rendering causes "window is not defined" errors.

**Why it happens:** Next.js static export pre-renders pages on the server where `window` doesn't exist.

**How to avoid:** Always guard browser API calls with `if (typeof window === "undefined") return;`

**Warning signs:**

- Build-time errors about window not being defined
- Client/server hydration mismatches
- Errors only appear in production build, not dev mode

### Pitfall 4: Excessive URL Updates

**What goes wrong:** Updating URL on every keystroke causes performance degradation and makes URL sharing difficult (URL changes mid-typing).

**Why it happens:** Directly calling `replaceState` in onChange handlers without debouncing.

**How to avoid:**

- Debounce URL updates (150-500ms)
- Use replaceState (not pushState) to avoid history pollution
- Consider separating immediate UI state from debounced URL state

**Warning signs:**

- Browser history filled with tiny incremental changes
- Performance lag during rapid input
- Shared URLs capture half-typed values

### Pitfall 5: Incorrect TypeScript Middleware Signature

**What goes wrong:** TypeScript errors like "Argument of type 'StateCreator<...>' is not assignable to parameter of type 'StateCreator<...>'"

**Why it happens:** Middleware signature must exactly match Zustand's expected types. The curried `create<T>()()` syntax is required when using middleware.

**How to avoid:**

- Use `StateCreator<T, [], []>` for simple middleware
- Use `create<T>()()` (double parentheses) when applying middleware
- Copy type signatures from official middleware examples

**Warning signs:**

- TypeScript errors about StateCreator incompatibility
- Inference not working (need explicit type annotations everywhere)
- Middleware seems to work in JavaScript but fails TypeScript compilation

## Code Examples

### Complete URL Sync Middleware Implementation

```typescript
// Source: Zustand patterns + research findings
// File: src/lib/middleware/url-sync.ts

import type { StateCreator } from "zustand";

export interface UrlSyncOptions {
  /** Whether to enable URL sync (default: true) */
  enabled?: boolean;
  /** Debounce time in milliseconds (default: 150) */
  debounceMs?: number;
  /** Only sync these keys to URL (default: all keys) */
  include?: string[];
  /** Exclude these keys from URL sync (default: none) */
  exclude?: string[];
}

/**
 * Creates URL sync middleware with isolated debounce timer
 *
 * CRITICAL: This is a factory function. Each invocation creates
 * a NEW middleware instance with its OWN debounce timer via closure.
 *
 * @example
 * const useStore = create<State>()(
 *   createUrlSyncMiddleware({ debounceMs: 200 })(
 *     (set) => ({ count: 0, increment: () => set(s => ({ count: s.count + 1 })) })
 *   )
 * );
 */
export function createUrlSyncMiddleware<T extends object>(
  options: UrlSyncOptions = {}
) {
  const { enabled = true, debounceMs = 150, include, exclude } = options;

  // CLOSURE: Timer declared in factory scope
  // Each call to createUrlSyncMiddleware creates NEW closure
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Return the middleware function
  return (config: StateCreator<T, [], []>): StateCreator<T, [], []> => {
    return (set, get, api) => {
      // Load initial state from URL
      if (enabled && typeof window !== "undefined") {
        const urlParams = getUrlParams();
        if (Object.keys(urlParams).length > 0) {
          // Merge URL params with initial state
          // (This happens during store creation, before config is called)
        }
      }

      // Wrap setState to add URL sync
      const originalSet = api.setState;
      api.setState = (update, replace, actionName) => {
        // Call original setState first
        originalSet(update, replace, actionName);

        // Then sync to URL (debounced)
        if (!enabled) return;

        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
          const state = get();
          syncStateToUrl(state, { include, exclude });
        }, debounceMs);
      };

      return config(set, get, api);
    };
  };
}

function getUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

function syncStateToUrl(
  state: object,
  options: { include?: string[]; exclude?: string[] }
) {
  if (typeof window === "undefined") return;

  const { include, exclude } = options;
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(state)) {
    // Skip if not in include list (when include is specified)
    if (include && !include.includes(key)) continue;
    // Skip if in exclude list
    if (exclude?.includes(key)) continue;
    // Skip functions and undefined/null/empty values
    if (typeof value === "function") continue;
    if (value === undefined || value === null || value === "") continue;

    searchParams.set(key, String(value));
  }

  const newSearch = searchParams.toString();
  const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;

  // Use replaceState (not pushState) to avoid flooding history
  window.history.replaceState({}, "", newUrl);
}
```

### Using the Middleware in Calculator Store

```typescript
// Source: Updated calculator-store.ts pattern
// File: src/stores/calculator-store.ts

import { create, type StateCreator } from "zustand";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { parseNumberParam, parseStringParam } from "@/lib/utils/url-params";

export interface CalculatorState<T extends object, R> {
  values: T;
  result: R | null;
  errors: Partial<Record<keyof T, string>>;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: T) => void;
  reset: () => void;
}

export interface CreateCalculatorStoreOptions<T extends object, R> {
  name: string;
  initialValues: T;
  calculate: (values: T) => R | null;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  syncUrl?: boolean;
  debounceMs?: number;
}

export function createCalculatorStore<T extends object, R>({
  initialValues,
  calculate,
  validate,
  syncUrl = true,
  debounceMs = 150,
}: CreateCalculatorStoreOptions<T, R>) {
  const storeCreator: StateCreator<CalculatorState<T, R>> = (set, get) => ({
    values: initialValues,
    result: null,
    errors: {},

    setValue: <K extends keyof T>(key: K, value: T[K]) => {
      const currentState = get();
      const newValues = { ...currentState.values, [key]: value };

      const errors = validate?.(newValues) ?? {};
      const result = Object.keys(errors).length === 0 ? calculate(newValues) : null;

      set({ values: newValues, errors, result });
    },

    setValues: (values: T) => {
      const errors = validate?.(values) ?? {};
      const result = Object.keys(errors).length === 0 ? calculate(values) : null;

      set({ values, errors, result });
    },

    reset: () => {
      set({
        values: initialValues,
        errors: {},
        result: null,
      });
    },
  });

  // Apply middleware conditionally
  if (syncUrl) {
    return create<CalculatorState<T, R>>()(
      createUrlSyncMiddleware<CalculatorState<T, R>>({
        debounceMs,
        include: Object.keys(initialValues), // Only sync 'values' fields
      })(storeCreator)
    );
  }

  return create<CalculatorState<T, R>>()(storeCreator);
}
```

## State of the Art

| Old Approach          | Current Approach               | When Changed              | Impact                                                               |
| --------------------- | ------------------------------ | ------------------------- | -------------------------------------------------------------------- |
| Global debounce timer | Closure-based per-store timers | Phase 2 (this phase)      | Fixes concurrent calculator bug (STATE-04)                           |
| Inline URL sync logic | Reusable middleware            | Phase 2 (this phase)      | DRY principle, easier maintenance (STATE-03)                         |
| Zustand v4            | Zustand v5                     | Released 2024             | Dropped React <18 support, uses useSyncExternalStore, stricter types |
| pushState for params  | replaceState for params        | Community consensus ~2023 | Avoids history pollution                                             |
| Manual debounce       | useDebounce hooks              | Modern React pattern      | Still requires closure pattern for non-React contexts                |

**Deprecated/outdated:**

- **Zustand v3/v4:** Project uses v5.0.10, which has breaking changes (minimum React 18, stricter TypeScript)
- **Custom equality functions in create():** v5 requires `createWithEqualityFn` for custom equality
- **UMD/SystemJS builds:** Dropped in v5

## Open Questions

### 1. Should we sync all state or just 'values' to URL?

**What we know:**

- Current implementation syncs entire state (values, result, errors)
- Result and errors are derived from values
- URLs become very long when including calculated results

**What's unclear:**

- Performance impact of long URLs
- Whether users expect results in shareable URLs

**Recommendation:** Only sync the `values` object to URL. Use `include: Object.keys(initialValues)` in middleware options. Results can be recalculated from values on page load.

### 2. How should we handle URL parameter conflicts?

**What we know:**

- Two calculators on same page would both try to write to URL
- URLSearchParams doesn't namespace by default
- Current implementation doesn't have page with multiple calculators

**What's unclear:**

- Will there ever be multiple calculators on one page?
- How to namespace parameters if needed

**Recommendation:** If multiple calculators per page becomes a requirement (SUCCESS CRITERIA #2 mentions it), implement namespacing: `?calc1.amount=100&calc2.amount=200`. For now, assume one calculator per page.

### 3. What about URL parameter name collisions with other features?

**What we know:**

- Current calculators use simple field names (amount, rate, etc.)
- These might conflict with future features (utm params, analytics, etc.)

**What's unclear:**

- What reserved parameter names should be avoided
- Whether to prefix all calculator params

**Recommendation:** Document a convention (e.g., avoid `utm_*`, `ref`, `source`) but don't implement prefixing unless collisions occur. Keep URLs clean for now.

## Sources

### Primary (HIGH confidence)

- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - Official source code and discussions
- [Zustand Advanced TypeScript Guide](https://zustand.docs.pmnd.rs/guides/advanced-typescript) - Middleware typing patterns
- [How Zustand Uses Closures](https://www.shdev.blog/en/post/zustand-closure-deep-dive) - Per-store state isolation via closures
- [MDN: History.replaceState()](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) - Browser API reference
- [Next.js: Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) - window.history integration with Next.js
- Package.json inspection - Confirmed Zustand 5.0.10, TypeScript 5.9.3

### Secondary (MEDIUM confidence)

- [Zustand Middleware Discussion #1770](https://github.com/pmndrs/zustand/discussions/1770) - Community patterns, not official docs
- [How to Migrate to v5 from v4](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5) - Breaking changes documentation
- [replaceState vs pushState Best Practices](https://nickcolley.co.uk/2018/06/11/pushstate-vs-replacestate/) - Community guidance from 2018, still relevant
- [Debounce Closure Pattern Examples](https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940) - Community TypeScript examples
- [URL State Management Best Practices](https://alfy.blog/2025/10/31/your-url-is-your-state.html) - Recent blog post (2025) with practical patterns

### Tertiary (LOW confidence)

- [Zustand Middleware: Architectural Core](https://beyondthecode.medium.com/zustand-middleware-the-architectural-core-of-scalable-state-management-d8d1053489ac) - Medium article, helpful but not authoritative
- [React Debouncing Guide](https://www.developerway.com/posts/debouncing-in-react) - General React patterns, not Zustand-specific
- [nuqs Library](https://nuqs.dev) - Alternative approach mentioned for context, not recommended for this project

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Package.json inspection confirms versions, Zustand is proven technology
- Architecture patterns: HIGH - Closure pattern is fundamental JavaScript, verified with Zustand maintainer discussions and source code analysis
- Pitfalls: HIGH - Derived from official migration guides, GitHub issues, and code inspection of current implementation
- Code examples: MEDIUM - Synthesized from multiple sources, not tested in this specific project yet (will be validated in implementation)

**Research date:** 2026-01-17
**Valid until:** ~2026-02-17 (30 days - Zustand is stable, URL APIs are evergreen)

**Key risks:**

- TypeScript middleware typing is notoriously complex; examples may need adjustment during implementation
- SUCCESS CRITERIA #2 (concurrent calculators) may reveal edge cases not covered in research
- Next.js 16 is recent; window.history integration behavior should be validated in testing
