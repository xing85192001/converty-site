"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/pwa/offline-detector";

/**
 * Offline Banner Component
 *
 * Displays a fixed banner at the top of the page when the user is offline.
 * Auto-dismisses when network connection is restored.
 *
 * Why fixed banner:
 * - Non-intrusive: Doesn't block content or require user action
 * - Always visible: Users always know their network status
 * - Auto-recovery: Disappears when back online (no manual dismiss needed)
 *
 * Why yellow (warning) color:
 * - Standard for transient/temporary states
 * - Not as severe as red (error) since offline is often expected for PWAs
 * - Distinct from app's primary colors
 *
 * @example
 * ```tsx
 * // Add to root layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <>
 *       <OfflineBanner />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  // Don't render anything when online
  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium shadow-md"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={16} aria-hidden="true" />
        <span>You are offline. Calculators will work from cache.</span>
      </div>
    </div>
  );
}
