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
 * Why scope '/converty/':
 * The app is deployed to GitHub Pages under the /converty base path
 * (see next.config.ts basePath). The SW is emitted at /converty/sw.js and
 * must use scope /converty/ to intercept all locale routes
 * (/converty/en/, /converty/fr/, ...). A '/' scope would be rejected by the
 * browser since it is broader than the script's own path.
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

  // Register service worker
  navigator.serviceWorker
    .register("/converty/sw.js", { scope: "/converty/" })
    .then((registration) => {
      console.log("Service worker registered:", registration.scope);

      // Check for updates on navigation
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log("Service worker update found");
        }
      });
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
}
