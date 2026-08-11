# External Integrations

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## APIs & External Services

**Build-Time API Calls:**

- **CoinGecko API** (free tier, no API key)
  - Purpose: Fetch cryptocurrency prices for BTC, ETH, LTC, XRP, DOGE, ADA
  - Script: `scripts/fetch-crypto-prices.ts`
  - Output: `src/data/crypto-prices.json`
  - Fallback: Hardcoded fallback prices if API unavailable
  - Staleness warning: Displayed in UI when data older than 24 hours

- **Blockchain.info API** (free, no API key)
  - Purpose: Fetch Bitcoin mining difficulty and network hash rate
  - Script: `scripts/fetch-mining-data.ts`
  - Output: `src/data/mining-data.json`
  - Fallback: Hardcoded fallback data if API unavailable

**Runtime API Calls:**

- None - All data is fetched at build time and bundled as static JSON

## Data Storage

**Databases:**

- None - No database connectivity

**File Storage:**

- Local filesystem only (static export to `out/` directory)
- No cloud storage integration

**Client-Side Storage:**

- URL query parameters - State persistence via Zustand URL sync middleware
  - Implementation: `src/stores/calculator-store.ts`
  - Debounced URL updates (150ms, replaceState)
  - Enables shareable calculator links
- Service worker cache - Workbox caching strategies for offline access
  - HTML: NetworkFirst (7-day cache fallback)
  - Static assets: CacheFirst (content-hashed, immutable)
  - Fonts: StaleWhileRevalidate
- No localStorage, sessionStorage, or IndexedDB direct usage

**Caching:**

- Service worker (Workbox v7) - Runtime caching with strategy-based approach
- Browser HTTP caching (configured in `nginx.conf` for Docker deployment)
  - Static assets: 1 year cache
  - Other assets: 30 days
  - HTML: no cache

## Authentication & Identity

**Auth Provider:**

- None - No authentication system

**User Management:**

- Not applicable - Public static site with no user accounts

## Monitoring & Observability

**Error Tracking:**

- None - No error tracking service (e.g., Sentry)

**Analytics:**

- None - No analytics integration

**Logs:**

- nginx access logs (stdout) when containerized
- nginx error logs (stderr) when containerized
- No centralized logging service

**Performance Monitoring:**

- None - No APM or RUM tools
- Bundle analyzer available on-demand via `ANALYZE=true` environment variable

## CI/CD & Deployment

**Hosting:**

- GitHub Pages (primary)

  - Static hosting at `https://[username].github.io/converty/`
  - Deployment from `out/` directory
  - Workflow: `.github/workflows/static.yml`

- Alternative: Docker container with nginx
  - Image: nginx:alpine
  - Port: 8080 (non-root)
  - Healthcheck: HTTP GET on `/`
  - Multi-stage build reduces image size

**CI Pipeline:**

- GitHub Actions

  - Build workflow: `.github/workflows/static.yml`

    - Runs on: `main` branch push
    - Node.js 20
    - Steps: install -> type-check -> lint -> build -> deploy

  - Security workflow: `.github/workflows/security.yml`
    - Runs on: push, PR, weekly schedule (Monday 00:00 UTC)
    - npm audit (moderate level)
    - CodeQL analysis (JavaScript/TypeScript)
    - Trivy container scan
    - Trivy filesystem scan (vuln, secret, misconfig)
    - Biome security linting
    - Dependency review (PRs only)

**Build Tools:**

- GitHub Actions (ubuntu-latest runners)
- Make (local development via `Makefile`)

**Build Pipeline:**

1. `prebuild`: Fetch crypto prices + mining data + generate search indexes
2. `next build`: Static site generation (all 167+ calculator pages x 4 locales)
3. `generate-sw.js`: Workbox service worker with precache manifest

**Secrets Management:**

- Not applicable - No secrets required
- No .env files in use
- Build-time APIs use free tiers (no keys)

## Environment Configuration

**Required env vars:**

- None - Application requires no environment variables

**Optional env vars:**

- `ANALYZE=true` - Enable @next/bundle-analyzer
- `NEXT_TELEMETRY_DISABLED=1` - Used in Docker builds

**Secrets location:**

- Not applicable - No secrets, API keys, or credentials needed

**Runtime configuration:**

- Configuration is build-time only via `next.config.ts`
- `NODE_ENV` determines static export behavior (production only)

## Pre-commit Hooks

**Husky v9:**

- Location: `.husky/pre-commit`
- Triggers: Before every git commit
- Action: Runs lint-staged

**lint-staged:**

- Scope: Only staged files
- Action: Runs `biome check --write` on staged TypeScript/JavaScript files
- Performance: Keeps pre-commit under 3 seconds

## Search Infrastructure

**Build-Time Index Generation:**

- Script: `scripts/generate-search-index.ts`
- Output: Per-locale JSON indexes in `src/data/`
- Source: Registry metadata + translations
- Triggered: As part of `prebuild` npm script

**Runtime Search:**

- Library: Fuse.js 7.1.0 (~5KB gzipped)
- UI: cmdk 1.1.1 (Command palette)
- Trigger: Cmd+K keyboard shortcut
- Behavior: Fuzzy search across calculator names, descriptions, keywords
- Lazy-loaded: Search index loaded on first search activation

## PWA Infrastructure

**Service Worker:**

- Generator: workbox-build 7.4.0 (build-time)
- Registration: workbox-window 7.4.0 (runtime)
- Registration component: `src/components/layout/sw-registration.tsx`
- Production only: Service worker not registered in development

**Caching Strategies:**

- NetworkFirst: HTML/documents (7-day fallback)
- CacheFirst: Static assets (content-hashed, immutable)
- StaleWhileRevalidate: Fonts (instant rendering, background update)

**Install Prompt:**

- Platform detection: iOS needs manual instructions, Android/Desktop support programmatic prompt
- Root scope: `/` covers all locale routes

## Webhooks & Callbacks

**Incoming:**

- None - No webhook endpoints

**Outgoing:**

- None - No webhook calls to external services

## Third-Party Dependencies

**All external dependencies are npm packages:**

See `package.json` for complete list. Critical runtime dependencies:

- UI: Radix UI primitives, Lucide icons
- State: Zustand
- i18n: next-intl
- Styling: Tailwind CSS
- Charts: Recharts
- PDF: jsPDF
- Search: Fuse.js, cmdk
- Network: ipaddr.js
- Crypto: crypto-js, wallet-address-validator
- PWA: workbox-window
- Utilities: clsx, class-variance-authority, tailwind-merge

**Dependency Security:**

- Monitored via GitHub Dependabot (if enabled)
- npm audit in security workflow (moderate level)
- CodeQL analysis on every push
- Trivy filesystem scan (vulnerabilities, secrets, misconfig)
- Dependency review action on pull requests
- License restrictions: GPL-3.0, AGPL-3.0 denied

## Network Requirements

**Development:**

- No external network calls required (data files are pre-generated)
- Local development server: `localhost:3000`

**Build-Time:**

- CoinGecko API: `api.coingecko.com` (optional, has fallback)
- Blockchain.info API: `blockchain.info` (optional, has fallback)

**Production:**

- Static assets served via CDN (GitHub Pages or nginx)
- All resources bundled at build time
- No runtime API calls
- Workbox CDN (`storage.googleapis.com`) loaded via importScripts in service worker

---

_Integration audit: 2026-01-29 (v5.0)_
