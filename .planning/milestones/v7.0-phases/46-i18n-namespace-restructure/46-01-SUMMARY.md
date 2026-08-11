---
phase: 46-i18n-namespace-restructure
plan: "01"
subsystem: i18n
tags: [next-intl, i18n, json, locale, namespace, restructure]

# Dependency graph
requires:
  - phase: 45-discriminated-union-result-types
    provides: Completed Phase 45 — all 91 calculator components using CalculationResult type
provides:
  - "4 restructured locale JSON files with stable namespace schema: common, nav, converter, calculator"
  - "Migration script committed for audit trail"
  - "common.validation and common.metadata nested correctly"
  - "nav namespace with subcategories nested under it"
affects:
  - "46-02: Code updates must use new namespace strings (converter, nav, common.validation, common.metadata)"
  - "All components using useTranslations('converters') or useTranslations('categories')"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Namespace migration: one-shot Node.js script committed for audit trail"
    - "Top-level i18n namespaces: common, nav, converter, calculator (no others)"
    - "common nests validation and metadata sub-namespaces"
    - "nav nests category labels and subcategories"

key-files:
  created:
    - scripts/migrate-i18n-namespaces.js
  modified:
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json

key-decisions:
  - "converters (plural) renamed to converter (singular) as the canonical namespace for calculator metadata"
  - "nav namespace built by spreading categories + nesting subcategories under nav.subcategories"
  - "validation and metadata moved under common namespace as common.validation and common.metadata"
  - "Orphaned top-level realestate key removed (verified duplicate of calculator.realestate.property-valuation)"
  - "Pre-existing extra key calculator.engineering.labels.shape in fr/de is out of scope — predates migration, logged as deferred"

patterns-established:
  - "Migration scripts: write one-shot Node.js scripts committed to scripts/ for audit trail"
  - "Locale parity: all 4 locales must share identical key structure (pre-existing divergences are deferred)"

requirements-completed: [R6.1]

# Metrics
duration: 5min
completed: 2026-02-26
---

# Phase 46 Plan 01: i18n Namespace Restructure Summary

**Atomically restructured all 4 locale JSON files from 8 inconsistent top-level keys to the stable 4-key schema (common, nav, converter, calculator) using a committed migration script**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-26T00:00:00Z
- **Completed:** 2026-02-26T00:05:00Z
- **Tasks:** 2 (1 migration + 1 verification)
- **Files modified:** 5 (4 locale files + migration script)

## Accomplishments

- Renamed `converters` → `converter` across all 4 locale files (en, fr, de, it)
- Built `nav` namespace by spreading `categories` + nesting `subcategories` under `nav.subcategories`
- Moved `validation` under `common.validation` and `metadata` under `common.metadata`
- Removed orphaned top-level `realestate` key (verified as duplicate of `calculator.realestate.property-valuation`)
- Leaf key count preserved within ±10: en 4291 (was 4293), fr/de 4292 (was 4294) — 2-key reduction = removed duplicate realestate title+description pair

## Task Commits

Each task was committed atomically:

1. **Task 1: Write and run the JSON namespace migration script** - `0ed2b4d` (feat)
2. **Task 2: Verify key parity across all 4 locale files** - no file changes, verification only

## Files Created/Modified

- `scripts/migrate-i18n-namespaces.js` - One-shot migration script (committed for audit trail)
- `src/messages/en.json` - Restructured: 8 top-level keys → 4 (common, nav, converter, calculator)
- `src/messages/fr.json` - Restructured: same transformation
- `src/messages/de.json` - Restructured: same transformation
- `src/messages/it.json` - Restructured: same transformation

## Decisions Made

- `converters` (plural) renamed to `converter` (singular) — aligns with single-namespace-per-calculator design
- `nav` built by spreading all category label objects + nesting `subcategories` object — preserves existing structure while unifying under one key
- `validation` and `metadata` moved under `common` — logical grouping with other shared/cross-cutting keys
- `realestate` top-level key deleted after verifying `calculator.realestate.property-valuation` already contains the same content
- Pre-existing parity divergence in `fr`/`de` (`calculator.engineering.labels.shape` extra key) left untouched — predates this migration and is out-of-scope

## Deviations from Plan

### Out-of-scope Discovery (Logged, Not Fixed)

**Pre-existing key parity divergence in fr/de**
- **Found during:** Task 2 (parity verification)
- **Issue:** `fr` and `de` have 1 extra key `calculator.engineering.labels.shape` not present in `en` or `it` — this existed before Plan 46-01
- **Action:** Logged to deferred items — the migration script correctly preserved all keys as-is; this is not introduced by this plan
- **Out-of-scope per rules:** Pre-existing issue in unrelated files, not caused by current task's changes

None of the core migration transformations deviated from the plan.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan executed exactly as written. Pre-existing fr/de divergence discovered and logged as deferred.

## Issues Encountered

None — migration script ran successfully on first attempt. All 4 locale files processed cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Locale files are restructured with stable namespace schema
- Plan 46-02 can now update all source code (`useTranslations('converters')` → `useTranslations('converter')`, `useTranslations('categories')` → `useTranslations('nav')`, etc.)
- NOTE: The build is expected to be broken until Plan 46-02 updates the source code namespace strings — this is intentional (Plans 01 and 02 form a single atomic unit)

---
*Phase: 46-i18n-namespace-restructure*
*Completed: 2026-02-26*
