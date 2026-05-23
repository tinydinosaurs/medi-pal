"use client";

import { useSyncExternalStore, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// No-op subscribe: "mounted" never changes after the first client render.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
