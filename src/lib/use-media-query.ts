"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. Returns false on the server and during hydration,
 * then the real value, so layouts should treat false as the safe default.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
