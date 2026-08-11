# ADR-004: Four-Locale Internationalization (EN / FR / DE / IT)

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Switzerland has four official languages: German, French, Italian, and Romansh. The project owner is Swiss, and the primary target audience includes Swiss professionals and students who prefer working in their native language. A single-language English-only tool would exclude a large part of this audience.

Romansh was excluded due to the very small speaker population (~0.5% of Switzerland) and the absence of stable locale data in common i18n libraries.

## Decision

Support four locales: `en`, `fr`, `de`, `it`. All locales receive equal treatment — no locale is a fallback for another.

**Framework:** `next-intl 4` with static generation
- Each locale generates its own set of static pages: `/{locale}/{category}/{calculator}/`
- Translation files are JSON at `src/messages/{locale}.json`
- Server components use `getTranslations()`, client components use `useTranslations()`
- Locale detection via `middleware.ts` with cookie/Accept-Language negotiation

**Translation key structure:**
```json
{
  "converters": {
    "{calculator-id}": {
      "name": "...",
      "description": "...",
      "metaDescription": "..."
    }
  },
  "calculator": {
    "{category}": {
      "{fieldKey}": "..."
    }
  },
  "categories": { ... },
  "common": { ... }
}
```

**What is NOT translated:**
- Chemical element symbols and formula notation (Fe, Ca(OH)₂)
- SI units and mathematical symbols (kg, m², π)
- Vendor CLI commands (portcfgex, switchport fcrxbbcredit)
- File extensions and code snippets

**Currency:** All monetary values use CHF formatting with locale-appropriate number formatting (e.g., `fr-CH`, `de-CH`).

## Consequences

**Positive:**
- Full support for Swiss multilingual users
- SEO benefit: 4× the indexed pages for locale-specific search queries
- next-intl integrates cleanly with Next.js App Router static generation
- Each locale's pages are fully pre-rendered (no runtime translation fetching)

**Negative / Constraints:**
- Every new calculator requires translations in all 4 locale files — forgetting one breaks the build (enforced by `/check-i18n` skill)
- Translation files grow large (~5000+ lines each)
- No machine translation fallback: untranslated strings cause build failures
- 193 calculators × 4 locales = 772 static pages, increasing build time

**Tooling:**
- `/add-translations` skill scaffolds translation keys across all 4 files
- `/check-i18n` skill audits completeness and reports missing/orphaned keys
