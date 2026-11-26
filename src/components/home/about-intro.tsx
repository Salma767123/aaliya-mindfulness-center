"use client";

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useInView } from "motion/react";
import { useLenis } from "lenis/react";
import type { Recognition, Therapist } from "@/types/content";
import { images } from "@/content/images";
import { EASE_OUT } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/* ------------------------------------------------------------------
   "Who you will meet": the founder, told as one move from stillness
   to the work.

   The section begins where "Our vision" ends. The meditation photograph
   on the vision's ring lifts off, turns through the air and comes down
   as the top print of a stack: behind it, in depth, lie five more
   photographs, one for each thing the founder is known for. As the page
   scrolls, the top print turns over like a page and the next comes
   forward.

   What each photograph stands for is not set in a list or a panel. It
   is one line of type beside the photograph (never on it). The lines
   sit on a drum that the scroll turns, so one rolls away upward as the
   next comes round from below. Five small drawings under it mark the
   place and jump to any of the five; the one in hand draws itself and
   is underlined with a stroke of the pen.

   Large screens: the section holds still while this plays (GSAP
   ScrollTrigger reads the scroll; the layers are moved in 3D).
   Smaller screens and reduced motion: no pinning and no flight. The
   same stack and drum are shown, the line below the photograph; the
   five take turns, and choosing one stops them.
   ------------------------------------------------------------------ */

/** How long the section holds while the five are told, in screen heights. */
const TRAVEL = 2.3;
/** Seconds each line holds the stack while the five take turns (smaller screens). */
const HOLD_SECONDS = 4.6;
/** The share of the hold over which the meditation print turns over, and the first line takes its place. */
const OPENING = 0.13;
/** How far round the drum the next line waits, in degrees. */
const DRUM_STEP = 78;
/** The drum's axis lies this far behind the type, as a CSS transform origin. */
const DRUM_ORIGIN = "50% 100% -4.5rem";

const pad = (value: number) => String(value).padStart(2, "0");
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const lerp = (from: number, to: number, at: number) => from + (to - from) * at;
const easeInOut = (value: number) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2);

/**
 * Where the stack stands for a share of the hold: 0 is the meditation print on top,
 * 1 the first line's photograph, and so on up to `count`, the last. Each photograph
 * rests on top for a while, then gives way.
 */
function standing(progress: number, count: number) {
  if (progress <= OPENING) return smooth(clamp((progress - 0.02) / (OPENING - 0.02)));
  const along = ((progress - OPENING) / (1 - OPENING)) * (count - 1);
  const step = Math.min(count - 2, Math.floor(along));
  return 1 + step + smooth(clamp((along - step - 0.3) / 0.4));
}

/** The share of the hold at which a line's photograph rests on top, for jumping to it. */
function restingAt(index: number, count: number) {
  if (index === 0) return OPENING + 0.03;
  return OPENING + (index / (count - 1)) * (1 - OPENING);
}

/**
 * How a print lies, by its place in the stack: 0 on top, positive waiting behind
 * (further back, a little up and to the left, and fainter), negative turned over.
 * A print turns about its left edge, the way a page does.
 */
function lie(place: number) {
  if (place >= 0) {
    return { x: place * -7.5, y: place * -8.5, z: place * -80, turn: place * 4, opacity: Math.max(0, 1 - place * 0.31) };
  }
  const gone = Math.min(1, -place);
  return { x: 0, y: 0, z: gone * 30, turn: gone * -104, opacity: Math.max(0, 1 - gone * 1.15) };
}

/** How a line sits on the drum: `away` is how many places it is from facing the reader (positive: still to come). */
function facing(away: number) {
  const turn = Math.max(-1, Math.min(1, away));
  return { turn: turn * -DRUM_STEP, opacity: Math.max(0, 1 - Math.abs(turn) * 1.7) };
}

/** One line on the drum: the small label over it, and the line itself. `rank` is its place in the telling. */
type Line = { rank: number; label: string; title: string };

export function AboutIntro({ therapist }: { therapist: Therapist }) {
  const items = therapist.recognition;
  const count = items.length;
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const roomy = useMediaQuery("(min-width: 1024px) and (min-height: 700px)");
  /** The section holds and the scroll tells it. Otherwise it is shown whole. */
  const told = roomy && !reduce;

  const section = useRef<HTMLElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const prints = useRef<Array<HTMLDivElement | null>>([]);
  const inView = useInView(section, { amount: 0.3 });

  /** The line in hand: 0 to count - 1, or -1 while the meditation print is still on top. */
  const [{ active, changes }, setView] = useState({ active: 0, changes: 0 });
  /** Smaller screens: the five take turns until the visitor chooses one. */
  const [turns, setTurns] = useState(true);
  const [focused, setFocused] = useState(false);
  const running = !told && turns && inView && !focused && !reduce;

  const show = (index: number) =>
    setView((now) => (now.active === index ? now : { active: index, changes: now.changes + 1 }));
  const next = () => setView((now) => ({ active: (Math.max(0, now.active) + 1) % count, changes: now.changes + 1 }));

  /** Choosing a line: where the scroll tells the story, go to its place in it; otherwise show it and stop the turns. */
  const choose = (index: number) => {
    const element = section.current;
    if (told && element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const target = top + (element.offsetHeight - window.innerHeight) * restingAt(index, count);
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    setTurns(false);
    show(index);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  /* ---------------------------------------------------------------- the telling */
  useEffect(() => {
    const root = section.current;
    const stack = deck.current;
    if (!told || !root || !stack) return;
    gsap.registerPlugin(ScrollTrigger);
    const update = () => ScrollTrigger.update();
    lenis?.on("scroll", update);

    const source = document.querySelector<HTMLElement>('[data-handoff="meditation"]');
    let shown = -2;

    const context = gsap.context(() => {
      const heading = gsap.utils.toArray<HTMLElement>("[data-line]", root);
      const rises = gsap.utils.toArray<HTMLElement>("[data-rise]", root);
      const faces = gsap.utils.toArray<HTMLElement>("[data-face]", root);
      const arrival = { at: 0 };
      const telling = { at: 0 };

      /** Lays the stack out for where the telling stands; `arrived` fades the waiting prints in as the first one lands. */
      const layOut = (stand: number, arrived: number) => {
        const place = (element: HTMLElement | null, rank: number, waiting: boolean) => {
          if (!element) return;
          const pose = lie(rank - stand);
          gsap.set(element, {
            xPercent: pose.x,
            yPercent: pose.y,
            z: pose.z,
            rotationY: pose.turn,
            transformOrigin: "0% 50%",
            autoAlpha: pose.opacity * (waiting ? arrived : 1),
          });
        };
        place(opener.current, 0, false);
        prints.current.forEach((element, index) => place(element, index + 1, true));
      };

      const render = () => {
        const landing = arrival.at;
        const stand = standing(telling.at, count);

        // ---- the flight: the meditation photograph leaves the vision's ring and lands on the stack
        const craft = flyer.current;
        const from = source?.getBoundingClientRect();
        const to = stack.getBoundingClientRect();
        const flying = Boolean(craft && from && from.width > 0 && landing > 0.002 && landing < 0.998);
        if (source) source.style.opacity = landing > 0.002 ? "0" : "";
        if (craft) craft.style.display = flying ? "block" : "none";
        if (craft && from && flying) {
          const along = easeInOut(landing);
          const lift = Math.sin(Math.PI * landing);
          const width = lerp(from.width, to.width, along);
          const height = lerp(from.height, to.height, along);
          gsap.set(craft, {
            x: lerp(from.left + from.width / 2, to.left + to.width / 2, along) - width / 2,
            y: lerp(from.top + from.height / 2, to.top + to.height / 2, along) - height / 2 - lift * 36,
            width,
            height,
            borderRadius: lerp(Math.min(from.width, from.height) / 2, 24, along),
            rotationY: lift * -34,
            rotationX: lift * 13,
            rotationZ: lift * -4,
            scale: 1 + lift * 0.1,
            transformPerspective: 1100,
          });
        }

        // ---- the stack: the meditation print is on it once it has landed (or at once, if there is nothing to fly)
        layOut(stand, smooth(clamp((landing - 0.55) / 0.45)));
        if (opener.current && source && landing < 0.998) gsap.set(opener.current, { autoAlpha: 0 });

        // ---- the drum: each line faces the reader while its photograph is on top
        faces.forEach((face) => {
          const pose = facing(Number(face.dataset.face) - stand);
          gsap.set(face, { rotationX: pose.turn, autoAlpha: pose.opacity, transformOrigin: DRUM_ORIGIN });
        });

        // ---- the words arrive as it lands: the heading line by line, then the rest in order
        heading.forEach((line, order) => {
          gsap.set(line, { yPercent: (1 - smooth(clamp((landing - 0.34 - order * 0.08) / 0.3))) * 112 });
        });
        rises.forEach((element) => {
          const order = Number(element.dataset.rise);
          const up = smooth(clamp((landing - 0.42 - order * 0.05) / 0.26));
          gsap.set(element, { opacity: up, y: (1 - up) * 26 });
        });

        // ---- the line in hand: none yet while the meditation print is on top
        const now = Math.min(count, Math.round(stand)) - 1;
        if (now !== shown) {
          shown = now;
          setView((view) => (view.active === now ? view : { active: now, changes: view.changes + 1 }));
        }
      };

      gsap.to(arrival, {
        at: 1,
        ease: "none",
        onUpdate: render,
        scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: 0.4, onRefresh: render },
      });
      gsap.to(telling, {
        at: 1,
        ease: "none",
        onUpdate: render,
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.4, onRefresh: render },
      });
      render();
    }, root);

    return () => {
      lenis?.off("scroll", update);
      context.revert();
      if (source) source.style.opacity = "";
      // back to the first line for the layout that takes turns
      setView((view) => (view.active < 0 ? { active: 0, changes: view.changes + 1 } : view));
    };
  }, [told, count, lenis]);

  if (!count) return null;

  /** Where the telling stands when the scroll is not driving it: the line in hand faces the reader. */
  const stand = Math.max(0, active) + 1;

  /** Smaller screens: the stack is laid out by the line in hand, and moves by itself. */
  const settled = (rank: number): CSSProperties | undefined => {
    if (told) return undefined;
    const pose = lie(rank - stand);
    return {
      transform: `translate3d(${pose.x}%, ${pose.y}%, ${pose.z}px) rotateY(${pose.turn}deg)`,
      opacity: pose.opacity,
      visibility: pose.opacity > 0 ? "visible" : "hidden",
    };
  };

  const lines: Line[] = [
    ...(told && therapist.summary ? [{ rank: 0, label: "It begins in stillness", title: therapist.summary }] : []),
    ...items.map((item, index) => ({ rank: index + 1, label: item.label, title: item.title })),
  ];

  const Rise = told ? Arrives : Reveal;
  const who = therapist.name ? `${therapist.name}, ${therapist.role}` : `the center's ${therapist.role}`;

  return (
    <section
      ref={section}
      className="relative bg-mist"
      style={told ? { height: `${(1 + TRAVEL) * 100}svh` } : undefined}
    >
      <div
        className={cn(
          told ? "sticky top-0 flex h-svh items-center overflow-hidden pt-[4.5rem]" : "section-y overflow-clip",
        )}
      >
        <div className="shell w-full">
          <div className="mx-auto grid max-w-[64rem] gap-x-16 gap-y-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] xl:gap-x-20">
            {/* ---------------------------------------------------------- heading */}
            <div className="lg:col-start-2 lg:row-start-1">
              <Rise order={0}>
                <Eyebrow index="02">Who you will meet</Eyebrow>
              </Rise>
              {told ? (
                <h2 className="display-lg mt-5 text-ink">
                  <span className="block overflow-hidden pb-[0.08em]">
                    <span data-line className="block">
                      A practice built
                    </span>
                  </span>
                  <span className="-mt-[0.08em] block overflow-hidden pb-[0.14em]">
                    <span data-line className="block">
                      on <span className="text-emerald-600">listening.</span>
                    </span>
                  </span>
                </h2>
              ) : (
                <SplitHeading text={"A practice built\non *listening.*"} className="display-lg mt-5 text-ink" />
              )}
              <Rise order={1} delay={0.1}>
                <p className="mt-3 max-w-[30rem] text-[1.02rem] leading-relaxed text-ink-soft lg:mt-1.5">
                  Led by <span className="font-medium text-ink">{who}</span>.
                  {/* where the scroll tells the story this is the first line on the drum */}
                  {!told && therapist.summary ? ` ${therapist.summary}.` : null}
                </p>
              </Rise>
            </div>

            {/* ---------------------------------------------------------- the stack of photographs */}
            <div className="relative mx-auto w-full max-w-[17rem] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start">
              <div ref={deck} className="relative aspect-[4/5] [perspective:1300px]">
                {items.map((item, index) => (
                  <div
                    key={item.title}
                    ref={(element) => {
                      prints.current[index] = element;
                    }}
                    style={{ zIndex: count - index, ...settled(index + 1) }}
                    className={cn(
                      "absolute inset-0 origin-left overflow-hidden rounded-[1.5rem] bg-emerald-900 shadow-[0_26px_50px_-28px_rgb(3_39_26/0.7)] will-change-transform",
                      !told && "transition-[transform,opacity,visibility] duration-[900ms] ease-out-expo motion-reduce:transition-none",
                    )}
                  >
                    <Image
                      src={item.image.src}
                      alt={!told && index === active ? item.image.alt : ""}
                      fill
                      sizes="(min-width: 1024px) 21rem, 17rem"
                      className="object-cover"
                      style={item.focus ? { objectPosition: item.focus } : undefined}
                    />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[28%] bg-linear-to-t from-emerald-950/65 to-transparent" />
                    <p aria-hidden className="eyebrow absolute bottom-4 left-4 tabular-nums text-white/75">
                      {pad(index + 1)} / {pad(count)}
                    </p>
                  </div>
                ))}

                {/* the print that arrives from "Our vision" and is the first to turn over */}
                {told ? (
                  <div
                    ref={opener}
                    style={{ zIndex: count + 1 }}
                    className="absolute inset-0 origin-left overflow-hidden rounded-[1.5rem] bg-emerald-900 shadow-[0_26px_50px_-28px_rgb(3_39_26/0.7)] will-change-transform"
                  >
                    <Image src={images.meditationForest.src} alt="" fill sizes="21rem" className="object-cover object-[32%_18%]" />
                  </div>
                ) : null}
              </div>
            </div>

            {/* ---------------------------------------------------------- the line, and the five */}
            <div className="lg:col-start-2 lg:row-start-2 lg:self-end" onFocus={() => setFocused(true)} onBlur={handleBlur}>
              <Rise order={3} delay={0.22} className="lg:max-w-[31rem]">
                <div aria-hidden>
                  <Drum lines={lines} stand={told ? null : stand} />
                </div>
              </Rise>

              <Rise order={4} delay={0.3}>
                <div className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-5 lg:mt-6">
                  {/* the five, as small drawings: the one in hand draws itself and is underlined */}
                  <ol aria-label="What the founder is known for" className="relative -ml-2 flex items-center gap-1.5">
                    {/* where the five take turns, this keeps the time and hands on to the next */}
                    {!told && turns && !reduce ? (
                      <li
                        key={changes}
                        aria-hidden
                        onAnimationEnd={next}
                        style={{ animationDuration: `${HOLD_SECONDS}s`, animationPlayState: running ? "running" : "paused" }}
                        className="pointer-events-none absolute size-0 animate-[intro-line_1s_linear_both]"
                      />
                    ) : null}
                    {items.map((item, index) => {
                      const isActive = index === active;
                      return (
                        <li key={item.title}>
                          <button
                            type="button"
                            aria-pressed={isActive}
                            aria-label={`${item.label}: ${item.title}`}
                            title={item.label}
                            onClick={() => choose(index)}
                            className={cn(
                              "relative grid size-11 cursor-pointer place-items-center transition-[color,translate] duration-500 ease-out-expo hover:-translate-y-0.5 hover:text-emerald-700",
                              isActive ? "text-emerald-700" : index < active ? "text-emerald-700/55" : "text-ink-mute/55",
                            )}
                          >
                            <RoleIcon
                              name={item.icon}
                              drawn={isActive && changes > 0 && !reduce}
                              live={isActive && inView && !reduce}
                              className="size-[1.6rem]"
                            />
                            {isActive ? (
                              <svg
                                viewBox="0 0 40 8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                focusable="false"
                                className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 text-emerald-600"
                              >
                                <motion.path
                                  d="M2 5.5C8 1.5 13 7.5 20 4.5S32 2 38 4.8"
                                  initial={reduce ? false : { pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
                                />
                              </svg>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ol>

                  <Button href="/about" variant="outline" className="w-full justify-between sm:w-auto sm:justify-start">
                    Meet the therapist
                  </Button>
                </div>
              </Rise>
            </div>
          </div>
        </div>
      </div>

      {/* the photograph in flight between the two sections; it belongs to neither, so it is drawn over the page */}
      {told
        ? createPortal(
            <div
              ref={flyer}
              aria-hidden
              style={{ display: "none" }}
              className="pointer-events-none fixed left-0 top-0 z-[60] overflow-hidden bg-emerald-900 shadow-[0_40px_70px_-30px_rgb(2_26_17/0.8)] will-change-transform"
            >
              <Image src={images.meditationForest.src} alt="" fill sizes="21rem" className="object-cover object-[32%_18%]" />
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

/** A piece of the words that comes up as the photograph lands; the scroll moves it (see the telling). */
function Arrives({ children, order, className }: { children: ReactNode; order: number; delay?: number; className?: string }) {
  return (
    <div data-rise={order} className={className}>
      {children}
    </div>
  );
}

/**
 * The lines, on a drum. One faces the reader; the one before has rolled away upward and the
 * next waits below. With `stand` the drum is set by that place and moves by itself; without
 * it the scroll turns it (see the telling).
 */
function Drum({ lines, stand }: { lines: Line[]; stand: number | null }) {
  return (
    <div className="relative h-[6.6rem] [perspective:900px] sm:h-[5.4rem] lg:h-[7rem]">
      {lines.map((line) => {
        const pose = stand === null ? null : facing(line.rank - stand);
        return (
          <div
            key={line.rank}
            data-face={line.rank}
            style={
              pose
                ? {
                    transform: `rotateX(${pose.turn}deg)`,
                    transformOrigin: DRUM_ORIGIN,
                    opacity: pose.opacity,
                    visibility: pose.opacity > 0 ? "visible" : "hidden",
                  }
                : undefined
            }
            className={cn(
              // beside the photograph the line stands on the foot of its box; under it, on small screens, it hangs from the top
              "absolute inset-0 flex flex-col will-change-transform [backface-visibility:hidden] lg:justify-end",
              pose && "transition-[transform,opacity,visibility] duration-700 ease-out-expo motion-reduce:transition-none",
            )}
          >
            <span className="eyebrow text-emerald-700">{line.label}</span>
            <span className="mt-2 block text-balance font-display text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.5rem] lg:text-[1.7rem]">
              {line.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------- drawings */

type Drawing = {
  /** The outline, in the order it is drawn. */
  lines: string[];
  /** The part that keeps moving while its line is in hand. */
  accent: (live: boolean) => ReactNode;
};

/** Seconds of stillness between two passes of a drawing's moving part. */
const REST = 1.9;

/** A stroke that writes itself again and again while live, and is simply there otherwise. */
function Rewrite({ d, live, delay = 0, duration = 0.7 }: { d: string; live: boolean; delay?: number; duration?: number }) {
  return (
    <motion.path
      d={d}
      initial={false}
      animate={{ pathLength: live ? [0, 1] : 1 }}
      transition={live ? { duration, ease: "easeInOut", delay, repeat: Infinity, repeatDelay: REST } : { duration: 0 }}
    />
  );
}

/** A mark that comes and goes while live, and is absent otherwise. */
function Pulse({ d, live, delay = 0, filled = false }: { d: string; live: boolean; delay?: number; filled?: boolean }) {
  return (
    <motion.path
      d={d}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      initial={false}
      animate={{ opacity: live ? [0, 1, 1, 0] : 0 }}
      transition={
        live ? { duration: 1.5, times: [0, 0.25, 0.7, 1], ease: "easeInOut", delay, repeat: Infinity } : { duration: 0.3 }
      }
    />
  );
}

const DRAWINGS: Record<Recognition["icon"], Drawing> = {
  // a microphone, and the sound leaving it
  microphone: {
    lines: [
      "M12 3a2.75 2.75 0 0 1 2.75 2.75v4.5a2.75 2.75 0 0 1-5.5 0v-4.5A2.75 2.75 0 0 1 12 3Z",
      "M6.5 10.5a5.5 5.5 0 0 0 11 0",
      "M12 16v4.5M8.75 20.5h6.5",
    ],
    accent: (live) => (
      <>
        <Pulse live={live} d="M3.7 5.6c-.9 1.7-.9 3.5 0 5.2" />
        <Pulse live={live} d="M20.3 5.6c.9 1.7.9 3.5 0 5.2" delay={0.35} />
      </>
    ),
  },
  // a cup, catching the light
  trophy: {
    lines: [
      "M8 4.5h8v4a4 4 0 0 1-8 0v-4Z",
      "M8 6H5.75c0 2.1.9 3.4 2.6 3.8M16 6h2.25c0 2.1-.9 3.4-2.6 3.8",
      "M12 12.5V16M10.25 16h3.5l.6 3.5h-4.7l.6-3.5Z",
    ],
    accent: (live) => (
      <>
        <Pulse live={live} d="M20.25 1.75v3M18.75 3.25h3" />
        <Pulse live={live} d="M3.75 12.5v2.2M2.65 13.6h2.2" delay={0.6} />
      </>
    ),
  },
  // a guest on the screen, and the light that says the programme is on air
  television: {
    lines: [
      "M5.7 7h12.6a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V9.2A2.2 2.2 0 0 1 5.7 7Z",
      "M8.5 3.25 12 7l3.5-3.75M8 21h8",
      "M9.1 11.3a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0ZM7.6 16.7a3 3 0 0 1 6 0",
    ],
    accent: (live) => <Pulse live={live} filled d="M15.6 10.6a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0Z" />,
  },
  // an open book, its lines being written
  book: {
    lines: [
      "M12 6.75C10.1 5.5 7.7 5 4.5 5.3v12.5c3.2-.3 5.6.2 7.5 1.45 1.9-1.25 4.3-1.75 7.5-1.45V5.3c-3.2-.3-5.6.2-7.5 1.45Z",
      "M12 6.75v12.5",
    ],
    accent: (live) => (
      <>
        <Rewrite live={live} d="M6.75 9.3c1 .05 2 .25 3 .6" />
        <Rewrite live={live} d="M6.75 12.1c1 .05 2 .25 3 .6" delay={0.3} />
        <Rewrite live={live} d="M14.25 9.9c1-.35 2-.55 3-.6" delay={0.6} />
        <Rewrite live={live} d="M14.25 12.7c1-.35 2-.55 3-.6" delay={0.9} />
      </>
    ),
  },
  // a presentation board, the point on it being made
  board: {
    lines: [
      "M5.3 4h13.4a1.8 1.8 0 0 1 1.8 1.8v7.4a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8V5.8A1.8 1.8 0 0 1 5.3 4Z",
      "M12 15v3M8.5 21l3.5-3 3.5 3",
    ],
    accent: (live) => <Rewrite live={live} d="m7.25 11.75 2.75-2.6 2.4 1.7 4.35-3.85" duration={1.1} />,
  },
};

type RoleIconProps = {
  name: Recognition["icon"];
  /** Draw the outline once, as its line is taken in hand. */
  drawn?: boolean;
  /** Keep its moving part going. */
  live?: boolean;
  className?: string;
};

/** The small drawing for one line, in the line style of the site's other icons. */
function RoleIcon({ name, drawn = false, live = false, className }: RoleIconProps) {
  const drawing = DRAWINGS[name];
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
      {drawing.lines.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          initial={false}
          animate={{ pathLength: drawn ? [0, 1] : 1 }}
          transition={drawn ? { duration: 0.85, ease: EASE_OUT, delay: 0.12 + index * 0.14 } : { duration: 0 }}
        />
      ))}
      {drawing.accent(live)}
    </svg>
  );
}
