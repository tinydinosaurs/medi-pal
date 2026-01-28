/**
 * Storage Abstraction Layer
 *
 * Provides a unified interface for persisting data to local storage.
 *
 * TODO: When the app needs to support larger datasets (e.g., photo uploads for bills),
 * offline-first PWA sync, or complex querying, swap this implementation to use IndexedDB.
 * All hooks (useBillHistory, useDoseLog, useMedications, useAppointments) use this
 * abstraction, so the migration will be seamless - just update these functions.
 */

/**
 * Check if we're running in the browser (vs SSR).
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get a value from storage.
 * Returns null if not found or if running server-side.
 */
export function get<T>(key: string): T | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Set a value in storage.
 * No-op if running server-side.
 */
export function set<T>(key: string, value: T): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

/**
 * Remove a value from storage.
 * No-op if running server-side.
 */
export function remove(key: string): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

/**
 * Get a raw string value (for simple flags like "true"/"false").
 */
export function getRaw(key: string): string | null {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Set a raw string value.
 */
export function setRaw(key: string, value: string): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore errors
  }
}

// Convenience export as object for those who prefer `storage.get()` syntax
export const storage = {
  get,
  set,
  remove,
  getRaw,
  setRaw,
};
