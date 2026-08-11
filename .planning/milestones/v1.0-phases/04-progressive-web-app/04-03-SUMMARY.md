---
phase: 04-progressive-web-app
plan: 03
subsystem: pwa
tags: [workbox, service-worker, pwa, offline, install-prompt]

# Dependency graph
requires:
  - phase: 04-01
    provides: PWA manifest and icons
  - phase: 04-02
    provides: Service worker and offline detection
provides:
  - Service worker registration infrastructure (production-only)
  - Build-time SW generation with Workbox precaching
  - Install prompt component with iOS/Android detection
  - Complete PWA integration in layout
affects: [deployment, testing, future-pwa-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Production-only SW registration with environment checks"
    - "Client component boundary for browser API usage"
    - "Post-build script for SW generation"
    - "Platform detection for progressive enhancement"

key-files:
  created:
    - src/lib/pwa/register-sw.ts
    - src/app/[locale]/sw-registration.tsx
    - src/components/ui/install-prompt.tsx
    - scripts/generate-sw.js
  modified:
    - src/app/[locale]/layout.tsx
    - package.json

key-decisions:
  - "Production-only SW registration to avoid caching breaking hot reload in dev"
  - "Separate client component (SWRegistration) for clean server/client boundary"
  - "generateSW approach instead of injectManifest for simplicity"
  - "Platform detection for iOS vs Android/Desktop Chrome install UX"
  - "Post-build script integration (next build && node scripts/generate-sw.js)"

patterns-established:
  - "Browser API usage: Separate client components with 'use client' directive"
  - "PWA registration: Single component rendering all PWA UI (offline banner + install prompt)"
  - "Build integration: Post-build script pattern for SW generation"

# Metrics
duration: 4.3min
completed: 2026-01-17
---

# Phase 04 Plan 03: PWA Registration & Build Integration Summary

**Complete PWA implementation with automatic service worker registration, build-time precaching manifest (838 files), and cross-platform install prompt**

## Performance

- **Duration:** 4.3 min
- **Started:** 2026-01-17T17:29:30Z
- **Completed:** 2026-01-17T17:33:46Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Service worker registration infrastructure with production-only guard
- Build integration script generates optimized SW with 838 files precached
- Install prompt component with iOS manual instructions and Android/Desktop programmatic prompt
- Complete PWA integration in locale layout with offline detection and install UI

## Task Commits

Each task was committed atomically:

1. **Task 3: Create install prompt component with iOS detection** - `3cb5d8d` (feat)
2. **Task 1: Create service worker registration and integrate into layout** - `cd0d3b4` (feat)
3. **Task 2: Create build integration script for service worker** - `4de9b6c` (feat)

## Files Created/Modified

### Created

- `src/lib/pwa/register-sw.ts` - Service worker registration with production-only and browser support checks
- `src/app/[locale]/sw-registration.tsx` - Client component rendering OfflineBanner and InstallPrompt, calls registerServiceWorker
- `src/components/ui/install-prompt.tsx` - Cross-platform install prompt with iOS detection and beforeinstallprompt handling
- `scripts/generate-sw.js` - Post-build script using Workbox generateSW for precache manifest

### Modified

- `src/app/[locale]/layout.tsx` - Added SWRegistration component inside ThemeProvider
- `package.json` - Updated build script to run SW generation after Next.js build

## Decisions Made

**1. Production-only service worker registration**

- **Rationale:** Service worker caching breaks hot reload in development. Development needs fresh code on every change. This is a known PWA pitfall (see 04-RESEARCH.md Pitfall 5).
- **Implementation:** Check `process.env.NODE_ENV === 'production'` before calling navigator.serviceWorker.register()

**2. Separate client component for SW registration**

- **Rationale:** Root layout is server component. Service worker registration requires browser APIs (navigator, useEffect) only available in client components. Separate client component provides clean boundary.
- **Implementation:** Created `src/app/[locale]/sw-registration.tsx` with "use client" directive

**3. generateSW instead of injectManifest**

- **Rationale:** Simpler approach that creates complete SW file with precaching. No template needed. Perfect for static exports with predictable file structure.
- **Implementation:** Workbox's generateSW creates out/sw.js with precacheAndRoute + runtime caching strategies

**4. Post-build script integration**

- **Rationale:** Workbox needs static files to exist before generating precache manifest. Next.js build creates files in out/, then script scans and injects manifest.
- **Implementation:** `build: "next build && node scripts/generate-sw.js"`

**5. Platform detection for install prompt**

- **Rationale:** iOS doesn't support beforeinstallprompt event - must show manual instructions. Android/Desktop Chrome support programmatic prompt.
- **Implementation:** Detect iOS via user agent, listen for beforeinstallprompt on other platforms, show appropriate UI for each

**6. Root scope for service worker**

- **Rationale:** Converty uses locale routing (/en/, /fr/, /de/, /it/). Service worker at root scope (/) intercepts all requests. If scope was /en/, would miss /fr/ requests.
- **Implementation:** navigator.serviceWorker.register('/sw.js', { scope: '/' })

**7. Combined PWA UI in one component**

- **Rationale:** SW registration, offline detection, and install prompt are all PWA concerns. Grouping in SWRegistration component keeps related functionality together and ensures they're rendered together.
- **Implementation:** SWRegistration renders both <OfflineBanner /> and <InstallPrompt />

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks executed smoothly with expected behavior.

## Next Phase Readiness

**PWA infrastructure complete:**

- ✓ Manifest with icons (04-01)
- ✓ Service worker with caching strategies (04-02)
- ✓ Offline detection UI (04-02)
- ✓ Service worker registration (04-03)
- ✓ Build integration with precaching (04-03)
- ✓ Install prompt UI (04-03)

**Phase 4 complete. Ready for Phase 5 (next roadmap phase).**

**Verification steps for production deployment:**

1. Build production bundle: `npm run build`
2. Verify out/sw.js exists with precache manifest
3. Serve production build and check console for "Service worker registered" message
4. Go offline and verify calculators work from cache
5. Check for install prompt on compatible browsers

**Known limitations:**

- Service worker only registers in production builds (by design)
- iOS install prompt requires manual "Add to Home Screen" (platform limitation)
- First visit requires network to cache resources (standard PWA behavior)

---

_Phase: 04-progressive-web-app_
_Completed: 2026-01-17_
