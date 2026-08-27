import { compressToEncodedURIComponent } from "lz-string";
import type { StateCreator } from "zustand";

/**
 * Configuration options for URL sync middleware
 */
export interface UrlSyncOptions<T = object> {
  /** Whether to enable URL sync (default: true) */
  enabled?: boolean;
  /** Debounce time in milliseconds (default: 150) */
  debounceMs?: number;
  /** Only sync these keys to URL (default: all keys) */
  include?: string[];
  /** Exclude these keys from URL sync (default: none) */
  exclude?: string[];
  /** Select which part of state to sync (default: sync entire state) */
  selectState?: (state: T) => object;
}

/**
 * Creates URL sync middleware with isolated debounce timer
 *
 * CRITICAL: This is a factory function. Each invocation creates
 * a NEW middleware instance with its OWN debounce timer via closure.
 * This prevents timer conflicts when multiple stores exist on the same page.
 *
 * @template T - The store state type
 * @param options - Configuration options for URL sync behavior
 * @returns Zustand middleware that syncs state to URL parameters
 *
 * @example
 * ```typescript
 * const useStore = create<State>()(
 *   createUrlSyncMiddleware({ debounceMs: 200 })(
 *     (set) => ({ count: 0, increment: () => set(s => ({ count: s.count + 1 })) })
 *   )
 * );
 * ```
 */
export function createUrlSyncMiddleware<T extends object>(options: UrlSyncOptions<T> = {}) {
  const { enabled = true, debounceMs = 150, include, exclude, selectState } = options;

  // CLOSURE: Timer declared in factory scope (NOT module scope)
  // Each call to createUrlSyncMiddleware creates a NEW closure with NEW timer
  // This is the fix for STATE-04 (global timer causing conflicts)
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Return the middleware function (standard Zustand middleware signature)
  return (config: StateCreator<T, [], []>): StateCreator<T, [], []> => {
    return (set, get, api) => {
      // Wrap setState to add debounced URL sync
      const originalSet = api.setState;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- biome-ignore lint/suspicious/noExplicitAny: Zustand setState has complex generic signature
      api.setState = ((...args: any[]) => {
        // Call original setState first (update store)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- biome-ignore lint/suspicious/noExplicitAny: Required to match Zustand setState signature
        (originalSet as any)(...args);

        // Then sync to URL (debounced)
        if (!enabled) return;

        // Clear previous timeout (debounce pattern)
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        // Schedule URL update after debounce delay
        debounceTimeout = setTimeout(() => {
          const state = get();
          const stateToSync = selectState ? selectState(state) : state;
          syncStateToUrl(stateToSync, { include, exclude });
        }, debounceMs);
      }) as typeof api.setState;

      // Call original config to create initial state
      return config(set, get, api);
    };
  };
}

/**
 * Sync state object to URL parameters using LZ-String compression.
 * Writes the entire filtered state as a single ?z=<compressed> param (R4.2, R4.4).
 * @internal
 */
function syncStateToUrl(state: object, options: { include?: string[]; exclude?: string[] }) {
  if (typeof window === "undefined") return;

  const { include, exclude } = options;
  const url = new URL(window.location.href);

  // Build filtered state (same include/exclude logic as before)
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (include && !include.includes(key)) continue;
    if (exclude?.includes(key)) continue;
    if (typeof value === "function") continue;
    if (value === undefined || value === null || value === "") continue;
    filtered[key] = value;
  }

  // If nothing to sync, clear URL
  if (Object.keys(filtered).length === 0) {
    window.history.replaceState({}, "", url.pathname);
    return;
  }

  // Compress entire state as JSON → single ?z= param (R4.2, R4.4)
  const json = JSON.stringify(filtered);
  const compressed = compressToEncodedURIComponent(json);
  window.history.replaceState({}, "", `${url.pathname}?z=${compressed}`);
}
