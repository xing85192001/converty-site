# Technology Stack

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## Languages

**Primary:**

- TypeScript 5.9.3 - All source code (`src/`)
  - Strict mode enabled
  - Target: ES2017
  - Module resolution: bundler

**Secondary:**

- JavaScript (ESM) - Configuration files only (eslint.config.mjs, postcss.config.mjs)
- JavaScript - Build scripts (`scripts/generate-sw.js`, `scripts/package-local.js`)

## Runtime

**Environment:**

- Node.js 20+ (specified in GitHub Actions CI)

**Package Manager:**

- npm (latest)
- Lockfile: `package-lock.json` committed

## Frameworks

**Core:**

- Next.js 16.1.1 - App Router with static export (`output: "export"`)

  - Static site generation (SSG) only
  - Locale routing via `[locale]` segments
  - next-intl plugin for i18n
  - GitHub Pages deployment target (base path: `/converty`)
  - Dynamic imports for code splitting (all 167+ calculator pages)

- React 19.2.3 - UI framework
  - react-dom 19.2.3
  - JSX transform: `react-jsx`

**Styling:**

- Tailwind CSS 4.1.18 - Utility-first CSS framework
  - PostCSS plugin: `@tailwindcss/postcss` 4.1.18
  - autoprefixer 10.4.23
  - CSS variables for theming

**UI Components:**

- Radix UI - Accessible UI primitives
  - @radix-ui/react-checkbox 1.3.3
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-label 2.1.8
  - @radix-ui/react-popover 1.1.15
  - @radix-ui/react-progress 1.1.8
  - @radix-ui/react-radio-group 1.3.8
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-switch 1.2.6
  - @radix-ui/react-tabs 1.1.13

**State Management:**

- Zustand 5.0.10 - Lightweight state management
  - Custom calculator store pattern in `src/stores/calculator-store.ts`
  - Built-in URL sync middleware for shareable links

**Internationalization:**

- next-intl 4.7.0 - i18n for Next.js
  - 4 locales: en, fr, de, it (Swiss variants)
  - Server and client component support
  - Locale-based formatting (CHF currency)

**Theming:**

- next-themes 0.4.6 - Dark/light mode toggle

**Search:**

- Fuse.js 7.1.0 - Client-side fuzzy search (~5KB gzipped)
  - Pre-built search indexes per locale (generated at build time)
  - Command palette via cmdk 1.1.1

**Visualization:**

- Recharts 3.6.0 - React chart library for data visualization

**Document Generation:**

- jsPDF 4.0.0 - Client-side PDF generation

**Network:**

- ipaddr.js 2.3.0 - IPv4/IPv6 address manipulation (55M+ weekly downloads)

**Cryptography:**

- crypto-js 4.2.0 - MD5 hashing (WebCrypto used for SHA algorithms)
- wallet-address-validator 0.2.4 - Cryptocurrency address validation (30+ currencies)

**PWA:**

- workbox-window 7.4.0 - Service worker registration (runtime)
- workbox-build 7.4.0 - Service worker generation (build-time, dev dependency)

**Icons:**

- Lucide React 0.562.0 - Icon library

**Build/Dev:**

- @swc/helpers 0.5.18 - SWC runtime helpers
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.23 - CSS vendor prefixing

**Code Quality:**

- @biomejs/biome 2.3.11 - Linting and formatting
- ESLint 9.39.2 - Additional linting
  - eslint-config-next 16.1.1
  - eslint-plugin-react 7.37.5
  - eslint-plugin-react-hooks 7.0.1
  - typescript-eslint 8.53.0
- Husky 9.1.7 - Git hooks
- lint-staged 16.2.7 - Pre-commit staged file linting
- @lingual/i18n-check 0.8.19 - Translation validation

**Bundle Analysis:**

- @next/bundle-analyzer 16.1.3 - Bundle size analysis (enabled via ANALYZE=true)

**Testing:**

- None - No test framework configured (Vitest recommended for future)

## Key Dependencies

**Critical:**

- next 16.1.1 - Framework core
- react 19.2.3 - UI library
- zustand 5.0.10 - State management
- next-intl 4.7.0 - Internationalization

**Infrastructure:**

- class-variance-authority 0.7.1 - CVA for variant-based components
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Tailwind class merging
- cmdk 1.1.1 - Command menu component

**Domain-Specific:**

- ipaddr.js 2.3.0 - Network calculators
- crypto-js 4.2.0 - Crypto calculators (MD5)
- wallet-address-validator 0.2.4 - Crypto address validation
- fuse.js 7.1.0 - Global search
- jspdf 4.0.0 - PDF export

## Configuration

**Environment:**

- `ANALYZE=true` - Enable bundle analyzer (optional)
- `NEXT_TELEMETRY_DISABLED=1` - Disable telemetry in Docker builds
- No other environment variables required

**Build:**

- `next.config.ts` - Next.js configuration
  - Static export in production
  - basePath: `/converty` (GitHub Pages)
  - unoptimized images
  - next-intl plugin
- Build pipeline: `prebuild` (fetch data + generate indexes) -> `next build` -> `generate-sw.js`

**TypeScript:**

- `tsconfig.json` - TypeScript configuration
  - Strict mode: enabled
  - Path aliases: `@/*` -> `./src/*`
  - Incremental compilation

**Linting:**

- `biome.json` - Biome configuration

  - Formatter: 2-space indent, 100 line width
  - Linter: security rules enabled
  - Organizes imports automatically

- `eslint.config.mjs` - ESLint 9 flat config
  - TypeScript ESLint
  - React plugin
  - React Hooks plugin
  - Next.js plugin

**Pre-commit:**

- `.husky/pre-commit` - Runs lint-staged
- `lint-staged` config in `package.json` - Runs Biome on staged files

**Styling:**

- Tailwind CSS 4 (configured via `@tailwindcss/postcss` plugin)
- `postcss.config.mjs` - PostCSS configuration

## Platform Requirements

**Development:**

- Node.js 20 or higher
- npm
- Operating System: macOS, Linux, Windows (via WSL recommended)

**Production:**

- Static hosting (GitHub Pages)
- No server-side runtime required
- Can be containerized with nginx (see `Dockerfile`)

**Container:**

- Docker multi-stage build
  - Base: node:22-alpine (deps and builder stages)
  - Runtime: nginx:alpine
  - Port: 8080 (non-root nginx)
  - Healthcheck included

---

_Stack analysis: 2026-01-29 (v5.0)_
