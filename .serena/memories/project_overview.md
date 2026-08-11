# Converty Project Overview

## Purpose

Converty is a comprehensive static site with 150+ calculators and converters for everyday needs. Built with Next.js 16, React 19, TypeScript 5. Deployed to GitHub Pages via static export.

## Tech Stack

- **Framework**: Next.js 16.1 (App Router, Static Export)
- **UI**: React 19, Tailwind CSS 4, Radix UI, shadcn/ui patterns
- **State**: Zustand 5 (migrating from useConverter hook)
- **i18n**: next-intl 4.7 (4 Swiss locales: en, fr, de, it)
- **Charts**: Recharts 3.6
- **PDF**: jsPDF 4.0
- **Icons**: Lucide React
- **Linting**: Biome 2.3

## Architecture

Three-layer pattern:

1. **Pure Calculation Logic** (`src/lib/converters/[category]/[name].ts`) - No React, pure functions
2. **State + UI Components** (`src/app/[locale]/[category]/[name]/[name]-calculator.tsx`) - Client components with Zustand
3. **Page Layout** (`src/app/[locale]/[category]/[name]/page.tsx`) - Server component, metadata, static params

## Directory Structure

```
src/
├── app/[locale]/          # Pages with locale routing (150+ calculator pages)
├── lib/converters/        # Pure calculation functions by category
├── lib/registry/          # Calculator metadata (categories.ts, converters.ts)
├── components/converter/  # Reusable: InputField, OutputDisplay, ResultGrid
├── components/ui/         # Base UI primitives (Radix + Tailwind)
├── stores/                # Zustand state management
├── i18n/                  # i18n configuration
├── messages/              # Translation files (en, fr, de, it)
└── hooks/                 # Legacy hooks (being phased out)
```

## Categories (150 calculators)

- Health: 26 | Math: 41 | Finance: 24 | Photo: 22
- Video: 9 | Web: 10 | Data: 3 | DateTime: 8
- Physics: 1 | Music: 1 | Color: 1 | Other: 2
