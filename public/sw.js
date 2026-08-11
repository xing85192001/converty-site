/* global workbox, importScripts */

/**
 * Converty Service Worker
 *
 * Implements offline-first caching strategies using Workbox v7.
 * Enables calculator functionality without internet connection.
 */

// Import Workbox from CDN (Workbox v7 standard pattern)
importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js");

// Check if Workbox loaded successfully
if (workbox) {
  console.log("Workbox loaded successfully");

  // Configure Workbox
  workbox.setConfig({
    debug: false, // Set to true for debugging
  });

  // Enable immediate activation (skip waiting)
  workbox.core.skipWaiting();

  // Take control of all clients immediately
  workbox.core.clientsClaim();

  // Cache names
  const PAGES_CACHE = "pages-cache-v1";
  const STATIC_CACHE = "static-cache-v1";
  const FONT_CACHE = "font-cache-v1";

  /**
   * STRATEGY 1: Network First for HTML/Document requests
   *
   * Purpose: Calculators always get fresh content when online,
   * but work offline from cache (7-day fallback).
   *
   * Why NetworkFirst: Users expect latest calculator features,
   * but offline functionality is critical for PWA.
   */
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "document",
    new workbox.strategies.NetworkFirst({
      cacheName: PAGES_CACHE,
      plugins: [
        // Only cache successful responses
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        // Expire after 7 days, keep max 50 pages
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  /**
   * STRATEGY 2: Cache First for static assets (JS, CSS, images)
   *
   * Purpose: Static assets are immutable (Next.js content hashes),
   * so serve from cache immediately for performance.
   *
   * Why CacheFirst: Static assets never change (hash in filename),
   * cache hit = instant load, no network needed.
   */
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: STATIC_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        // Long expiration for immutable assets
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  /**
   * STRATEGY 3: Stale While Revalidate for fonts
   *
   * Purpose: Serve cached font immediately, update in background.
   * Balances instant rendering with keeping fonts fresh.
   *
   * Why StaleWhileRevalidate: Fonts change rarely but users
   * shouldn't wait for network. Best of both worlds.
   */
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "font",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: FONT_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        // Limit font cache size
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  /**
   * OFFLINE FALLBACK
   *
   * If a navigation request fails and isn't in cache,
   * serve a simple offline message instead of browser error.
   */
  workbox.routing.setCatchHandler(async ({ event }) => {
    // Only handle navigation requests (page loads)
    if (event.request.destination === "document") {
      // Try to get from cache
      const cache = await caches.open(PAGES_CACHE);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      // Return simple offline page
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offline - Converty</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            h1 {
              color: #333;
              margin: 0 0 1rem;
            }
            p {
              color: #666;
              margin: 0 0 1.5rem;
            }
            button {
              background: #000;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              font-size: 1rem;
              cursor: pointer;
            }
            button:hover {
              background: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>This page isn't cached yet. Please check your internet connection and try again.</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // For non-document requests, just let it fail
    return Response.error();
  });

  console.log("Service worker caching strategies configured");
} else {
  console.error("Workbox failed to load from CDN");
}
