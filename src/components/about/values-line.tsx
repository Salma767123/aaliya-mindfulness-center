"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import type { ImageAsset, Value } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Reveal, Wipe } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";

/* ------------------------------------------------------------------
   The values as a line you can take hold of.

   On the home page the five values drift past as one line of type. Here
   the same line can be held: draw it sideways and each value in turn
   passes through an arched photograph of that value at work, turning
   white where it crosses the picture. Whichever value rests in the arch
   is the one the section speaks about: the center's own sentence for it
   on the left, and on the right the places a visitor will meet it.

   Large screens set all of this as one composition: heading and controls
   above the line, the sentence and the list below it, the arch through
   the middle. Smaller screens set the same parts one under another.
   ------------------------------------------------------------------ */

export type ValueInPractice = Value & {
  /** A photograph of the value at work. */
  image: ImageAsset;
  /** CSS object-position, for photographs whose subject sits off-centre. */
  focus?: string;
  /** Where a visitor meets this value, in the center's own words. */
  meets: string[];
};

type ValuesLineProps = {
  index: string;
  eyebrow: string;
  /** Heading copy. *Asterisks* mark emphasis, "\n" starts a new line. */
  heading: string;
  lede: string;
  values: ValueInPractice[];
};

type View = { active: number; previous: number; direction: 1 | -1; turn: number };

/** Narrowest the arch gets, as width over height. Photographs are sized to cover it. */
const FRAME_RATIO = 0.5;

const LINE =
  "absolute left-1/2 top-1/2 flex -translate-y-1/2 items-center whitespace-nowrap font-display leading-none tracking-[-0.03em] text-[16.5cqw] lg:top-[48%] lg:text-[min(11cqw,12.5rem)]";

/** `sizes` for a photograph that covers the arch: a wide photograph is drawn far wider than the frame. */
function coverSizes(photo: ImageAsset) {
  const scale = Math.max(1, photo.width / photo.height / FRAME_RATIO);
  return `(min-width: 1024px) ${Math.ceil(27 * scale)}vw, ${Math.ceil(72 * scale)}vw`;
}

type WordProps = {
  title: string;
  /** Where the line sits; with `centre`, how far this word is from the middle of the arch. */
  x: MotionValue<number>;
  centre: () => number;
  reach: () => number;
  className?: string;
  leaf: string;
  last: boolean;
  wordRef?: (element: HTMLSpanElement | null) => void;
  onPick?: () => void;
};

/** One value in the line. It is at full strength in the arch and fades as it moves away. */
function Word({ title, x, centre, reach, className, leaf, last, wordRef, onPick }: WordProps) {
  const opacity = useTransform(x, (value) => {
    const distance = Math.min(1, Math.abs(value + centre()) / Math.max(1, reach()));
    return 1 - distance * 0.78;
  });

  return (
    <>
      <motion.span
        ref={wordRef}
        onTap={onPick}
        // the line is a pointer convenience; keyboard and screen-reader users have the numbered buttons
        tabIndex={-1}
        style={{ opacity }}
        className={cn("px-[0.04em]", className)}
      >
        {title}
      </motion.span>
      {last ? null : <span className={cn("mx-[0.3em] size-[0.13em] flex-none shape-leaf", leaf)} />}
    </>
  );
}

export function ValuesLine({ index, eyebrow, heading, lede, values }: ValuesLineProps) {
  const reduce = useReducedMotion();
  const count = values.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  /** Centre of each word, measured along the line. */
  const centres = useRef<number[]>([]);
  const activeRef = useRef(0);
  const arrived = useRef(false);
  const inView = useInView(stageRef, { once: true, margin: "0px 0px -18% 0px" });

  const [view, setView] = useState<View>({ active: 0, previous: 0, direction: 1, turn: 0 });
  const [measured, setMeasured] = useState(false);
  const [limits, setLimits] = useState({ left: 0, right: 0 });

  const x = useMotionValue(0);

  // Keep the line's measurements current: fonts loading and the window resizing both move the words.
  useEffect(() => {
    const line = lineRef.current;
    const stage = stageRef.current;
    if (!line || !stage) return;

    function measure() {
      const words = wordRefs.current.filter((word): word is HTMLSpanElement => word !== null);
      if (words.length === 0 || !stage) return;
      centres.current = words.map((word) => word.offsetLeft + word.offsetWidth / 2);
      setLimits({ left: -centres.current[centres.current.length - 1], right: -centres.current[0] });
      const rest = -centres.current[activeRef.current];
      // Until the section has been seen, the line waits a little to the right of its place.
      x.set(arrived.current ? rest : rest + stage.clientWidth * 0.32);
      setMeasured(true);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(line);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [x]);

  // Arriving: the line glides into place the first time the section is seen.
  useEffect(() => {
    if (!inView || !measured || arrived.current) return;
    arrived.current = true;
    const rest = -centres.current[activeRef.current];
    if (reduce) x.set(rest);
    else animate(x, rest, { duration: 1.8, ease: EASE_OUT });
  }, [inView, measured, reduce, x]);

  function go(target: number) {
    const next = ((target % count) + count) % count;
    const from = activeRef.current;
    activeRef.current = next;
    if (next !== from) {
      setView((current) => ({
        active: next,
        previous: from,
        direction: next > from ? 1 : -1,
        turn: current.turn + 1,
      }));
    }
    const rest = -(centres.current[next] ?? 0);
    if (reduce) x.set(rest);
    else animate(x, rest, { type: "spring", stiffness: 105, damping: 21, mass: 0.9 });
  }

  /** The value whose word is closest to the middle of the arch when the line sits at `at`. */
  function nearestTo(at: number) {
    let nearest = 0;
    let gap = Infinity;
    centres.current.forEach((centre, position) => {
      const distance = Math.abs(at + centre);
      if (distance < gap) {
        gap = distance;
        nearest = position;
      }
    });
    return nearest;
  }

  // While the line is held, the photograph and the text keep up with whichever value is in the arch.
  function follow() {
    const next = nearestTo(x.get());
    const from = activeRef.current;
    if (next === from) return;
    activeRef.current = next;
    setView((current) => ({ active: next, previous: from, direction: next > from ? 1 : -1, turn: current.turn + 1 }));
  }

  // Letting go: the line settles on whichever value is nearest, allowing for the throw.
  function settle(_: unknown, info: PanInfo) {
    go(nearestTo(x.get() + info.velocity.x * 0.16));
  }

  /* The photograph leans a little away from the pointer, for depth. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const leanY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((0.5 - (event.clientX - box.left) / box.width) * 22);
    pointerY.set((0.5 - (event.clientY - box.top) / box.height) * 14);
  }

  const current = values[view.active];
  const reach = () => (stageRef.current?.clientWidth ?? 1200) * 0.34;

  return (
    <div
      ref={stageRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={eyebrow}
      className="@container relative lg:h-[clamp(34rem,46cqw,41rem)]"
      onPointerMove={handlePointerMove}
    >
      {/* every value, for readers who do not use the line */}
      <ul className="sr-only">
        {values.map((value) => (
          <li key={value.title}>
            {value.title}: {value.description}
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------ above the line: heading and note */}
      <div className="shell pointer-events-none relative z-30 flex flex-col gap-y-6 lg:absolute lg:inset-x-0 lg:top-0 lg:flex-row lg:items-start lg:justify-between">
        <div className="pointer-events-auto">
          <Reveal>
            <Eyebrow index={index} tone="light">
              {eyebrow}
            </Eyebrow>
          </Reveal>
          <SplitHeading
            text={heading}
            emClassName="text-emerald-300"
            className="display-lg mt-5"
          />
        </div>

        <Reveal delay={0.15} className="pointer-events-auto lg:w-[min(21rem,25cqw)]">
          <p className="max-w-sm text-[1rem] leading-relaxed text-emerald-100/70">{lede}</p>
        </Reveal>
      </div>

      {/* ------------------------------------------------ the arch and the line through it */}
      <div className="relative mt-8 h-[24rem] sm:h-[30rem] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
        {/* the photograph */}
        <Wipe
          from="bottom"
          className="absolute left-1/2 top-0 h-full w-[72cqw] -translate-x-1/2 overflow-hidden shape-arch bg-emerald-800 sm:w-[46cqw] lg:w-[27cqw]"
        >
          <motion.div className="absolute -inset-[4%]" style={reduce ? undefined : { x: leanX, y: leanY }}>
            {values.map((value, position) => {
              const on = position === view.active;
              const entering = on && view.turn > 0 && !reduce;
              return (
                <motion.div
                  key={value.title}
                  className="absolute inset-0"
                  style={{ zIndex: on ? 2 : position === view.previous ? 1 : 0 }}
                  initial={false}
                  animate={
                    entering
                      ? {
                          clipPath: [
                            view.direction > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
                            "inset(0% 0% 0% 0%)",
                          ],
                          scale: [1.1, 1],
                        }
                      : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
                  }
                  transition={{ duration: 1.15, ease: EASE_OUT }}
                >
                  <Image
                    src={value.image.src}
                    alt={on ? value.image.alt : ""}
                    fill
                    sizes={coverSizes(value.image)}
                    className="object-cover"
                    style={value.focus ? { objectPosition: value.focus } : undefined}
                  />
                </motion.div>
              );
            })}
          </motion.div>
          <div aria-hidden className="absolute inset-0 z-10 bg-emerald-950/45" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-t from-emerald-950/80 to-transparent" />
        </Wipe>

        {/* the line, as it reads against the ground: this is the one that is held */}
        <motion.div
          ref={lineRef}
          aria-hidden
          data-cursor="Drag"
          drag="x"
          dragConstraints={limits}
          dragElastic={0.14}
          dragMomentum={false}
          onDrag={follow}
          onDragEnd={settle}
          style={{ x }}
          className={cn(
            LINE,
            "z-10 cursor-grab touch-pan-y select-none text-emerald-300 transition-opacity duration-700 active:cursor-grabbing",
            measured ? "opacity-100" : "opacity-0",
          )}
        >
          {values.map((value, position) => (
            <Word
              key={value.title}
              title={value.title}
              x={x}
              centre={() => centres.current[position] ?? 0}
              reach={reach}
              leaf="bg-emerald-600"
              last={position === count - 1}
              wordRef={(element) => {
                wordRefs.current[position] = element;
              }}
              onPick={() => go(position)}
            />
          ))}
        </motion.div>

        {/* the same line again, cut to the arch and set in white: the part that crosses the photograph */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-[72cqw] -translate-x-1/2 overflow-hidden shape-arch sm:w-[46cqw] lg:w-[27cqw]"
        >
          <motion.div
            style={{ x }}
            className={cn(LINE, "text-white transition-opacity duration-700", measured && inView ? "opacity-100" : "opacity-0")}
          >
            {values.map((value, position) => (
              <Word
                key={value.title}
                title={value.title}
                x={x}
                centre={() => centres.current[position] ?? 0}
                reach={reach}
                leaf="bg-leaf"
                last={position === count - 1}
              />
            ))}
          </motion.div>
        </div>

        {/* the controls sit on the foot of the arch, next to the picture and the words they change */}
        <div className="absolute bottom-4 left-1/2 z-30 flex w-[calc(72cqw-1.5rem)] max-w-[19rem] -translate-x-1/2 items-center gap-1.5 sm:w-[calc(46cqw-2rem)] lg:bottom-5 lg:w-[calc(27cqw-2rem)]">
          <button
            type="button"
            aria-label="Previous value"
            onClick={() => go(view.active - 1)}
            className="grid size-11 flex-none place-items-center rounded-full border border-white/40 text-white transition-colors duration-500 hover:border-white hover:bg-white hover:text-emerald-900"
          >
            <ArrowLeft className="size-4" />
          </button>
          <ol className="flex flex-1 items-center justify-between">
            {values.map((value, position) => {
              const on = position === view.active;
              return (
                <li key={value.title}>
                  <button
                    type="button"
                    aria-label={value.title}
                    aria-current={on ? "true" : undefined}
                    onClick={() => go(position)}
                    className={cn(
                      "eyebrow relative grid h-11 w-7 place-items-center tabular-nums transition-colors duration-500",
                      on ? "text-white" : "text-white/55 hover:text-white",
                    )}
                  >
                    0{position + 1}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-1 left-1/2 -ml-1 size-2 shape-leaf bg-leaf transition-transform duration-500 ease-out-expo",
                        on ? "scale-100" : "scale-0",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            aria-label="Next value"
            onClick={() => go(view.active + 1)}
            className="grid size-11 flex-none place-items-center rounded-full border border-white/40 text-white transition-colors duration-500 hover:border-white hover:bg-white hover:text-emerald-900"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ below the line: the value in the arch */}
      <div
        aria-live="polite"
        className="shell pointer-events-none relative z-30 mt-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.title}
            className="flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10, transition: { duration: 0.22 } }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <div className="pointer-events-auto lg:w-[min(27rem,29cqw)]">
              <h3 className="eyebrow flex items-center gap-3 text-leaf">
                <span className="tabular-nums">0{view.active + 1}</span>
                <span className="text-emerald-100/80">{current.title}</span>
              </h3>
              <p className="mt-4 font-display text-[clamp(1.7rem,2.6cqw,2.5rem)] leading-[1.12] text-white">
                {current.description}
              </p>
            </div>

            <div className="pointer-events-auto lg:w-[min(21rem,25cqw)]">
              <p className="eyebrow text-emerald-100/60">Where you will meet it</p>
              <ul className="mt-3 border-t border-white/14">
                {current.meets.map((place) => (
                  <li
                    key={place}
                    className="flex gap-3.5 border-b border-white/14 py-3 text-[0.95rem] leading-snug text-emerald-50/90"
                  >
                    <span aria-hidden className="mt-1.5 size-2 flex-none shape-leaf bg-leaf" />
                    {place}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
