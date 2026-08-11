# Components Directory

This directory contains all React components for Converty.

## Structure

```text
components/
├── converter/       # Calculator-specific components
├── layout/          # Page layout components (Header, Footer)
└── ui/              # Base UI primitives (shadcn/ui style)
```

## UI Components (`ui/`)

Base primitives following shadcn/ui patterns with Radix UI + Tailwind:

| Component | Usage |
|-----------|-------|
| `button.tsx` | Buttons with variants (default, destructive, outline, secondary, ghost, link) |
| `card.tsx` | Card containers (Card, CardHeader, CardTitle, CardContent, CardFooter) |
| `input.tsx` | Text inputs |
| `label.tsx` | Form labels |
| `select.tsx` | Dropdown selects (Radix-based) |
| `switch.tsx` | Toggle switches |
| `tabs.tsx` | Tab navigation (Radix-based) |
| `radio-group.tsx` | Radio button groups (Radix-based) |
| `badge.tsx` | Status badges with variants |
| `textarea.tsx` | Multi-line text inputs |

### Adding New UI Components

1. Follow shadcn/ui patterns
2. Use Radix UI primitives when available
3. Use `cn()` from `@/lib/utils` for class merging
4. Export from the component file directly

## Converter Components (`converter/`)

Reusable components for calculators:

| Component | Purpose |
|-----------|---------|
| `converter-layout.tsx` | Standard page wrapper with title, description |
| `input-field.tsx` | Labeled numeric input with formatting |
| `output-display.tsx` | Formatted result display |
| `result-grid.tsx` | Grid of label/value pairs |
| `index.ts` | Barrel export for all converter components |

### Using Converter Components

```tsx
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";

// InputField - numeric input with label
<InputField
  id="amount"
  label={t("amount")}
  value={values.amount}
  onChange={(v) => setValue("amount", v)}
  min={0}
  step="0.01"
/>

// OutputDisplay - single result with optional formatting
<OutputDisplay
  label={t("result")}
  value={formattedValue}
  size="lg"  // "sm" | "md" | "lg"
/>

// ResultGrid - multiple results in grid layout
<ResultGrid
  results={[
    { label: "Total", value: "$1,234.56" },
    { label: "Interest", value: "$234.56" },
  ]}
/>
```

## Layout Components (`layout/`)

- `header.tsx` - Site header with navigation and language switcher
- `footer.tsx` - Site footer
- `language-switcher.tsx` - Locale selector dropdown

## Conventions

1. **Client vs Server**: Mark client components with `"use client"` directive
2. **Translations**: Use `useTranslations()` hook in client components
3. **Styling**: Use Tailwind classes, `cn()` for conditionals
4. **Types**: Export interfaces alongside components when needed
