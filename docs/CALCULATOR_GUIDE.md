# Adding a New Calculator

This guide walks through creating a new calculator for Converty.

## Overview

Each calculator consists of:

1. **Calculation logic** - Pure TypeScript functions in `src/lib/converters/`
2. **Registry entry** - Metadata in `src/lib/registry/converters.ts`
3. **Translations** - Labels in `src/messages/*.json`
4. **Component** - React component with Zustand store
5. **Page** - Next.js page with metadata

## Step 1: Create the Calculation Logic

Create `src/lib/converters/{category}/{name}.ts`:

```typescript
/**
 * Calculator Name
 *
 * Brief description of what this calculator does.
 */

export interface MyCalculatorInput {
  value1: number;
  value2: number;
}

export interface MyCalculatorResult {
  output1: number;
  output2: string;
}

/**
 * Calculate something useful
 */
export function calculateSomething(input: MyCalculatorInput): MyCalculatorResult | null {
  const { value1, value2 } = input;

  // Validate inputs
  if (value1 <= 0 || value2 <= 0) {
    return null;
  }

  // Perform calculations
  const output1 = value1 * value2;
  const output2 = `Result: ${output1}`;

  return { output1, output2 };
}

// Export any constants that might be useful
export const PRESETS = [
  { name: "Option 1", value: 1 },
  { name: "Option 2", value: 2 },
];
```

## Step 2: Export from Category Index

Add to `src/lib/converters/{category}/index.ts`:

```typescript
export * from "./my-calculator";
```

## Step 3: Create the Page

Create `src/app/[locale]/{category}/{name}/page.tsx`:

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
  const t = await getTranslations({ locale, namespace: "converters.my-calculator" });

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

  const t = await getTranslations("converters.my-calculator");
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

## Step 4: Create the Component

Create `src/app/[locale]/{category}/{name}/my-calculator.tsx`:

```typescript
"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateSomething,
  type MyCalculatorInput,
  type MyCalculatorResult,
} from "@/lib/converters/{category}/my-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";

// Create store OUTSIDE component (module scope)
const useMyCalculatorStore = createCalculatorStore<MyCalculatorInput, MyCalculatorResult>({
  name: "my-calculator",
  initialValues: { value1: 10, value2: 5 },
  calculate: calculateSomething,
});

export function MyCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const { values, setValue, result } = useMyCalculatorStore();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("inputs")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="value1"
            label={t("value1")}
            type="number"
            value={values.value1}
            onChange={(value) => setValue("value1", Number(value))}
          />
          <InputField
            id="value2"
            label={t("value2")}
            type="number"
            value={values.value2}
            onChange={(value) => setValue("value2", Number(value))}
          />
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tResults("result")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultGrid
              results={[
                { label: t("output1"), value: result.output1 },
                { label: t("output2"), value: result.output2 },
              ]}
              columns={2}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Step 5: Register the Calculator

Add to `src/lib/registry/converters.ts`:

```typescript
import { CategoryIcon } from "lucide-react";

// In the converterRegistry object:
"my-calculator": {
  id: "my-calculator",
  slug: "my-calculator",
  name: "My Calculator",
  description: "Brief description for the menu",
  category: "category",
  keywords: ["keyword1", "keyword2"],
  icon: CategoryIcon,
  featured: false,
},
```

## Step 6: Add Translations

See the [I18N Guide](./I18N_GUIDE.md) for detailed translation instructions.

Add to all 4 locale files (`src/messages/en.json`, `fr.json`, `de.json`, `it.json`):

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

## Step 7: Add JSDoc Comments

Document your calculation functions:

```typescript
/**
 * Calculates the compound interest on an investment.
 *
 * Formula: A = P(1 + r/n)^(nt)
 *
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (decimal, e.g., 0.05 for 5%)
 * @param time - Time in years
 * @param n - Number of times interest compounds per year
 * @returns The final amount including principal and interest
 */
export function calculateCompoundInterest(...): number { ... }
```

---

## Zustand Store Pattern

The `createCalculatorStore` factory provides:

- **Automatic URL synchronization** - State syncs to URL parameters (shareable links)
- **Type-safe generics** - `createCalculatorStore<InputType, ResultType>`
- **No Provider needed** - Use the store hook directly
- **Automatic calculation** - Result updates when values change
- **Built-in validation** - Returns `null` for invalid inputs

**Important:** Always create the store **outside** the component at module scope.

---

## Advanced Patterns

For complex calculators, see existing examples:

| Feature | Example |
|---------|---------|
| Custom validation | `src/app/[locale]/finance/mortgage/` |
| PDF export | `src/app/[locale]/photo/dof/` |
| Charts (recharts) | `src/app/[locale]/finance/compound-interest/` |
| Multiple result sections | `src/app/[locale]/network/subnet-calculator/` |
| Select dropdowns | `src/app/[locale]/photo/nd-filter/` |
| Material/section databases | `src/app/[locale]/engineering/column-buckling/` |
| Formula parsing | `src/app/[locale]/chemistry/molecular-weight/` |
| Multi-mode calculators | `src/app/[locale]/chemistry/ph-calculator/` |
| Chemical equation parser | `src/app/[locale]/chemistry/stoichiometry/` |
| Interactive data tables | `src/app/[locale]/chemistry/periodic-table/` |
| Pipe/fluid databases | `src/app/[locale]/engineering/pipe-flow/` |
| Unit conversion matrix | `src/app/[locale]/engineering/engineering-unit-converter/` |

---

## Domain-Specific Patterns

### Engineering Calculators

Engineering calculators use material and section databases stored in `src/data/engineering/`:

```typescript
// Load materials from JSON database
import materials from "@/data/engineering/materials.json";
import beamSections from "@/data/engineering/beam-sections.json";

// Typed interfaces for database entries
export interface ColumnBucklingInput {
  materialId: string;      // References materials.json
  sectionId: string;       // References beam-sections.json
  axis: "strong" | "weak";
  endCondition: "pinned-pinned" | "fixed-pinned" | "fixed-fixed" | "fixed-free";
  length: number;
  // Custom overrides when "custom" is selected
  customYoungsModulus?: number;
  customYieldStrength?: number;
  customArea?: number;
  customMomentOfInertia?: number;
}
```

Key patterns:

- **Material/section lookup functions**: `getMaterialById()`, `getSectionById()` — always provide fallback for `"custom"` IDs
- **Calculation steps**: Return a `steps` array describing intermediate values for educational display
- **End conditions**: Use a constant map (e.g., `END_CONDITION_K`) for lookup tables
- **Unit handling**: Engineering unit converter uses `UNIT_CATEGORIES` with `conversionFactor` per unit

### Chemistry Calculators

Chemistry calculators parse formulas and equations in `src/lib/converters/chemistry/`:

```typescript
// Parse chemical formulas like "Ca(OH)2", "CuSO4·5H2O"
import { parseChemicalFormula } from "@/lib/converters/chemistry/formula-parser";

const result = parseChemicalFormula("H2O");
// → { success: true, composition: { H: 2, O: 1 } }
```

Key patterns:

- **Formula parser**: Recursive descent parser handles parentheses, hydrates (·), and nested groups
- **Equation parser**: Splits balanced equations on arrow symbols (→, ->, =)
- **Periodic table data**: `src/data/chemistry/periodic-table.json` — 118 elements with IUPAC 2024 data
- **pH modes**: Multi-mode calculator pattern — different input sets for strong/weak acids/bases/buffers
- **Common compound presets**: `src/data/chemistry/common-compounds.json` — preset formulas users can select

---

## Checklist

Before submitting:

- [ ] Calculation logic has unit tests (if complex)
- [ ] All 4 locale files have translations
- [ ] Calculator registered in registry
- [ ] `generateStaticParams()` exported
- [ ] `setRequestLocale()` called in page
- [ ] Store created outside component
- [ ] JSDoc comments on exported functions
