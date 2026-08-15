/**
 * Service Worker Generation Script
 *
 * Generates production service worker with Workbox precaching manifest.
 * Runs as post-build step after Next.js static export completes.
 *
 * Why post-build script:
 * - Workbox needs static files to exist before generating precache manifest
 * - Next.js build creates files in out/, then this script scans and injects manifest
 * - Standard pattern for static site PWAs
 *
 * Why generateSW:
 * - Creates complete SW file with precaching + runtime caching
 * - Simpler than injectManifest (no template needed)
 * - Perfect for static exports with predictable file structure
 *
 * Caching strategies:
 * - HTML documents: NetworkFirst (fresh when online, 7-day cache fallback)
 * - Images: CacheFirst (immutable content, 30-day expiration, 100 max entries)
 * - Fonts: StaleWhileRevalidate (instant render, background updates, 20 max entries)
 *
 * @see https://developer.chrome.com/docs/workbox/modules/workbox-build/
 */

const { generateSW } = require("workbox-build");
const fs = require("node:fs");
const path = require("node:path");

async function buildServiceWorker() {
  try {
    // Generate service worker with precache manifest
    const result = await generateSW({
      // Source: Next.js static export output directory
      globDirectory: "out",

      // Files to precache: all static assets
      globPatterns: ["**/*.{html,js,css,png,jpg,jpeg,svg,webp,woff2}"],

      // Output: service worker file
      swDest: "out/sw.js",

      // Activation: immediate takeover
      skipWaiting: true,
      clientsClaim: true,

      // Bump cache id on every major deployment so stale precached HTML/JS
      // from old builds (which reference deleted hashed chunks) is discarded.
      cacheId: "converty-v2",
      cleanupOutdatedCaches: true,

      // Runtime caching strategies
      runtimeCaching: [
        {
          // HTML documents: NetworkFirst (fresh when online, short cache fallback)
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages-cache-v2",
            expiration: {
              maxAgeSeconds: 24 * 60 * 60, // 1 day
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Self-hosted FFmpeg core files: cache first, never expire (large, immutable)
          urlPattern: ({ url }) => url.pathname.startsWith("/ffmpeg/"),
          handler: "CacheFirst",
          options: {
            cacheName: "ffmpeg-core-cache-v2",
            expiration: {
              maxEntries: 10,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Images: CacheFirst (immutable content-hashed assets)
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache-v2",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Fonts: StaleWhileRevalidate (instant render + background updates)
          urlPattern: ({ request }) => request.destination === "font",
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "font-cache-v2",
            expiration: {
              maxEntries: 20,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    });

    // Log success with manifest details
    console.log(
      `✓ Service worker generated: ${result.count} files precached (${result.size} bytes)`
    );
  } catch (error) {
    // Log error and fall back to the hand-written service worker so the
    // build still produces a usable (if less optimized) SW with fresh cache
    // versioning (v2) instead of a stale generated one.
    console.error("✗ Service worker generation failed:", error);
    try {
      fs.copyFileSync(
        path.join(__dirname, "../public/sw.js"),
        path.join(__dirname, "../out/sw.js")
      );
      console.log("✓ Fallback: copied public/sw.js to out/sw.js");
    } catch (copyErr) {
      console.error("✗ Fallback copy also failed:", copyErr);
      process.exit(1);
    }
  }
}

// Run build
buildServiceWorker();
