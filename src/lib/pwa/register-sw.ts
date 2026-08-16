/**
 * Service Worker Registration
 *
 * Earlier PWA service workers (v3/v4/v5/v6/v7) caused repeated crashes (React
 * hydration errors, infinite reload loops, broken fetches on mirror domains).
 * This module now only registers the self-destructing kill-switch when a stale
 * worker is still present. Once the kill-switch has run, the origin is left
 * with no controlling service worker.
 */

const SW_URL = "/sw-v8.js";

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

  // Only install the kill-switch if a stale worker is still around. New
  // visitors should not get a service worker at all.
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      const hasStaleWorker = registrations.some(
        (r) => !String((r as unknown as { scriptURL: string }).scriptURL).endsWith(SW_URL)
      );

      if (!hasStaleWorker) {
        if (registrations.length > 0) {
          console.log("Only kill-switch worker present; staying SW-free");
        } else {
          console.log("No stale service worker found; staying SW-free");
        }
        return;
      }

      // Register the kill-switch to wipe caches and unregister everything.
      navigator.serviceWorker
        .register(SW_URL, { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          console.log("Kill-switch service worker registered:", registration.scope);

          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === "sw-cleanup-complete") {
              console.log("Service worker cleanup complete; no worker controls this page");
            }
          });

          registration.update().catch(() => {
            // Ignore update check errors (e.g. offline).
          });
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update().catch(() => {
                // Ignore update check errors.
              });
            }
          });
        })
        .catch((error) => {
          console.error("Kill-switch service worker registration failed:", error);
        });
    })
    .catch((error) => {
      console.error("Failed to inspect service worker registrations:", error);
    });
}
