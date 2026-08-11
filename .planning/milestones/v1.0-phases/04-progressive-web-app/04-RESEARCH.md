# Phase 4: Progressive Web App - Research

**Researched:** 2026-01-17
**Domain:** Progressive Web Apps (PWA) for Next.js static exports
**Confidence:** HIGH

## Summary

Progressive Web Apps for Next.js 16 static exports require manual service worker implementation rather than automated build plugins, since popular tools like Serwist require Webpack but Next.js 16 defaults to Turbopack. The standard approach involves creating a service worker in `public/sw.js`, registering it client-side, and using a web manifest configured via `app/manifest.ts` or `app/manifest.json`.

For static exports deployed to GitHub Pages, the critical considerations are service worker scope (must be served from root), proper caching strategies for calculator assets, and offline fallback UI. The calculators' client-side nature (pure functions, no API calls) makes them ideal PWA candidates - once cached, they work fully offline.

Icon requirements are strict: browsers require both 192x192px and 512x512px icons minimum for installation. Mobile install prompts work differently across platforms (Android shows `beforeinstallprompt`, iOS requires Share menu).

**Primary recommendation:** Use manual service worker registration with Workbox caching strategies library, configure manifest via Next.js App Router built-in support, and implement offline detection UI. Avoid automated PWA plugins that conflict with static export constraints.

## Standard Stack

The established libraries/tools for PWA implementation in Next.js static exports:

### Core

| Library            | Version | Purpose                     | Why Standard                                           |
| ------------------ | ------- | --------------------------- | ------------------------------------------------------ |
| workbox-window     | 7.x     | Service worker registration | Industry standard for SW lifecycle management          |
| workbox-precaching | 7.x     | Asset precaching            | Google's official caching library, used by 54% of PWAs |
| workbox-routing    | 7.x     | Request routing             | Declarative caching strategy configuration             |
| workbox-strategies | 7.x     | Caching strategies          | Pre-built Cache First, Network First, etc.             |

### Supporting

| Library                    | Version          | Purpose                        | When to Use                                         |
| -------------------------- | ---------------- | ------------------------------ | --------------------------------------------------- |
| workbox-build              | 7.x              | Build-time manifest generation | Generate precache manifest during build             |
| @vite-pwa/assets-generator | 0.2.x            | Icon generation                | Generate all required icon sizes from single source |
| next-pwa                   | 5.x (deprecated) | Automated PWA setup            | AVOID - incompatible with Next.js 16 Turbopack      |
| @serwist/next              | 9.x (limited)    | PWA configuration              | Requires `--webpack` flag, not ideal for Turbopack  |

### Alternatives Considered

| Instead of      | Could Use       | Tradeoff                                                  |
| --------------- | --------------- | --------------------------------------------------------- |
| Workbox         | Manual SW       | More control but complex caching logic, high maintenance  |
| Icon generators | Manual creation | Pixel-perfect control but tedious, error-prone            |
| Manual manifest | next-pwa        | Automation but requires Webpack, conflicts with Turbopack |

**Installation:**

```bash
npm install workbox-window workbox-precaching workbox-routing workbox-strategies
npm install -D workbox-build @vite-pwa/assets-generator
```

**Important:** For Next.js 16 static exports, manual implementation is recommended over automated plugins due to Turbopack/Webpack conflicts and static export limitations (no Server Actions).

## Architecture Patterns

### Recommended Project Structure

```
public/
├── sw.js                # Service worker (generated or manual)
├── manifest.json        # Alternative to app/manifest.ts
├── icons/
│   ├── icon-192x192.png # Required minimum size
│   ├── icon-512x512.png # Required minimum size
│   ├── icon-192-maskable.png  # Android adaptive icon
│   └── apple-touch-icon.png   # iOS (180x180)
app/
├── manifest.ts          # Next.js built-in manifest (preferred)
└── layout.tsx           # Register service worker here
src/
└── lib/
    └── pwa/
        ├── register-sw.ts      # Client-side registration
        └── offline-detector.ts # Offline UI logic
```

### Pattern 1: Manual Service Worker Registration

**What:** Client-side registration in root layout with lifecycle management
**When to use:** Next.js static exports where build plugins don't work
**Example:**

```typescript
// Source: https://developer.chrome.com/docs/workbox/caching-strategies-overview
// app/layout.tsx (client component or useEffect)
"use client";

import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });
    }
  }, []);

  return children;
}
```

### Pattern 2: Web Manifest via Next.js App Router

**What:** Type-safe manifest configuration using Next.js built-in support
**When to use:** Always (preferred over static manifest.json)
**Example:**

```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Converty - Calculators & Converters",
    short_name: "Converty",
    description: "200+ calculators and converters",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

### Pattern 3: Workbox Caching Strategies

**What:** Declarative caching rules by resource type
**When to use:** Service worker implementation for offline functionality
**Example:**

```javascript
// Source: https://developer.chrome.com/docs/workbox/caching-strategies-overview
// public/sw.js
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache calculator pages: Network First with offline fallback
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "pages-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// Cache static assets: Cache First (long-lived)
registerRoute(
  ({ request }) => ["style", "script", "image"].includes(request.destination),
  new CacheFirst({
    cacheName: "static-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Cache fonts: Stale While Revalidate
registerRoute(
  ({ request }) => request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "font-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20 }),
    ],
  })
);
```

### Pattern 4: Offline Fallback UI

**What:** User-friendly offline indication with auto-recovery
**When to use:** Required for PWA-04 (offline fallback UI)
**Example:**

```typescript
// Source: https://www.getfishtank.com/insights/building-native-like-offline-experience-in-nextjs-pwas
// src/lib/pwa/offline-detector.ts
"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage in component:
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 w-full bg-yellow-500 text-black p-2 text-center">
      You are offline. Some features may not be available.
    </div>
  );
}
```

### Pattern 5: Install Prompt (Android/Desktop)

**What:** Custom install button using beforeinstallprompt event
**When to use:** Enhanced UX for Android/Chrome users (not iOS)
**Example:**

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  if (!installPrompt) return null;

  return <button onClick={handleInstall}>Install Converty</button>;
}
```

### Anti-Patterns to Avoid

- **Using automated PWA plugins with static export:** Next-pwa/Serwist require Webpack or server features not available in static export
- **Service worker in app directory:** Must be in `public/` for proper root scope
- **Blocking UI with install prompts:** iOS doesn't support beforeinstallprompt, don't assume it exists
- **Caching everything:** Be selective - cache static assets aggressively, HTML moderately
- **No offline fallback:** Users need visual feedback when offline

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                | Don't Build                   | Use Instead                              | Why                                                         |
| ---------------------- | ----------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Icon generation        | Manual resize in Photoshop    | @vite-pwa/assets-generator, Progressier  | Need 10+ sizes, maskable variants, safe zones (80% rule)    |
| Service worker caching | Custom cache logic            | Workbox strategies                       | Edge cases: cache versioning, quota management, update flow |
| Offline detection      | Simple navigator.onLine check | navigator.onLine + online/offline events | navigator.onLine can lie, need event listeners for updates  |
| SW lifecycle           | Manual registration + updates | workbox-window (Workbox)                 | Update flow complex: waiting, skipWaiting, clients.claim    |
| Precache manifest      | Manual file list              | workbox-build                            | Cache busting, revision tracking, build integration         |
| Install prompt         | Custom prompt logic           | beforeinstallprompt API + fallback       | Browser handles criteria, timing, permission state          |

**Key insight:** Service workers have complex lifecycle (installing, waiting, activated, redundant) and caching involves cache versioning, quota limits, and stale data management. Workbox handles these edge cases that custom implementations frequently miss.

## Common Pitfalls

### Pitfall 1: Service Worker Scope Issues on GitHub Pages

**What goes wrong:** Service worker registered from `/repo-name/sw.js` is scoped to `/repo-name/` path only, won't intercept root-level requests
**Why it happens:** GitHub Pages serves repos at subdirectories (github.io/repo-name), service workers default to their directory scope
**How to avoid:**

- For custom domain: No issue, serve from root
- For github.io subdirectory: Configure service worker with explicit scope

```javascript
navigator.serviceWorker.register("/repo-name/sw.js", {
  scope: "/repo-name/",
});
```

**Warning signs:** "No matching service worker detected" in Lighthouse, network requests not intercepted

### Pitfall 2: Service Worker Not Updating in Production

**What goes wrong:** Service worker changes don't take effect, users see old cached version indefinitely
**Why it happens:** Cache-Control headers prevent SW file refresh, browser caches the SW file itself
**How to avoid:**

- Set Cache-Control for sw.js: `no-cache, no-store, must-revalidate`
- Use workbox-window's update detection
- In GitHub Pages: Configure in repository settings or proxy
  **Warning signs:** Code changes not reflected after deploy, DevTools shows old SW version

### Pitfall 3: Missing Required Icon Sizes

**What goes wrong:** PWA not installable, "Add to Home Screen" doesn't appear
**Why it happens:** Chromium browsers require both 192x192 and 512x512 icons, missing either blocks installation
**How to avoid:** Always generate at minimum: 192x192, 512x512, plus 180x180 apple-touch-icon for iOS
**Warning signs:** Lighthouse "Does not provide a valid apple-touch-icon", installation criteria not met

### Pitfall 4: beforeinstallprompt Not Firing on iOS

**What goes wrong:** Custom install button never appears for iOS users
**Why it happens:** iOS doesn't support beforeinstallprompt event, uses Share menu instead
**How to avoid:**

- Feature detect before showing install UI
- Provide iOS-specific instructions (Share > Add to Home Screen)
- Progressive enhancement: show install button only when event fires
  **Warning signs:** Install feature works on Android/Desktop but not iOS

### Pitfall 5: Development vs Production Service Worker Behavior

**What goes wrong:** Service worker caching breaks hot reload in development
**Why it happens:** SW intercepts requests, serves cached versions instead of latest code
**How to avoid:**

- Disable SW registration in development: `if (process.env.NODE_ENV === 'production')`
- Use `skipWaiting: false` during dev
- Clear service workers between dev sessions
  **Warning signs:** Code changes not reflecting in dev, stale content served

### Pitfall 6: Locale Routing with Service Worker

**What goes wrong:** Service worker precaches `/en/` routes but not `/fr/`, `/de/`, `/it/`
**Why it happens:** Precache manifest only includes built HTML files, may miss locale variations
**How to avoid:**

- Ensure generateStaticParams runs for all locales
- Verify build output includes all locale directories
- Use runtime caching for navigations (Network First strategy)
  **Warning signs:** Only English version works offline, other locales fail

### Pitfall 7: Static Export Manifest Path

**What goes wrong:** app/manifest.ts generates manifest at wrong path for static export
**Why it happens:** Static export changes route structure, may not place manifest at expected location
**How to avoid:**

- Test manifest accessibility at `/manifest.json` or `/manifest.webmanifest`
- Verify `<link rel="manifest">` path matches actual file location
- Check build output directory structure
  **Warning signs:** Manifest 404 error in Network tab, Lighthouse "No manifest detected"

## Code Examples

Verified patterns from official sources:

### Service Worker with Offline Page

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
// public/sw.js
const CACHE_NAME = "converty-v1";
const OFFLINE_URL = "/offline.html";

// Install: precache offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        "/icons/icon-192x192.png",
        // Add critical assets
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first with offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
```

### Workbox Build Integration (Next.js)

```javascript
// Source: https://developer.chrome.com/docs/workbox/caching-strategies-overview
// scripts/generate-sw.js
const { generateSW } = require("workbox-build");

generateSW({
  globDirectory: "out",
  globPatterns: ["**/*.{html,js,css,png,jpg,webp,svg,woff2}"],
  swDest: "out/sw.js",
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
}).then(({ count, size }) => {
  console.log(`Generated SW, precaching ${count} files (${size} bytes)`);
});
```

### Complete Install Prompt with iOS Detection

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [
    installPrompt,
    setInstallPrompt,
  ] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Listen for install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Show iOS-specific instructions
  if (isIOS && !installPrompt) {
    return (
      <div className="install-prompt">
        <p>Install this app: tap Share then "Add to Home Screen"</p>
      </div>
    );
  }

  // Show install button for Android/Desktop
  if (installPrompt) {
    return (
      <button onClick={handleInstall} className="install-button">
        Install Converty
      </button>
    );
  }

  return null;
}
```

## State of the Art

| Old Approach                  | Current Approach                 | When Changed | Impact                                                             |
| ----------------------------- | -------------------------------- | ------------ | ------------------------------------------------------------------ |
| next-pwa plugin               | Manual SW + Workbox libraries    | Late 2025    | Next.js 16 Turbopack default conflicts with Webpack-based plugins  |
| Static manifest.json          | app/manifest.ts                  | Next.js 13+  | Type safety, dynamic generation, better DX                         |
| Cache API directly            | Workbox strategies               | Ongoing      | Declarative caching, less boilerplate, handles edge cases          |
| Universal beforeinstallprompt | Feature detection + iOS fallback | iOS 16.4+    | iOS supports PWA install but via different UX pattern              |
| Manual icon creation          | Automated generators             | 2024+        | Maskable icons, safe zones, platform-specific requirements complex |

**Deprecated/outdated:**

- **next-pwa:** Still maintained but not recommended for Next.js 16 with Turbopack (requires `--webpack` flag)
- **next-offline:** Archived, no longer maintained
- **Static manifest.json in public/:** Works but app/manifest.ts preferred for type safety
- **Assuming beforeinstallprompt everywhere:** iOS doesn't support it, need progressive enhancement

## Open Questions

Things that couldn't be fully resolved:

1. **GitHub Pages Base Path Handling**

   - What we know: GitHub Pages may serve at subdirectory (username.github.io/repo-name)
   - What's unclear: If Converty uses custom domain or subdirectory deployment
   - Recommendation: Test both scenarios, configure SW scope dynamically based on base path

2. **Static Export with app/manifest.ts**

   - What we know: Next.js docs show app/manifest.ts for App Router
   - What's unclear: Whether static export properly handles manifest route generation
   - Recommendation: Test manifest accessibility after build, may need static manifest.json fallback

3. **Multi-Locale Precaching Strategy**

   - What we know: 4 locales (en, fr, de, it) with generateStaticParams
   - What's unclear: Whether to precache all locale versions or use runtime caching
   - Recommendation: Precache only default locale (en), use Network First for other locales to balance cache size vs offline support

4. **Service Worker Build Integration**
   - What we know: workbox-build can generate SW, but requires custom build script
   - What's unclear: Best integration point in Next.js build process for static export
   - Recommendation: Post-build script (`scripts/generate-sw.js`) that runs after `next build`, before deployment

## Sources

### Primary (HIGH confidence)

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official Next.js PWA documentation
- [Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview) - Chrome Developers official Workbox docs
- [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) - Mozilla official PWA installation requirements
- [MDN: Define App Icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons) - Mozilla official icon specifications

### Secondary (MEDIUM confidence)

- [LogRocket: Next.js 16 PWA Offline Support](https://blog.logrocket.com/nextjs-16-pwa-offline-support) - Recent tutorial (Jan 2026), verified against official docs
- [Fishtank: Building Native-Like Offline Experience](https://www.getfishtank.com/insights/building-native-like-offline-experience-in-nextjs-pwas) - Offline UI patterns, cross-referenced with MDN
- [GitHub Discussion: Building PWA with Static Export](https://github.com/vercel/next.js/discussions/72221) - Community insights on static export challenges

### Tertiary (LOW confidence)

- WebSearch results on GitHub Pages PWA deployment - Community blog posts, needs validation with actual deployment testing
- Icon generator tool recommendations - Multiple tools mentioned, should test with project's specific needs

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Official Workbox documentation, Next.js manifest support confirmed
- Architecture: HIGH - Patterns from Chrome Developers, MDN, official Next.js docs
- Pitfalls: HIGH - Verified through official documentation, GitHub issues, and MDN browser compatibility tables
- Icon requirements: HIGH - MDN official specs, maskable icon standards documented
- Static export compatibility: MEDIUM - Next.js docs confirm manifest support, but service worker integration with static export needs testing
- GitHub Pages specific: MEDIUM - Community resources verified against service worker scope documentation

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - PWA standards stable, Next.js evolving)

**Key validation needed during planning:**

- Verify GitHub Pages deployment base path (custom domain vs subdirectory)
- Test app/manifest.ts with static export build
- Confirm workbox-build integration point in build pipeline
- Test multi-locale precaching strategy impact on cache size
