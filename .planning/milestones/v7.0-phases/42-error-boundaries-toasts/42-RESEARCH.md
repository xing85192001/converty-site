# Phase 42: Error Boundaries & Toasts - Research

**Researched:** 2026-02-26
**Domain:** React error boundaries, toast notifications, HTML sanitization
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R2.1 | `react-error-boundary` installed and wrapping the calculator page layout | ErrorBoundary wraps the dynamic-imported calculator component inside `<Suspense>` at the page level; see Architecture Patterns |
| R2.2 | Error fallback component showing error message + "Reload Calculator" button | `FallbackComponent` prop with `error.message` and `resetErrorBoundary()` callback; fully typed with `FallbackProps` |
| R2.3 | `sonner` installed with `<Toaster>` mounted in root layout | `<Toaster>` can be server component; placed in `src/app/[locale]/layout.tsx` after `<Footer>` |
| R2.4 | Toast notifications for: copy-to-clipboard success/fail, CSV/PDF export success/fail | Modify `use-copy-to-clipboard.ts`, `csv-export-button.tsx`, `pdf-export-button.tsx` with `toast.success()` / `toast.error()` |
| R2.5 | Calculator calculation errors (when `result === null`) show user-facing toast | `result === null` pattern exists in 21+ calculators; add toast call inside `calculateStore` or per-calculator component |
| R2.6 | DOMPurify installed and applied to any HTML rendered from user input or external data | No `dangerouslySetInnerHTML` currently; DOMPurify wraps future HTML output; use `isomorphic-dompurify` to avoid SSR errors |
</phase_requirements>

---

## Summary

Phase 42 adds three defensive layers to the 169-calculator app: crash recovery via `react-error-boundary`, user feedback via Sonner toasts, and HTML sanitization via DOMPurify. Currently calculator crashes show a blank white screen, copy/export actions have no feedback, and there is no HTML sanitization.

The project uses Next.js 16 with static export (`output: "export"`). The root layout at `src/app/[locale]/layout.tsx` is a server component and is the correct mounting point for `<Toaster>`. Calculator pages are server components that dynamically import client calculator components. Error boundaries must be client components (`"use client"`) and belong at the page level wrapping the dynamic import.

There is currently no `dangerouslySetInnerHTML` in the codebase. DOMPurify (R2.6) is a defensive install for future safety, but no immediate application sites exist. Use `isomorphic-dompurify` to avoid the `window is not defined` error during static generation.

**Primary recommendation:** Install `react-error-boundary@6`, `sonner@2`, and `isomorphic-dompurify`. Mount `<Toaster>` in the locale layout. Create a `CalculatorErrorBoundary` wrapper client component. Update `use-copy-to-clipboard.ts`, `csv-export-button.tsx`, and `pdf-export-button.tsx` to call `toast.success()` / `toast.error()`. Toast calculation null-result errors from the components that check `result === null`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-error-boundary | 6.1.1 | Wraps React component trees to catch render errors, provide fallback UI and recovery | bvaughn's reference library; 239k dependents; actively maintained; React 19 compatible |
| sonner | 2.0.7 | Opinionated toast notification system; single `<Toaster>` in layout, `toast()` calls anywhere | 502k dependents; shadcn/ui standard; works as server component in layout; zero-config |
| isomorphic-dompurify | ^2.x | HTML sanitization that works in Node.js (SSR/static export) and browser | Solves `window is not defined` in Next.js static export; wraps DOMPurify + jsdom |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dompurify | (peer of isomorphic-dompurify) | Core HTML sanitizer | Transitively installed; do not import directly in Next.js |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| isomorphic-dompurify | next/dynamic + dompurify directly | Dynamic import is more complex; isomorphic-dompurify is simpler and handles Node.js automatically |
| react-error-boundary | Next.js `error.js` file convention | `error.js` is App Router native but cannot wrap individual calculator components within a page; react-error-boundary gives per-component control |
| sonner | react-hot-toast, react-toastify | Sonner is shadcn/ui standard; lighter weight; works in server component layouts |

**Installation:**
```bash
npm install react-error-boundary sonner isomorphic-dompurify
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/[locale]/layout.tsx          # Add <Toaster> here (server component, OK)
├── components/
│   └── error-boundary/
│       ├── calculator-error-boundary.tsx   # "use client" wrapper component
│       └── calculator-error-fallback.tsx   # Fallback UI component
├── hooks/
│   └── use-copy-to-clipboard.ts     # Add toast.success/error calls here
├── components/converter/
│   ├── csv-export-button.tsx        # Add toast.success/error calls here
│   └── pdf-export-button.tsx        # Add toast.success/error calls here
└── lib/utils/
    └── sanitize.ts                  # DOMPurify wrapper utility
```

### Pattern 1: Calculator Error Boundary

**What:** A `"use client"` wrapper component that accepts children and provides an error fallback with a reset button.
**When to use:** Wrap the dynamic import of every calculator component in `page.tsx`.

```typescript
// src/components/error-boundary/calculator-error-fallback.tsx
"use client";

import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CalculatorErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6 space-y-4">
        <p className="text-destructive font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Reload Calculator
        </Button>
      </CardContent>
    </Card>
  );
}
```

```typescript
// src/components/error-boundary/calculator-error-boundary.tsx
"use client";

import { ErrorBoundary } from "react-error-boundary";
import { CalculatorErrorFallback } from "./calculator-error-fallback";

interface CalculatorErrorBoundaryProps {
  children: React.ReactNode;
}

export function CalculatorErrorBoundary({ children }: CalculatorErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={CalculatorErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

**Usage in page.tsx:**
```typescript
// Replace existing <Suspense> pattern:
<Suspense fallback={<CalculatorSkeleton />}>
  <CalculatorErrorBoundary>
    <MortgageCalculator />
  </CalculatorErrorBoundary>
</Suspense>
```

### Pattern 2: Toaster in Layout

**What:** `<Toaster>` from sonner mounted once in the locale layout. It can live in a server component.
**When to use:** One placement, works for all calculator pages.

```typescript
// src/app/[locale]/layout.tsx  — add Toaster import and element
import { Toaster } from "sonner";

// Inside the returned JSX:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <SWRegistration />
  <div className="relative flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
  <Toaster richColors position="bottom-right" />
</ThemeProvider>
```

### Pattern 3: Toast in Copy-to-Clipboard

**What:** Replace the silent `console.error` on clipboard failure with `toast.error()`, and add `toast.success()` on copy.
**When to use:** `use-copy-to-clipboard.ts` is the shared hook; updating it fixes all 4 usage sites (+ `output-display.tsx` has its own inline handler).

```typescript
// src/hooks/use-copy-to-clipboard.ts
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        toast.success("Copied to clipboard");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy to clipboard");
      }
    },
    [timeout]
  );

  return { copied, copy };
}
```

**Note:** `output-display.tsx` and `html-encoder-tool.tsx` have inline clipboard calls — update them too.

### Pattern 4: Toast in CSV/PDF Export

**What:** Wrap the export call in try/catch and fire toast.
**When to use:** `csv-export-button.tsx` and `pdf-export-button.tsx`.

```typescript
// csv-export-button.tsx handleExport — updated pattern
const handleExport = () => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
    const fullFilename = `${filename}_${timestamp}.csv`;
    exportToCsv(data, { filename: fullFilename });
    toast.success(t("csvSuccess"));
  } catch (error) {
    console.error("CSV export failed:", error);
    toast.error(t("csvError"));
  }
};
```

### Pattern 5: DOMPurify Utility

**What:** A thin wrapper around `isomorphic-dompurify` that can be called safely from both server and client.
**When to use:** Any time user-supplied or external HTML is rendered with `dangerouslySetInnerHTML`.

```typescript
// src/lib/utils/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "rel", "target"],
  });
}
```

### Anti-Patterns to Avoid

- **Placing `<Toaster>` in a `"use client"` component only:** It works, but the server component placement in layout.tsx is preferred for zero client JS overhead.
- **Importing plain `dompurify` directly in a Next.js page:** Causes `window is not defined` during static generation. Always use `isomorphic-dompurify`.
- **Wrapping the entire locale layout with ErrorBoundary:** Too coarse — a crash in one calculator would hide the header/footer. Wrap at the per-calculator level.
- **Using `error.js` file convention instead of react-error-boundary:** `error.js` resets the entire route segment, not just the calculator component. react-error-boundary gives granular control.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error catching + fallback UI | Custom class component with `componentDidCatch` | `react-error-boundary` | Edge cases: error recovery, resetKeys, onError logging; already solved |
| Toast notification stack | Custom state + portal | `sonner` | z-index management, a11y, animation, deduplication are all solved |
| HTML sanitization | Custom regex/replace | `isomorphic-dompurify` | XSS bypass vectors in regex; DOMPurify uses the browser's own parser |

**Key insight:** All three problems have known XSS/UX pitfalls that hand-rolled solutions routinely miss.

---

## Common Pitfalls

### Pitfall 1: `window is not defined` with DOMPurify

**What goes wrong:** Importing `dompurify` directly in a file that Next.js pre-renders at build time crashes with `ReferenceError: window is not defined`.
**Why it happens:** Static export runs page code in Node.js; DOMPurify needs a DOM.
**How to avoid:** Use `isomorphic-dompurify` — it substitutes jsdom in Node.js environments automatically.
**Warning signs:** Build fails with `window is not defined`; happens at `npm run build` not at runtime.

### Pitfall 2: Error Boundary Must Be a Client Component

**What goes wrong:** Adding `ErrorBoundary` in a server component file (no `"use client"`) causes a build error.
**Why it happens:** `ErrorBoundary` uses React state and `componentDidCatch` — server component incompatible.
**How to avoid:** Create a dedicated `CalculatorErrorBoundary` wrapper with `"use client"` directive. The `page.tsx` (server component) imports this wrapper and passes the dynamic-imported calculator as children.
**Warning signs:** TypeScript error "cannot be used in a server component."

### Pitfall 3: Sonner `toast()` in Server Components

**What goes wrong:** Calling `toast()` from a server component silently fails — it only works on the client.
**Why it happens:** `toast()` modifies client-side state; no-op in server context.
**How to avoid:** Always call `toast()` from `"use client"` files only. The `<Toaster>` element itself is fine in server layout.
**Warning signs:** No toast appears; no error thrown.

### Pitfall 4: `result === null` Toast Spam

**What goes wrong:** Toasting every time `result` is null fires on initial load (before any input), producing spurious toasts.
**Why it happens:** `result` starts as `null` before calculation; emitting a toast on null triggers immediately on mount.
**How to avoid:** Only toast when the user has already interacted (check if `values` differ from `initialValues`, or use a `hasInteracted` ref). The simplest approach: toast inside `setValue` only when calculate() returns null after a user action, not on mount.
**Warning signs:** Toast fires on page load before any user input.

### Pitfall 5: Biome Strict Linting on `catch (error)`

**What goes wrong:** `catch (error)` where `error` is typed as `unknown` — accessing `error.message` without narrowing will fail Biome.
**Why it happens:** Biome strict mode enforces that `error` is `unknown` in catch blocks.
**How to avoid:** Use `error instanceof Error ? error.message : String(error)` pattern. Or: `const msg = error instanceof Error ? error.message : "Unknown error";`
**Warning signs:** Biome lint error: "Catching binding 'error' must be typed."

---

## Code Examples

Verified patterns from official sources:

### react-error-boundary: FallbackComponent Pattern

```typescript
// Source: https://github.com/bvaughn/react-error-boundary (v6.1.1)
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={Fallback} onError={(error, info) => console.error(error, info)}>
  <CalculatorComponent />
</ErrorBoundary>
```

### Sonner: Root Layout Setup + Toast Calls

```typescript
// Source: https://sonner.emilkowal.ski/getting-started + shadcn/ui docs
import { Toaster } from "sonner";

// In layout.tsx (server component — OK):
<body>
  {children}
  <Toaster richColors position="bottom-right" />
</body>

// In any "use client" component:
import { toast } from "sonner";

toast.success("Copied to clipboard");
toast.error("Export failed");
toast.promise(asyncOperation(), {
  loading: "Exporting...",
  success: "Export complete",
  error: "Export failed",
});
```

### isomorphic-dompurify: Safe HTML Sanitization

```typescript
// Source: https://www.npmjs.com/package/isomorphic-dompurify
import DOMPurify from "isomorphic-dompurify";

const clean = DOMPurify.sanitize(dirtyHtml);

// In JSX:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

---

## Existing Code Inventory

This inventory answers the key questions about where changes are needed.

### Copy-to-Clipboard Sites (R2.4)

| File | Pattern | Action Needed |
|------|---------|--------------|
| `src/hooks/use-copy-to-clipboard.ts` | Hook with `navigator.clipboard.writeText` | Add `toast.success` / `toast.error` |
| `src/components/converter/output-display.tsx` | Inline `handleCopy` with `navigator.clipboard.writeText` | Add `toast.success` / `toast.error` |
| `src/app/[locale]/web/html-encoder/html-encoder-tool.tsx` | Inline `navigator.clipboard.writeText` | Add `toast.success` / `toast.error` |
| `src/app/[locale]/crypto/hash/hash-calculator.tsx` | `handleCopy` with `navigator.clipboard.writeText` | Add `toast.success` / `toast.error` |
| `src/app/[locale]/network/bb-credit-calculator/bb-credit-calculator.tsx` | Uses `useCopyToClipboard` hook | Covered when hook is updated |
| `src/app/[locale]/web/html-chars/html-char-map.tsx` | Direct clipboard call | Add `toast.success` / `toast.error` |
| `src/app/[locale]/web/emoji-chars/emoji-map.tsx` | Direct clipboard call | Add `toast.success` / `toast.error` |

### CSV/PDF Export Sites (R2.4)

10 calculator components use `CsvExportButton` or `PdfExportButton`:
- `server-virtualization-calculator.tsx`, `hyperv-consolidation-calculator.tsx`, `hypervisor-comparison-calculator.tsx`, `windows-licensing-calculator.tsx`, `virtualization-cost-calculator.tsx`, `vm-storage-calculator.tsx`, `vmware-licensing-calculator.tsx`, `k8s-capacity-calculator.tsx`, `age-calculator.tsx`
- Action: Update `csv-export-button.tsx` and `pdf-export-button.tsx` shared components — all 10 get toasts automatically.

### Null Result Sites (R2.5)

21 calculator components have `result === null` checks (finance category). The pattern is `result ? <ShowResult> : null`. The toast should fire when the user has changed inputs but the result came back null. Best approach: fire the toast in the Zustand store's `setValue`/`setValues` when `calculate()` returns null and the user has interacted (i.e., the action was triggered by a user change, not initial mount).

**Recommended approach for null result toasts:** Add an optional `onCalculationError?: (values: T) => string` callback to `createCalculatorStore`. When calculate returns null and this callback is provided, call `toast.error(onCalculationError(values))` inside `setValue`. This is opt-in per calculator to avoid toast spam on calculators where null is a valid "not enough input" state.

### HTML Rendering Sites (R2.6)

No `dangerouslySetInnerHTML` currently exists in the codebase. DOMPurify is a preemptive install. Create `src/lib/utils/sanitize.ts` utility and document in CLAUDE.md for future use.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class component with `componentDidCatch` | `react-error-boundary` v6 with hooks | 2022+ | Functional component pattern; supports `useErrorBoundary` hook |
| `react-toastify` | `sonner` | 2023+ | Smaller bundle; shadcn/ui standard; server component compatible |
| Plain `dompurify` | `isomorphic-dompurify` | 2022+ | Node.js SSR/static export support |

**Deprecated/outdated:**
- React class components for error boundaries: Still work but `react-error-boundary` is the ecosystem standard
- `window.__react_error_boundary` reset tricks: `resetKeys` prop handles this cleanly in v4+

---

## Open Questions

1. **Should null-result toasts be opt-in or default?**
   - What we know: 21+ calculators return null for invalid inputs; toasting all of them on every keystroke would be too noisy
   - What's unclear: Which calculators have meaningful "calculation failed" states vs. "just not enough input yet" states
   - Recommendation: Add `onCalculationError` callback option to `createCalculatorStore` (opt-in). Start with no null-result toasts enabled; enable for calculators where null represents a true error (not an empty-input state).

2. **Translation keys for new toast messages**
   - What we know: The project uses `next-intl` with 4 locales; all user-facing text requires translation
   - What's unclear: How many new keys are needed; the `toast()` call can accept a plain string which bypasses i18n
   - Recommendation: Add toast messages to `common.toast` namespace in all 4 locale files. Keys: `copySuccess`, `copyError`, `csvExportSuccess`, `csvExportError`, `pdfExportSuccess`, `pdfExportError`, `calculationError`. Use `useTranslations("common.toast")` in the components or pass translated strings from props.

3. **Error boundary reset strategy**
   - What we know: `resetErrorBoundary()` remounts the component; `resetKeys` array triggers automatic reset
   - What's unclear: Whether URL params should be cleared on reset, or preserved
   - Recommendation: Simple `resetErrorBoundary()` button; preserve URL params. Zustand stores reinitialize from URL on remount.

---

## Sources

### Primary (HIGH confidence)
- GitHub: `bvaughn/react-error-boundary` (v6.1.1) — FallbackProps, ErrorBoundary API
- GitHub: `emilkowalski/sonner` (v2.0.7) — Toaster component, toast() API
- shadcn/ui Sonner docs — Next.js App Router integration pattern
- npm: `isomorphic-dompurify` — SSR-safe DOMPurify wrapper

### Secondary (MEDIUM confidence)
- WebSearch: "react-error-boundary v4 React 19 Next.js App Router" — React 19 compatibility confirmed, 6.1.1 latest
- WebSearch: "sonner v2 Next.js App Router" — `<Toaster>` in server component confirmed
- WebSearch: "dompurify SSR Next.js static export" — `isomorphic-dompurify` recommendation confirmed by multiple sources

### Tertiary (LOW confidence)
- None — all claims verified with official GitHub/npm sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — version numbers from GitHub/npm; React 19 compatibility confirmed
- Architecture: HIGH — verified against actual project structure; patterns from official docs
- Pitfalls: HIGH — DOMPurify/SSR pitfall verified from Next.js GitHub issues; Biome strict mode is project-documented
- Null-result toast strategy: MEDIUM — recommendation based on project patterns; needs planner decision on opt-in vs default

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stable libraries, slow-moving area)
