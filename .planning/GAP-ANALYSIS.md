# Gap Analysis: Converty vs Raidy Architecture

**Date:** 2026-02-26
**Purpose:** Identify architectural differences between Converty (current) and Raidy (target building blocks) to plan the v7.0 Framework Migration milestone.

---

## Executive Summary

Raidy is a newer project with modern best practices baked in from day one. Converty grew organically from a legacy codebase and carries architectural debt in five key areas: **no tests**, **no validation layer**, **no error boundaries**, **verbose URL state**, and **a monolithic i18n structure**. Additionally, Raidy uses Vite instead of Next.js, which would be the most invasive change of all.

The migration is classified as **high-impact, high-value** — particularly the test framework, Zod validation, and LZ-String URL compression. The framework swap (Next.js → Vite) is the most disruptive and should come last, if at all.

---

## Dimension-by-Dimension Comparison

### 1. Build Framework

Next.js stays. The 4-locale SSG (676 static pages), GitHub Pages deployment, and next-intl App Router integration all require Next.js. Vite is not adopted.

---

### 2. Test Framework

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Test runner | None | Vitest 4.x | ❌ **Critical gap** |
| Unit tests | None | src/engines, src/utils, src/workers | ❌ Major |
| Component tests | None | @testing-library/react | ❌ Major |
| Property tests | None | fast-check | ⚠️ Optional |
| Coverage | 0% | 75% threshold (lines/functions/branches) | ❌ Major |
| CI integration | No test step | `vitest run --coverage` | ❌ Major |

**Risk:** Zero. Adding Vitest to Next.js is well-supported. This is the **safest and highest-value change** — 169 pure functions in `src/lib/converters/` are immediately testable with zero refactoring.

---

### 3. Input Validation

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Validation library | None (TypeScript types only) | Zod 3.x | ❌ Major |
| Runtime validation | TypeScript compile-time only | Zod schemas on every input | ❌ Major |
| URL param validation | Map-based parsing with custom helpers | Zod parse with `.safeParse()` | ⚠️ Notable |
| Error messages | Manual string construction | Zod's built-in error messages | ⚠️ Notable |

**Risk:** Low. Zod can be added incrementally. Start with URL state parsing (replaces custom `parseNumberParam` helpers). Does not require changing the component layer.

---

### 4. URL State Persistence

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Encoding | Plain URL search params (`?a=1&b=2`) | LZ-String compressed URL hash (`#raidy=<lz>`) | ⚠️ Notable |
| Compression | None | LZ-String (~2 KB typical, ~60-80% reduction) | ⚠️ Notable |
| Storage location | `?search=params` | `#hash=compressed` | ⚠️ Notable |
| Max URL length risk | High (many params = very long URL) | Low (compressed hash) | ⚠️ Notable |
| Shareability | All inputs in URL (verified working) | All inputs in URL (compressed) | ✅ Same goal |

**Risk:** Low-Medium. LZ-String is drop-in for the middleware layer. Moving to `#hash` vs `?params` needs careful handling in Next.js static export (GitHub Pages treats `#hash` differently). **Recommend: use LZ-String with search params, not hash, to preserve GitHub Pages compatibility.**

---

### 5. Error Handling

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Error boundaries | None | react-error-boundary | ❌ Major |
| Toast notifications | None | Sonner (toast library) | ⚠️ Notable |
| Calculation errors | `null` return, no user feedback | Discriminated union types + toast | ⚠️ Notable |
| Crash recovery | Page reload required | Error boundary + retry UI | ❌ Major |

**Risk:** Low. react-error-boundary and Sonner are additive. Wrapping the calculator layout in a boundary is a 1-day task.

---

### 6. Security — Input Sanitization

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| DOM sanitization | None | DOMPurify 3.x | ⚠️ Notable |
| XSS prevention | TypeScript discipline + no innerHTML | DOMPurify on all external data | ⚠️ Notable |
| URL param injection | Map-based parsing (secure) | Zod + DOMPurify | ⚠️ Notable |

**Risk:** Low. DOMPurify is additive. Currently, Converty has no `dangerouslySetInnerHTML` usage, so risk is already low. Still worth adding as a safety net.

---

### 7. Internationalization

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Library | next-intl 4.x | i18next + react-i18next | ❌ Major |
| Structure | Single JSON per locale (~4000+ keys) | Namespaced per feature/domain | ⚠️ Notable |
| Language detection | URL prefix (`/en/`, `/fr/`) | `i18next-browser-languagedetector` | ❌ Major |
| SSG integration | Built into Next.js routing | Browser-side only | ❌ Major |
| Locale switching | Full page navigate | Client-side switch | ⚠️ Notable |

**Risk:** Very High if switching from next-intl to i18next. next-intl is deeply integrated with the Next.js App Router and `[locale]` file structure. Switching requires either also switching frameworks OR maintaining a hybrid. **Recommend: keep next-intl, adopt namespace pattern within it.**

---

### 8. State Management

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Library | Zustand 5.x | Zustand 5.x | ✅ Same |
| Pattern | Per-calculator stores via `createCalculatorStore` | Single store with slices | ⚠️ Different |
| URL sync | `history.replaceState` with debounce | LZ-String compressed hash | ⚠️ Different |
| Granularity | 169 separate stores | 1 store (single app) | ⚠️ Different |

**Risk:** Low. Both use Zustand. The per-calculator pattern is actually better suited to Converty's multi-calculator architecture than Raidy's single-simulator pattern.

---

### 9. Type System Patterns

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Result types | `T | null` for errors | Discriminated unions `{ ok: true, value } | { ok: false, error }` | ⚠️ Notable |
| Input types | Simple interfaces | Zod-inferred types | ⚠️ Notable |
| Union safety | Basic TypeScript | Exhaustive switch + discriminated unions | ⚠️ Notable |

**Risk:** Low-Medium. Adopting discriminated union result types requires touching converter functions and their consumers (components + stores). Valuable but non-trivial.

---

### 10. Performance — Web Workers

| Aspect | Converty (Current) | Raidy (Target) | Delta |
|--------|-------------------|----------------|-------|
| Heavy computation | Main thread only | Web Worker (Monte Carlo) | ⚠️ Optional |
| Applicable to Converty | Only 1-2 calculators would benefit | N/A | ⚠️ Low priority |

**Risk:** Low but low value. Most Converty calculations are fast formulas. Only the subnet BigInt calculator might benefit. **Recommend: defer to a future optimization milestone.**

---

## Priority Matrix

| Change | Value | Effort | Risk | Recommended Phase |
|--------|-------|--------|------|-------------------|
| ✅ **Vitest + unit tests** | 🔴 Critical | Medium | Low | Phase 40 |
| ✅ **react-error-boundary** | High | Low | Low | Phase 41 |
| ✅ **Sonner toasts** | High | Low | Low | Phase 41 |
| ✅ **DOMPurify** | Medium | Low | Low | Phase 41 |
| ✅ **Zod validation** | High | Medium | Low | Phase 42 |
| ✅ **LZ-String URL compression** | Medium | Medium | Medium | Phase 43 |
| ✅ **Discriminated union results** | Medium | High | Medium | Phase 44 |
| ⚠️ **i18n namespace restructure** | Medium | High | Medium | Phase 45 |
| ❌ **Web Workers** | Low | Medium | Low | Future |

---

## What to Keep (Converty Strengths)

| Converty Pattern | Assessment |
|-----------------|------------|
| `createCalculatorStore` factory | ✅ Well-designed for multi-calculator app — don't replace |
| Per-locale static HTML generation | ✅ SEO benefit — Next.js is correct choice |
| Pure functions in `src/lib/converters/` | ✅ Already testable — perfect for Vitest |
| `history.replaceState` debounced URL sync | ✅ Works well — augment with LZ-String compression |
| Radix UI primitives | ✅ Accessible, no equivalent in Raidy |
| `parseNumberParam`, `parseStringParam` helpers | ⚠️ Replace with Zod |

---

## Recommended Migration Strategy

### Phased Approach (on `feature/framework-migration` branch)

**Wave 1 — Testing Foundation (highest ROI, zero risk):**

- Add Vitest to Next.js project
- Write unit tests for all 169 converter functions
- Set up 75% coverage threshold in CI

**Wave 2 — Error Handling & UX (additive, low risk):**

- Add react-error-boundary wrapping calculator layout
- Add Sonner for toast notifications
- Add DOMPurify for any user-generated content rendering

**Wave 3 — Validation Layer (moderate effort):**

- Add Zod to project
- Define Zod schemas for calculator input types
- Replace `parseNumberParam`/etc with Zod `.safeParse()`

**Wave 4 — URL State Compression (moderate):**

- Add LZ-String
- Update URL sync middleware to compress/decompress
- Keep search params (not hash) for GitHub Pages compatibility

**Wave 5 — Type System Hardening (breaking but valuable):**

- Adopt discriminated union result types across all converters
- Update component layer to handle `{ ok, value/error }` results

**Wave 6 — i18n Structure (invasive but not framework-breaking):**

- Restructure single JSON files into named sub-objects per domain
- Keep next-intl (no library change)
- Update `useTranslations()` call namespaces

---

## Conclusion

The most impactful migrations are the ones that don't require changing the framework: Vitest, Zod, react-error-boundary, Sonner, DOMPurify, and LZ-String. These collectively close the architectural gap with Raidy at low risk.

Next.js stays. The static export requirement, 4-locale SSG, and GitHub Pages deployment all favor keeping the current framework.

---

_Generated: 2026-02-26 | Next: Update REQUIREMENTS.md and ROADMAP.md for v7.0 milestone_
