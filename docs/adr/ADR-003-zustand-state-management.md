# ADR-003: Zustand for Calculator State Management

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Each of the 193+ calculators needs local state management for:
- User input values (strings from form fields)
- Computed results (typed domain objects)
- Validation errors
- UI state (active tab, mode, etc.)

Candidates evaluated:
1. **React `useState` / `useReducer`** — simple, but no URL sync integration, no sharing between components
2. **React Context** — provider boilerplate, re-render cascade issues at scale
3. **Redux / Redux Toolkit** — powerful but heavy for simple form state; requires provider setup
4. **Zustand** — lightweight, no provider, TypeScript-native, middleware composable
5. **Jotai / Recoil** — atom-based, good for fine-grained but less natural for grouped calculator state

## Decision

Use **Zustand 5** as the sole state management library. Each calculator gets its own dedicated store module in `src/stores/`. A factory pattern (`createCalculatorStore`) standardizes the shape:

```typescript
const useStore = create<State>()(
  createUrlSyncMiddleware<State>({ ... })((set, get) => ({
    // inputs (strings — raw form values)
    field1: initialField1,
    // result (computed domain type or null)
    result: null,
    error: null,
    // actions
    setField1: (value) => { set({ field1: value }); setTimeout(() => get().calculate(), 0); },
    calculate: () => { /* pure calculation call */ },
    reset: () => { /* restore defaults */ },
  }))
);
```

**Critical rule:** Stores are created at **module scope**, not inside React components. This ensures a single store instance per calculator and enables URL sync on page load before React mounts.

## Consequences

**Positive:**
- No Provider boilerplate — stores are imported directly where needed
- Tiny bundle footprint (~3KB gzipped)
- Composable middleware (URL sync, devtools)
- TypeScript generics enable fully typed stores without `any`
- Auto-calculation pattern: setters trigger `calculate()` via `setTimeout(..., 0)` (deferred to next tick)
- Easy to test: stores are plain objects with actions

**Negative / Constraints:**
- Each calculator requires a separate store file (`src/stores/{name}-store.ts`)
- Module-scope store creation means the store is shared across all instances of a component (fine for calculators — never rendered twice)
- Zustand's lack of time-travel debugging makes debugging complex state flows harder (mitigated by URL sharing)

**Migration path:** Some early calculators used the `useConverter` hook pattern; new calculators use Zustand stores directly. Both patterns coexist.
