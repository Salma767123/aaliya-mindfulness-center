"use client";

import { Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Keeps smooth scrolling in step with the router: after a navigation the
 * browser jumps (to the top, or to a restored position) and Lenis has to
 * adopt that position instead of easing back to where it was.
 */
function ScrollSync() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [lenis, pathname]);

  return null;
}

/** Smooth scrolling and motion preferences for the whole site. */
export function Providers({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  return (
    <MotionConfig reducedMotion="user">
      {reducedMotion ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.085, smoothWheel: true, anchors: true }}>
          <Suspense fallback={null}>
            <ScrollSync />
          </Suspense>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
