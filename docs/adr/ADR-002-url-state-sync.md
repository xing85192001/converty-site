# ADR-002: URL State Synchronization for Shareable Calculations

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Calculator tools are most useful when results can be shared with colleagues, students, or clients. Traditional approaches include:

1. **User accounts + database storage** — requires backend, login, GDPR compliance
2. **Local storage** — device-local, not shareable
3. **Copy-paste results** — manual, error-prone, loses context
4. **URL query parameters** — stateless, shareable, zero backend

Because of the static export constraint (ADR-001), options 1 and 3 are not viable. Option 4 aligns perfectly with the architecture.

## Decision

Synchronize all calculator input values to URL query parameters using a custom Zustand middleware. Every calculator uses the `createUrlSyncMiddleware` factory:

```typescript
createUrlSyncMiddleware<State>({
  enabled: true,
  debounceMs: 300,
  selectState: (state) => ({
    field1: state.field1,
    field2: state.field2,
  }),
})
```

**Rules:**
- Only `values` (user inputs) are synced — never `result` or `errors`
- URL updates use `history.replaceState()` (not `pushState()`) to avoid polluting browser history
- Debounced 300ms to avoid excessive URL writes during typing
- Initial load reads URL params to restore state (`getUrlParams()`)

## Consequences

**Positive:**
- Any calculation can be shared as a simple URL
- Bookmarks restore the exact calculation state
- No cookies, no tracking, no login required
- Zero infrastructure cost for state persistence
- Deep-linkable from other tools, documentation, chat

**Negative / Constraints:**
- URL length limit (~2000 chars) limits the complexity of shareable state
- Sensitive input values become visible in browser history and server logs if the URL is ever sent to a server (analytics, error trackers)
- `history.replaceState()` means the back button does not restore previous calculator inputs
- Every calculator must implement the sync pattern — cannot be forgotten (mitigated by `createUrlSyncMiddleware` factory)

**Privacy note:** URL state sharing is always an explicit user action (copying the URL). The application does not send URLs anywhere automatically.
