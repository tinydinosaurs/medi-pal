## useStorageState Explained

Let me walk through the entire file, explaining both the "what" and the "why."

---

### The Problem We're Solving

We need to persist state in `localStorage` while avoiding two issues:

1. **Hydration mismatch** - Next.js renders on server first (no localStorage), then client takes over (has localStorage). If they return different values, React throws an error.

2. **setState in useEffect** - The naive approach loads from localStorage in a `useEffect`, but React 19's compiler/linter flags this as problematic because it causes cascading renders.

---

### The Solution: `useSyncExternalStore`

React 18 introduced `useSyncExternalStore` specifically for syncing React with external data sources. It takes three arguments:

```typescript
useSyncExternalStore(
  subscribe, // How to listen for changes
  getSnapshot, // How to read current value (client)
  getServerSnapshot, // How to read value during SSR
);
```

This is React's official answer to "how do I read from something outside React without causing problems?"

---

### Code Walkthrough

```typescript
import { useSyncExternalStore, useCallback, useRef } from "react";
import { storage } from "./storage";
```

We import `useSyncExternalStore` from React and our storage abstraction.

---

#### Module-Level Listeners

```typescript
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
```

**What:** A pub/sub system at the module level, outside of React.

**Why:** When one component calls `setValue`, other components using the same key need to know. We can't use React state for this (circular dependency), so we use a simple listener pattern.

**Structure:**

- `Map<string, Set<() => void>>` - Each storage key has a set of callback functions
- `notifyListeners(key)` - Calls all callbacks for that key
- `subscribeToKey(key, listener)` - Registers a callback, returns unsubscribe function

**Why not use `StorageEvent`?** That was our first attempt, but dispatching `new StorageEvent()` triggered the subscribe callback, which called `getSnapshot`, which returned a new object reference, which caused React to re-render, which... infinite loop.

---

#### The Hook

```typescript
export function useStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void];
```

**What:** Generic hook that returns `[value, setValue]` just like `useState`.

**Why generic:** `useStorageState<Medication[]>("meds", [])` works, and TypeScript knows the value is `Medication[]`.

---

#### Cache Reference

```typescript
const cacheRef = useRef<{ json: string; value: T } | null>(null);
```

**What:** A mutable ref that caches the last parsed value.

**Why:** `getSnapshot` is called frequently by React (on every render, before effects, etc.). Without caching:

1. We'd call `localStorage.getItem()` repeatedly (I/O)
2. We'd `JSON.parse()` repeatedly (CPU)
3. We'd return a new object reference each time, which React sees as "changed"

The cache stores both the raw JSON string and the parsed value. If the JSON hasn't changed, we return the same object reference.

---

#### Subscribe Function

```typescript
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
```

**What:** Tells React how to subscribe to changes from this external store.

**Two subscription sources:**

1. **`StorageEvent`** - Fires when _another tab_ modifies localStorage. The browser doesn't fire this for the same tab that made the change.

2. **`subscribeToKey`** - Our custom listener for _same-tab_ updates. When `setValue` is called, we notify all subscribers.

**`e.key === null`** - When `localStorage.clear()` is called, the event has `key: null`.

**Cache invalidation** - When notified of a change, we clear the cache so `getSnapshot` will re-read from storage.

**Cleanup** - Returns a function that removes both listeners.

---

#### Get Snapshot (Client)

```typescript
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
```

**What:** Returns the current value from storage.

**Why caching matters:** React may call `getSnapshot` many times. If we return a new `[]` each time (even if contents are the same), React thinks the value changed and re-renders infinitely.

**Cache check:** If `raw` JSON string matches what we cached, return the exact same object reference. React's `Object.is()` comparison sees it as unchanged.

**Why `localStorage.getItem` directly?** We could use `storage.get()`, but here we need the raw string for cache comparison. This is the one place we bypass the abstraction.

---

#### Get Server Snapshot

```typescript
const getServerSnapshot = useCallback((): T => {
  return defaultValue;
}, [defaultValue]);
```

**What:** Returns the value during SSR.

**Why just `defaultValue`?** Server has no localStorage. By always returning the default:

- Server renders with default (e.g., empty array)
- Client hydrates with same default
- After hydration, React calls `getSnapshot` which reads real data
- No mismatch!

---

#### Use the Hook

```typescript
const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

**What:** Combines all three functions into a reactive value.

**How it works:**

1. On mount (client), React calls `subscribe(callback)`
2. React calls `getSnapshot()` to get initial value
3. When our listeners call `onStoreChange()`, React calls `getSnapshot()` again
4. If value changed, React re-renders

---

#### Set Value

```typescript
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
```

**What:** Updates the value in storage and triggers re-renders.

**Supports functional updates:** Like `useState`, you can do `setValue(prev => [...prev, newItem])`.

**`notifyListeners(key)`** - Tells all components using this key to re-read. This is synchronous and doesn't create a DOM event, avoiding the infinite loop.

---

### Why This Architecture?

| Decision                     | Alternative                                     | Why We Chose This                                     |
| ---------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `useSyncExternalStore`       | `useState` + `useEffect`                        | Avoids hydration mismatch, no linter warnings         |
| Module-level listeners       | `StorageEvent` dispatch                         | Avoids infinite loop                                  |
| JSON string cache            | No cache                                        | Prevents unnecessary re-renders                       |
| Separate `getServerSnapshot` | Single `getSnapshot` with `typeof window` check | Cleaner, React's intended pattern                     |
| `useCallback` everywhere     | Inline functions                                | Stable references prevent subscribe/unsubscribe churn |

---

### The Data Flow

**Initial render (SSR):**

```
getServerSnapshot() → defaultValue → render HTML
```

**Initial render (client hydration):**

```
getServerSnapshot() → defaultValue → matches server HTML ✓
```

**After hydration:**

```
getSnapshot() → reads localStorage → real data → re-render with data
```

**User triggers action:**

```
setValue(newData)
  → storage.set(key, newData)     // Persist
  → notifyListeners(key)          // Notify
    → onStoreChange()             // React callback
      → getSnapshot()             // Re-read
        → cache miss, parse JSON
        → return new value
          → React re-renders
```

**Other tab changes data:**

```
StorageEvent fires
  → handler checks e.key
    → invalidate cache
    → onStoreChange()
      → getSnapshot() → returns new value → re-render
```

---

### useStorageFlag

The same pattern, simplified for boolean flags stored as raw strings ("true"/"false"). No JSON parsing needed, so the cache just stores the raw string.

---

This design gives us:

- **SSR-safe** - No hydration mismatches
- **No linter warnings** - No setState in useEffect
- **Performant** - Cached reads, minimal re-renders
- **Cross-tab sync** - Real StorageEvents work
- **Same-tab sync** - Custom listeners work
- **Familiar API** - Like useState, drop-in replacement
