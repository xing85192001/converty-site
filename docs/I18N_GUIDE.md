# Internationalization (i18n) Guide

Converty supports 4 Swiss languages: **English (en)**, **French (fr)**, **German (de)**, **Italian (it)**.

## Key Files

| Path | Purpose |
|------|---------|
| `src/i18n/config.ts` | Locale definitions and formats |
| `src/i18n/request.ts` | Server-side i18n setup |
| `src/i18n/navigation.ts` | Localized Link, redirect, usePathname |
| `src/messages/en.json` | English translations (source of truth) |
| `src/messages/fr.json` | French translations |
| `src/messages/de.json` | German translations |
| `src/messages/it.json` | Italian translations |

## URL Structure

All pages are prefixed with locale:

```
/en/finance/mortgage
/fr/finance/mortgage
/de/finance/mortgage
/it/finance/mortgage
```

---

## Adding Translations

### Step 1: Add to English first

Edit `src/messages/en.json`:

```json
{
  "converters": {
    "my-calculator": {
      "name": "My Calculator",
      "description": "Calculate something useful",
      "metaDescription": "SEO description for search engines"
    }
  }
}
```

### Step 2: Copy to other locales

Copy the same structure to `fr.json`, `de.json`, `it.json` and translate.

### Naming Rules

**Translation keys must use kebab-case** to match registry IDs:

```json
// Good
"compound-interest": { ... }

// Bad
"compoundInterest": { ... }
```

**Do NOT include "Calculator" in the `name` field:**

| Locale | Incorrect | Correct |
|--------|-----------|---------|
| EN | "BMI Calculator" | "BMI" |
| FR | "Calculateur de IMC" | "IMC" |
| DE | "BMI-Rechner" | "BMI" |
| IT | "Calcolatore di IMC" | "IMC" |

---

## Using Translations in Code

### Server Components (pages)

```typescript
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function MyPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);  // REQUIRED

  const t = await getTranslations("namespace");

  return <div>{t("key")}</div>;
}
```

### Client Components (calculators)

```typescript
"use client";

import { useTranslations, useFormatter } from "next-intl";

export function MyCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  // Format numbers with locale
  const formatted = format.number(1234.56);

  // Format currency
  const price = format.number(99.99, {
    style: "currency",
    currency: "CHF"
  });

  return <div>{t("label")}</div>;
}
```

---

## Static Generation

All pages **must** export `generateStaticParams()`:

```typescript
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

This generates pages for all 4 locales at build time.

---

## Translation File Structure

```json
{
  "common": {
    "siteName": "Converty",
    "search": "Search",
    "backTo": "Back to {category}"
  },
  "categories": {
    "finance": {
      "name": "Finance",
      "description": "Financial calculators"
    }
  },
  "converters": {
    "mortgage": {
      "name": "Mortgage",
      "description": "Calculate monthly payments",
      "metaDescription": "SEO description"
    }
  },
  "calculator": {
    "labels": {
      "amount": "Amount",
      "rate": "Interest Rate"
    },
    "results": {
      "monthly": "Monthly Payment"
    }
  }
}
```

---

## Domain-Specific Translation Rules

### Never Translate

These tokens must remain identical across all locales:

| Category | Examples | Why |
|----------|----------|-----|
| Chemical formulas | `H₂O`, `NaCl`, `Ca(OH)₂`, `CuSO₄·5H₂O` | IUPAC international notation |
| SI unit symbols | `m`, `kg`, `Pa`, `mol/L`, `MPa`, `N` | International System of Units |
| Mathematical symbols | `σ`, `δ`, `π`, `ε`, `λ` | Universal notation |
| Element symbols | `H`, `O`, `Na`, `Fe`, `Cu` | Periodic table symbols |
| Variable placeholders | `{count}`, `{period}` | next-intl interpolation |

### Always Translate

| Category | EN | FR | DE | IT |
|----------|----|----|----|----|
| Element names | Hydrogen | Hydrogène | Wasserstoff | Idrogeno |
| Material names | Structural Steel | Acier de construction | Baustahl | Acciaio strutturale |
| Unit full names | pounds per square inch | livres par pouce carré | Pfund pro Quadratzoll | libbre per pollice quadrato |
| Engineering terms | Column Buckling | Flambage de colonne | Stützenknickung | Instabilità della colonna |
| Solution types | Strongly Acidic | Fortement acide | Stark sauer | Fortemente acido |

### Translation Quality Checks

- **Chemical precision**: "Molar Mass" ≠ "Molecular Weight" — use the correct term per locale convention
- **Engineering terminology**: Use standards-body terminology (e.g., Eurocode terms for DE/FR/IT)
- **Unit descriptions**: Keep `(GB)`, `(MHz)`, `(M₁)` notation — these are not translatable
- **Subscript/superscript**: Keep `H⁺`, `OH⁻`, `M₁V₁ = M₂V₂` in all locales

---

## Checklist

- [ ] English translations added first
- [ ] All 4 locale files updated
- [ ] Keys use kebab-case
- [ ] No "Calculator" in names
- [ ] `generateStaticParams()` exported
- [ ] `setRequestLocale()` called in pages
- [ ] Chemical formulas NOT translated
- [ ] SI unit symbols NOT translated
- [ ] Element names ARE translated
- [ ] `{variable}` placeholders preserved
