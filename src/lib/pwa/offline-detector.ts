"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect online/offline status with real-time updates.
 *
 * Why navigator.onLine + events:
 * - navigator.onLine alone can be stale (browser caches the value)
 * - Event listeners ('online', 'offline') provide real-time updates when network status changes
 * - Combined approach ensures both initial state and updates are accurate
 *
 * @returns {boolean} isOnline - True if browser has network connectivity, false otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOnline = useOnlineStatus();
 *   return <div>{isOnline ? 'Online' : 'Offline'}</div>;
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  // Default to online (server-side rendering assumption)
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize with current browser state
    setIsOnline(navigator.onLine);

    // Event handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for network status changes
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup: remove event listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
