self.addEventListener("install", (_event) => {
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
