"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** The hint asked for by whatever this node sits in, if anything asks. */
function hintFor(node: EventTarget | null) {
  const marked = node instanceof Element ? node.closest("[data-cursor]") : null;
  return marked?.getAttribute("data-cursor") || null;
}

/**
 * A soft label that follows the pointer over elements marked with
 * data-cursor="Play" (or "View", "Read", "Drag"). The native cursor stays
 * visible; this only adds a hint. Mouse pointers only.
 *
 * The label only ever describes what is under the pointer now. A click answers
 * the hint, so it goes and stays away until the pointer moves again; arriving on
 * a new page clears it; and scrolling re-reads what has moved under a resting pointer.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  /** False from a click or a change of page until the pointer next moves. */
  const live = useRef(false);

  const dismiss = useCallback(() => {
    live.current = false;
    setLabel(null);
  }, []);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;

    function handleMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      live.current = true;
      setLabel(hintFor(event.target));
    }

    // The page has moved under a pointer that has not: read again what it is over.
    function handleScroll() {
      if (!live.current || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (live.current) setLabel(hintFor(document.elementFromPoint(x.get(), y.get())));
      });
    }

    function handleLeave() {
      setLabel(null);
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("click", dismiss, true);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("blur", handleLeave);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("click", dismiss, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("blur", handleLeave);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [reduce, x, y, dismiss]);

  if (reduce) return null;

  return (
    <>
      {/* reads the current path, so it sits in its own boundary like the header does */}
      <Suspense fallback={null}>
        <OnRouteChange run={dismiss} />
      </Suspense>
      <motion.div
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[150]"
        style={{ x: springX, y: springY }}
      >
        <motion.div
          className="-ml-12 -mt-12 grid size-24 place-items-center rounded-full bg-emerald-700/92 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm"
          initial={false}
          animate={{ scale: label ? 1 : 0, opacity: label ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {label}
        </motion.div>
      </motion.div>
    </>
  );
}

/** Runs once the router has landed on another page. */
function OnRouteChange({ run }: { run: () => void }) {
  const pathname = usePathname();
  useEffect(run, [pathname, run]);
  return null;
}
