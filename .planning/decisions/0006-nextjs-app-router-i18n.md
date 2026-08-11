# Use Next.js App Router with next-intl for i18n Routing

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty targets a Swiss audience and serves users in four languages: English, French, German, and Italian. Every calculator must be fully translated, including labels, placeholders, units, and error messages. We need an internationalization approach that:

- Integrates with Next.js static export
- Does not require a server for locale detection
- Supports SEO-friendly locale-prefixed URLs (`/en/`, `/fr/`, `/de/`, `/it/`)
- Scales to 200+ calculators without per-page boilerplate

## Decision Drivers

- **Static export compatibility** — Must work with `output: "export"` (no server for locale negotiation)
- **Type-safe translations** — TypeScript should catch missing translation keys at compile time
- **Minimal per-page setup** — 200+ pages should not each contain locale boilerplate
- **SEO** — Each locale has its own URL (`/fr/math/percentage` is indexable separately)
- **Swiss four-language context** — en, fr, de, it are all first-class (no fallback chain)

## Considered Options

1. **next-intl with App Router `[locale]` segment** — Dynamic route segment, server component support, type-safe
2. **i18next + react-i18next** — Most popular React i18n library, browser-based routing
3. **next-i18n-router (Pages Router)** — Legacy Pages Router with `next.config.js` i18n block
4. **Manual locale detection** — Custom hook reading URL pathname, no external library
5. **Single-language English** — No i18n, English only

## Decision Outcome

Chosen option: **"next-intl with App Router `[locale]` segment"** because it provides type-safe translations via generated type definitions, integrates natively with Next.js App Router server components, and requires zero per-page locale boilerplate once the root layout is configured.

### Consequences

**Positive:**

- **Type-safe keys:** `useTranslations("calculator.percentage")` catches typos at compile time
- **Server components work:** Page metadata (title, description) can use translations without client JS
- **Single source of truth:** Translation files in `src/messages/{locale}.json`, one file per language
- **Automatic static params:** `generateStaticParams()` returns all 4 locales once, applies to all routes
- **No runtime locale detection:** Locale is in the URL path, no cookie/header parsing needed at runtime

**Negative:**

- **All pages under `[locale]`:** Every page must live under `src/app/[locale]/`, adding one directory level
- **No locale negotiation:** Users must navigate to a specific locale URL; no automatic redirect based on browser language (constraint of static export)
- **next-intl version coupling:** Tied to next-intl API (currently v4.x); major upgrades require migration

**Neutral:**

- **4 locale files** — `src/messages/en.json`, `fr.json`, `de.json`, `it.json` must stay in sync
- **Translation completeness** — Missing keys fall back to key string; the `/check-i18n` skill audits for gaps

## Directory Structure Imposed

```
src/
└── app/
    └── [locale]/          # Dynamic segment — en | fr | de | it
        ├── layout.tsx      # Provides NextIntlClientProvider
        ├── page.tsx        # Homepage
        └── math/
            └── percentage/
                └── page.tsx  # /en/math/percentage, /fr/math/percentage, etc.
src/
└── messages/
    ├── en.json
    ├── fr.json
    ├── de.json
    └── it.json
```

## Usage Pattern

```typescript
// Server component (page.tsx)
import { getTranslations } from "next-intl/server";
export async function generateMetadata({ params }) {
  const t = await getTranslations("math.percentage");
  return { title: t("title") };
}

// Client component (calculator.tsx)
import { useTranslations } from "next-intl";
const t = useTranslations("math.percentage");
```

## Links

- **i18n configuration:** `src/i18n/routing.ts`, `src/i18n/request.ts`
- **Translation files:** `src/messages/`
- **Skill:** `/check-i18n` — audits translation completeness
- **Skill:** `/add-translations` — adds keys across all 4 locales
- **Guide:** `docs/I18N_GUIDE.md`
