/**
 * Service Worker Registration
 *
 * Registers the service worker for PWA functionality including:
 * - Offline caching of calculator pages
 * - Static asset caching (JS, CSS, images)
 * - Runtime caching strategies
 *
 * Why production-only:
 * Service worker caching breaks hot reload in development.
 * Development needs fresh code on every change, but SW caches aggressively.
 * This is a known PWA development pitfall (see RESEARCH.md Pitfall 5).
 *
 * Why scope '/':
 * The app is deployed at a root domain (basePath is "" in next.config.ts).
 * The SW is emitted at /sw.js and uses scope '/' to intercept all routes
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

  // Register service worker.
  // updateViaCache: 'none' prevents the browser from using its HTTP cache for
  // /sw.js, so every page load checks for a new service worker.
  navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      console.log("Service worker registered:", registration.scope);

      // Check for updates immediately and whenever the tab becomes visible.
      // This helps PWA clients pick up new deployments without waiting for the
      // browser's default 24-hour SW update interval.
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

      // Check for updates on navigation. When a new service worker activates,
      // reload so the latest app shell (and hashed JS chunks) is used. This
      // prevents stale SW caches from serving old HTML that points at deleted
      // chunks, which causes "page cannot be loaded" errors on mobile.
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        console.log("Service worker update found");

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            console.log("New service worker activated, reloading for fresh app shell");
            window.location.reload();
          }
        });
      });
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
}
