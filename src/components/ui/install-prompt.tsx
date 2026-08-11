"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

/**
 * BeforeInstallPrompt Event Interface
 *
 * Chrome/Edge specific event for PWA installation prompt.
 * Not supported on iOS Safari (requires manual Add to Home Screen).
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Shows the install prompt to the user
   */
  prompt: () => Promise<void>;
  /**
   * Promise that resolves when user accepts or dismisses the prompt
   */
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Install Prompt Component
 *
 * Cross-platform PWA installation UI with automatic platform detection:
 * - Android/Desktop Chrome: Shows install button using beforeinstallprompt event
 * - iOS Safari: Shows manual installation instructions (no programmatic API)
 * - Already installed: Hides completely
 *
 * Why platform detection:
 * - iOS doesn't support beforeinstallprompt - must show manual instructions
 * - Android/Desktop Chrome can programmatically trigger install prompt
 * - Standalone mode detection prevents showing prompt to already-installed users
 *
 * Why progressive enhancement:
 * - Gracefully handles all scenarios without breaking
 * - Never shows broken/confusing UI
 * - Respects user's install state
 *
 * @example
 * ```tsx
 * // Add to layout (already integrated via SWRegistration component)
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <InstallPrompt />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
export function InstallPrompt() {
  // Chrome/Edge install prompt event (null on iOS)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // iOS device detection
  const [isIOS, setIsIOS] = useState(false);
  // Already installed (standalone mode) detection
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(iOS);

    // Detect if already installed (running in standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Listen for Chrome/Edge install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default mini-infobar on mobile
      e.preventDefault();
      // Save event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Handle install button click (Chrome/Edge only)
   */
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show install prompt
    await installPrompt.prompt();

    // Wait for user response
    const { outcome } = await installPrompt.userChoice;

    // If accepted, hide button (user will be in standalone mode)
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return null;
  }

  // iOS: Show manual installation instructions
  if (isIOS && !installPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-start gap-3">
            <Share className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Install Converty
              </p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                Tap <Share className="inline h-3 w-3" /> then "Add to Home Screen"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Chrome: Show install button
  if (installPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={handleInstallClick} size="lg" className="shadow-lg">
          <Download className="mr-2 h-5 w-5" />
          Install Converty
        </Button>
      </div>
    );
  }

  // Not installable or already handled
  return null;
}
