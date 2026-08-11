# Pitfalls Research: Infrastructure Upgrade

**Research Date:** 2026-01-17
**Focus:** Common mistakes and how to avoid them

## PWA Service Worker Pitfalls

### Pitfall 1: Service Worker Not Working in Production

**Warning Signs:**

- PWA features work in dev, fail in production
- Service worker registers but doesn't activate
- Offline functionality not available

**Root Causes:**

From [next-pwa production issues](https://github.com/shadowwalker/next-pwa/issues/295):

- Missing middleware manifest configuration
- Static export route configuration
- Service worker served via redirect (browsers refuse to run)

**Prevention:**

```typescript
// src/app/manifest.webmanifest/route.ts
export const dynamic = "force-static"; // Required for static export

// public/service-worker.js
// Ensure SW is served from root path, not redirected
```

**Phase to Address:** Phase 3 (PWA Implementation)

### Pitfall 2: Aggressive Caching Breaking Updates

**Warning Signs:**

- Calculator changes not appearing after deployment
- Users stuck on old version
- Clear cache required to see updates

**Root Causes:**

From [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps):

- CacheFirst strategy caches forever
- No cache invalidation strategy
- Service worker not updating properly

**Prevention:**

```javascript
// public/service-worker.js
self.addEventListener("install", (event) => {
  // Force immediate activation on new SW
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clear old caches on activation
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CURRENT_CACHE)
          .map((cache) => caches.delete(cache))
      );
    })
  );
});
```

**Also implement:**

- Version cache names: `converty-v1.2.3`
- NetworkFirst for calculator pages (fresh data)
- CacheFirst only for static assets (CSS, JS, images)
- Cache debugging: Clear application cache during development

**Phase to Address:** Phase 3 (PWA Implementation)

**References:**

- [Creating PWA with Next.js](https://www.getfishtank.com/insights/creating-a-progressive-web-app-using-nextjs)

### Pitfall 3: Missing HTTPS Requirement

**Warning Signs:**

- Service worker won't register on deployment
- "Secure context required" error
- Works on localhost but not production

**Root Causes:**

- PWAs require HTTPS (except localhost)
- GitHub Pages serves over HTTPS ✓ (we're safe)
- But worth documenting

**Prevention:**

- Verify deployment URL uses HTTPS
- Add note in CONTRIBUTING.md about HTTPS requirement
- Test on actual deployment, not just localhost

**Phase to Address:** Phase 3 (PWA Implementation)

---

## State Management Migration Pitfalls

### Pitfall 4: Shared Zustand Store Instances

**Warning Signs:**

- Multiple calculator instances share state unexpectedly
- Changing one calculator affects another on same page
- URL state from one calculator overwrites another

**Root Causes:**

From [Zustand and React Context](https://tkdodo.eu/blog/zustand-and-react-context):

- Zustand maintains single instance per store
- Multiple components using same store = shared state
- This is intentional design, not a bug

**Prevention (for Converty):**

Each calculator gets its own unique store:

```typescript
// ✓ Good: Unique store per calculator
export const useMortgageStore = create(...)
export const useLoanStore = create(...)

// ✗ Bad: Generic store reused
export const useCalculatorStore = create(...) // Don't do this
```

Since calculators are independent pages (not components on same page), this is NOT an issue for us. But worth documenting for future multi-calculator pages.

**Phase to Address:** Phase 1 (State Migration Planning)

**References:**

- [React State Management 2025](https://www.zignuts.com/blog/react-state-management-2025)
- [Zustand and React Context](https://tkdodo.eu/blog/zustand-and-react-context)

### Pitfall 5: Excessive Re-renders from State Updates

**Warning Signs:**

- Calculator feels sluggish during typing
- Performance degradation on slower devices
- Browser DevTools show many re-renders

**Root Causes:**

From [React State Management in 2025](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m):

- Any change in object triggers re-render
- Nested property updates cause full component re-render
- Similar to React Context behavior

**Prevention:**

Use Zustand's selector pattern:

```typescript
// ✗ Bad: Re-renders on any state change
const { input, result, setInput } = useMortgageStore();

// ✓ Good: Only re-renders when input changes
const input = useMortgageStore((state) => state.input);
const setInput = useMortgageStore((state) => state.setInput);
```

Also use Immer middleware for nested updates:

```typescript
import { immer } from "zustand/middleware/immer";

export const useStore = create(
  immer((set) => ({
    settings: { locale: "en", currency: "CHF" },
    updateLocale: (locale) =>
      set((state) => {
        state.settings.locale = locale; // Direct mutation with Immer
      }),
  }))
);
```

**Phase to Address:** Phase 2 (Middleware Creation)

### Pitfall 6: URL Sync Race Conditions

**Warning Signs:**

- URL parameters don't match calculator state
- Shared link loads with wrong values
- Debounce timer conflicts between calculators

**Root Causes:**

- Global debounce timer (current bug in useConverter)
- Multiple URL updates happening simultaneously
- No per-store instance isolation

**Prevention:**

Per-store debounce timer in middleware:

```typescript
// src/lib/middleware/url-sync.ts
export const urlSync = <T>(config) => (set, get, api) => {
  let debounceTimer: NodeJS.Timeout | null = null; // ✓ Closure per store

  api.subscribe((state) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateURLParams(state);
    }, 500); // Increased from 150ms
  });

  return config(set, get, api);
};
```

**Critical:** Do NOT use a global variable for debounce timer.

**Phase to Address:** Phase 2 (Middleware Creation)

---

## TypeScript Strict Mode Pitfalls

### Pitfall 7: Big Bang Strict Mode Enablement

**Warning Signs:**

- Hundreds/thousands of type errors appear
- Team overwhelmed, abandons effort
- Development grinds to halt

**Root Causes:**

From [Incremental Migration](https://kevinwil.de/incremental-migration/):

- Teams attempt whole-project strict mode at once
- Get overwhelmed by compiler errors
- Abandon migration effort

**Prevention:**

Incremental enablement strategy:

1. Enable `noImplicitAny` only (catches 80% of issues)
2. Fix errors file-by-file
3. Enable other strict flags incrementally
4. Track progress with compliant file list

Use `typescript-strict-plugin` to exempt existing code, enforce for new code.

**Phase to Address:** Phase 1 (TypeScript Planning)

**References:**

- [Incremental Migration](https://kevinwil.de/incremental-migration/)
- [TypeScript Strict Option Guide](https://betterstack.com/community/guides/scaling-nodejs/typescript-strict-option/)

### Pitfall 8: Unsafe Type Coercion from URL Parameters

**Warning Signs:**

- Runtime errors from malformed URLs
- Calculator crashes on shared links
- Type errors in URL parsing code

**Root Causes:**

- URL params are always strings
- Unsafe coercion: `Number(urlParam)` returns `NaN` on invalid input
- No validation before parsing

**Prevention:**

Type-safe URL parsing with validation:

```typescript
// ✗ Bad: Unsafe coercion
const amount = Number(searchParams.get("amount")); // Can be NaN

// ✓ Good: Validated parsing
function parseNumberParam(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const amount = parseNumberParam(searchParams.get("amount"), 0);
```

Optional: Use Zod for runtime validation (add in later phase):

```typescript
import { z } from "zod";

const urlSchema = z.object({
  amount: z.coerce.number().min(0),
  rate: z.coerce.number().min(0).max(100),
});

const params = urlSchema.safeParse(Object.fromEntries(searchParams));
```

**Phase to Address:** Phase 2 (URL Sync Middleware)

---

## Dependency Upgrade Pitfalls

### Pitfall 9: jsPDF API Breaking Changes

**Warning Signs:**

- PDF export fails after upgrade
- Font rendering changes
- File size dramatically increases/decreases

**Root Causes:**

From [jsPDF v4.0.0 Release](https://github.com/parallax/jsPDF/releases):

- Version numbering is confusing (v4.0.0 → v2.5.2 is upgrade, not downgrade)
- API mode switch: "compat" mode for backward compatibility
- File system access restrictions in Node.js
- `doc.setFontType()` → `doc.setFont()` API change

**Historical Breaking Change:**

- v1.5.3 → v2.3.1: `setFontType()` renamed to `setFont()`

**Prevention:**

1. **Test PDF export thoroughly** after upgrade
2. **Use compat API mode** if needed:

   ```typescript
   import { jsPDF } from "jspdf";
   const doc = new jsPDF();
   doc.compatAPI(); // Backward compatibility mode
   ```

3. **Update API calls** to new methods
4. **Check file size** - report if drastically different

**Phase to Address:** Phase 4 (jsPDF Upgrade)

**References:**

- [jsPDF Releases](https://github.com/parallax/jsPDF/releases)
- [jsPDF Upgrade Issues](https://github.com/parallax/jsPDF/issues/3277)

### Pitfall 10: npm Audit False Positives

**Warning Signs:**

- Security warnings that don't apply
- Vulnerabilities in dev dependencies
- Warnings for optional features not used

**Root Causes:**

- npm audit shows all vulnerabilities, even irrelevant ones
- Dev dependencies included in audit
- Optional dependencies flagged

**Prevention:**

Use `npm audit --production` to check only production dependencies:

```bash
npm audit --production  # Excludes devDependencies
```

For known false positives, document in ADR:

```markdown
## Known Security Warnings

**jsPDF dompurify v3.2.4**

- Only affects Node.js html() function with file system access
- Not used in browser-based calculators
- Acceptable risk for static export
```

**Phase to Address:** Phase 4 (Dependency Upgrade)

---

## Documentation Pitfalls

### Pitfall 11: Stale Documentation

**Warning Signs:**

- CONTRIBUTING.md references deleted files
- Setup instructions don't work
- Examples use old patterns

**Root Causes:**

- Documentation written once, never updated
- Code changes faster than docs
- No ownership of documentation maintenance

**Prevention:**

1. **Update docs alongside code changes** (same PR)
2. **Add docs review to PR checklist**
3. **Test setup guide** on fresh machine/container
4. **Link to code examples** in docs (detect broken links)

**Example:**

```markdown
## Adding a Calculator

See example implementation:

- Store: [`src/stores/finance/mortgage-store.ts`](src/stores/finance/mortgage-store.ts)
- Component: [`src/app/[locale]/finance/mortgage/mortgage-calculator.tsx`](...)
```

**Phase to Address:** All phases (ongoing)

### Pitfall 12: Missing "Why" in ADRs

**Warning Signs:**

- ADRs just state decisions, not rationale
- Future developers don't understand context
- Decisions get re-litigated

**Root Causes:**

- ADRs written as announcement, not reasoning
- Missing "Alternatives Considered" section
- No consequences documented

**Prevention:**

Use MADR template with required sections:

```markdown
# ADR-001: Big Bang State Migration

## Context

74 calculators with useConverter, global debounce bug, URL sync duplication.

## Decision

Migrate all 74 at once by category, remove useConverter entirely.

## Alternatives Considered

1. **Incremental migration** - Keep useConverter for some calculators
   - Rejected: Dual patterns ARE the problem, not the solution

## Consequences

**Positive:** Single pattern, fixes bug, no maintenance burden
**Negative:** Higher risk (mitigated by category testing)
```

**Phase to Address:** Phase 5 (Documentation)

---

## Quality Pitfalls

### Pitfall 13: Linting Rule Disable Comments

**Warning Signs:**

- `// eslint-disable-next-line` in code
- `// @ts-ignore` comments
- `// biome-ignore` growing

**Root Causes:**

- Quick fix instead of proper solution
- Type errors too hard to fix
- Legitimate edge cases

**Prevention:**

1. **Fix the root issue** instead of disabling
2. **If disable needed**, add explanation:

   ```typescript
   // biome-ignore lint/suspicious/noExplicitAny: Legacy useConverter type
   function convert(input: any) { ... }
   ```

3. **Track disables** and address in strict mode phase
4. **Goal: Zero disable comments** after migration

Current state (from CONCERNS.md):

- `useConverter.ts` has disable comments
- Must be fixed during strict mode enablement

**Phase to Address:** Phase 1 (TypeScript Strict Mode)

### Pitfall 14: Functional Programming Violations

**Warning Signs:**

- Shared mutable state between calculators
- Side effects in calculation functions
- Global variables modified

**Root Causes:**

- Current bug: Global `debounceTimeout` variable
- Imperative style instead of functional
- Not following KISS, DRY principles

**Prevention:**

**KISS (Keep It Simple, Stupid):**

- Each calculator has own state (not shared)
- Pure calculation functions (no side effects)
- Simple, readable code (no clever tricks)

**DRY (Don't Repeat Yourself):**

- Consolidated URL sync middleware (not duplicated)
- Shared calculation functions in `src/lib/converters/`
- Reusable UI components in `src/components/`

**Functional Programming:**

- Pure functions for calculations
- Immutable state updates (Immer middleware)
- No shared mutable state

**Example of current violation:**

```typescript
// ✗ Bad: Shared mutable state (current bug)
let debounceTimeout: NodeJS.Timeout | null = null; // Global!

// ✓ Good: Per-store instance (closure)
export const urlSync = (config) => (set, get, api) => {
  let debounceTimer: NodeJS.Timeout | null = null; // Closure per store
};
```

**Phase to Address:** Phase 2 (Middleware Creation)

---

## Summary Table

| Pitfall                   | Warning Signs                   | Phase to Address | Prevention Strategy               |
| ------------------------- | ------------------------------- | ---------------- | --------------------------------- |
| SW not in production      | Works in dev, fails in prod     | Phase 3          | Force-static export, no redirects |
| Aggressive caching        | Updates not appearing           | Phase 3          | Version cache names, skipWaiting  |
| Missing HTTPS             | Won't register on deploy        | Phase 3          | Verify GitHub Pages HTTPS         |
| Shared store instances    | State leaks between calculators | Phase 1          | Unique store per calculator       |
| Excessive re-renders      | Sluggish typing                 | Phase 2          | Zustand selectors, Immer          |
| URL sync race conditions  | Wrong params on shared links    | Phase 2          | Per-store debounce timer          |
| Big bang strict mode      | Hundreds of errors              | Phase 1          | Incremental: noImplicitAny first  |
| Unsafe URL coercion       | Runtime errors from URLs        | Phase 2          | Validated parsing with fallbacks  |
| jsPDF API changes         | PDF export fails                | Phase 4          | Test thoroughly, compat mode      |
| npm audit false positives | Irrelevant warnings             | Phase 4          | Use --production flag             |
| Stale documentation       | Setup doesn't work              | All phases       | Update docs with code             |
| Missing ADR rationale     | Re-litigating decisions         | Phase 5          | Use MADR template                 |
| Linting disables          | Growing @ts-ignore              | Phase 1          | Fix root issue, not symptom       |
| Functional violations     | Shared mutable state            | Phase 2          | Pure functions, closures          |

---

## Critical Insights

**Top 3 Highest-Risk Pitfalls:**

1. **Big Bang Strict Mode** (Pitfall 7) - Can derail entire project if done wrong

   - Mitigation: Incremental approach (noImplicitAny first)

2. **URL Sync Race Conditions** (Pitfall 6) - Current bug, must fix correctly

   - Mitigation: Per-store closure, NOT global variable

3. **jsPDF API Breaking Changes** (Pitfall 9) - Unknown unknowns in upgrade
   - Mitigation: Thorough testing, compat mode fallback

**References:**

- [Next.js PWA production issues](https://github.com/shadowwalker/next-pwa/issues/295)
- [Creating PWA with Next.js](https://www.getfishtank.com/insights/creating-a-progressive-web-app-using-nextjs)
- [Zustand and React Context](https://tkdodo.eu/blog/zustand-and-react-context)
- [React State Management 2025](https://www.zignuts.com/blog/react-state-management-2025)
- [Incremental TypeScript Migration](https://kevinwil.de/incremental-migration/)
- [jsPDF Releases](https://github.com/parallax/jsPDF/releases)
