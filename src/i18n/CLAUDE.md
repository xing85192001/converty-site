# i18n Directory

Internationalization configuration using next-intl.

## Supported Locales

| Code | Language | Region |
|------|----------|--------|
| `en` | English | Swiss (en-CH) |
| `fr` | French | Swiss (fr-CH) |
| `de` | German | Swiss (de-CH) |
| `it` | Italian | Swiss (it-CH) |

## Files

### `config.ts`

Locale definitions and formatting configuration:

```typescript
export const locales = ['en', 'fr', 'de', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
```

### `request.ts`

Server-side i18n setup for next-intl:

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### `navigation.ts`

Localized navigation helpers:

```typescript
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
});
```

## Usage Patterns

### Server Components (Pages)

```typescript
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);  // Required for static generation

  const t = await getTranslations("namespace");
  return <div>{t("key")}</div>;
}
```

### Client Components

```typescript
"use client";
import { useTranslations, useFormatter } from "next-intl";

export function Component() {
  const t = useTranslations("namespace");
  const format = useFormatter();

  // Format numbers with locale
  const formatted = format.number(1234.56, {
    style: "currency",
    currency: "CHF"
  });

  return <div>{t("key")}</div>;
}
```

### Localized Links

```typescript
import { Link } from "@/i18n/navigation";

// Automatically includes current locale
<Link href="/finance/mortgage">Mortgage</Link>
// Renders as: /en/finance/mortgage (if current locale is en)
```

## Translation Keys

Keys must be **kebab-case** to match converter IDs in registry:

```json
{
  "converters": {
    "compound-interest": {  // matches id: "compound-interest"
      "name": "Compound Interest Calculator",
      "description": "Calculate compound interest",
      "metaDescription": "SEO description"
    }
  }
}
```

## Adding Translations

1. Add to `src/messages/en.json` first (source of truth)
2. Copy to `fr.json`, `de.json`, `it.json`
3. Translate each file
4. Key must match converter `id` in registry
