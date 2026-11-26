"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CheckIcon, LinkIcon } from "@/components/ui/icons";

/** Wraps the article body and draws a thin bar across the top of the window as it is read. */
export function ReadingProgress({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.35", "end 0.75"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[95] h-[3px] origin-left bg-emerald-600"
        style={{ scaleX: reduce ? scrollYProgress : scaleX }}
      />
      <div ref={ref} className={className}>
        {children}
      </div>
    </>
  );
}

/** Copies the page address so the article can be shared. */
export function CopyLink() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the address bar is still there.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="tap group inline-flex items-center gap-3 text-[0.9rem] font-medium text-ink transition-colors duration-300 hover:text-emerald-700"
    >
      <span className="grid size-10 place-items-center rounded-full border border-ink/15 transition-colors duration-500 group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
        {copied ? <CheckIcon className="size-4" /> : <LinkIcon className="size-4" />}
      </span>
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}
