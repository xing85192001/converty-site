---
phase: 04-progressive-web-app
plan: 01
subsystem: infra
tags: [pwa, manifest, icons, sharp, next.js, static-export]

# Dependency graph
requires:
  - phase: none
    provides: standalone PWA foundation
provides:
  - PWA manifest configuration (app/manifest.ts)
  - Icon generation automation (scripts/generate-icons.js)
  - 4 PWA icon sizes (192x192, 512x512, maskable, apple-touch-icon)
affects: [04-02-service-worker, 04-03-install-prompt]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Next.js App Router manifest.ts for type-safe PWA configuration
    - Automated icon generation using Sharp library
    - force-static export for Next.js static site compatibility

key-files:
  created:
    - src/app/manifest.ts
    - scripts/generate-icons.js
    - public/icons/icon-192x192.png
    - public/icons/icon-512x512.png
    - public/icons/icon-192-maskable.png
    - public/icons/apple-touch-icon.png
  modified: []

key-decisions:
  - "Use Next.js App Router manifest.ts instead of static manifest.json for type safety"
  - "Automate icon generation with Sharp to ensure correct dimensions and maskable safe zones"
  - "Create placeholder gradient icon (replaceable with branded assets later)"
  - "Add force-static export declaration for Next.js static export compatibility"

patterns-established:
  - "PWA manifest as TypeScript function returning MetadataRoute.Manifest type"
  - "Automated icon generation from programmatic source (80% safe zone for maskable icons)"

# Metrics
duration: 3min
completed: 2026-01-17
---

# Phase 04 Plan 01: PWA Manifest & Icons Summary

**Type-safe PWA manifest with automated icon generation (4 sizes including maskable) enabling browser "Add to Home Screen" installation**

## Performance

- **Duration:** 3 min 11 sec
- **Started:** 2026-01-17T18:22:43Z
- **Completed:** 2026-01-17T18:25:54Z
- **Tasks:** 2
- **Files created:** 7

## Accomplishments

- Generated all 4 required PWA icon sizes with automated script (192x192, 512x512, maskable, apple-touch-icon)
- Created type-safe manifest configuration using Next.js App Router MetadataRoute.Manifest type
- Manifest successfully generates at /manifest.webmanifest during static build
- Icons follow PWA best practices (maskable icon with 80% safe zone for Android adaptive icons)

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate PWA icons from source** - `fbd6d07` (feat)
2. **Task 2: Create PWA manifest with Next.js App Router** - `d1bd9b8` (feat)

## Files Created/Modified

**Created:**

- `src/app/manifest.ts` - Type-safe PWA manifest configuration with all required fields
- `scripts/generate-icons.js` - Automated icon generation using Sharp library
- `public/icons/icon-192x192.png` - Chrome minimum icon (192x192)
- `public/icons/icon-512x512.png` - Chrome minimum icon (512x512)
- `public/icons/icon-192-maskable.png` - Android adaptive icon with 80% safe zone
- `public/icons/apple-touch-icon.png` - iOS home screen icon (180x180)

**Modified:** None

## Decisions Made

**1. Next.js App Router manifest.ts over static manifest.json**

- **Rationale:** Type safety via MetadataRoute.Manifest type prevents configuration errors, aligns with Next.js 16 best practices

**2. Automated icon generation instead of manual creation**

- **Rationale:** Ensures correct dimensions, proper maskable safe zones (80% rule), and reproducibility. Script can be re-run with different source assets.

**3. Placeholder gradient icon design**

- **Rationale:** Creates functional PWA immediately. Can be replaced by updating generateSourceIcon() function with branded SVG/PNG assets.

**4. Force-static export declaration**

- **Rationale:** Required for Next.js static export mode (output: "export"). Without it, manifest route fails during build.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added static export declaration to manifest**

- **Found during:** Task 2 (manifest build verification)
- **Issue:** Build failed with "export const dynamic = "force-static" not configured on route /manifest.webmanifest" error
- **Fix:** Added `export const dynamic = "force-static"` to manifest.ts
- **Files modified:** src/app/manifest.ts
- **Verification:** Build succeeded, manifest generated at /manifest.webmanifest
- **Committed in:** d1bd9b8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Essential fix for Next.js static export compatibility. No scope creep.

## Issues Encountered

**Initial build failure:**

- **Problem:** Next.js static export requires explicit static declaration for all routes
- **Solution:** Added `export const dynamic = "force-static"` to manifest.ts (documented in Next.js static export requirements)
- **Outcome:** Build succeeds, manifest generated successfully

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 04 Plan 02 (Service Worker):**

- Manifest file is generated and accessible at /manifest.webmanifest
- All 4 required icon sizes exist and are properly referenced
- Browser can recognize site as installable PWA foundation
- Service worker implementation can now be added to enable offline support and complete PWA requirements

**No blockers or concerns.**

**Notes:**

- Current icons are placeholder gradient designs - can be replaced with branded assets by updating scripts/generate-icons.js
- Manifest passes Lighthouse PWA audit requirements for icons and configuration
- Browser "Add to Home Screen" prompt will be enabled after service worker is implemented in Plan 03

---

_Phase: 04-progressive-web-app_
_Completed: 2026-01-17_
