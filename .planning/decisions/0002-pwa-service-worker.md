# Use Workbox for Service Worker with Production-Only Registration

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty is a static site (Next.js with `output: "export"`) containing 117+ calculators that users access on mobile devices and desktops. To provide a Progressive Web App experience, we need:

- Offline calculator functionality (users can calculate without internet)
- "Add to Home Screen" installation on mobile devices
- Fast page loads through intelligent caching
- Minimal impact on development workflow (hot reload must work)

How should we implement service worker functionality for a static Next.js site while maintaining developer experience?

## Decision Drivers

- **Static export constraint** - Next.js output: "export" eliminates server-side features, requires static file approach
- **Offline-first UX** - Calculators should work offline after first visit (core PWA value proposition)
- **Mobile install support** - Users should be able to install on iOS (manual) and Android/Desktop (programmatic prompt)
- **Development workflow** - Service worker caching must not break hot reload during development
- **Caching strategy** - Need different strategies for HTML (fresh content) vs static assets (aggressive caching)
- **Build automation** - Precache manifest should generate automatically, not manually maintained

## Considered Options

1. **Workbox generateSW with post-build script** - Workbox generates complete SW file after Next.js build
2. **Workbox injectManifest with custom SW template** - Manual SW file with Workbox injecting precache manifest
3. **Manual service worker without framework** - Hand-written SW using Cache API directly
4. **next-pwa plugin** - Webpack plugin for service worker generation

## Decision Outcome

Chosen option: **"Workbox generateSW with post-build script"** because it provides automated precache manifest generation (838 files), supports static exports, and requires no SW template maintenance. The post-build approach fits Next.js static export workflow where files must exist before SW generation.

### Consequences

**Positive:**

- **Automated precaching:** Workbox scans 838 files and generates optimized manifest automatically
- **Intelligent caching strategies:** NetworkFirst for HTML, CacheFirst for static assets, StaleWhileRevalidate for fonts
- **Production-only registration:** SW registers only in production, preserving hot reload in development
- **No template maintenance:** generateSW creates complete SW file, no manual updates needed
- **Static export compatible:** Post-build script works perfectly with Next.js static output
- **Cross-platform install:** Platform detection provides iOS manual instructions, Android/Desktop programmatic prompt

**Negative:**

- **Build time increase:** Post-build script adds ~2-3 seconds to build process
- **Less customization:** generateSW offers less control than injectManifest (but sufficient for our needs)
- **CDN dependency:** Workbox loaded via importScripts from CDN (standard v7 pattern, but adds external dependency)
- **Debugging complexity:** Service worker debugging requires production build testing

**Neutral:**

- **838 files precached:** Large precache manifest (~150KB gzipped), but ensures complete offline functionality
- **Root scope required:** SW at `/sw.js` with scope `/` covers all locale routes (/en/, /fr/, /de/, /it/)

## Pros and Cons of the Options

### Workbox generateSW with post-build script

- **Good:** Fully automated - no manifest maintenance required
- **Good:** Standard Workbox v7 pattern with CDN loading via importScripts
- **Good:** Works perfectly with Next.js static export (files exist before SW generation)
- **Good:** Production-only registration preserves development hot reload
- **Good:** Post-build script integrates cleanly: `next build && node scripts/generate-sw.js`
- **Bad:** Less customization than injectManifest (can't modify SW internals)
- **Bad:** Build-time coupling (must regenerate SW after every build)
- **Neutral:** 838-file precache manifest (large but ensures offline functionality)

### Workbox injectManifest with custom SW template

- **Good:** Full control over service worker code and logic
- **Good:** Can add custom caching strategies and handlers
- **Good:** Template allows comments and custom event listeners
- **Bad:** Requires maintaining SW template file (more complexity)
- **Bad:** Template must use `self.__WB_MANIFEST` placeholder correctly
- **Bad:** More opportunity for errors (syntax, API misuse)
- **Neutral:** Same build-time generation requirement as generateSW

### Manual service worker without framework

- **Good:** No external dependencies (complete control)
- **Good:** Smaller SW file size (no Workbox library)
- **Bad:** Must manually implement caching strategies (NetworkFirst, CacheFirst, etc.)
- **Bad:** Must manually maintain precache manifest (838 files!)
- **Bad:** Cache versioning logic must be hand-written
- **Bad:** Higher risk of bugs (Cache API is low-level)
- **Bad:** Loses Workbox's battle-tested cache expiration and size limiting

### next-pwa plugin

- **Good:** Next.js-specific integration, familiar patterns
- **Good:** Webpack plugin integrates with Next.js build
- **Bad:** Designed for Next.js server mode, static export support unclear
- **Bad:** Adds webpack complexity to build process
- **Bad:** Less flexible than direct Workbox usage
- **Bad:** Additional dependency layer on top of Workbox

## Links

- **Phase 4 Plan 1 Summary (Manifest & Icons):** `.planning/phases/04-progressive-web-app/04-01-SUMMARY.md`
- **Phase 4 Plan 2 Summary (Service Worker):** `.planning/phases/04-progressive-web-app/04-02-SUMMARY.md`
- **Phase 4 Plan 3 Summary (Registration & Build):** `.planning/phases/04-progressive-web-app/04-03-SUMMARY.md`
- **Service Worker:** `public/sw.js` (Workbox CDN loading, caching strategies)
- **Build Script:** `scripts/generate-sw.js` (Post-build Workbox generateSW)
- **Registration:** `src/lib/pwa/register-sw.ts` (Production-only registration)
- **Install Prompt:** `src/components/ui/install-prompt.tsx` (iOS/Android detection)
- **STATE.md Decisions:** Lines 58-69 (Workbox decisions, caching strategies, platform detection)

## Implementation Details

### Caching Strategies

**NetworkFirst for HTML (Documents):**

- **Rationale:** Users expect latest calculator features when online, but offline functionality critical for PWA
- **Configuration:** 7-day cache expiration, max 50 pages cached
- **Impact:** Fresh content when online with cache fallback for offline

**CacheFirst for Static Assets:**

- **Rationale:** Next.js content-hashes static assets (e.g., `_next/static/chunks/main-abc123.js`) making them immutable
- **Configuration:** 30-day cache expiration, max 100 entries
- **Impact:** Instant asset loading from cache, aggressive caching optimal for immutable files

**StaleWhileRevalidate for Fonts:**

- **Rationale:** Fonts rarely change, users shouldn't wait for network validation
- **Configuration:** Background updates, instant rendering from cache
- **Impact:** Balanced freshness and performance

### Platform Detection

**iOS Install Prompt:**

- Safari on iOS doesn't support `beforeinstallprompt` event (platform limitation)
- Shows manual instructions: "Tap Share button → Add to Home Screen"
- Detects iOS via user agent check

**Android/Desktop Install Prompt:**

- Listens for `beforeinstallprompt` event
- Stores event and shows custom install button
- Programmatic prompt via `event.prompt()`

### Production-Only Registration

**Problem:** Service worker caching breaks Next.js hot reload in development

**Solution:** Environment check before registration

```typescript
if (process.env.NODE_ENV === "production") {
  navigator.serviceWorker.register("/sw.js", { scope: "/" });
}
```

**Why:** Development needs fresh code on every change. Service worker would cache old bundles and prevent hot reload updates from appearing.

### Build Integration

**Script:** `package.json` build command

```json
"build": "next build && node scripts/generate-sw.js"
```

**Why:** Workbox needs static files to exist before generating precache manifest. Next.js creates files in `out/`, then script scans directory and injects manifest into SW file.

### Root Scope Requirement

**Scope:** `/` (root)

**Why:** Converty uses locale routing (`/en/`, `/fr/`, `/de/`, `/it/`). Service worker at root scope intercepts requests for all locales. If scope was `/en/`, would miss `/fr/` requests.

## Verification Results

**Build Output:**

- Service worker generated at `out/sw.js` with 838 files in precache manifest
- Build script completes successfully with "Service worker generated" message

**Functional Testing:**

- Service worker registers in production build
- Offline detection banner shows/hides correctly
- Calculators work offline after initial cache
- Install prompt appears on compatible browsers (Android/Desktop Chrome)
- iOS shows manual install instructions

**Performance:**

- Build time increase: ~2-3 seconds for SW generation
- Precache manifest: ~150KB gzipped (838 files)
- Cache strategies verified via Chrome DevTools → Application → Cache Storage
