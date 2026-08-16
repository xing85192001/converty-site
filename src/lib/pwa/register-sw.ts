/**
 * Service Worker Registration
 *
 * This module is now a migration helper. Earlier PWA service workers
 * (v3/v4/v5/v6/v7) caused repeated crashes (React hydration errors, infinite
 * reload loops, broken fetches on mirror domains), so we deploy a single
 * "kill-switch" worker that uninstalls itself and leaves the site with no
 * controlling service worker.
 *
 * Once the kill-switch has run, the site behaves like a normal website:
 * - No service-worker interception of page or FFmpeg fetches.
 * - No forced reloads during hydration.
 * - No stale caches causing broken deployments.
 *
 * The function remains a no-op during SSR and in development.
 */

const SW_URL = "/sw-v8.js";
const CLEANUP_KEY = "sw-cleanup-done-v7";

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

  // Wipe the old cleanup flag so a fresh migration happens if we ever need
  // to run another kill-switch in the future.
  try {
    localStorage.removeItem(CLEANUP_KEY);
  } catch {
    // localStorage may be unavailable in private/sandboxed modes.
  }

  navigator.serviceWorker
    .register(SW_URL, { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      console.log("Kill-switch service worker registered:", registration.scope);

      // Listen for the worker to report that it has finished wiping caches
      // and unregistered itself.
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "sw-cleanup-complete") {
          console.log("Service worker cleanup complete; no worker controls this page");
        }
      });

      // Check for updates immediately and on visibilitychange so the
      // kill-switch can replace any lingering old worker as fast as possible.
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
}
