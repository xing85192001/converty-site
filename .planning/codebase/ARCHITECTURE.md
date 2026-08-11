# Architecture

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## Pattern Overview

**Overall:** Static Site Generation (SSG) with Next.js 16 App Router + Server/Client Component Split

**Key Characteristics:**

- Next.js 16 with static export for GitHub Pages deployment
- Server components for metadata and data fetching, client components for interactivity
- Pure function layer (calculation logic) completely decoupled from UI layer
- Centralized metadata registry system for dynamic routing and categorization
- Multi-locale static generation with next-intl for 4 Swiss languages (en, fr, de, it)
- 167+ calculators across 20 categories
- PDF/CSV export with zero external dependencies (native Blob API for CSV, jsPDF for PDF)
- Code splitting via Next.js dynamic imports for all calculator pages
- Build-time data fetching for crypto prices and mining data (CoinGecko, blockchain.info)
- Client-side fuzzy search with pre-built indexes per locale (Fuse.js)
- PWA support with Workbox service worker (offline-capable)

## Layers

**Presentation Layer (React Components):**

- Purpose: Render UI, handle user interaction, display results
- Location: `src/app/[locale]/`, `src/components/`
- Contains: Server components (pages), client components (calculators), UI primitives
- Depends on: Business Logic Layer, State Management Layer, i18n Layer
- Used by: End users via browser

**Business Logic Layer (Pure Functions):**

- Purpose: Perform calculations, transformations, validations
- Location: `src/lib/converters/`
- Contains: Pure TypeScript functions organized by 20 categories (automotive, chemistry, color, cooking, crypto, data, datetime, engineering, finance, health, infrastructure, math, music, network, photo, physics, realestate, video, web)
- Depends on: Nothing (framework-agnostic)
- Used by: Presentation Layer, State Management Layer
- Special patterns:
  - Engineering: ASTM material databases, AISC beam sections, SVG diagram generation
  - Chemistry: Custom formula parser, IUPAC 2024 atomic weights, periodic table data
  - Infrastructure: Multi-platform virtualization (VMware, Hyper-V, Proxmox, XCP-ng)
  - Network: IPv4/IPv6 calculations with ipaddr.js, BigInt for large host counts
  - Crypto: Build-time price data, WebCrypto + crypto-js for hashing

**State Management Layer:**

- Purpose: Manage calculator state, sync to URL, handle validation
- Location: `src/stores/`, `src/hooks/`
- Contains: Zustand stores (standard), legacy useConverter hook (deprecated)
- Depends on: Business Logic Layer
- Used by: Client components
- Pattern: `createCalculatorStore<Input, Result>()` factory with URL sync middleware

**Metadata Registry Layer:**

- Purpose: Centralized metadata for categories and calculators
- Location: `src/lib/registry/`
- Contains: Category definitions (20 categories with subcategories), converter metadata, helper functions
- Depends on: Nothing
- Used by: Presentation Layer, routing, search, navigation

**Search Layer:**

- Purpose: Client-side fuzzy search across all calculators
- Location: `src/components/layout/global-search.tsx`, `src/data/search-index-*.json`
- Contains: Command palette (cmdk), Fuse.js integration, pre-built locale indexes
- Depends on: Registry Layer (build-time), Fuse.js (runtime)
- Used by: Header component (Cmd+K shortcut)

**Export Layer:**

- Purpose: Export calculator results as PDF or CSV
- Location: `src/lib/utils/pdf-export.ts`, `src/lib/utils/csv-export.ts`, `src/components/converter/`
- Contains: PDF generation (jsPDF), CSV generation (native Blob API), export buttons
- Depends on: Business Logic Layer results
- Used by: Calculator components

**Internationalization Layer:**

- Purpose: Multi-locale support with static generation
- Location: `src/i18n/`, `src/messages/`
- Contains: Locale config, translation files (en.json, fr.json, de.json, it.json), next-intl setup
- Depends on: Nothing
- Used by: All presentation components

**Styling Layer:**

- Purpose: Consistent design system and theming
- Location: `src/app/globals.css`, `src/components/ui/`, Tailwind config
- Contains: CSS variables for light/dark themes, Radix UI primitives, shadcn/ui style components
- Depends on: Nothing
- Used by: All components

## Data Flow

**Static Page Generation Flow:**

1. Next.js reads `generateStaticParams()` from all page.tsx files
2. For each locale (en, fr, de, it), generates static HTML pages
3. Pages load translations from `src/messages/[locale].json` via next-intl
4. Metadata comes from registry (`src/lib/registry/`) + translations
5. Static HTML includes all server-rendered content
6. Calculator components loaded via dynamic imports (code splitting)

**Build-Time Data Flow:**

1. `prebuild` scripts fetch crypto prices (CoinGecko) and mining data (blockchain.info)
2. Data written to `src/data/` as JSON files with timestamps
3. Search indexes generated per locale from registry metadata
4. Workbox generates service worker with precache manifest post-build

**Calculator Interaction Flow:**

1. User interacts with InputField component (client component)
2. InputField calls `setValue()` from Zustand store
3. Store updates state, syncs to URL query params (debounced)
4. Store calls calculation function from `src/lib/converters/[category]/[name].ts`
5. Calculation function returns result or null (if invalid)
6. Result propagates to UI via store state
7. OutputDisplay and ResultGrid components render updated results
8. Export buttons (PDF/CSV) available when results are present

**State Management:**

- Zustand stores (standard): `createCalculatorStore()` factory creates store with URL sync middleware
- Legacy useConverter hook: Deprecated, still used in some older calculators
- Both patterns: values -> calculate -> result, with automatic URL sync for shareability

## Key Abstractions

**ConverterMeta:**

- Purpose: Metadata for each calculator (id, slug, category, subcategory, keywords, icon, featured)
- Examples: `src/lib/registry/health-converters.ts`, `src/lib/registry/finance-converters.ts`
- Pattern: Record<string, ConverterMeta> exported per category, merged in `converters.ts`

**Category:**

- Purpose: Top-level grouping with optional subcategories
- Examples: `src/lib/registry/categories.ts`
- Pattern: Array of Category objects with id, slug, name, description, icon, subcategories[]
- Count: 20 categories (automotive, chemistry, color, cooking, crypto, data, datetime, engineering, finance, health, infrastructure, math, music, network, photo, physics, realestate, video, web)

**Calculator Store:**

- Purpose: Generic state container for calculator inputs/outputs
- Examples: `src/stores/calculator-store.ts` (factory), `src/app/[locale]/datetime/age/age-calculator.tsx` (usage)
- Pattern: `createCalculatorStore<InputType, ResultType>({ name, initialValues, calculate, validate? })`

**Pure Calculation Function:**

- Purpose: Framework-agnostic business logic
- Examples: `src/lib/converters/datetime/age.ts`, `src/lib/converters/health/bmi.ts`
- Pattern: `export function calculateX(input: XInput): XResult | null`

**Reference Data Modules:**

- Purpose: Domain-specific constants and lookup tables
- Examples: `src/lib/converters/engineering/materials-data.ts` (ASTM materials), `src/lib/converters/chemistry/periodic-table.ts` (IUPAC 2024)
- Pattern: Typed constants with exhaustive coverage, sourced from standards bodies

**Converter Components:**

- Purpose: Reusable UI building blocks for calculators
- Examples: `src/components/converter/input-field.tsx`, `src/components/converter/result-grid.tsx`, `src/components/converter/pdf-export-button.tsx`
- Pattern: Composable components that accept labels from translations

## Entry Points

**Root HTML Entry:**

- Location: `src/app/layout.tsx`
- Triggers: Next.js build process
- Responsibilities: HTML shell, font loading, suppress hydration warning

**Locale Layout Entry:**

- Location: `src/app/[locale]/layout.tsx`
- Triggers: For each locale during static generation
- Responsibilities: NextIntlClientProvider setup, theme provider, Header/Footer layout, metadata generation, service worker registration

**Homepage Entry:**

- Location: `src/app/[locale]/page.tsx`
- Triggers: Root path for each locale (e.g., /en, /fr)
- Responsibilities: Display category grid, load category metadata from registry

**Category Pages:**

- Location: `src/app/[locale]/[category]/page.tsx` (e.g., `src/app/[locale]/finance/page.tsx`)
- Triggers: Category paths (e.g., /en/finance)
- Responsibilities: List calculators in category, grouped by subcategory

**Calculator Pages:**

- Location: `src/app/[locale]/[category]/[calculator]/page.tsx`
- Triggers: Calculator-specific paths (e.g., /en/finance/mortgage)
- Responsibilities: Load metadata, render ConverterLayout, mount calculator component in Suspense with dynamic import

**i18n Request Entry:**

- Location: `src/i18n/request.ts`
- Triggers: Every page request during build
- Responsibilities: Load appropriate translation file based on locale

## Error Handling

**Strategy:** Graceful degradation with null returns and validation

**Patterns:**

- Calculation functions return `null` for invalid inputs (no throwing)
- Network/engineering functions may throw for parsing errors (caller catches)
- Stores/hooks check for null results before rendering output
- Validation errors stored in `errors` object by field key
- `safeParsePositive` / `safeParseNonNegative` preserve previous valid value during typing
- UI shows validation messages when errors present
- Client-side validation prevents invalid submissions
- Server components use `notFound()` for invalid routes/locales
- Build-time data fetches have fallback values if API unavailable

## Cross-Cutting Concerns

**Logging:** Browser console only (no backend)

**Validation:** Optional validate function in stores/hooks, per-field error messages

**Authentication:** Not applicable (public static site)

**Theming:** CSS variables with next-themes, light/dark mode support, system preference detection

**URL State Sync:** Automatic via Zustand middleware, debounced at 150ms, uses replaceState (not pushState)

**Static Generation:** All pages generated at build time via `generateStaticParams()`, no runtime server

**Code Splitting:** All 167+ calculator pages use Next.js dynamic imports with CalculatorSkeleton fallback

**PWA:** Workbox service worker with NetworkFirst (HTML), CacheFirst (static assets), StaleWhileRevalidate (fonts)

**Security:** CodeQL analysis, Trivy scanning, npm audit, Biome security linting, Map-based URL parameters (no prototype pollution)

---

_Architecture analysis: 2026-01-29 (v5.0)_
