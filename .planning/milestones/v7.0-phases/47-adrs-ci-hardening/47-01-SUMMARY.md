---
phase: 47-adrs-ci-hardening
plan: "01"
subsystem: documentation
tags: [adr, architecture, error-boundaries, zod, lz-string, documentation]
dependency_graph:
  requires: []
  provides: [ADR-013, ADR-014, ADR-015]
  affects: [docs/adr/]
tech_stack:
  added: []
  patterns: [adr-format, decision-record]
key_files:
  created:
    - docs/adr/ADR-013-error-boundaries-sonner-toasts.md
    - docs/adr/ADR-014-zod-input-validation.md
    - docs/adr/ADR-015-lz-string-url-compression.md
  modified: []
decisions:
  - "ADR-013 documents react-error-boundary, isomorphic-dompurify, and opt-in onCalculationError for Phase 42"
  - "ADR-014 documents Zod schema? param in createCalculatorStore, string vs number schema strategy, and coverage gaps for Phase 43"
  - "ADR-015 documents lz-string ?z= compression, dual-path read, null-safety, prototype pollution prevention, and URLSearchParams bug fix for Phase 44"
metrics:
  duration_seconds: 150
  completed_date: "2026-02-26"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
---

# Phase 47 Plan 01: ADRs for Error Boundaries, Zod Validation, and LZ-String Compression Summary

**One-liner:** Three Architecture Decision Records documenting Phase 42-44 library choices — react-error-boundary/sonner, Zod runtime validation, and lz-string URL compression — with full context, alternatives considered, and consequences.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write ADR-013 — Error Boundaries and Sonner Toasts | 2966215 | docs/adr/ADR-013-error-boundaries-sonner-toasts.md |
| 2 | Write ADR-014 — Zod Input Validation | 08c0bc0 | docs/adr/ADR-014-zod-input-validation.md |
| 3 | Write ADR-015 — LZ-String URL Compression | a1f8821 | docs/adr/ADR-015-lz-string-url-compression.md |

## What Was Built

Three complete Architecture Decision Records filling the documentation gap for v7.0 Framework Migration phases 42-44:

**ADR-013** (118 lines): Documents the Phase 42 decision to adopt `react-error-boundary` and `sonner`. Key decisions documented: `ConverterLayout` remains a server component even after adding `CalculatorErrorBoundary`; `isomorphic-dompurify` chosen over plain `dompurify` to prevent `window is not defined` during static generation; `onCalculationError` is opt-in (not default) to avoid toast spam on 169 calculators that use `null` as a normal incomplete-input return.

**ADR-014** (129 lines): Documents the Phase 43 Zod adoption. Key decisions: Zod is a runtime dep (not devDep) since schemas execute client-side; `z.string().refine()` for health/math categories vs `z.number()` for finance (matching their `FormValues` types); `z.coerce.number()` rejected because it changes output type; two validation paths coexist (`schema` and `validate`); coverage gaps explicitly documented (useState-based calculators).

**ADR-015** (127 lines): Documents the Phase 44 lz-string adoption. Key decisions: `compressToEncodedURIComponent` for URL-safe output; dual-path read (new `?z=` and legacy per-key); null-safety guard before `JSON.parse`; prototype pollution prevention via key allowlist from `initialValues`; `Object.keys(urlParams)` dead-code bug fix; search params not hash (GitHub Pages compat).

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- All three ADR files exist in `docs/adr/`
- All files exceed 60 lines (ADR-013: 118, ADR-014: 129, ADR-015: 127)
- Total ADR count: 15 ADRs + README.md = 16 files
- Each file has Status, Date, Context, Decision, Alternatives Considered, Consequences, Implementation Details, Related ADRs sections
- ADR-013 cross-references ADR-007 and ADR-009
- ADR-014 cross-references ADR-002 and ADR-003
- ADR-015 cross-references ADR-002 and ADR-008

## Self-Check: PASSED

Files verified to exist:
- docs/adr/ADR-013-error-boundaries-sonner-toasts.md — FOUND (118 lines)
- docs/adr/ADR-014-zod-input-validation.md — FOUND (129 lines)
- docs/adr/ADR-015-lz-string-url-compression.md — FOUND (127 lines)

Commits verified:
- 2966215 — FOUND (ADR-013)
- 08c0bc0 — FOUND (ADR-014)
- a1f8821 — FOUND (ADR-015)
