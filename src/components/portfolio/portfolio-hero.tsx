"use client";

import { useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import type { PortfolioEntry } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

type HeroEntry = Pick<PortfolioEntry, "slug" | "title" | "category" | "scope" | "cover" | "sample">;

type PortfolioHeroProps = {
  entries: HeroEntry[];
  /** Number of kinds of work the entries fall into. */
  kinds: number;
  /** Eyebrow and page heading, rendered by the page. */
  header: ReactNode;
  lede: string;
};

const delay = (seconds: number) => ({ "--d": `${seconds.toFixed(2)}s` }) as CSSProperties;
const pad = (value: number) => String(value).padStart(2, "0");

/** How far each print sits from the viewer; nearer prints follow the pointer further. */
const DEPTH = [0.45, 0.95, 0.6, 1, 0.55, 0.9, 0.5];

/**
 * Opens the portfolio with the work itself: every entry as a photographic print.
 *
 * Large screens lay the prints out as a fan across the page. Pointing at, focusing
 * or choosing one lifts it out of the fan and names it in the bar below; the fan
 * leans a little toward the pointer, and left alone the prints take turns.
 * Smaller screens set the same prints in a row to swipe through.
 * Every print links to its entry.
 */
export function PortfolioHero({ entries, kinds, header, lede }: PortfolioHeroProps) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** Prints take turns until the visitor picks one from the bar. */
  const [turns, setTurns] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inView = useInView(stage, { amount: 0.35 });
  const running = turns && inView && !hovered && !focused;

  // Pointer position over the fan, from -0.5 to 0.5 on each axis.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 90, damping: 18, mass: 0.6 });
  const leanY = useSpring(pointerY, { stiffness: 90, damping: 18, mass: 0.6 });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const onPointerLeave = () => {
    setHovered(false);
    pointerX.set(0);
    pointerY.set(0);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const count = entries.length;
  const middle = (count - 1) / 2;
  const current = entries[active];

  return (
    <section className="relative overflow-clip bg-paper pb-10 pt-32 lg:pb-12 lg:pt-36">
      <div className="shell">
        {/* Large screens: the count beside the heading and the intro text under both. Wider still,
            the count and the intro text stack beside the two lines of the heading. */}
        <div className="grid gap-y-5 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-10 xl:grid-cols-[auto_minmax(0,31rem)] xl:justify-between xl:gap-x-16 xl:gap-y-4">
          <div className="xl:row-span-2">{header}</div>
          <p className="eyebrow intro-fade hidden pb-3.5 tabular-nums text-ink-mute lg:block xl:pb-0" style={delay(0.5)}>
            {count} entries
            <span aria-hidden className="mx-2.5 text-ink/25">/</span>
            {kinds} kinds of work
          </p>
          <p className="lede intro-fade max-w-2xl text-pretty text-ink-soft lg:col-span-2 xl:col-span-1 xl:col-start-2 xl:pb-2" style={delay(0.5)}>
            {lede}
          </p>
        </div>

        <div
          ref={stage}
          className="mt-8 lg:mt-12"
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onFocus={() => setFocused(true)}
          onBlur={onBlur}
        >
          {/* ------------------------------------------------------------ the prints */}
          <ul
            aria-label="Portfolio entries"
            className="-mx-[clamp(1.25rem,4.6vw,4.75rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4.6vw,4.75rem)] pb-6 pt-3 [scrollbar-width:none] lg:relative lg:mx-0 lg:block lg:h-[calc(var(--print)*1.25+6.4rem)] lg:overflow-visible lg:p-0 lg:[--print:clamp(11.5rem,15.6vw,14.6rem)] [&::-webkit-scrollbar]:hidden"
          >
            {entries.map((entry, index) => {
              const fromMiddle = (index - middle) / (middle || 1);
              const isActive = index === active;
              return (
                <li
                  key={entry.slug}
                  className="intro-fade w-[62vw] max-w-[16rem] flex-none snap-center lg:absolute lg:w-(--print) lg:max-w-none"
                  style={{
                    ...delay(0.5 + index * 0.07),
                    // spread evenly across the stage, the middle print highest
                    left: `calc(${index / (count - 1 || 1)} * (100% - var(--print)))`,
                    top: `${(fromMiddle * fromMiddle * 3.1).toFixed(2)}rem`,
                    zIndex: isActive ? 40 : 10 + index,
                  }}
                >
                  <Lean x={leanX} y={leanY} depth={DEPTH[index % DEPTH.length]} still={reduce}>
                    <Link
                      href={`/portfolio/${entry.slug}`}
                      prefetch
                      data-cursor="View"
                      data-active={isActive}
                      aria-label={`${entry.title}, ${entry.category}`}
                      onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
                      onFocus={() => setActive(index)}
                      style={
                        {
                          "--tilt": `${index % 2 ? 1.4 : -1.4}deg`,
                          "--fan": `${(fromMiddle * 12).toFixed(2)}deg`,
                          // the prints either side of the lifted one give it room
                          "--nudge": `${index < active ? -0.9 : index > active ? 0.9 : 0}rem`,
                        } as CSSProperties
                      }
                      className="group block rotate-(--tilt) rounded-[1.1rem] bg-white p-1.5 shadow-[0_22px_44px_-26px_rgb(5_58_37/0.55)] ring-1 ring-ink/5 transition-[rotate,translate,scale,box-shadow] duration-700 ease-out-expo motion-reduce:transition-none lg:translate-x-(--nudge) lg:rotate-(--fan) lg:data-[active=true]:-translate-y-9 lg:data-[active=true]:rotate-0 lg:data-[active=true]:scale-[1.07] lg:data-[active=true]:shadow-[0_44px_70px_-30px_rgb(5_58_37/0.6)]"
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-[0.75rem] bg-emerald-100">
                        <Image
                          src={entry.cover.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 16vw, 62vw"
                          loading="eager"
                          className="object-cover transition-transform duration-[1400ms] ease-out-expo lg:group-data-[active=true]:scale-[1.06]"
                        />
                      </span>
                      <span className="block px-2 pb-1.5 pt-2.5">
                        {/* the next print covers the right of each one, so the label keeps to the left */}
                        <span className="flex items-center gap-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em]">
                          <span className="tabular-nums text-ink-mute">{pad(index + 1)}</span>
                          <span className="truncate text-emerald-700">{entry.category}</span>
                        </span>
                        <span className="mt-1.5 block font-display text-[1.1rem] leading-snug text-ink lg:hidden">
                          {entry.title}
                        </span>
                      </span>
                    </Link>
                  </Lean>
                </li>
              );
            })}
          </ul>

          {/* ------------------------------------------------------------ the lifted print, named (large screens) */}
          <div
            aria-hidden
            className="intro-fade relative mt-2 hidden min-h-[4.75rem] items-center gap-x-8 overflow-hidden rounded-[1.75rem] bg-mist px-7 py-3 lg:flex"
            style={delay(1.05)}
          >
            <p className="eyebrow flex flex-none items-center gap-3 text-emerald-700">
              <span className="tabular-nums text-ink-mute">
                {pad(active + 1)} <span className="opacity-50">/ {pad(count)}</span>
              </span>
              {current.category}
              {current.sample ? <SampleTag /> : null}
            </p>

            {/* room for two lines, so a long title never changes the height of the bar */}
            <p className="min-w-0 flex-1 font-display text-[clamp(1.15rem,1.5vw,1.35rem)] leading-[1.2] text-ink">
              <motion.span
                key={current.slug}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                {current.title}
                <span className="ml-3 whitespace-nowrap text-[0.85em] text-emerald-700">{current.scope}</span>
              </motion.span>
            </p>

            {/* one mark per print */}
            <div className="hidden flex-none items-center gap-1.5 xl:flex">
              {entries.map((entry, index) => (
                <button
                  key={entry.slug}
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setTurns(false);
                    setActive(index);
                  }}
                  className="group/mark grid h-6 cursor-pointer place-items-center"
                >
                  <span
                    className={cn(
                      "block h-0.5 rounded-full transition-[width,background-color] duration-500 ease-out-expo",
                      index === active ? "w-9 bg-emerald-600" : "w-3.5 bg-ink/15 group-hover/mark:bg-ink/40",
                    )}
                  />
                </button>
              ))}
            </div>

            <Link
              href={`/portfolio/${current.slug}`}
              tabIndex={-1}
              className="group/open flex flex-none items-center gap-3 text-[0.9rem] font-medium text-ink"
            >
              <span className="hidden xl:inline">View this work</span>
              <span className="grid size-10 place-items-center rounded-full bg-emerald-700 text-white transition-transform duration-500 ease-out-expo group-hover/open:scale-110">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>

            {/* The turn of the lifted print: this line fills along the foot of the bar, then the next print rises. */}
            {turns ? (
              <span
                key={current.slug}
                onAnimationEnd={() => setActive((active + 1) % count)}
                style={{ animationPlayState: running ? "running" : "paused" }}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[intro-line_4.2s_linear_both] bg-emerald-600/60"
              />
            ) : null}
          </div>

          <p className="eyebrow mt-1 flex items-center gap-3 text-ink-mute lg:hidden">
            <span aria-hidden className="h-px w-8 bg-ink/25" />
            Swipe through {count} entries
          </p>
        </div>
      </div>
    </section>
  );
}

/** Shifts a print a few pixels toward the pointer, further the nearer it sits. */
function Lean({
  children,
  x,
  y,
  depth,
  still,
}: {
  children: ReactNode;
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  still: boolean;
}) {
  const shiftX = useTransform(x, (value) => value * depth * 34);
  const shiftY = useTransform(y, (value) => value * depth * 20);
  return <motion.div style={still ? undefined : { x: shiftX, y: shiftY }}>{children}</motion.div>;
}
