"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Emblem, EmblemArt } from "./hero-emblem";
import { heroDisplay } from "./hero-font";
import { Backdrop, Foreground, WaterLotus, WaterSwan, type Camera } from "./hero-scene";
import { Stream } from "./hero-stream";

/* ------------------------------------------------------------------
   The hero: a lake at first light.

   At the edge of still water sits the emblem: a figure in meditation, in
   silhouette, before a glowing lotus with a sun behind her head and
   leaves at her knees (see hero-emblem.tsx). It breathes, four seconds
   in and six out. The headline is balanced either side of it:
   "Nurturing Minds," on the left, "Empowering Lives." on the right.
   Hills stand in mist behind, and a lotus and a swan ride on the water
   either side of her (see hero-scene.tsx). Her reflection lies on the
   water, and leaves drift across it, the way thoughts cross a mind. A visitor can touch one to name the thought it carries and let
   it go (see hero-stream.tsx).

   Scrolling is read as a camera. It sinks to the water's edge and moves
   in towards her while dusk falls: the hills and the water darken, the
   lotus is left glowing on the night with its light on the lake, stars
   come out, a second line takes the headline's place, and a short line
   about the work itself settles on the water. The next section, which is
   set in the same dark water, then slides over.

   Layout lives in globals.css (.hero, .hero-stage, .hero-sky,
   .hero-water). This file moves things: with the breath, the pointer
   and the scroll.
   ------------------------------------------------------------------ */

/** One breath, in seconds. */
const INHALE = 4;
const EXHALE = 6;
const BREATH = INHALE + EXHALE;

/** How far the horizon drops as the view tilts up to her, in hundredths of the stage's height. */
const DROP = 8.5;
/** How much she grows as the view moves in. */
const GROW = 0.2;

/** The line that takes the headline's place at night: each half as lines of words. */
const NIGHT_LEFT = [["Stillness"], ["is", "a", "skill."]];
const NIGHT_RIGHT = [["It", "can", "be"], ["learned."]];
/** What the center does, in two short sentences, shown on the water at night. */
const SLOGAN = ["Counseling that listens.", "Mindfulness that lasts."];

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;
const easeInOut = (value: number) => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);
const sine = (value: number) => 0.5 - Math.cos(Math.PI * value) / 2;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const roomy = useMediaQuery("(min-height: 560px)");
  const pinned = roomy && !reduce;
  const still = Boolean(reduce);
  const wide = useMediaQuery("(min-width: 1024px)");
  const inView = useInView(sectionRef);

  /* -------------------------------------------------------------- scroll */
  // Two stretches of scroll: `rise` while the scene turns to night, then `cover` while the next section slides over.
  const { scrollY } = useScroll();
  const top = useMotionValue(0);
  const travel = useMotionValue(1);
  const overlap = useMotionValue(1);
  const unit = useMotionValue(8);
  const mode = useMotionValue(0);

  useEffect(() => {
    mode.set(pinned ? 1 : 0);
  }, [mode, pinned]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    function measure() {
      if (!section || !stage) return;
      const height = stage.offsetHeight;
      unit.set(height / 100);
      top.set(section.getBoundingClientRect().top + window.scrollY);
      travel.set(Math.max(1, section.offsetHeight - height * 2));
      overlap.set(Math.max(1, height));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [unit, top, travel, overlap, pinned]);

  const rise = useTransform<number, number>([scrollY, top, travel, mode], ([y, start, length, on]) =>
    on ? clamp((y - start) / length) : 0,
  );
  const cover = useTransform<number, number>([scrollY, top, travel, overlap, mode], ([y, start, length, after, on]) =>
    on ? clamp((y - start - length) / after) : 0,
  );

  // The scroll as a camera: dusk falls while the view sinks to the water's edge and moves in.
  const dusk = useTransform(rise, (value) => easeInOut(clamp((value - 0.06) / 0.5)));
  const push = useTransform(rise, (value) => easeInOut(clamp(value / 0.8)));
  const drop = useTransform<number, number>([push, unit], ([moved, one]) => moved * DROP * one);

  /* -------------------------------------------------------------- breath */
  const cycle = useMotionValue(0);
  const breathStart = useRef<number | null>(null);
  useAnimationFrame((time) => {
    if (reduce || !inView) return;
    // let the scene arrive before the first breath
    if (breathStart.current === null) breathStart.current = time + 2400;
    const elapsed = time - breathStart.current;
    if (elapsed >= 0) cycle.set(((elapsed / 1000) % BREATH) / BREATH);
  });
  const air = useTransform(cycle, (value) => {
    const turn = INHALE / BREATH;
    return value < turn ? sine(value / turn) : 1 - sine((value - turn) / (1 - turn));
  });

  /* ------------------------------------------------------------- pointer */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 46, damping: 18, mass: 0.7 });
  const leanY = useSpring(pointerY, { stiffness: 46, damping: 18, mass: 0.7 });

  useEffect(() => {
    if (reduce) return;
    function handleMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reduce, pointerX, pointerY]);

  const camera: Camera = { leanX, leanY, air, dusk, push, drop };

  /* -------------------------------------------------------------- emblem */
  // The whole piece leans very slightly with the pointer and lifts with each breath in; it goes
  // down with the horizon and grows as the view moves in. Its layers then move against one
  // another (see hero-emblem.tsx).
  const figureX = useTransform(leanX, (value) => value * 14);
  const figureY = useTransform<number, number>([leanY, air, drop], ([lean, breath, down]) => lean * 4 - breath * 2 + down);
  const figureScale = useTransform(push, [0, 1], [1, 1 + GROW]);
  // its glow on the air: wider with each breath in, and stronger as the light goes
  const auraScale = useTransform<number, number>([air, dusk], ([breath, night]) => 0.9 + breath * 0.22 + night * 0.2);
  const auraOpacity = useTransform<number, number>([air, dusk], ([breath, night]) =>
    Math.min(1, 0.6 + breath * 0.4 + night * 0.4),
  );
  const nightAura = useTransform<number, number>([air, dusk], ([breath, night]) => night * (0.7 + breath * 0.3));
  const raysOpacity = useTransform(dusk, [0, 1], [0.7, 0.5]);

  /* --------------------------------------------------------------- water */
  const reflectionOpacity = useTransform<number, number>(
    [air, dusk],
    ([breath, night]) => 0.34 - breath * 0.08 + night * 0.28,
  );
  const surfaceOpacity = useTransform(dusk, [0, 0.8], [1, 0]);
  // what floats in front of her is nearer still: it slides out past the view as it moves in
  const streamOpacity = useTransform(rise, [0.04, 0.3], [1, 0]);
  const streamScale = useTransform(push, [0, 1], [1, 1.9]);
  const lotusOpacity = useTransform(rise, [0.1, 0.38], [1, 0]);
  const lotusScale = useTransform(push, [0, 1], [1, 2.6]);

  // the last thing to arrive: the line about the work, under her on the water
  const sloganOpacity = useTransform(rise, [0.68, 0.82], [0, 1]);
  const sloganY = useTransform(rise, [0.68, 0.84], [16, 0]);

  const copyOpacity = useTransform(rise, [0, 0.1], [1, 0]);
  const copyY = useTransform(rise, [0, 0.1], [0, 26]);
  const copyVisibility = useTransform(rise, (value) => (value >= 0.1 ? "hidden" : "visible"));

  /* --------------------------------------------------------------- words */
  // The two halves of the headline lean against the pointer and, where they stand either side of
  // her, ease apart and thin out as the light goes.
  const spread = useMotionValue(0);
  useEffect(() => {
    spread.set(wide ? 46 : 0);
  }, [spread, wide]);
  const wingLeftX = useTransform<number, number>(
    [leanX, rise, spread],
    ([lean, risen, apart]) => lean * -16 - apart * easeOut(clamp(risen / 0.4)),
  );
  const wingRightX = useTransform<number, number>(
    [leanX, rise, spread],
    ([lean, risen, apart]) => lean * -16 + apart * easeOut(clamp(risen / 0.4)),
  );
  const wingY = useTransform(leanY, (value) => value * -8);
  const dayWords = useTransform(rise, [0.08, 0.3], [1, 0]);
  const dayBlur = useTransform(rise, [0.08, 0.3], ["blur(0px)", "blur(10px)"]);
  const nightX = useTransform(leanX, (value) => value * -16);

  /* --------------------------------------------------------------- cover */
  // as the next section slides over, the scene lifts more slowly behind it
  const worldY = useTransform<number, number>([cover, unit], ([covered, one]) => -covered * 9 * one);

  return (
    <section ref={sectionRef} className={cn("hero", heroDisplay.variable)} data-idle={inView ? undefined : ""}>
      <div ref={stageRef} className="hero-stage">
        <motion.div className="absolute inset-0" style={still ? undefined : { y: worldY }}>
          {/* ----------------------------------------------- sky, hills and mist */}
          <Backdrop camera={camera} still={still} />

          {/* ------------------------------------------------------------ the water */}
          <motion.div className="hero-water" style={still ? undefined : { y: drop }}>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={still ? undefined : { opacity: surfaceOpacity }}
            >
              <div className="hero-water__surface" />
            </motion.div>
            {!still ? (
              <motion.div aria-hidden className="hero-water__night pointer-events-none" style={{ opacity: dusk }}>
                <motion.div className="hero-water__glow" style={{ opacity: nightAura }} />
              </motion.div>
            ) : null}

            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-(--figure)">
              <motion.div
                className="hero-reflection"
                style={
                  still ? undefined : { opacity: reflectionOpacity, x: figureX, scale: figureScale, originX: 0.5, originY: 0 }
                }
              >
                <div className="hero-figure__in absolute inset-0" style={delay(0.9)}>
                  <div className="hero-reflection__turn">
                    <EmblemArt reflection />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="absolute inset-x-0 top-0"
              style={still ? undefined : { opacity: streamOpacity, scale: streamScale, originX: 0.5, originY: 0 }}
            >
              <div className="intro-fade" style={delay(1.1)}>
                <Stream air={air} rise={rise} still={still} />
              </div>
            </motion.div>

            <motion.div
              className="shell absolute inset-x-0 top-[calc(var(--band)+2*var(--u))] flex flex-col items-center text-center"
              style={still ? undefined : { opacity: copyOpacity, y: copyY, visibility: copyVisibility }}
            >
              <p
                className="intro-fade max-w-[34rem] text-[0.96rem] leading-[1.6] text-ink-soft sm:text-[1.06rem] lg:text-[1.1rem]"
                style={delay(1)}
              >
                A calm, confidential space for psychological counseling, mindfulness and growth
                <span className="hidden sm:inline">, for individuals, families, institutions and organizations</span>.
              </p>
              <div
                className="intro-fade mt-[calc(2.2*var(--u))] flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-3"
                style={delay(1.12)}
              >
                <Button href="/contact" className="justify-between sm:justify-start">
                  Book a consultation
                </Button>
                <Button href="#services" variant="outline" icon={false} className="justify-center bg-paper/70 backdrop-blur-sm">
                  Explore our services
                </Button>
              </div>
            </motion.div>

            {/* what the center does, said plainly, once night has fallen */}
            {!still ? (
              <motion.p
                className="hero-slogan hero-type shell pointer-events-none absolute inset-x-0 top-[calc(var(--band)*0.74)] flex flex-col items-center text-center"
                style={{ opacity: sloganOpacity, y: sloganY }}
              >
                <span aria-hidden className="mb-[calc(1.1*var(--u))] size-2.5 shape-leaf bg-emerald-300" />
                <span>
                  {SLOGAN[0]} <br className="sm:hidden" />
                  {SLOGAN[1]}
                </span>
              </motion.p>
            ) : null}

            {/* how to breathe along, and what the leaves are for */}
            {!still ? (
              <motion.div
                aria-hidden
                className="absolute inset-x-0 bottom-[calc(1.8*var(--u))] hidden justify-center sm:flex [@media(max-height:699px)]:hidden"
                style={{ opacity: copyOpacity }}
              >
                <div className="intro-fade flex items-center gap-4 text-[0.78rem] text-ink-mute" style={delay(2.1)}>
                  <BreathCue cycle={cycle} breath={air} />
                  <span className="h-3 w-px bg-ink/15" />
                  <span>Thoughts drift by like leaves. Touch one to let it go.</span>
                </div>
              </motion.div>
            ) : null}
          </motion.div>

          {/* --------------------------------------- above the water: the emblem, and the words */}
          <div className="hero-sky pointer-events-none">
            <motion.div
              className="absolute inset-x-0 top-[calc(var(--horizon)-var(--figure)-3.2*var(--u))] hidden lg:[@media(min-height:720px)]:block"
              style={still ? undefined : { opacity: copyOpacity }}
            >
              <p className="eyebrow intro-fade flex items-center justify-center gap-3 text-emerald-700" style={delay(0.85)}>
                <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                Counseling · Mindfulness · Madurai
              </p>
            </motion.div>

            <div className="hero-words">
              <motion.h1
                aria-label="Nurturing Minds, Empowering Lives."
                className="hero-headline hero-type text-[length:var(--type)] leading-[0.96] text-ink"
                style={still ? undefined : { opacity: dayWords, filter: dayBlur }}
              >
                <motion.span
                  aria-hidden
                  className="hero-wing hero-wing--left"
                  style={still ? undefined : { x: wingLeftX, y: wingY }}
                >
                  <span className="inline lg:block">
                    <Word step={0}>Nurturing</Word>
                  </span>{" "}
                  <span className="inline lg:block">
                    <Word step={1}>Minds,</Word>
                  </span>
                </motion.span>
                <motion.span
                  aria-hidden
                  className="hero-wing hero-wing--right text-emerald-700"
                  style={still ? undefined : { x: wingRightX, y: wingY }}
                >
                  <span className="inline lg:block">
                    <Word step={3}>Empowering</Word>
                  </span>{" "}
                  <span className="inline lg:block">
                    <Word step={4}>Lives.</Word>
                  </span>
                </motion.span>
              </motion.h1>

              {/* the line that takes its place at night */}
              {!still ? (
                <p className="hero-headline hero-headline--night hero-type leading-[0.96]">
                  <motion.span className="hero-wing hero-wing--left" style={{ x: nightX, y: wingY }}>
                    <NightLines lines={NIGHT_LEFT} from={0} progress={rise} />
                  </motion.span>
                  <motion.span className="hero-wing hero-wing--right" style={{ x: nightX, y: wingY }}>
                    <NightLines lines={NIGHT_RIGHT} from={4} progress={rise} />
                  </motion.span>
                </p>
              ) : null}
            </div>

            <motion.div
              className="hero-figure"
              style={still ? undefined : { x: figureX, y: figureY, scale: figureScale, originX: 0.5, originY: 1 }}
            >
              <div aria-hidden className="intro-fade absolute inset-0" style={delay(0.1)}>
                <motion.div className="absolute inset-0" style={still ? undefined : { opacity: raysOpacity }}>
                  <div className="hero-rays" />
                </motion.div>
                <motion.div className="hero-aura" style={still ? undefined : { scale: auraScale, opacity: auraOpacity }} />
                {!still ? (
                  <motion.div className="hero-aura hero-aura--night" style={{ scale: auraScale, opacity: nightAura }} />
                ) : null}
              </div>
              <Emblem leanX={leanX} leanY={leanY} air={air} open={push} still={still} />
            </motion.div>
          </div>

          {/* the lotus and the swan either side of it, on the water */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-(--horizon) hidden h-0 md:block"
            style={still ? undefined : { opacity: lotusOpacity, y: drop, scale: lotusScale }}
          >
            <div className="intro-fade" style={delay(1.3)}>
              <WaterLotus />
              <WaterSwan />
            </div>
          </motion.div>

          {/* leaves on the near bank, rising into the corners as the view sinks */}
          {!still ? <Foreground camera={camera} /> : null}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- words */

/** One word of the headline, rising into place behind a mask. */
function Word({ children, step }: { children: string; step: number }) {
  return (
    <span className="intro-mask">
      <span className="hero-rise" style={delay(0.12 + step * 0.1)}>
        {children}
      </span>
    </span>
  );
}

/** One half of the night line: its words surface one after another once the light has gone. */
function NightLines({
  lines,
  from,
  progress,
}: {
  lines: string[][];
  /** Where this half's first word falls in the whole line's order. */
  from: number;
  progress: MotionValue<number>;
}) {
  let order = from;
  return (
    <>
      {lines.map((words, line) => (
        <span key={line} className="inline lg:block">
          {words.map((word) => {
            const index = order++;
            return (
              <NightWord key={index} progress={progress} index={index}>
                {word}
              </NightWord>
            );
          })}
        </span>
      ))}
    </>
  );
}

function NightWord({ children, progress, index }: { children: ReactNode; progress: MotionValue<number>; index: number }) {
  const start = 0.5 + index * 0.034;
  const opacity = useTransform(progress, [start, start + 0.09], [0, 1]);
  const y = useTransform(progress, [start, start + 0.12], ["0.35em", "0em"]);
  const blur = useTransform(progress, [start, start + 0.09], ["blur(10px)", "blur(0px)"]);

  return (
    <>
      <motion.span className="inline-block will-change-transform" style={{ opacity, y, filter: blur }}>
        {children}
      </motion.span>{" "}
    </>
  );
}

/* ----------------------------------------------------------------- breath cue */

/** Names the breath she is taking, so a visitor can fall in with it. */
function BreathCue({ cycle, breath }: { cycle: MotionValue<number>; breath: MotionValue<number> }) {
  const [inhaling, setInhaling] = useState(true);
  useMotionValueEvent(cycle, "change", (value) => setInhaling(value < INHALE / BREATH));
  const dot = useTransform(breath, [0, 1], [0.55, 1]);

  return (
    <span className="eyebrow flex items-center gap-2.5 whitespace-nowrap text-emerald-800/85">
      <motion.span className="size-2 flex-none rounded-full bg-emerald-600" style={{ scale: dot }} />
      <span className="relative grid">
        <span className={cn("col-start-1 row-start-1 transition-opacity duration-700", inhaling ? "opacity-100" : "opacity-0")}>
          Breathe in
        </span>
        <span className={cn("col-start-1 row-start-1 transition-opacity duration-700", inhaling ? "opacity-0" : "opacity-100")}>
          Breathe out
        </span>
      </span>
    </span>
  );
}
