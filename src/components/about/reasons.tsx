"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import type { Reason } from "@/types/content";
import { images } from "@/content/images";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/* ------------------------------------------------------------------
   "Why choose Aaliya": seven commitments, read down a line.

   The heading stays in view and travels down its column while the
   seven scroll past. Each commitment stands on a rail: a small drawing,
   its title from the brochure, and one line on what it means in
   practice. The one crossing the middle of the screen is lit, the rail
   fills behind it, and a counter beside the heading keeps the place
   ("03 of 07"); its seven marks jump to any of them. A pointer lights
   whichever it rests on.
   ------------------------------------------------------------------ */

export function Reasons({ reasons, index }: { reasons: Reason[]; /** Section number on the page. */ index: string }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const rows = useRef<Array<HTMLDivElement | null>>([]);
  const total = String(reasons.length).padStart(2, "0");

  // the commitment crossing the middle of the screen is the one in hand
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [reasons.length]);

  function goTo(index: number) {
    const row = rows.current[index];
    if (!row) return;
    const offset = -(window.innerHeight - row.offsetHeight) / 2;
    if (lenis) lenis.scrollTo(row, { offset });
    else row.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section id="why" className="grain relative scroll-mt-10 overflow-clip bg-emerald-900 text-white">
      {/* water texture, barely there */}
      <Parallax distance={-70} className="pointer-events-none absolute -inset-y-24 inset-x-0">
        <Image
          src={images.ripples.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.16] mix-blend-luminosity"
        />
      </Parallax>
      <div aria-hidden className="absolute inset-0 bg-linear-to-b from-emerald-900 via-emerald-900/40 to-emerald-900" />
      {/* a soft light behind the list */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18%] top-[8%] size-[62vmax] rounded-full opacity-70"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-emerald-600) 46%, transparent), transparent)" }}
      />

      <div className="shell section-y relative grid gap-x-12 gap-y-12 lg:grid-cols-12">
        {/* the heading stays in view and travels down the column while the seven scroll past */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <Eyebrow index={index} tone="light">
                Why choose Aaliya
              </Eyebrow>
            </Reveal>
            <SplitHeading text={"Care built\n*on trust.*"} emClassName="text-emerald-300" className="display-lg mt-6" />
            <Reveal delay={0.15}>
              <p className="lede mt-8 max-w-md text-emerald-100/75">
                Seven commitments shape everything the center does, from a single counseling session to a
                programme for a whole institution.
              </p>
            </Reveal>

            {/* keeps the place among the seven, and jumps to any of them */}
            <Reveal delay={0.25} className="mt-10 hidden lg:block">
              <div aria-hidden className="flex items-end gap-3">
                <span className="block h-[4.5rem] overflow-hidden font-display text-[4.5rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                  {reduce ? (
                    String(active + 1).padStart(2, "0")
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={active}
                        className="block"
                        initial={{ y: "70%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-70%", opacity: 0, transition: { duration: 0.22 } }}
                        transition={{ duration: 0.55, ease: EASE_OUT }}
                      >
                        {String(active + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </span>
                <span className="eyebrow pb-2.5 text-emerald-300/75">of {total}</span>
              </div>
              <ol className="mt-4 flex max-w-[19rem] gap-1.5">
                {reasons.map((reason, index) => (
                  <li key={reason.title} className="flex-1">
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Commitment ${index + 1}: ${reason.title}`}
                      aria-current={index === active ? "step" : undefined}
                      className="group/mark block w-full py-2.5"
                    >
                      <span
                        className={cn(
                          "block h-[3px] rounded-full transition-colors duration-500 group-hover/mark:bg-white/70",
                          index <= active ? "bg-leaf" : "bg-white/18",
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mt-9">
                <Button href="/contact" variant="light">
                  Book a consultation
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        <Stagger as="ol" stagger={0.08} className="lg:col-span-7">
          {reasons.map((reason, index) => {
            const current = index === active;
            const reached = index <= active;
            const last = index === reasons.length - 1;
            return (
              <StaggerItem as="li" key={reason.title} className="relative">
                {/* the rail to the next one; it fills once this one has been read */}
                {last ? null : (
                  <span aria-hidden className="absolute left-6 top-6 h-full w-px bg-white/14 sm:left-7 sm:top-7">
                    <span
                      className={cn(
                        "block size-full origin-top bg-leaf transition-transform duration-700 ease-out-expo",
                        index < active ? "scale-y-100" : "scale-y-0",
                      )}
                    />
                  </span>
                )}

                <div
                  ref={(element) => {
                    rows.current[index] = element;
                  }}
                  data-index={index}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActive(index);
                  }}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3.5 pb-3 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-5 sm:pb-4"
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-12 items-center justify-center rounded-full border transition-colors duration-500 sm:size-14",
                      reached ? "border-leaf bg-leaf text-emerald-950" : "border-white/22 bg-emerald-900 text-emerald-200",
                    )}
                  >
                    <ReasonIcon name={reason.icon} className="size-6" />
                  </span>

                  <div
                    className={cn(
                      "rounded-[1.5rem] border px-5 py-5 transition-[background-color,border-color] duration-500 sm:px-7 sm:py-6",
                      current ? "border-emerald-300/30 bg-white/[0.07]" : "border-white/8 bg-white/[0.02]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <h3
                        className={cn(
                          "display-sm transition-colors duration-500",
                          current ? "text-white" : "text-white/80",
                        )}
                      >
                        {reason.title}
                      </h3>
                      <span
                        className={cn(
                          "eyebrow mt-2 flex-none tabular-nums transition-colors duration-500",
                          current ? "text-leaf" : "text-emerald-300/60",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2.5 max-w-[34rem] text-[0.98rem] leading-relaxed transition-colors duration-500",
                        current ? "text-emerald-100/88" : "text-emerald-100/60",
                      )}
                    >
                      {reason.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* on small screens the same invitation closes the list */}
        <Reveal className="lg:hidden">
          <Button href="/contact" variant="light" className="w-full justify-between sm:w-auto sm:justify-start">
            Book a consultation
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- icons */

const ICONS: Record<Reason["icon"], ReactNode> = {
  shield: (
    <>
      <path d="M12 3 5 6v5.2c0 4.3 2.8 7.9 7 9.8 4.2-1.9 7-5.5 7-9.8V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
      <path d="M12 14.4v2.4" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5" />
      <path d="M10.2 3v6.2l-5 8.6A2.1 2.1 0 0 0 7 21h10a2.1 2.1 0 0 0 1.8-3.2l-5-8.6V3" />
      <path d="M7.6 15h8.8" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="m8.9 13.3-1.4 7.2 4.5-2.5 4.5 2.5-1.4-7.2" />
      <path d="m10.1 9.1 1.3 1.3 2.5-2.6" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  lotus: (
    <>
      <path d="M12 4.5c1.9 2.3 2.9 4.7 2.9 7 0 2.4-1.2 4.2-2.9 4.2s-2.9-1.8-2.9-4.2c0-2.3 1-4.7 2.9-7Z" />
      <path d="M9.3 9.2C7.4 8.6 5.6 8.6 4 9.2c.2 3.6 2.4 6.2 6 6.6" />
      <path d="M14.7 9.2c1.9-.6 3.7-.6 5.3 0-.2 3.6-2.4 6.2-6 6.6" />
      <path d="M5 19.2c2.2.6 4.5.9 7 .9s4.8-.3 7-.9" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5v-1A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5v1" />
      <path d="M15.6 5.1a3.2 3.2 0 0 1 0 5.8" />
      <path d="M17.3 14.2a4.5 4.5 0 0 1 3.2 4.3v1" />
    </>
  ),
};

/** The small drawing for one commitment, in the line style of the site's other icons. */
function ReasonIcon({ name, className }: { name: Reason["icon"]; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}
