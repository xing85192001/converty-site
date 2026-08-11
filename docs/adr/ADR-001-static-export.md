# ADR-001: Static Export via Next.js

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Converty needs a hosting strategy that is:
- Zero cost to operate indefinitely
- Requires no server maintenance or on-call rotation
- Delivers fast page loads globally
- Stays available even during deployment downtime

GitHub Pages was identified as the ideal free hosting platform, but it only serves static files — no Node.js server, no API execution, no SSR.

## Decision

Use Next.js `output: "export"` (static HTML export) as the build target. All pages are pre-rendered at build time into the `./out` directory and deployed as pure HTML/CSS/JS.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  basePath: "/converty",
  trailingSlash: true,
  images: { unoptimized: true },
};
```

## Consequences

**Positive:**
- Zero hosting cost (GitHub Pages free tier)
- No backend to maintain, patch, or scale
- CDN-served pages with sub-100ms TTFB globally
- All 772 calculator pages (193 calculators × 4 locales) pre-rendered
- Full crawlability by search engines (no JavaScript rendering required)

**Negative / Constraints:**
- No Server-Side Rendering (SSR), API routes, server actions, or middleware
- No real-time data — all external data (crypto prices, mining rates, CPU benchmarks) must be fetched at build time via prebuild scripts
- Build time grows with every new calculator (~10–15 min for full build)
- Dynamic features (user accounts, saved history) are architecturally excluded

**Mitigations:**
- Prebuild scripts (`fetch-crypto-prices.ts`, `fetch-mining-data.ts`, `fetch-spec-cpu-data.ts`) pull live data before static generation
- URL state synchronization provides shareability without a backend
- PWA service worker enables offline use after first visit
