# Use Zustand for Calculator State Management

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty has 117+ calculators that need shareable URLs (so users can bookmark or share calculations) and predictable state management. The previous implementation used React's `useState` with manual URL synchronization logic duplicated across calculator components. This led to:

- 60+ lines of identical URL sync code in each calculator store
- Global debounce timer causing conflicts between multiple calculator instances
- Type safety issues with URL parameter parsing (unsafe coercion, NaN propagation)
- Maintenance burden: changes to URL sync pattern required updating many files

How should we manage calculator state to eliminate this duplication while maintaining URL synchronization and type safety?

## Decision Drivers

- **URL state synchronization required** - Calculators must support shareable links with input values encoded in URL parameters
- **Minimize boilerplate** - 117+ calculators shouldn't each implement URL sync logic
- **Type safety with TypeScript strict mode** - Must work with `noImplicitAny`, strict null checks
- **Small bundle size** - Each calculator shouldn't add significant JavaScript to the bundle
- **Support multiple calculator instances** - Users might open multiple calculator tabs simultaneously
- **Developer experience** - Pattern should be easy for contributors to follow

## Considered Options

1. **Zustand with custom middleware** - Lightweight state management with factory pattern and URL sync middleware
2. **Redux Toolkit with RTK Query** - Industry standard with mature ecosystem
3. **Jotai with URL persistence** - Atomic state management with persistence plugins
4. **Continue with useState pattern** - Refactor existing approach to centralize URL sync logic

## Decision Outcome

Chosen option: **"Zustand with custom middleware"** because it provides the smallest bundle size (1.2KB gzipped), allows custom middleware for URL synchronization, and integrates seamlessly with TypeScript. The factory pattern (`createCalculatorStore`) eliminates boilerplate while maintaining flexibility.

### Consequences

**Positive:**

- **Minimal bundle impact:** Zustand is 1.2KB gzipped (vs ~20KB for Redux Toolkit)
- **Zero boilerplate:** `createCalculatorStore` factory provides complete store with URL sync in 4 lines
- **Automatic URL synchronization:** Custom middleware handles debounced URL updates with per-instance timers
- **No Provider wrapper needed:** Zustand stores work without React context, simpler architecture
- **Type-safe with generics:** `createCalculatorStore<InputType, ResultType>` ensures type safety across values, actions, and results
- **Per-instance timer isolation:** Closure-based middleware pattern prevents conflicts between multiple calculator instances

**Negative:**

- **Learning curve:** Contributors unfamiliar with Zustand need to learn new patterns
- **Migration effort:** Required updating all 117 existing calculators from useState to Zustand stores
- **Smaller ecosystem:** Less tooling and middleware compared to Redux (but sufficient for our needs)
- **Less common in React community:** Redux/Context more widely known

**Neutral:**

- **Custom middleware required:** URL sync middleware needed to be built (completed in Phase 2)
- **Documentation needed:** CONTRIBUTING.md requires updates with Zustand patterns

## Pros and Cons of the Options

### Zustand with custom middleware

- **Good:** Tiny bundle size (1.2KB), perfect for static site with 100+ calculators
- **Good:** No provider wrapper required (simpler than Context/Redux)
- **Good:** Easy to test pure calculation functions separately from state
- **Good:** Middleware pattern allows reusable URL sync logic
- **Good:** Works seamlessly with TypeScript generics
- **Bad:** Less mature ecosystem compared to Redux
- **Bad:** Fewer contributors familiar with Zustand vs Redux
- **Bad:** Custom middleware development required (not available off-the-shelf)

### Redux Toolkit with RTK Query

- **Good:** Mature ecosystem with extensive documentation
- **Good:** Redux DevTools for debugging state changes
- **Good:** Well-known patterns, easier for new contributors
- **Good:** Built-in middleware for common patterns
- **Bad:** Larger bundle size (~20KB gzipped) impacts static site performance
- **Bad:** Requires Provider wrapper at app root
- **Bad:** More boilerplate even with Redux Toolkit (slices, actions, reducers)
- **Bad:** RTK Query designed for API calls, overkill for calculator logic
- **Neutral:** URL sync would still require custom middleware or manual implementation

### Jotai with URL persistence

- **Good:** Atomic state model, fine-grained updates
- **Good:** Small bundle size (similar to Zustand)
- **Good:** React Suspense integration
- **Bad:** Atoms must be defined at module level (not inside components)
- **Bad:** URL persistence plugins less mature than Zustand middleware
- **Bad:** Less common than Redux/Zustand, steeper learning curve
- **Neutral:** Would still need custom persistence logic for URL sync

### Continue with useState pattern

- **Good:** No new dependencies or learning curve
- **Good:** Most familiar pattern for React developers
- **Bad:** Doesn't solve duplication problem (60+ lines per store)
- **Bad:** Global timer conflicts remain unsolved
- **Bad:** Type safety issues with URL parsing persist
- **Bad:** Maintenance burden continues (changes require updating 117 files)

## Links

- **Phase 3 Summary:** `.planning/phases/03-state-migration/03-01-SUMMARY.md`
- **Phase 2 Summary (URL Sync Middleware):** `.planning/phases/02-url-sync-infrastructure/02-01-SUMMARY.md`
- **Implementation:** `src/stores/calculator-store.ts` (createCalculatorStore factory)
- **URL Sync Middleware:** `src/lib/middleware/url-sync.ts` (135 lines)
- **Example Usage:** `src/app/[locale]/datetime/age/age-calculator.tsx`
- **STATE.md Decisions:** Lines 51-52 (functional approach), Line 54 (Immer not needed)

## Implementation Notes

**Factory Pattern:**

```typescript
const useAgeStore = createCalculatorStore<AgeInput, AgeResult>({
  name: "age-calculator",
  initialValues: { birthDate: "" },
  calculate: calculateAge,
});
```

**URL Sync Middleware:**

- Closure-based pattern: Each `createUrlSyncMiddleware()` call creates new closure with isolated debounce timer
- `selectState` option: Syncs only input values (not result/errors/methods) to URL
- 150ms debounce prevents URL pollution during typing
- `replaceState` (not `pushState`) avoids flooding browser history

**Migration Results:**

- 117 calculators migrated successfully
- Zero legacy hook imports remaining (`use-converter.ts`, `use-url-state.ts` deleted)
- Production build verified: 651 static pages generated
- All calculator functionality tested across 4 locales (en, fr, de, it)
