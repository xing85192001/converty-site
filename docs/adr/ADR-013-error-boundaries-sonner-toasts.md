# ADR-013: Error Boundaries and Toast Notifications

**Status:** Accepted
**Date:** 2026-02-26
**Proposed by:** v7.0 Framework Migration

---

## Context

Before Phase 42, runtime exceptions in any calculator component caused the entire page to render
a blank white screen with zero user feedback. Specific problems:

- The `ConverterLayout` component had no error boundary — any unhandled exception in a
  calculator unmounted the entire page tree silently with no recovery path
- Copy-to-clipboard and CSV/PDF export operations produced no success or failure feedback;
  users had no way to know if an export completed or failed
- Calculation errors caused by invalid inputs returned `null` silently — the UI simply
  cleared with no explanation
- There was no mechanism to surface non-fatal errors (invalid URL params, out-of-range inputs)
  to the user without crashing the page

The project's pure function architecture (ADR-007) means all 169 calculators delegate math
to converter functions that can return `null` for invalid states. Distinguishing "still typing"
from "genuinely invalid input" was invisible to users.

## Decision

### Error Boundary: react-error-boundary

Adopted `react-error-boundary` wrapping `ConverterLayout` for graceful crash recovery.

- `CalculatorErrorBoundary` (in `src/components/error-boundary/`) wraps `ConverterLayout`
  via import — `ConverterLayout` remains a **server component**; Next.js App Router allows
  server components to import client components safely
- `CalculatorErrorFallback` provides a "Reload Calculator" button so users can recover
  without a full page navigation
- Both files require `'use client'` because `ErrorBoundary` uses React state internally

### HTML Sanitization: isomorphic-dompurify (not plain dompurify)

`src/lib/sanitize.ts` uses `isomorphic-dompurify` rather than plain `dompurify`.

Plain `dompurify` references `window` at module load time. During Next.js static generation
(`next build`), there is no browser context, causing `window is not defined` errors.
`isomorphic-dompurify` checks for the `window` object and falls back safely in Node.js.

### Toast Notifications: sonner

Adopted `sonner` for all toast notifications:

- `<Toaster>` mounted inside `ThemeProvider` after the flex container `div` in the root
  layout — does not require `'use client'` on `layout.tsx`
- Toast i18n keys stored under `common.toast` namespace (7 keys: copy success/fail,
  CSV export success/fail, PDF export success/fail, calculation error)
- `tToast = useTranslations('common.toast')` used alongside the calculator's own `t` in
  components that need both (export buttons, copy hooks)

### onCalculationError: opt-in callback

`onCalculationError` in `createCalculatorStore` is **opt-in** and not the default.

All 169 calculators use `null` as a normal return value for incomplete or invalid input
states — it is not an error condition. If `toast.error` fired on every `null` result, users
would see a storm of error toasts simply by clearing an input field.

Callback signature: `(values: T) => string` — fully typed, no `any`, caller decides the
message text. Toast is triggered only inside `setValue`/`setValues` (user-triggered changes),
never from `reset` or initial state.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| React's built-in `componentDidCatch` | No fallback UI, no recovery path for users |
| react-toastify | More complex API surface; heavier bundle than `sonner`; `sonner` has simpler call signatures |
| Plain `dompurify` | Throws `window is not defined` during `next build` static generation |
| Global `onCalculationError` default | Would cause toast spam on 169 calculators that use `null` as normal incomplete-input return |

## Consequences

**Positive:**

- Calculator crashes now show a graceful fallback with a "Reload Calculator" button instead
  of a blank white screen
- Users receive clear feedback on copy and export operations (success and failure)
- `sanitize.ts` provides a safe HTML sanitization utility for any content rendered from
  user input or external data sources
- Error boundary is server-component-compatible — `ConverterLayout` remains a server
  component with no `'use client'` directive required on layout files
- Hook-level toast in `useCopyToClipboard` covers all hook consumers automatically — no
  per-component toast wiring needed for copy operations

**Negative / Trade-offs:**

- `onCalculationError` requires explicit opt-in per calculator that needs it — extra
  boilerplate for complex calculators with meaningful error states
- Two additional packages (`react-error-boundary`, `sonner`) added to the client bundle

## Implementation Details

- `src/components/error-boundary/calculator-error-boundary.tsx` — `'use client'`; wraps
  children with `react-error-boundary`'s `ErrorBoundary`
- `src/components/error-boundary/calculator-error-fallback.tsx` — `'use client'`; renders
  error fallback UI with "Reload Calculator" button
- `src/lib/sanitize.ts` — `isomorphic-dompurify` wrapper with TypeScript-safe export
- `src/hooks/use-copy-to-clipboard.ts` — hook-level toast covers all consumers
- `src/lib/stores/calculator-store.ts` — `onCalculationError?: (values: T) => string`
  added to store config type; called in `setValue`/`setValues` when result is `null`
- Toaster placed inside `ThemeProvider` after flex container `div` in root layout
  (`src/app/[locale]/layout.tsx`)

## Related ADRs

- [ADR-007](ADR-007-pure-functions-converters.md) — Pure functions pattern; all converters
  return `null` for invalid inputs, which is the root cause requiring opt-in error callbacks
- [ADR-009](ADR-009-no-backend-privacy-first.md) — No backend / privacy first; all
  error handling must be client-side only (no error reporting service)
