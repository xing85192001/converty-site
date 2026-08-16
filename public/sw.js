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

    // Reload every open tab so it immediately picks up the fresh build
    // instead of the stale HTML/JS served by the previous service worker.
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of clients) {
      client.navigate(client.url).catch(() => {});
    }
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