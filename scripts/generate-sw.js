/**
 * Service Worker Generation Script
 *
 * This service worker is a "kill switch". It is designed to migrate users away
 * from the earlier PWA service workers (v3/v4/v5/v6/v7) that caused repeated
 * problems:
 *
 *   - Forced navigation during React hydration -> "Minified React error #418"
 *     and "insertBefore" crashes.
 *   - Intercepting page fetches on mirror/forward domains (e.g. allcalc.cc.cd)
 *     -> "Failed to fetch" and broken resource loading.
 *   - Aggressive precaching of hashed chunks -> stale HTML pointing at deleted
 *     JS files after deployments.
 *
 * The kill-switch SW:
 *   1. Installs and activates immediately.
 *   2. Deletes ALL caches.
 *   3. Unregisters itself so the page is no longer controlled by any SW.
 *   4. Claims clients so the unregistration takes effect on the current tab.
 *
 * After this runs once, the site behaves like a normal website: no SW
 * interception, no forced reloads, no stale caches. The FFmpeg core is fetched
 * directly from CDN instead of relying on a self-hosted path that may fail on
 * mirror domains.
 */

const fs = require("node:fs");
const path = require("node:path");

const swSource = `self.addEventListener("install", (_event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Wipe every cache created by previous SW versions.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // Take control of the current tab immediately.
      await self.clients.claim();

      // Unregister this worker so no SW controls the origin any more.
      await self.registration.unregister();

      // Notify any listening clients that cleanup is complete.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({ type: "sw-cleanup-complete" });
      }
    })()
  );
});

self.addEventListener("fetch", () => {
  // Do not intercept any requests. Pass-through is the default when no
  // respondWith() is called, but leaving this handler empty keeps the SW
  // from accidentally touching page/FFmpeg fetches.
});

`;

function writeServiceWorker() {
  const outDir = path.join(__dirname, "../out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Use a fresh versioned filename so old workers cannot cache/intercept it.
  const outFile = path.join(outDir, "sw-v8.js");
  fs.writeFileSync(outFile, `${swSource.trim()}\n`);

  // Keep a committed copy in public/ for local exports and Vercel static files.
  const pubFile = path.join(__dirname, "../public/sw-v8.js");
  fs.writeFileSync(pubFile, `${swSource.trim()}\n`);

  console.log("✓ Service worker written:", outFile);
}

try {
  writeServiceWorker();
} catch (error) {
  console.error("✗ Service worker write failed:", error);
  process.exit(1);
}
