# Deploy as Static Export to GitHub Pages

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty is a calculator platform with 200+ tools. All calculations are pure client-side operations — no user accounts, no persistent server state, no database queries. We need a reliable, zero-cost hosting solution that can handle a large number of static pages and supports internationalization with 4 locale prefixes.

What hosting model and deployment platform should we use?

## Decision Drivers

- **Zero infrastructure cost** — No budget for server hosting
- **High availability without ops** — No servers to manage, patch, or scale
- **Static-friendly content** — All calculations are client-side; no API routes required
- **GitHub integration** — Source code already on GitHub
- **4 locales × 200+ calculators = 800+ pages** — Must handle large static page counts efficiently
- **CDN globally** — GitHub Pages uses Fastly CDN for worldwide distribution

## Considered Options

1. **Next.js static export + GitHub Pages** — `output: "export"`, deploy via `gh-pages` action
2. **Vercel** — Serverless Next.js hosting with edge functions
3. **Cloudflare Pages** — CDN-first static + edge workers
4. **Netlify** — Static site hosting with serverless functions
5. **Self-hosted (VPS/Docker)** — Full Next.js server on a VPS

## Decision Outcome

Chosen option: **"Next.js static export + GitHub Pages"** because all calculators are pure client-side, the cost is zero, deployment is fully automated via GitHub Actions, and the CDN distribution is global with zero operational overhead.

### Consequences

**Positive:**

- **Zero cost:** GitHub Pages free tier covers unlimited public repo deployments
- **Zero ops:** No server management, patching, or scaling concerns
- **Automated CI/CD:** GitHub Actions `static.yml` builds and deploys on every push to `main`
- **Version history:** Every deployment is a git commit; rollback is a revert
- **Global CDN:** Fastly CDN serves assets from edge nodes worldwide
- **URL structure clear:** `/converty/[locale]/[category]/[calculator]` maps 1:1 to file system

**Negative:**

- **No SSR:** Cannot use Next.js server-side rendering, API routes, middleware, or server actions
- **No dynamic data:** No real-time data; crypto prices and mining data must be fetched at build time
- **Build-time locale generation:** All 800+ pages must be pre-rendered at build time
- **`basePath` required:** GitHub Pages serves from `/converty` subdirectory, not root
- **Image optimization disabled:** `unoptimized: true` required (no server to optimize images on-demand)

**Neutral:**

- **Service worker required for offline:** PWA offline support needs a custom service worker (Workbox, see ADR-0002)
- **Search index pre-built:** Fuzzy search indexes must be generated at build time per locale

## Constraints Imposed by This Decision

```javascript
// next.config.js mandatory settings
const nextConfig = {
  output: "export",           // Static HTML/CSS/JS only
  basePath: "/converty",      // GitHub Pages subdirectory
  images: { unoptimized: true }, // No server-side image optimization
};
```

Any future feature must be implementable without server-side execution. This rules out:
- User authentication / sessions
- Server-side A/B testing
- Real-time collaborative features
- Dynamic API endpoints

## Links

- **CI/CD Workflow:** `.github/workflows/static.yml`
- **Next.js config:** `next.config.ts`
- **Build scripts:** `scripts/` (prebuild data fetching)
- **ADR-0002:** PWA service worker (consequence of static-only approach)
