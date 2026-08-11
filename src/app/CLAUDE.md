# App Directory (Next.js Pages)

Next.js App Router pages with locale-based routing.

## Structure

```text
app/
├── [locale]/                    # Dynamic locale segment
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Homepage
│   ├── [category]/             # Category pages
│   │   ├── page.tsx            # Category listing
│   │   └── [calculator]/       # Calculator pages
│   │       ├── page.tsx        # Page metadata + layout
│   │       └── *-calculator.tsx # Calculator component
│   └── ...
├── layout.tsx                   # HTML root
└── globals.css                  # Global styles
```

## Page Pattern

Every calculator page follows this pattern:

### `page.tsx` (Server Component)

```typescript
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { MyCalculator } from "./my-calculator";

// REQUIRED: Generate pages for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Metadata with translations
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.my-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["keyword1", "keyword2"],
  };
}

// Page component
export default async function MyCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);  // REQUIRED for static generation

  const t = await getTranslations("converter.my-calculator");
  const tCommon = await getTranslations("common");

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      backLink={`/${locale}/category`}
      backLabel={tCommon("backToCategory")}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <MyCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
```

### Calculator Component (Client Component)

```typescript
"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { useConverter } from "@/hooks";
import { calculateMy, type MyInput, type MyResult } from "@/lib/converters/category/my";

interface FormValues {
  field1: string;
  field2: string;
}

export function MyCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result } = useConverter<FormValues, MyResult | null>({
    initialValues: { field1: "100", field2: "50" },
    calculate: (vals) => {
      const input: MyInput = {
        field1: parseFloat(vals.field1) || 0,
        field2: parseFloat(vals.field2) || 0,
      };
      return { value: calculateMy(input) };
    },
  });

  return (
    <div className="space-y-6">
      <InputField
        id="field1"
        label={t("field1")}
        value={values.field1}
        onChange={(v) => setValue("field1", v)}
      />
      {/* ... more inputs and outputs */}
    </div>
  );
}
```

## Categories

| Category | Path | Count |
|----------|------|-------|
| Health | `/[locale]/health/` | 28 calculators |
| Finance | `/[locale]/finance/` | 24 calculators |
| Math | `/[locale]/math/` | 38 calculators |
| Photo | `/[locale]/photo/` | 22 calculators |
| Video | `/[locale]/video/` | 9 calculators |
| Web | `/[locale]/web/` | 10 calculators |
| Data | `/[locale]/data/` | 3 calculators |
| DateTime | `/[locale]/datetime/` | 8 calculators |
| Physics | `/[locale]/physics/` | 1 calculator |
| Music | `/[locale]/music/` | 1 calculator |
| Color | `/[locale]/color/` | 1 converter |

## Key Files

- `[locale]/layout.tsx` - Provides NextIntlClientProvider, theme
- `[locale]/page.tsx` - Homepage with featured calculators
- `globals.css` - Tailwind imports and CSS variables

## Important Notes

1. **Always call `setRequestLocale(locale)`** in page components for static generation
2. **Always export `generateStaticParams()`** returning all locales
3. **Use kebab-case** for folder names matching registry slugs
4. **Translation namespace** must match converter id in registry
