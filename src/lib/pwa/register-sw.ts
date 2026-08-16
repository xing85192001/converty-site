/**
 * Service Worker Cleanup (page-level fallback)
 *
 * The authoritative cleanup runs as a synchronous inline script in the root
 * layout (`src/app/layout.tsx`) BEFORE React hydration, so a stale worker
 * cannot claim clients and trigger "Minified React error #418". This module is
 * a secondary safety net that runs after hydration: if the inline script did
 * not run (e.g. browser stripped it), we still unregister every worker and
 * delete every cache here.
 *
 * We never register a new service worker anymore — the PWA was the root cause
 * of repeated breakage (hydration crashes, infinite reload loops, broken
 * fetches on mirror domains). The site now behaves like a plain website.
 */

const CLEANUP_FLAG = "sw-cleanup-v9";

export function registerServiceWorker(): void {
  // Only run in browser (not during SSR)
  if (typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Service worker cleanup skipped in development mode");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("Service worker not supported in this browser");
    return;
  }

  cleanupServiceWorkers().catch((error) => {
    console.error("Service worker cleanup failed:", error);
  });
}

async function cleanupServiceWorkers(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const hasWorker = registrations.length > 0;

  const cacheKeys = typeof caches !== "undefined" && caches.keys ? await caches.keys() : [];
  const hasCache = cacheKeys.length > 0;

  if (!hasWorker && !hasCache) {
    console.log("No stale service worker / cache found; staying SW-free");
    return;
  }

  // Unregister every service worker on this origin.
  await Promise.all(
    registrations.map((registration) =>
      registration.unregister().catch((err) => {
        console.error("Failed to unregister a service worker:", err);
      })
    )
  );

  // Delete every cache (incl. stale "ffmpeg-core-v7" left by sw-v7.js).
  if (typeof caches !== "undefined" && caches.delete) {
    await Promise.all(
      cacheKeys.map((key) =>
        caches.delete(key).catch((err) => {
          console.error(`Failed to delete cache ${key}:`, err);
        })
      )
    );
  }

  console.log("Service worker cleanup complete; no worker controls this page");

  // Reload once per session so the current tab is no longer controlled by the
  // just-unregistered worker. The inline script owns the reload flag; we reuse
  // the same key so the two paths never trigger a reload loop.
  try {
    if (!window.sessionStorage.getItem(CLEANUP_FLAG)) {
      window.sessionStorage.setItem(CLEANUP_FLAG, "1");
      window.location.reload();
    }
  } catch {
    /* sessionStorage may be unavailable; skip reload */
  }
}
