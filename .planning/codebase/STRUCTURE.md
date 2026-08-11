# Codebase Structure

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## Directory Layout

```text
converty/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── static.yml          # Build + deploy to GitHub Pages
│       └── security.yml        # CodeQL, Trivy, npm audit, Biome security
├── .husky/                     # Git hooks (Husky v9)
│   └── pre-commit              # lint-staged pre-commit hook
├── .planning/                  # GSD planning artifacts
│   ├── codebase/               # Codebase documentation (this directory)
│   └── milestones/             # Archived milestone artifacts (v1.0-v5.0)
├── docs/                       # Project documentation
│   ├── CALCULATOR_GUIDE.md     # Step-by-step guide for adding calculators
│   ├── CHEMISTRY_PATTERNS.md   # Chemistry formula parsing, IUPAC standards
│   ├── CODE_STYLE.md           # TypeScript, naming, linting, precision
│   ├── ENGINEERING_PATTERNS.md # Material databases, structural formulas, NIST
│   ├── GREPAI.md               # Semantic code search reference
│   ├── I18N_GUIDE.md           # Internationalization patterns
│   ├── REFERENCE_DATA_GUIDE.md # Data sourcing, versioning, quality checks
│   └── SERENA.md               # Semantic code editing reference
├── public/                     # Static assets
│   ├── icons/                  # PWA icons (multiple sizes)
│   ├── robots.txt              # Search engine rules
│   └── sitemap.xml             # Sitemap for SEO
├── scripts/                    # Build/deployment scripts
│   ├── fetch-crypto-prices.ts  # Build-time CoinGecko price fetch
│   ├── fetch-mining-data.ts    # Build-time blockchain.info data fetch
│   ├── generate-search-index.ts# Per-locale search index generation
│   ├── generate-sw.js          # Workbox service worker generation
│   └── package-local.js        # Local packaging utility
├── src/                        # Source code
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Locale-specific routes (20 categories)
│   │   │   ├── automotive/     # Vehicle calculators
│   │   │   ├── chemistry/      # Chemical calculations
│   │   │   ├── color/          # Color conversion
│   │   │   ├── cooking/        # Recipe and nutrition
│   │   │   ├── crypto/         # Cryptocurrency tools
│   │   │   ├── data/           # Data size/bandwidth
│   │   │   ├── datetime/       # Date and time
│   │   │   ├── engineering/    # Structural, materials, hydraulics
│   │   │   ├── finance/        # Financial calculators
│   │   │   ├── health/         # Health and fitness
│   │   │   ├── infrastructure/ # Virtualization, K8s, datacenter
│   │   │   ├── math/           # Mathematical calculators
│   │   │   ├── music/          # Music theory
│   │   │   ├── network/        # IP, subnet, network tools
│   │   │   ├── photo/          # Photography calculators
│   │   │   ├── physics/        # Physics converters
│   │   │   ├── realestate/     # Property and mortgage
│   │   │   ├── video/          # Video and media
│   │   │   └── web/            # Web development tools
│   │   ├── layout.tsx          # Root HTML layout
│   │   └── globals.css         # Global styles + CSS variables
│   ├── components/             # React components
│   │   ├── converter/          # Calculator-specific components
│   │   │   ├── input-field.tsx
│   │   │   ├── result-grid.tsx
│   │   │   ├── converter-layout.tsx
│   │   │   ├── pdf-export-button.tsx
│   │   │   ├── csv-export-button.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── subcategory-nav.tsx
│   │   │   └── index.ts        # Barrel export
│   │   ├── layout/             # Header, Footer, ThemeProvider, GlobalSearch
│   │   └── ui/                 # Base UI primitives (shadcn style)
│   ├── data/                   # Static/generated data files
│   │   ├── crypto-prices.json  # Build-time fetched crypto prices
│   │   ├── mining-data.json    # Build-time fetched mining data
│   │   └── search-index-*.json # Per-locale search indexes
│   ├── hooks/                  # React hooks (legacy pattern)
│   │   ├── use-converter.ts    # DEPRECATED - use Zustand stores
│   │   ├── use-url-state.ts
│   │   └── use-debounce.ts
│   ├── i18n/                   # i18n configuration
│   │   ├── config.ts           # Locale definitions
│   │   ├── navigation.ts       # Localized routing helpers
│   │   └── request.ts          # next-intl server setup
│   ├── lib/                    # Core utilities and business logic
│   │   ├── converters/         # Pure calculation functions (20 categories)
│   │   │   ├── automotive/
│   │   │   ├── chemistry/      # Includes formula-parser.ts, periodic-table.ts
│   │   │   ├── color/
│   │   │   ├── cooking/
│   │   │   ├── crypto/
│   │   │   ├── data/
│   │   │   ├── datetime/
│   │   │   ├── engineering/    # Includes materials-data.ts, beam-sections.ts
│   │   │   ├── finance/
│   │   │   ├── health/
│   │   │   ├── infrastructure/ # Multi-platform virtualization
│   │   │   ├── math/
│   │   │   ├── music/
│   │   │   ├── network/
│   │   │   ├── photo/
│   │   │   ├── physics/
│   │   │   ├── realestate/
│   │   │   ├── video/
│   │   │   └── web/
│   │   ├── registry/           # Category and converter metadata
│   │   │   ├── categories.ts   # 20 category definitions
│   │   │   ├── converters.ts   # Merges all category registries
│   │   │   └── *-converters.ts # Per-category converter metadata
│   │   └── utils/              # Shared utilities
│   │       ├── cn.ts           # Class name merging (Tailwind)
│   │       ├── pdf-export.ts   # PDF generation utility
│   │       ├── csv-export.ts   # CSV generation utility
│   │       └── url-params.ts   # Consolidated URL parameter extraction
│   ├── messages/               # Translation files
│   │   ├── en.json             # English (source of truth)
│   │   ├── fr.json             # French
│   │   ├── de.json             # German
│   │   └── it.json             # Italian
│   ├── stores/                 # Zustand state management
│   │   ├── calculator-store.ts # Factory function with URL sync
│   │   └── index.ts
│   └── types/                  # Shared TypeScript types
│       ├── converter.ts        # ConverterMeta, CalculationStep
│       └── index.ts
├── biome.json                  # Biome linter/formatter config
├── CLAUDE.md                   # AI assistant project guide
├── eslint.config.mjs           # ESLint configuration
├── Makefile                    # Local development shortcuts
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Directory Purposes

**src/app/[locale]/**

- Purpose: Next.js pages with dynamic locale routing
- Contains: Server component pages, client component calculators, 20 category directories
- Key files: `layout.tsx` (locale-specific layout), `page.tsx` (homepage)
- Pattern: `[locale]/[category]/[calculator]/page.tsx` + `[calculator]-calculator.tsx`

**src/app/[locale]/[category]/**

- Purpose: Category-specific calculators (20 categories)
- Contains: Calculator directories with page.tsx and component files
- Example: `src/app/[locale]/finance/mortgage/` contains `page.tsx` and `mortgage-calculator.tsx`
- Categories: automotive, chemistry, color, cooking, crypto, data, datetime, engineering, finance, health, infrastructure, math, music, network, photo, physics, realestate, video, web

**src/components/converter/**

- Purpose: Reusable calculator UI components
- Contains: InputField, OutputDisplay, ResultGrid, ConverterLayout, PdfExportButton, CsvExportButton, Breadcrumbs, SubcategoryNav
- Key files: `input-field.tsx`, `result-grid.tsx`, `converter-layout.tsx`, `index.ts` (barrel export)

**src/components/layout/**

- Purpose: Site-wide layout components
- Contains: Header, Footer, ThemeProvider, ThemeToggle, LocaleHtmlLang, GlobalSearch, SWRegistration
- Mounted in: `src/app/[locale]/layout.tsx`

**src/components/ui/**

- Purpose: Base UI primitives (shadcn/ui style with Radix UI)
- Contains: Button, Card, Input, Label, Select, Switch, Tabs, Badge, Command, Dialog, Checkbox, Popover, Progress, RadioGroup, Textarea
- Pattern: Single component per file, barrel export via index.ts

**src/lib/converters/**

- Purpose: Pure calculation functions organized by category
- Contains: 20 category subdirectories matching app structure
- Pattern: Each file exports interfaces (Input, Result) and pure function
- Example: `src/lib/converters/health/bmi.ts` exports `BmiInput`, `BmiResult`, `calculateBmi`
- Special files: `materials-data.ts`, `beam-sections.ts`, `periodic-table.ts`, `formula-parser.ts`

**src/lib/registry/**

- Purpose: Centralized metadata for categories and converters
- Contains: `categories.ts`, `converters.ts`, per-category registries
- Key files: `categories.ts` (20 categories with subcategories), `converters.ts` (merges all registries)

**src/lib/utils/**

- Purpose: Shared utility functions
- Contains: `cn()` for class name merging, `pdf-export.ts`, `csv-export.ts`, `url-params.ts`

**src/data/**

- Purpose: Static and generated data files
- Contains: Build-time fetched crypto prices, mining data, per-locale search indexes
- Generated by: `scripts/fetch-crypto-prices.ts`, `scripts/fetch-mining-data.ts`, `scripts/generate-search-index.ts`

**src/messages/**

- Purpose: i18n translation files (JSON)
- Contains: en.json, fr.json, de.json, it.json (Swiss locales)
- Structure: Nested JSON with common, categories, converters, calculator namespaces
- Important: Keys must use kebab-case to match converter IDs; all 4 locales must have identical structure

**src/stores/**

- Purpose: Zustand state management
- Contains: `calculator-store.ts` (factory function), `index.ts` (exports)
- Pattern: `createCalculatorStore<InputType, ResultType>()` with URL sync middleware

**src/hooks/**

- Purpose: React hooks (DEPRECATED legacy pattern)
- Contains: `use-converter.ts`, `use-url-state.ts`, `use-debounce.ts`
- Note: New calculators must use Zustand stores, not useConverter hook

**src/i18n/**

- Purpose: Internationalization configuration
- Contains: `config.ts` (locale definitions), `request.ts` (next-intl setup), `navigation.ts` (localized routing)
- Locales: en, fr, de, it (Swiss variants with CHF currency)

**src/types/**

- Purpose: Shared TypeScript type definitions
- Contains: `converter.ts` (ConverterMeta, CalculationStep), `index.ts`

**scripts/**

- Purpose: Build-time scripts
- Contains: Data fetching (crypto prices, mining data), search index generation, service worker generation, local packaging
- Run: Automatically via `prebuild` npm script, or manually

**docs/**

- Purpose: Project documentation
- Contains: Calculator guide, code style, i18n guide, engineering patterns, chemistry patterns, reference data guide, tool references (grepai, Serena)

## Key File Locations

**Entry Points:**

- `src/app/layout.tsx`: Root HTML layout
- `src/app/[locale]/layout.tsx`: Locale-specific layout with providers
- `src/app/[locale]/page.tsx`: Homepage
- `src/i18n/request.ts`: i18n request handler

**Configuration:**

- `next.config.ts`: Next.js config (static export, basePath for GitHub Pages)
- `biome.json`: Linter and formatter
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and scripts

**Core Logic:**

- `src/lib/converters/`: All calculation functions (167+ calculators)
- `src/lib/registry/categories.ts`: 20 category definitions
- `src/lib/registry/converters.ts`: Converter metadata registry
- `src/stores/calculator-store.ts`: Zustand store factory

**Testing:**

- No test files (testing not yet implemented; Vitest recommended)

## Where to Add New Code

**New Calculator:**

- Primary code: `src/app/[locale]/[category]/[slug]/[slug]-calculator.tsx` (client component)
- Page wrapper: `src/app/[locale]/[category]/[slug]/page.tsx` (server component)
- Calculation logic: `src/lib/converters/[category]/[slug].ts` (pure function)
- Registry entry: Add to `src/lib/registry/[category]-converters.ts`
- Translations: Add to all 4 files in `src/messages/` with key matching slug

**New Category:**

- Category definition: Add to `src/lib/registry/categories.ts`
- Category page: `src/app/[locale]/[category]/page.tsx`
- Category registry: Create `src/lib/registry/[category]-converters.ts`
- Converters directory: Create `src/lib/converters/[category]/`
- Import in registry: Add to `src/lib/registry/converters.ts` imports and merge
- Translations: Add to `categories` section in all 4 `src/messages/*.json`

**New Component/Module:**

- UI component: `src/components/ui/[name].tsx`
- Converter component: `src/components/converter/[name].tsx`
- Layout component: `src/components/layout/[name].tsx`
- Utility: `src/lib/utils/[name].ts`
- Store: `src/stores/[name]-store.ts` (preferred pattern)
- Hook: `src/hooks/use-[name].ts` (DEPRECATED — avoid)

---

_Structure analysis: 2026-01-29 (v5.0)_
