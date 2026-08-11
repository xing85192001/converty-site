---
phase: 47-adrs-ci-hardening
plan: "02"
subsystem: documentation
tags: [docs, code-style, engineering-patterns, zod, discriminated-union, ci]
dependency_graph:
  requires: []
  provides: [CODE_STYLE.md-zod-section, CODE_STYLE.md-calculation-result-section, ENGINEERING_PATTERNS.md-updated-validation]
  affects: [docs/CODE_STYLE.md, docs/ENGINEERING_PATTERNS.md]
tech_stack:
  added: []
  patterns: [CalculationResult<T> discriminated union, Zod string-based schemas]
key_files:
  created: []
  modified:
    - docs/CODE_STYLE.md
    - docs/ENGINEERING_PATTERNS.md
decisions:
  - "Inserted Zod and CalculationResult sections after Precision & Significant Figures, before Pre-commit Checks in CODE_STYLE.md"
  - "CI gate (npm run test:run before Build) already present in static.yml from Phase 41 — no changes needed"
  - "ADR-011 and ADR-012 verified present in docs/adr/ — no new ADRs required"
metrics:
  duration: "~2 min"
  completed: "2026-02-26"
  tasks_completed: 2
  files_modified: 2
---

# Phase 47 Plan 02: Developer Documentation — Zod and CalculationResult Patterns Summary

**One-liner:** Added Zod input validation and CalculationResult<T> discriminated union sections to CODE_STYLE.md; updated ENGINEERING_PATTERNS.md Validation Rules away from bare null returns.

## Objective

Update developer documentation to reflect v7.0 Framework Migration patterns. Without these docs, developers adding new calculators would revert to the old `T | null` return type and skip Zod schemas.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update CODE_STYLE.md — Add Zod and CalculationResult patterns | 7c828fa | docs/CODE_STYLE.md |
| 2 | Update ENGINEERING_PATTERNS.md and verify CI gate | 0b30166 | docs/ENGINEERING_PATTERNS.md |

## Changes Made

### Task 1: CODE_STYLE.md

Two new sections inserted after "Precision & Significant Figures" and before "Pre-commit Checks":

**Section: Zod Input Validation**
- Documents `z.string().refine()` pattern (not `z.coerce.number()`) for string-typed FormValues
- Documents `z.number()` pattern for finance FormValues
- Shows `createCalculatorStore` wiring with `schema:` option
- Explains field-level error display via `errors` from the store
- Critical warning about Biome `import type` compliance for `ZodType`

**Section: CalculationResult\<T\> Return Type**
- Documents the discriminated union `{ ok: true; value: T } | { ok: false; error: string; code: string }`
- Explicit prohibition: "Do NOT return `null` from converter functions"
- Shows adapter pattern behavior inside `createCalculatorStore`
- JSX pattern for displaying `calculationError` in components
- Common error codes table: INVALID_INPUT, INSUFFICIENT_DATA, DIVISION_BY_ZERO, UNSUPPORTED

### Task 2: ENGINEERING_PATTERNS.md

**Validation Rules — Rule 2 updated:**
- Old: `Return null for invalid inputs — never throw from calculation functions`
- New: `Return CalculationResult<T> for all calculator functions — never throw, never return bare null` with concrete success/failure examples and import statement

**Adding a New Engineering Calculator — Step 1 updated:**
- Old: Create `...{name}.ts` with typed input/result interfaces
- New: Same, plus: `return CalculationResult<YourResult>` (not `T | null`)

### CI Gate Verification (Read-Only)

Confirmed `.github/workflows/static.yml` has:
```yaml
- name: Test
  run: npm run test:run
```
This step appears BEFORE the `Build` step — CI gate is in place from Phase 41. No changes needed.

### ADR Verification (Read-Only)

Both ADRs confirmed present:
- `docs/adr/ADR-011-vitest-test-strategy.md` — exists
- `docs/adr/ADR-012-i18n-namespace-restructure.md` — exists

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c "CalculationResult" docs/CODE_STYLE.md` | 4 matches |
| `grep -c "z.string().refine" docs/CODE_STYLE.md` | 3 matches |
| `grep -c "CalculationResult" docs/ENGINEERING_PATTERNS.md` | 3 matches |
| `grep "test:run" .github/workflows/static.yml` | `run: npm run test:run` |
| ADR-011 exists | Yes |
| ADR-012 exists | Yes |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| docs/CODE_STYLE.md exists | FOUND |
| docs/ENGINEERING_PATTERNS.md exists | FOUND |
| 47-02-SUMMARY.md exists | FOUND |
| Commit 7c828fa exists | FOUND |
| Commit 0b30166 exists | FOUND |
