# ADR-006: Progressive Web App with Workbox Service Worker

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Calculator tools are used in contexts where internet connectivity cannot be assumed:
- Field engineers in data centers with restricted network access
- Students in environments with unreliable Wi-Fi
- Professionals traveling on trains, planes, or remote sites

A traditional web app requires connectivity for every page load. A PWA with service worker caching can serve the entire application from cache after the first visit.

## Decision

Implement PWA support using **Workbox 7** with a custom `generate-sw.js` post-build script. The service worker is generated after `next build` completes and injected into the `./out` directory.

**Caching strategies:**
| Resource Type | Strategy | TTL | Max Entries |
|--------------|----------|-----|-------------|
| HTML pages | NetworkFirst | 7-day fallback | — |
| Static assets (JS/CSS) | CacheFirst | 30 days | — |
| Images | CacheFirst | 30 days | 100 |
| Google Fonts | StaleWhileRevalidate | ∞ | — |

**Offline package:** A `converty-local.zip` is built during release workflows containing the full static export plus start scripts for Python and Node.js local servers. This allows completely air-gapped use without browser caching.

**Install prompt:** The PWA manifest (`manifest.json`) enables Add-to-Home-Screen on Chrome, Edge, and Safari (iOS 16.4+).

## Consequences

**Positive:**
- Full offline functionality after first visit (all 193 calculators)
- Sub-50ms page load from cache (vs. network latency)
- Native-app-like experience when installed from browser
- No app store submission required
- Downloadable offline package for completely air-gapped environments

**Negative / Constraints:**
- Service worker generation adds a post-build step and potential failure point
- Cached resources may be stale until the next service worker update cycle
- Live data (crypto prices, mining rates) cached at last build time — acceptable for estimation purposes
- PWA installation UX varies significantly across browsers (Safari still limited)
- `generate-sw.js` must be kept in sync with the output directory structure
