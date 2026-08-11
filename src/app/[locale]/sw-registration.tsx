"use client";

import { useEffect } from "react";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { registerServiceWorker } from "@/lib/pwa/register-sw";

/**
 * Service Worker Registration Component
 *
 * Handles PWA initialization and renders PWA-related UI components:
 * - Registers service worker on mount (production only)
 * - Renders offline detection banner
 * - Renders install prompt (platform-specific)
 *
 * Why separate client component:
 * Root layout is a server component. Service worker registration requires
 * browser APIs (navigator, useEffect) only available in client components.
 * This provides a clean boundary between server and client logic.
 *
 * Why in locale layout, not root layout:
 * Root layout (app/layout.tsx) is just HTML shell. Application logic lives
 * in locale layout (app/[locale]/layout.tsx) where providers and features
 * are initialized.
 *
 * Why combined with UI components:
 * SW registration, offline detection, and install prompt are all PWA concerns.
 * Grouping them in one component keeps related functionality together and
 * ensures they're rendered together in the layout.
 *
 * @example
 * ```tsx
 * // In app/[locale]/layout.tsx
 * <ThemeProvider>
 *   <SWRegistration />
 *   <div className="app">
 *     {children}
 *   </div>
 * </ThemeProvider>
 * ```
 */
export function SWRegistration() {
  useEffect(() => {
    // Register service worker on first render
    registerServiceWorker();
  }, []);

  return (
    <>
      {/* Offline detection banner - shows when network is unavailable */}
      <OfflineBanner />

      {/* Install prompt - shows on compatible browsers when not installed */}
      <InstallPrompt />
    </>
  );
}
