"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLenis } from "lenis/react";
import type { ImageAsset, VisionStage } from "@/types/content";
import { images } from "@/content/images";
import { EASE_OUT } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";

/* ------------------------------------------------------------------
   The vision as a ripple.

   A still centre (the lotus), then circles that widen from the center
   itself, to the individuals it supports, to the communities they live
   in. On large screens the scene pins and the scroll tells it in three
   stages; the statement lights up phrase by phrase, each ring carries
   that phrase, and photographs surface along the rings. The water
   answers the pointer: moving or tapping sends out ripples, and the
   layers lean with the mouse.

   On small screens and for reduced motion the same composition is shown
   whole, without pinning.
   ------------------------------------------------------------------ */

/** Ring radii in a 1000-unit square, one per stage, innermost first. */
const RING_RADII = [205, 350, 495] as const;

type Satellite = {
  image: ImageAsset;
  /** Which ring it sits on. */
  stage: 1 | 2;
  /** Position around the ring in degrees; 0 is three o'clock, positive is clockwise. */
  angle: number;
  /** Width as a percentage of the field. */
  size: number;
  frame: string;
  /** How strongly it leans with the pointer. */
  depth: number;
  /** Scroll window (0-1 of the pinned travel) over which it surfaces. */
  from: number;
  to: number;
  focus?: string;
};

const SATELLITES: Satellite[] = [
  { image: images.lakeside, stage: 1, angle: -40, size: 21, frame: "aspect-[4/5] shape-leaf", depth: 1, from: 0.36, to: 0.52 },
  { image: images.meditationForest, stage: 1, angle: 152, size: 17, frame: "aspect-square rounded-full", depth: 0.65, from: 0.42, to: 0.58, focus: "object-[32%_18%]" },
  { image: images.communityCircle, stage: 2, angle: 40, size: 26, frame: "aspect-[5/4] shape-stone", depth: 1.45, from: 0.68, to: 0.84 },
  { image: images.trainingRoom, stage: 2, angle: 212, size: 22, frame: "aspect-[4/5] shape-leaf-flip", depth: 1.15, from: 0.74, to: 0.9 },
  { image: images.parentChild, stage: 2, angle: -98, size: 15, frame: "aspect-square rounded-full", depth: 0.85, from: 0.79, to: 0.94 },
];

/** When each ring appears, as a window of the pinned travel. */
const RING_WINDOWS: Array<[number, number]> = [
  [0, 0.1],
  [0.28, 0.44],
  [0.6, 0.76],
];

type Ripple = { id: number; x: number; y: number };

export function Vision({ stages }: { stages: VisionStage[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const roomy = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const pinned = roomy && !reduce;
  const count = stages.length;

  // Scroll through the pinned scene drives everything; unpinned, the scene is shown complete.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollYProgress: statementScroll } = useScroll({ target: statementRef, offset: ["start 0.9", "end 0.5"] });
  const mode = useMotionValue(0);
  useEffect(() => {
    mode.set(pinned ? 1 : 0);
  }, [mode, pinned]);
  const progress = useTransform<number, number>([scrollYProgress, mode], ([travel, on]) => (on ? travel : 1));
  const reading = useTransform<number, number>([scrollYProgress, statementScroll, mode], ([travel, own, on]) =>
    on ? travel : own,
  );

  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.min(count - 1, Math.floor(latest * count));
    setStage((current) => (current === next ? current : next));
  });

  // The pointer: a lean for the layers, and ripples on the water.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 46, damping: 18, mass: 0.7 });
  const leanY = useSpring(pointerY, { stiffness: 46, damping: 18, mass: 0.7 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [touched, setTouched] = useState(false);
  const lastRipple = useRef({ x: -999, y: -999, time: 0, id: 0 });

  function ripple(x: number, y: number, force: boolean) {
    const last = lastRipple.current;
    const distance = Math.hypot(x - last.x, y - last.y);
    const elapsed = performance.now() - last.time;
    if (!force && (distance < 130 || elapsed < 140)) return;
    lastRipple.current = { x, y, time: performance.now(), id: last.id + 1 };
    setRipples((current) => [...current.slice(-7), { id: last.id + 1, x, y }]);
    setTouched(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse" || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    ripple(event.clientX - rect.left, event.clientY - rect.top, false);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduce || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    ripple(event.clientX - rect.left, event.clientY - rect.top, true);
  }

  function goToStage(index: number) {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    const target = top + travel * ((index + 0.86) / count);
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  const backdropScale = useTransform(progress, [0, 1], [1.18, 1.02]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="vision-title"
      className="grain relative overflow-clip rounded-t-[2rem] bg-emerald-950 text-white lg:rounded-t-[3.5rem]"
      style={pinned ? { height: `${count * 100}svh` } : undefined}
    >
      <h2 id="vision-title" className="sr-only">
        Our vision
      </h2>

      <div
        ref={sceneRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className={cn("relative", pinned && "sticky top-0 h-svh overflow-hidden")}
      >
        {/* water */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={reduce ? undefined : { scale: backdropScale }}>
          <Image src={images.ripples.src} alt="" fill sizes="100vw" className="object-cover opacity-[0.14] mix-blend-luminosity" />
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 68% 50%, transparent 0%, color-mix(in srgb, var(--color-emerald-950) 78%, transparent) 100%)",
          }}
        />

        {/* ripples sent out by the pointer */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {ripples.map((item) => (
            <span
              key={item.id}
              className="water-ring"
              style={{ left: item.x, top: item.y }}
              onAnimationEnd={() => setRipples((current) => current.filter((entry) => entry.id !== item.id))}
            />
          ))}
        </div>

        <div
          className={cn(
            "shell relative grid items-center gap-x-10 gap-y-16 lg:grid-cols-12",
            pinned ? "h-full pb-6 pt-16" : "pb-10 pt-24 sm:pt-28",
          )}
        >
          {/* ---------------------------------------------------------------- words */}
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow index="01" tone="light">
                Our vision
              </Eyebrow>
            </Reveal>

            <p
              ref={statementRef}
              className="mt-7 font-display text-[clamp(1.95rem,3.25vw,3.3rem)] leading-[1.09] tracking-[-0.02em]"
            >
              {stages.map((item, stageIndex) => {
                const words = item.phrase.split(" ");
                const emphasis = (item.emphasis ?? []).map((word) => word.toLowerCase());
                // each phrase lights up inside its own third of the story
                const from = stageIndex / count + 0.03;
                const span = 0.23 / (count / 3);
                return words.map((word, wordIndex) => (
                  <StatementWord
                    key={`${stageIndex}-${wordIndex}`}
                    progress={reading}
                    start={from + (span * wordIndex) / (words.length + 0.8)}
                    end={from + (span * (wordIndex + 1.8)) / (words.length + 0.8)}
                    still={Boolean(reduce)}
                    emphasised={emphasis.includes(word.toLowerCase().replace(/[^a-z]/g, ""))}
                  >
                    {word}
                  </StatementWord>
                ));
              })}
            </p>

            {pinned ? (
              <div className="mt-9 xl:mt-12">
                <div className="grid items-start gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
                  {stages.map((item, index) => (
                    <StageTab
                      key={item.label}
                      index={index}
                      count={count}
                      label={item.label}
                      active={stage === index}
                      progress={progress}
                      onSelect={() => goToStage(index)}
                    />
                  ))}
                </div>

                <div className="relative mt-6 min-h-[5.5rem]" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={stage}
                      className="max-w-md text-[1.02rem] leading-relaxed text-emerald-50/78"
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                      transition={{ duration: 0.55, ease: EASE_OUT }}
                    >
                      {stages[stage].caption}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <AboutLink className="mt-5" />
              </div>
            ) : null}
          </div>

          {/* ---------------------------------------------------------------- the ripple */}
          <div className="lg:col-span-7">
            <RippleField
              stages={stages}
              progress={progress}
              leanX={leanX}
              leanY={leanY}
              pinned={pinned}
              activeStage={pinned ? stage : null}
              still={Boolean(reduce)}
            />
          </div>
        </div>

        {/* a quiet invitation to touch the water; leaves once it has been touched */}
        {!reduce ? (
          <p
            aria-hidden
            className={cn(
              "eyebrow pointer-events-none absolute bottom-6 right-[clamp(1.25rem,4.6vw,4.75rem)] hidden items-center gap-3 text-emerald-200/60 transition-opacity duration-700 lg:flex",
              touched ? "opacity-0" : "opacity-100",
            )}
          >
            <span className="relative grid size-5 place-items-center">
              <span className="absolute inset-0 animate-ripple rounded-full border border-emerald-200/60" />
              <span className="size-1 rounded-full bg-emerald-200" />
            </span>
            Move across the water
          </p>
        ) : null}
      </div>

      {/* unpinned: the three stages set out below the composition */}
      {!pinned ? (
        <div className="shell relative pb-24 sm:pb-28">
          <ol className="grid gap-x-10 gap-y-10 border-t border-white/14 pt-10 md:grid-cols-3">
            {stages.map((item, index) => (
              <Reveal as="li" key={item.label} delay={index * 0.08}>
                <p className="eyebrow tabular-nums text-leaf">0{index + 1}</p>
                <h3 className="display-sm mt-3">{item.label}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-emerald-50/75">{item.caption}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.1}>
            <AboutLink className="mt-10" />
          </Reveal>
        </div>
      ) : null}
    </section>
  );
}

function AboutLink({ className }: { className?: string }) {
  return (
    <Link
      href="/about"
      className={cn("tap group inline-flex items-center gap-3 text-[0.95rem] font-medium text-emerald-200", className)}
    >
      <span className="link-line pb-1">Read about the center</span>
      <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
    </Link>
  );
}

function StatementWord({
  children,
  progress,
  start,
  end,
  still,
  emphasised,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  still: boolean;
  emphasised: boolean;
}) {
  const opacity = useTransform(progress, [start, Math.min(end, 1)], [0.16, 1]);
  return (
    <>
      <motion.span className={cn(emphasised && "text-emerald-300")} style={still ? undefined : { opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}

function StageTab({
  index,
  count,
  label,
  active,
  progress,
  onSelect,
}: {
  index: number;
  count: number;
  label: string;
  active: boolean;
  progress: MotionValue<number>;
  onSelect: () => void;
}) {
  const fill = useTransform(progress, [index / count, (index + 1) / count], [0, 1]);
  return (
    <button type="button" onClick={onSelect} aria-current={active ? "step" : undefined} className="group text-left">
      <span className="block h-px w-full bg-white/16">
        <motion.span className="block h-full origin-left bg-leaf" style={{ scaleX: fill }} />
      </span>
      <span
        className={cn(
          "eyebrow mt-4 block tabular-nums transition-colors duration-500",
          active ? "text-leaf" : "text-white/35 group-hover:text-white/60",
        )}
      >
        0{index + 1}
      </span>
      <span
        className={cn(
          "mt-1.5 block font-display text-[1.25rem] leading-tight transition-colors duration-500 xl:text-[1.4rem]",
          active ? "text-white" : "text-white/40 group-hover:text-white/70",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function RippleField({
  stages,
  progress,
  leanX,
  leanY,
  pinned,
  activeStage,
  still,
}: {
  stages: VisionStage[];
  progress: MotionValue<number>;
  leanX: MotionValue<number>;
  leanY: MotionValue<number>;
  pinned: boolean;
  /** Stage in focus while the scene is pinned; null when the whole composition is shown at once. */
  activeStage: number | null;
  still: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(620);

  // Ring lettering is drawn in field units, so it is resized to stay near 11px on screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  const letterSize = Math.min(38, Math.max(16, Math.round((11.5 * 1000) / width)));

  const fieldScale = useTransform(progress, [0, 1], [0.94, 1]);
  const fieldX = useTransform(leanX, (value) => value * -16);
  const fieldY = useTransform(leanY, (value) => value * -12);
  const coreX = useTransform(leanX, (value) => value * 10);
  const coreY = useTransform(leanY, (value) => value * 8);
  const coreZoom = useTransform(progress, [0, 1], [1.28, 1.06]);

  return (
    <div
      ref={boxRef}
      className={cn(
        "relative mx-auto aspect-square",
        pinned ? "w-full max-w-[min(70svh,42rem)]" : "my-6 w-[88%] max-w-[30rem] sm:my-12",
      )}
    >
      {/* rings, each carrying its phrase of the vision */}
      <motion.div aria-hidden className="absolute inset-0" style={still ? undefined : { scale: fieldScale, x: fieldX, y: fieldY }}>
        {/* where the circles will reach, drawn faintly before they arrive */}
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 size-full overflow-visible text-emerald-100">
          {RING_RADII.map((radius) => (
            <circle
              key={radius}
              cx="500"
              cy="500"
              r={radius + letterSize}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.32"
              strokeWidth="1"
              strokeDasharray="1 7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {stages.slice(0, RING_RADII.length).map((item, index) => (
          <Ring
            key={item.ring}
            index={index}
            text={item.ring}
            letterSize={letterSize}
            progress={progress}
            dimmed={activeStage !== null && index < activeStage}
            still={still}
          />
        ))}
      </motion.div>

      {/* the still centre */}
      <div className="absolute left-1/2 top-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2">
        <span aria-hidden className="absolute -inset-[16%] animate-ripple rounded-full border border-emerald-200/30" />
        <span
          aria-hidden
          className="absolute -inset-[16%] animate-ripple rounded-full border border-emerald-200/30"
          style={{ animationDelay: "3.5s" } as CSSProperties}
        />
        <motion.div
          className="relative size-full overflow-hidden rounded-full shadow-[0_0_0_1px_rgb(194_223_208/0.4),0_0_70px_0_rgb(140_196_170/0.22),0_30px_80px_-20px_rgb(0_0_0/0.7)]"
          style={still ? undefined : { x: coreX, y: coreY }}
        >
          <motion.div className="absolute inset-0" style={still ? undefined : { scale: coreZoom }}>
            <Image
              src={images.lotus.src}
              alt={images.lotus.alt}
              fill
              sizes="(min-width: 1024px) 14vw, 30vw"
              className="object-cover object-[50%_42%]"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* photographs surfacing along the rings */}
      {SATELLITES.map((satellite, index) => (
        <SatelliteImage
          key={satellite.image.src}
          satellite={satellite}
          index={index}
          progress={progress}
          leanX={leanX}
          leanY={leanY}
          still={still}
        />
      ))}
    </div>
  );
}

function Ring({
  index,
  text,
  letterSize,
  progress,
  dimmed,
  still,
}: {
  index: number;
  text: string;
  letterSize: number;
  progress: MotionValue<number>;
  /** True once the story has moved on to a wider ring. */
  dimmed: boolean;
  still: boolean;
}) {
  const id = `ring-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const radius = RING_RADII[index];
  const [from, to] = RING_WINDOWS[index];
  const opacity = useTransform(progress, [from, to], [index === 0 ? 0.45 : 0, 1]);
  const scale = useTransform(progress, [from, to], [index === 0 ? 0.92 : 0.86, 1]);

  // Repeat the phrase as many times as fit comfortably, then let textLength space it evenly.
  const circumference = 2 * Math.PI * radius;
  const unit = `${text.toUpperCase()}  ·  `;
  const repeat = Math.max(1, Math.round(circumference / (letterSize * 0.98) / unit.length));

  return (
    <motion.div className="absolute inset-0" style={still ? undefined : { opacity, scale }}>
      <svg
        viewBox="0 0 1000 1000"
        className="orbit absolute inset-0 size-full overflow-visible text-emerald-100"
        style={
          {
            "--orbit": `${150 + index * 60}s`,
            animationDirection: index % 2 === 1 ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        <defs>
          <path
            id={id}
            d={`M500,500 m-${radius},0 a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <circle
          cx="500"
          cy="500"
          r={radius - letterSize * 1.25}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <text
          fontSize={letterSize}
          letterSpacing="0.3em"
          className="fill-current font-sans font-semibold transition-opacity duration-700"
          style={{ opacity: dimmed ? 0.4 : 0.82 }}
        >
          <textPath href={`#${id}`} textLength={Math.floor(circumference) - 6} lengthAdjust="spacing">
            {unit.repeat(repeat)}
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
}

function SatelliteImage({
  satellite,
  index,
  progress,
  leanX,
  leanY,
  still,
}: {
  satellite: Satellite;
  index: number;
  progress: MotionValue<number>;
  leanX: MotionValue<number>;
  leanY: MotionValue<number>;
  still: boolean;
}) {
  const radians = (satellite.angle * Math.PI) / 180;
  const reach = RING_RADII[satellite.stage] / 10;
  const left = (50 + reach * Math.cos(radians)).toFixed(2);
  const top = (50 + reach * Math.sin(radians)).toFixed(2);

  // It surfaces near the centre and travels outward along its own bearing to its place on the ring.
  const opacity = useTransform(progress, [satellite.from, satellite.from + (satellite.to - satellite.from) * 0.55], [0, 1]);
  const scale = useTransform(progress, [satellite.from, satellite.to], [0.3, 1]);
  const travel = useTransform(progress, [satellite.from, satellite.to], [-120, 0]);
  const x = useTransform(travel, (value) => Math.cos(radians) * value);
  const y = useTransform(travel, (value) => Math.sin(radians) * value);
  const leanedX = useTransform(leanX, (value) => value * satellite.depth * 38);
  const leanedY = useTransform(leanY, (value) => value * satellite.depth * 28);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%`, width: `${satellite.size}%` }}
    >
      <motion.div style={still ? undefined : { opacity, scale, x, y }}>
        <motion.div style={still ? undefined : { x: leanedX, y: leanedY }}>
          <div className="animate-drift" style={{ animationDuration: `${11 + index * 2.3}s`, animationDelay: `${-index * 1.7}s` }}>
            <div
              // the meditation photograph is picked up by the next section as the page moves on (see about-intro.tsx)
              data-handoff={satellite.image === images.meditationForest ? "meditation" : undefined}
              className={cn(
                "relative overflow-hidden bg-emerald-900 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.75)] ring-1 ring-emerald-100/25 transition-transform duration-700 ease-out-expo hover:scale-[1.08]",
                satellite.frame,
              )}
            >
              <Image
                src={satellite.image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 15vw, 26vw"
                className={cn("object-cover", satellite.focus)}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
