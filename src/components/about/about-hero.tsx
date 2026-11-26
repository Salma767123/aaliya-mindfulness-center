"use client";

import { useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "motion/react";
import type { ImageAsset } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { ArrowDown } from "@/components/ui/icons";

/* ------------------------------------------------------------------
   The About hero: who the center is here for.

   The center's work runs from a single conversation to a whole
   community, and the page opens on exactly that. The headline is one
   sentence whose last words change: "Here for one person." becomes
   "a family.", "a school.", "a workplace.", "a community.". The
   photograph is a picture of that work and changes with the words.
   Under the headline the five sit as a scale to step along; under the
   picture is what the center offers whoever is named, in its own words.

   Left alone the five take turns, and the line over each one fills
   while it holds the picture. Pointing at the scale or the list holds
   it there; choosing one stops the turns for good.
   ------------------------------------------------------------------ */

export type Audience = {
  /** Finishes the headline, full stop included: "one person." */
  name: string;
  /** Its name on the scale and over the list of what is offered. */
  label: string;
  /** What the center offers them, in the center's own words. */
  offers: string[];
  image: ImageAsset;
  /** CSS object-position, for photographs whose subject sits off-centre. */
  focus?: string;
};

type AboutHeroProps = {
  eyebrow: string;
  /** Opens the headline: "Here for". */
  lead: string;
  audiences: Audience[];
  lede: string;
  /** Where to read on: the section that sets out the work in full. */
  more: { href: string; label: string };
};

/** Seconds each audience holds the picture while they take turns. */
const HOLD_SECONDS = 5.6;

const delay = (seconds: number) => ({ "--d": `${seconds.toFixed(2)}s` }) as CSSProperties;
const pad = (value: number) => String(value).padStart(2, "0");

/** "a, b, c and d" */
function list(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

type View = {
  active: number;
  /** The picture the new one is drawn across. */
  previous: number;
  /** Whether the step went up the scale, which sets the side the picture comes from. */
  forward: boolean;
  /** Zero until the first change, so nothing moves on arrival except the intro. */
  changes: number;
};

export function AboutHero({ eyebrow, lead, audiences, lede, more }: AboutHeroProps) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const stops = useRef<Array<HTMLButtonElement | null>>([]);
  const inView = useInView(stage, { amount: 0.4 });

  const [view, setView] = useState<View>({ active: 0, previous: 0, forward: true, changes: 0 });
  /** The audiences take turns until the visitor chooses one. */
  const [turns, setTurns] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const running = turns && inView && !hovered && !focused && !reduce;

  const count = audiences.length;
  const current = audiences[view.active];
  const moved = view.changes > 0 && !reduce;

  const next = () =>
    setView((now) => ({
      active: (now.active + 1) % count,
      previous: now.active,
      forward: true,
      changes: now.changes + 1,
    }));

  const choose = (index: number) => {
    setTurns(false);
    setView((now) =>
      now.active === index
        ? now
        : { active: index, previous: now.active, forward: index > now.active, changes: now.changes + 1 },
    );
  };

  // The scale reads left to right, so the arrow keys step along it.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = (view.active + step + count) % count;
    choose(index);
    stops.current[index]?.focus();
  };

  /* A slight lean away from the pointer, so the picture has some depth. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 50, damping: 18, mass: 0.7 });
  const leanY = useSpring(pointerY, { stiffness: 50, damping: 18, mass: 0.7 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((0.5 - (event.clientX - box.left) / box.width) * 24);
    pointerY.set((0.5 - (event.clientY - box.top) / box.height) * 14);
  };

  /* The picture fills the screen, so resting the pointer on it must not stop the turns.
     They wait only while the visitor is on the scale or reading what is offered. */
  const hold = {
    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") setHovered(true);
    },
    onPointerLeave: () => setHovered(false),
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <section className="relative bg-paper pt-[5.25rem] lg:pt-24">
      <div className="shell">
        {/* One screen tall, less the header: the picture takes whatever the words under it leave. */}
        <div
          className="flex min-h-[calc(100svh-5.25rem)] flex-col pb-9 lg:min-h-[calc(100svh-6rem)] lg:pb-10"
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        >
          {/* ------------------------------------------------------------ the picture */}
          <div
            ref={stage}
            onPointerMove={handlePointerMove}
            className="intro-sweep relative flex min-h-[29rem] flex-1 flex-col justify-end overflow-hidden rounded-[1.75rem] bg-emerald-900 text-white lg:min-h-[25rem] lg:rounded-[2.5rem]"
            style={delay(0.1)}
          >
            <div className="intro-zoom absolute inset-0" style={delay(0.1)}>
              <motion.div className="absolute inset-0" style={reduce ? undefined : { x: leanX, y: leanY }}>
                {/* Every photograph stays in place. The one just chosen lies on top and is drawn across
                    the one before it, from the right going up the scale and from the left coming back. */}
                {audiences.map((audience, index) => {
                  const isActive = index === view.active;
                  const wasActive = !isActive && index === view.previous;
                  const hidden = view.forward ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
                  return (
                    <motion.div
                      key={audience.label}
                      // a little larger than the frame, so the lean never shows an edge
                      className="absolute -inset-[3%]"
                      style={{ zIndex: isActive ? 2 : wasActive ? 1 : 0 }}
                      initial={false}
                      animate={{ clipPath: isActive && moved ? [hidden, "inset(0% 0% 0% 0%)"] : "inset(0% 0% 0% 0%)" }}
                      transition={isActive ? { duration: 1.15, ease: EASE_OUT } : { duration: 0 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        initial={false}
                        animate={{ scale: isActive && moved ? [1.12, 1] : 1 }}
                        transition={isActive ? { duration: 1.9, ease: EASE_OUT } : { duration: 0 }}
                      >
                        <Image
                          src={audience.image.src}
                          alt={isActive ? audience.image.alt : ""}
                          fill
                          preload={index === 0}
                          sizes="(min-width: 1024px) 100vw, (min-width: 640px) 140vw, 200vw"
                          className="object-cover"
                          style={audience.focus ? { objectPosition: audience.focus } : undefined}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* The picture is deepened only where words sit on it. Narrow screens: the lower half, where
                the headline runs the full width. Wide screens: a band along the foot for the scale and
                the left side for the headline, which leaves the people on the right clear. */}
            <div aria-hidden className="absolute inset-0 z-[3] bg-emerald-950/15" />
            <div
              aria-hidden
              className="absolute inset-0 z-[3] bg-linear-to-t from-emerald-950/95 via-emerald-950/58 via-45% to-emerald-950/10 lg:via-emerald-950/45 lg:via-28% lg:to-transparent lg:to-60%"
            />
            <div
              aria-hidden
              className="absolute inset-0 z-[3] hidden bg-linear-to-r from-emerald-950/75 via-emerald-950/35 via-35% to-transparent to-68% lg:block"
            />

            <div className="relative z-[4] p-5 sm:p-8 lg:p-11">
              <p className="eyebrow intro-fade flex items-center gap-3 text-emerald-200" style={delay(0.75)}>
                <span aria-hidden className="size-2.5 shape-leaf bg-leaf" />
                {eyebrow}
              </p>

              <h1
                aria-label={`${lead} ${list(audiences.map((audience) => audience.name.replace(/\.$/, "")))}.`}
                className="display-xl mt-4 lg:mt-5"
              >
                <span aria-hidden className="block">
                  {lead.split(" ").map((word, index, words) => (
                    <span key={index}>
                      <span className="intro-mask">
                        <span className="intro-rise" style={delay(0.8 + index * 0.07)}>
                          {word}
                        </span>
                      </span>
                      {index < words.length - 1 ? " " : null}
                    </span>
                  ))}
                </span>
                <span aria-hidden className="block whitespace-nowrap text-emerald-200">
                  {/* rises once on arrival; after that each name leaves upward and the next rises in its place */}
                  <span className="intro-mask">
                    <span className="intro-rise" style={delay(1)}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={current.name}
                          className="inline-block"
                          initial={reduce ? false : { y: "118%" }}
                          animate={{ y: "0%" }}
                          exit={reduce ? undefined : { y: "-118%" }}
                          transition={{ duration: 0.5, ease: EASE_OUT }}
                        >
                          {current.name}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </span>
              </h1>

              {/* ---------------------------------------------------------- the scale */}
              <div
                role="group"
                aria-label="Who the center works with"
                onKeyDown={handleKeyDown}
                {...hold}
                className="intro-fade mt-6 grid gap-x-2 sm:gap-x-4 lg:mt-9 lg:gap-x-6"
                style={{ ...delay(1.25), gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              >
                {audiences.map((audience, index) => {
                  const isActive = index === view.active;
                  return (
                    <button
                      key={audience.label}
                      ref={(element) => {
                        stops.current[index] = element;
                      }}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => choose(index)}
                      className="group relative min-h-11 cursor-pointer pt-3.5 text-left lg:pt-4"
                    >
                      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/30" />
                      {isActive ? (
                        turns && !reduce ? (
                          // its turn: the line fills, then the next one takes the picture
                          <span
                            aria-hidden
                            key={view.changes}
                            onAnimationEnd={next}
                            style={{
                              animationDuration: `${HOLD_SECONDS}s`,
                              animationPlayState: running ? "running" : "paused",
                            }}
                            className="absolute inset-x-0 top-0 h-0.5 origin-left animate-[intro-line_1s_linear_both] bg-emerald-300"
                          />
                        ) : (
                          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-emerald-300" />
                        )
                      ) : null}
                      <span
                        aria-hidden
                        className={cn(
                          "eyebrow block tabular-nums transition-colors duration-500",
                          isActive ? "text-emerald-200" : "text-white/55 group-hover:text-emerald-200",
                        )}
                      >
                        {pad(index + 1)}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 block text-[0.98rem] font-medium leading-snug transition-colors duration-500 max-md:sr-only",
                          isActive ? "text-white" : "text-white/65 group-hover:text-white",
                        )}
                      >
                        {audience.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ under the picture */}
          <div className="mt-6 grid gap-x-12 gap-y-8 lg:mt-7 lg:grid-cols-12">
            <p className="lede intro-fade text-ink-soft lg:col-span-5" style={delay(1.35)}>
              {lede}
            </p>

            <div {...hold} className="intro-fade lg:col-span-7 xl:col-span-6 xl:col-start-7" style={delay(1.45)}>
              <div className="flex items-center justify-between gap-6">
                <p className="eyebrow flex items-center gap-3 text-emerald-700">
                  <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                  For {current.label}
                </p>
                <a
                  href={more.href}
                  className="tap group inline-flex flex-none items-center gap-2 text-[0.9rem] font-medium text-ink transition-colors duration-300 hover:text-emerald-700"
                >
                  <span className="link-line pb-0.5">{more.label}</span>
                  <ArrowDown className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-y-1" />
                </a>
              </div>

              {/* Spoken only once the visitor is choosing: the turns it takes on its own stay quiet. */}
              <div aria-live={turns ? "off" : "polite"} className="mt-4 sm:min-h-[4.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.ul
                    key={current.label}
                    aria-label={`What the center offers ${current.label.toLowerCase()}`}
                    className="grid gap-x-6 max-sm:border-b max-sm:border-ink/12 sm:grid-cols-3"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.55, ease: EASE_OUT }}
                  >
                    {current.offers.map((offer) => (
                      <li
                        key={offer}
                        className="flex gap-3 border-t border-ink/12 py-3 text-[0.98rem] leading-snug text-ink sm:pb-0"
                      >
                        <span aria-hidden className="mt-1.5 size-2 flex-none shape-leaf bg-emerald-600" />
                        {offer}
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
