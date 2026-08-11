# URL State Persistence for Shareable Calculator Links

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Users performing calculations often want to share their work — a mortgage calculation with specific parameters, a subnet configuration, or a unit conversion result. Without URL persistence, sharing requires copy-pasting all input values manually. Additionally, users expect the browser Back button and bookmarks to work meaningfully.

How should calculator input state be persisted and shared?

## Decision Drivers

- **Shareability is a core feature** — "Share this calculation" is a primary use case
- **No server-side storage** — Static export means no database or session storage
- **Privacy-first** — Input values must not leave the user's browser
- **URL must remain readable** — Parameters should be human-readable (`?value=100&unit=km`)
- **Browser history** — Back/Forward should not flood history with every keystroke
- **Security** — URL parameters must not enable XSS or property injection attacks

## Considered Options

1. **URL search parameters via `history.replaceState`** — Encode input values in `?key=value` format
2. **LocalStorage** — Persist last-used values client-side, not shareable
3. **URL hash (`#`)** — Encode state in fragment, not included in server requests
4. **SessionStorage** — Tab-scoped, not shareable across devices
5. **Clipboard-based "Share" button** — Manual copy, no automatic persistence

## Decision Outcome

Chosen option: **"URL search parameters via `history.replaceState`"** because it makes every calculator state instantly shareable by copying the browser URL, requires no server, and encodes all input values in a human-readable format.

### Consequences

**Positive:**

- **Zero-friction sharing:** Any calculation is shareable by copying the URL
- **Bookmark support:** Users can bookmark a specific calculation configuration
- **No server dependency:** State is entirely in the browser URL
- **Transparent:** Users can see and edit URL parameters manually
- **SEO neutral:** `replaceState` (not `pushState`) avoids flooding browser history

**Negative:**

- **URL length limits:** Very complex inputs (chemistry formulas, large arrays) may approach URL length limits
- **Encoding required:** Special characters (`+`, `=`, `/`) must be URL-encoded
- **No sensitive data warning:** Users must understand that URL-shared links expose all input values
- **Parse complexity:** Safely parsing URL parameters requires type-safe helpers to prevent injection

**Neutral:**

- **Only `values` synced, not `result`:** Results are always recomputed from inputs; results are not stored in URL
- **150ms debounce:** URL updates debounced to avoid performance issues during typing

## Security Consideration

Initial implementation used `Object.assign()` to merge URL parameters into store state, which enabled property injection attacks (e.g., `?__proto__[polluted]=true`). This was replaced in v4.0 with a `Map`-based approach that only reads explicitly declared parameter keys.

```typescript
// INSECURE (v3.0 and earlier)
Object.assign(storeValues, urlParams);  // Prototype pollution risk

// SECURE (v4.0+)
const knownKeys = new Map(Object.entries(initialValues));
for (const [key, value] of urlSearchParams) {
  if (knownKeys.has(key)) {
    parsedValues[key] = parseTyped(value, knownKeys.get(key));
  }
}
```

## Type-Safe Parameter Helpers

URL parameters are always strings. Three helpers provide safe parsing:

```typescript
parseNumberParam(value: string | null): number | undefined
parseStringParam(value: string | null): string | undefined
parseBooleanParam(value: string | null): boolean | undefined
// Boolean: only "true" and "1" → true (avoids ambiguous "yes", "on", "1.0")
```

## Implementation

The URL sync logic is centralized in a single Zustand middleware:

```
src/lib/middleware/url-sync.ts  — createUrlSyncMiddleware()
src/stores/calculator-store.ts  — createCalculatorStore() factory uses middleware
```

Each calculator store gets an isolated debounce timer via closure (see ADR-0001 for Zustand rationale).

## Links

- **ADR-0001:** Zustand state management (URL sync is a feature of the Zustand middleware)
- **Security fix:** v4.0 Map-based URL parameter parsing
- **Middleware:** `src/lib/middleware/url-sync.ts`
- **Type helpers:** `src/lib/utils/url-params.ts`
