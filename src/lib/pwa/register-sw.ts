/**
 * Service Worker Registration
 *
 * Registers the service worker for PWA functionality including offline caching
 * of static assets and runtime caching strategies.
 *
 * Why production-only:
 * Service worker caching breaks hot reload in development. Development needs
 * fresh code on every change, but SW caches aggressively.
 *
 * Why scope '/':
 * The app is deployed at a root domain (basePath is "" in next.config.ts).
 * The SW is emitted at /sw-v7.js and uses scope '/' to intercept all routes
 * (/en/, /fr/, /zh/, ...).
 *
 * Why fire-and-forget:
 * Registration happens in background. No need to await or handle result.
 * Errors are logged but don't block app functionality.
 *
 * @example
 * ```tsx
 * // In layout or root component
 * useEffect(() => {
 *   registerServiceWorker();
 * }, []);
 * ```
 */

const SW_URL = "/sw-v7.js";
const CLEANUP_KEY = "sw-cleanup-done-v7";

function getWorkerScriptURL(
  registration: ServiceWorkerRegistration,
): string | undefined {
  return (
    registration.active?.scriptURL ??
    registration.installing?.scriptURL ??
    registration.waiting?.scriptURL
  );
}

function reloadWhenSafe(): void {
  // Wait until the initial page load + React hydration are done before
  // reloading. Reloading while React is hydrating throws "Minified React
  // error #418" and can leave the DOM in a broken state.
  const doReload = () => {
    // Give hydration a tiny extra tick to settle.
    setTimeout(() => window.location.reload(), 50);
  };
  if (document.readyState === "complete") {
    doReload();
  } else {
    window.addEventListener("load", doReload, { once: true });
  }
}

export function registerServiceWorker(): void {
  // Only register in browser (not during SSR)
  if (typeof window === "undefined") {
    return;
  }

  // Only register in production (avoid caching issues in dev)
  if (process.env.NODE_ENV !== "production") {
    console.log("Service worker registration skipped in development mode");
    return;
  }

  // Check browser support
  if (!("serviceWorker" in navigator)) {
    console.log("Service worker not supported in this browser");
    return;
  }

  // STEP 1: Remove stale service workers from older deployments.
  // Older deployments (v3/v4/v5/v6) used /sw.js and called client.navigate()
  // inside the activate event to force a reload. That navigation during React
  // hydration is what produces "Minified React error #418" and the
  // insertBefore crash.
  //
  // We only unregister workers whose script URL is NOT the current versioned
  // worker. The current worker is intentionally harmless (it only caches
  // /ffmpeg/*), so there is no need to remove it on every load. We guard with
  // a persistent flag so a given browser profile only does the cleanup reload
  // once per SW version, preventing an infinite reload loop.
  const cleanupDone = localStorage.getItem(CLEANUP_KEY) === "1";

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      const staleRegistrations = registrations.filter((r) => {
        const scriptUrl = getWorkerScriptURL(r);
        return scriptUrl && !scriptUrl.endsWith(SW_URL);
      });

      if (staleRegistrations.length > 0) {
        return Promise.all(staleRegistrations.map((r) => r.unregister())).then(
          () => {
            console.log("Stale service workers unregistered");
            if (!cleanupDone) {
              localStorage.setItem(CLEANUP_KEY, "1");
              console.log("Reloading cleanly to release old worker");
              reloadWhenSafe();
            }
          },
        );
      }
      return Promise.resolve();
    })
    .then(() => {
      // STEP 2: Register the new, minimal worker under a versioned filename.
      // The versioned filename prevents the old worker from intercepting or
      // caching this file, breaking the stale-SW deadlock.
      return navigator.serviceWorker.register(SW_URL, {
        scope: "/",
        updateViaCache: "none",
      });
    })
    .then((registration) => {
      console.log("Service worker registered:", registration.scope);

      // Check for updates immediately and whenever the tab becomes visible.
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

      // The new worker intentionally does NOT force-reload tabs on activation.
      // It only caches /ffmpeg/* files; everything else comes straight from
      // the network, so stale HTML/JS chunks are no longer a problem.
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
}
