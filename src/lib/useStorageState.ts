/**
 * useStorageState Hook
 *
 * React 18+ hook for syncing state with localStorage, SSR-safe.
 * Uses useSyncExternalStore to avoid hydration mismatches.
 *
 * Benefits:
 * - No setState in useEffect (no linter warnings)
 * - No hydration mismatch (server returns default, client reads after hydration)
 * - Cross-tab sync works automatically via storage events
 */

import { useSyncExternalStore, useCallback, useRef } from "react";
import { storage } from "./storage";

// Module-level listeners for same-tab updates
const listeners = new Map<string, Set<() => void>>();

function notifyListeners(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribeToKey(key: string, listener: () => void) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(listener);
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

/**
 * Hook for syncing state with localStorage, SSR-safe.
 */
export function useStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Cache to avoid re-parsing JSON on every getSnapshot call
  const cacheRef = useRef<{ json: string; value: T } | null>(null);

  // Subscribe to both cross-tab storage events and same-tab updates
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      // Cross-tab sync
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
          cacheRef.current = null; // Invalidate cache
          onStoreChange();
        }
      };
      window.addEventListener("storage", handler);

      // Same-tab sync
      const unsubscribe = subscribeToKey(key, () => {
        cacheRef.current = null; // Invalidate cache
        onStoreChange();
      });

      return () => {
        window.removeEventListener("storage", handler);
        unsubscribe();
      };
    },
    [key],
  );

  // Get current value from storage (client) - with caching
  const getSnapshot = useCallback((): T => {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;

    // Use cached value if JSON hasn't changed
    if (cacheRef.current?.json === raw) {
      return cacheRef.current.value;
    }

    try {
      const parsed = JSON.parse(raw) as T;
      cacheRef.current = { json: raw, value: parsed };
      return parsed;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  // Get value during SSR (always return default)
  const getServerSnapshot = useCallback((): T => {
    return defaultValue;
  }, [defaultValue]);

  // Read value using useSyncExternalStore
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Setter function
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const current = storage.get<T>(key) ?? defaultValue;
      const resolved =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(current)
          : newValue;
      storage.set(key, resolved);
      // Notify same-tab listeners (not a storage event, avoids loop)
      notifyListeners(key);
    },
    [key, defaultValue],
  );

  return [value, setValue];
}

/**
 * Hook for syncing a simple string/boolean value with localStorage.
 * Useful for flags like "history enabled".
 */
export function useStorageFlag(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const cacheRef = useRef<{ raw: string; value: boolean } | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
          cacheRef.current = null;
          onStoreChange();
        }
      };
      window.addEventListener("storage", handler);

      const unsubscribe = subscribeToKey(key, () => {
        cacheRef.current = null;
        onStoreChange();
      });

      return () => {
        window.removeEventListener("storage", handler);
        unsubscribe();
      };
    },
    [key],
  );

  const getSnapshot = useCallback((): boolean => {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;

    if (cacheRef.current?.raw === raw) {
      return cacheRef.current.value;
    }

    const value = raw === "true";
    cacheRef.current = { raw, value };
    return value;
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback((): boolean => {
    return defaultValue;
  }, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (newValue: boolean) => {
      storage.setRaw(key, newValue ? "true" : "false");
      notifyListeners(key);
    },
    [key],
  );

  return [value, setValue];
}
