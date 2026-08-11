# ADR-012: i18n Namespace Restructure with next-intl

**Date:** 2026-02-26
**Status:** Accepted
**Deciders:** Project maintainer

## Context

The Converty project uses next-intl for internationalization across 4 locales (en, fr, de, it). Each locale file grew organically over 45 development phases to include ~4293 translation keys across 8 inconsistently-named top-level namespaces: `common`, `categories`, `subcategories`, `converters` (plural), `calculator`, `realestate`, `validation`, and `metadata`.

Problems with the existing structure:

1. **Inconsistent naming**: `converters` (plural) vs `calculator` (singular) — no clear convention
2. **Scattered metadata**: `validation` and `metadata` lived at the top level instead of under `common`
3. **Fragmented navigation**: `categories` and `subcategories` were separate top-level keys
4. **Duplicate data**: `realestate` existed at both top-level and under `calculator.realestate`

## Decision

Restructure the top-level namespace schema to 4 stable keys:

```json
{
  "common": {
    "siteName": "Converty",
    "validation": { "required": "...", "invalidNumber": "..." },
    "metadata": { "title": "...", "description": "..." }
  },
  "nav": {
    "health": { "name": "Health", "description": "..." },
    "subcategories": { "basic": "...", "advanced": "..." }
  },
  "converter": {
    "bmi": { "name": "BMI", "description": "...", "metaDescription": "..." },
    "compound-interest": { "name": "...", "description": "..." }
  },
  "calculator": {
    "labels": { "weight": "Weight", "height": "Height" },
    "results": { "result": "Result", "total": "Total" },
    "health": { "bmiCategory": "...", "underweight": "..." },
    "finance": { "principal": "...", "interest": "..." }
  }
}
```

**Naming conventions established:**

| Namespace | Purpose | Usage |
|-----------|---------|-------|
| `converter` | Metadata about each calculator tool (name, SEO description) | `getTranslations("converter.bmi")` in page.tsx |
| `nav` | Navigation/UI names for categories and subcategories | `getTranslations("nav.health")` in category pages, `useTranslations("nav")` in header |
| `common` | Shared UI text including validation messages and site metadata | `getTranslations("common")` anywhere |
| `calculator` | All calculator-specific labels, results, domain content | `useTranslations("calculator.health")` in components |

## Consequences

**Positive:**
- Clear semantic grouping: `converter` = "about the tool", `calculator` = "inside the tool", `nav` = "how to find it"
- `common.validation` and `common.metadata` follow the established `common.*` pattern
- Single `nav` key combines navigation concerns (was 2 separate top-level keys)
- Eliminates duplicate `realestate` key at top level
- Future calculators follow unambiguous placement rules

**Negative:**
- One-time migration required updating ~210 source files
- Migration done atomically — no backward compatibility period (build intentionally broken between plans 46-01 and 46-02)

**Neutral:**
- next-intl library unchanged (no new dependencies)
- Total leaf key count preserved (4291 keys — 2 duplicate `realestate.property-valuation` keys removed per locale)
- All 4 locales updated identically

## Alternatives Considered

**Split into separate JSON files per namespace:** next-intl supports multiple message files, but this requires changes to `next-intl.config.ts` and the provider setup. The single-file approach is simpler for a static export project.

**Use flat key prefixes instead of nesting:** e.g., `"converter_bmi_name"` instead of `"converter.bmi.name"`. Rejected because next-intl nesting with dot-notation is idiomatic and produces cleaner code.

**No change (status quo):** The 8-namespace organic structure would continue working but becomes increasingly confusing as new calculators are added.

## Implementation Notes

- Migration script: `scripts/migrate-i18n-namespaces.js` (committed for audit trail)
- All changes applied in Phase 46 (Plans 01–03)
- Calculator component internals using `calculator.*` namespaces were NOT changed — those were already well-structured
- Only `getTranslations()` calls in server components (`page.tsx` files) and a few client components using `converters.*`, `categories.*`, `subcategories` required updates
- `scripts/generate-search-index.ts` also updated to use new namespace keys
