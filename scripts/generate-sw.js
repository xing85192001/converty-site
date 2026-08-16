/**
 * Service Worker Generation Script
 *
 * Replaced the Workbox precaching generator with a tiny, self-clearing
 * service worker. Rationale:
 *
 * The previous Workbox-generated SW precached the hashed app shell. When a new
 * deployment deleted the old hashed JS chunks, browsers still controlled by the
 * OLD service worker served the cached (stale) HTML, which pointed at chunks
 * that no longer existed -> "page cannot be loaded" on mobile, and stale code
 * (jsdelivr core load) on desktop.
 *
 * The new SW is intentionally NOT a precache. It:
 *   1. On install: skipWaiting() so it takes over immediately.
 *   2. On activate: deletes EVERY cache (except the immutable FFmpeg core
 *      cache) and claims all clients. It intentionally does NOT force-reload
 *      open tabs, because reloading during React hydration causes "Minified
 *      React error #418".
 *   3. On fetch: goes straight to the network for everything except /ffmpeg/*
 *      (which is large + immutable and is cached once).
 *
 * Net effect: after a deploy, the user only needs to reopen/refresh the site
 * once. The old SW is replaced, all stale caches are wiped, and the page loads
 * the fresh build from the network. No manual DevTools unregister required.
 */

const fs = require("node:fs");
const path = require("node:path");

// Bump this when the SW logic itself changes, so clients drop any cached copy.
const FFMPEG_CACHE = "ffmpeg-core-v7";

const swSource = `
const FFMPEG_CACHE = "${FFMPEG_CACHE}";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (key === FFMPEG_CACHE) {
          return Promise.resolve();
        }
        return caches.delete(key);
      })
    );
    await self.clients.claim();

    // NOTE: We intentionally do NOT reload open tabs here. Forced navigation
    // during React hydration can throw "Minified React error #418" and leave
    // the page in a broken state. The new worker takes control immediately
    // (clients.claim) so subsequent fetches use the fresh cache; the tab will
    // pick up the new HTML/JS on its next regular navigation/reload.
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Only intercept the large, immutable FFmpeg core files. Cache them once
  // and reuse afterwards. We intentionally do NOT intercept page/app requests
  // here; letting the browser fetch them directly avoids "Failed to fetch"
  // errors caused by the SW retrying a request that the browser can handle
  // better on its own (e.g. on custom domains or flaky networks).
  if (sameOrigin && url.pathname.startsWith("/ffmpeg/")) {
    event.respondWith(
      caches.open(FFMPEG_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        const response = await fetch(request);
        if (response && (response.ok || response.status === 0)) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => fetch(request))
    );
  }
});
`;

function writeServiceWorker() {
  const outDir = path.join(__dirname, "../out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Use a versioned filename so old service workers cannot intercept or
  // cache the new worker file. This breaks the "stale SW serving stale SW"
  // deadlock that kept old clients stuck on v3/v4/v5/v6.
  const outFile = path.join(outDir, "sw-v7.js");
  fs.writeFileSync(outFile, swSource.trim());

  // Keep a committed copy in public/ so local exports and the fallback use
  // the same self-clearing SW.
  const pubFile = path.join(__dirname, "../public/sw-v7.js");
  fs.writeFileSync(pubFile, swSource.trim());

  console.log("✓ Service worker written:", outFile);
}

try {
  writeServiceWorker();
} catch (error) {
  console.error("✗ Service worker write failed:", error);
  process.exit(1);
}
