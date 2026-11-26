"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * The visitor's reduced-motion preference, safe to use while hydrating.
 *
 * It reports false on the server and for the first client render, so the
 * markup matches what the server sent, and then switches to the real value.
 * (Reading the preference directly during hydration makes server and client
 * disagree, and React then leaves the server's inline transforms in place.)
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
