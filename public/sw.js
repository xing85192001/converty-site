const FFMPEG_CACHE = "ffmpeg-core-v6";

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