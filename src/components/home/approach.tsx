"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import type { ApproachStep } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";

/* ------------------------------------------------------------------
   "Our approach": four steps, each shown as it happens.

   Every step has a small scene that acts out what its line says:

     1  A first conversation       someone speaks and is listened to, in confidence
     2  Understanding together     mind, emotion and daily life come together as one picture
     3  A plan shaped around you   a plan is ticked through, for you, a family or an organization
     4  Growth that lasts          a plant grows three leaves: awareness, resilience, balance

   The scenes carry the detail. Under each one the step has only its
   number, its name and one short sentence, set straight on the section
   with no card round them. Side by side, the steps take turns: the one
   in hand plays its scene while the line beside its number fills, until
   a visitor points at one or chooses it. Stacked, on a phone, the step
   crossing the middle of the screen plays.

   The scenes belong to the steps by position (see <Scene>).

   The section has depth as the page scrolls: the heading falls a little
   behind, and the steps each travel at their own rate, the later the
   faster. So they arrive as a flight of stairs, stand level as the row
   crosses the middle of the screen, and climb on as it leaves. Stacked,
   on a phone, the steps keep their places.
   ------------------------------------------------------------------ */

/** Seconds a step holds its turn; long enough for its scene to play through. */
const HOLD_SECONDS = 6.5;

/** Which step holds the plan, whose audience a visitor can change. */
const PLAN_STEP = 2;

/** Who a plan may be for, each with three of the center's own services (named as in the brochure). */
const PLANS = [
  {
    label: "You",
    title: "A plan for you",
    items: ["Individual Counseling", "Stress & Anxiety Management", "Resilience Building Sessions"],
  },
  {
    label: "Family",
    title: "A plan for your family",
    items: ["Family Counseling", "Parent Guidance Sessions", "Adolescent Counseling"],
  },
  {
    label: "Organization",
    title: "A plan for your organization",
    items: ["Corporate Wellness Programs", "Work-Life Balance Workshops", "Team Well-being Initiatives"],
  },
];

type View = {
  /** The step in hand. */
  active: number;
  /** Counts every change of step, so a scene plays afresh each time its step comes round. */
  run: number;
  /** How many times the plan step has come round; it shows a different audience each time. */
  planVisits: number;
};

export function Approach({ steps }: { steps: ApproachStep[] }) {
  const reduce = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLDivElement | null>>([]);
  const seen = useInView(list, { once: true, margin: "0px 0px -25% 0px" });
  const inView = useInView(list, { margin: "-10% 0px -10% 0px" });
  // from 640px up the steps sit side by side and take turns; below that they are stacked
  const sideBySide = useMediaQuery("(min-width: 640px)");
  // from 1280px up all four stand in one row; between the two they are two by two
  const inOneRow = useMediaQuery("(min-width: 1280px)");
  /** How far a step travels against the page, in px either way: more the further along the row it stands. */
  const travel = (index: number) => (inOneRow ? 8 + index * 22 : sideBySide ? 10 + (index % 2) * 30 : 0);

  const [view, setView] = useState<View>({ active: 0, run: 0, planVisits: 0 });
  /** The steps take turns until the visitor chooses one. */
  const [turns, setTurns] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [chosenPlan, setChosenPlan] = useState<number | null>(null);

  const show = useCallback(
    (index: number) =>
      setView((current) =>
        current.active === index
          ? current
          : {
              active: index,
              run: current.run + 1,
              planVisits: current.planVisits + (index === PLAN_STEP ? 1 : 0),
            },
      ),
    [],
  );

  // stacked: the step crossing the middle of the screen is the one in hand
  useEffect(() => {
    if (sideBySide) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cards.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, [sideBySide, show, steps.length]);

  const playing = seen && !reduce;
  const timed = turns && sideBySide && !reduce;
  const running = timed && inView && !hovered && !focused;
  const plan = chosenPlan ?? (Math.max(view.planVisits, 1) - 1) % PLANS.length;

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  /* Whether the pointer is on the steps. Read from every move onto a new element, not from
     entering and leaving: a scene is redrawn when its step is taken in hand, and an element
     removed from under the pointer swallows the enter and leave that would follow it. */
  const onPointerOver = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") setHovered(list.current?.contains(event.target as Node) ?? false);
  };

  return (
    <section
      onPointerOver={onPointerOver}
      onPointerLeave={() => setHovered(false)}
      className="section-y relative overflow-clip bg-mist"
    >
      <div className="shell">
        <div className="mx-auto max-w-[72rem]">
          {/* heading and lede share a row, so the right of the heading is not left empty */}
          <Parallax distance={sideBySide ? -24 : -10}>
          <div className="grid items-end gap-x-10 gap-y-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <Eyebrow index="04">Our approach</Eyebrow>
              </Reveal>
              <SplitHeading
                text={"Unhurried, structured,\n*and yours to shape.*"}
                className="display-lg mt-6 text-ink lg:whitespace-nowrap"
              />
            </div>
            <Reveal delay={0.15} className="lg:col-span-4 lg:pb-1">
              <p className="lede max-w-md text-ink-soft">
                Four steps, taken at your own pace. Each is agreed with you before the next begins.
              </p>
            </Reveal>
          </div>
          </Parallax>

          {/* while a visitor is pointing at the steps, or has the keyboard in them, the turns wait */}
          <div
            ref={list}
            className="mt-9 lg:mt-12"
            onFocus={() => setFocused(true)}
            onBlur={onBlur}
          >
            <Stagger as="ol" stagger={0.09} className="grid gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-y-10 xl:grid-cols-4">
              {steps.map((step, index) => {
                const current = index === view.active;
                const done = index < view.active;
                const play = current && playing;
                return (
                  <StaggerItem as="li" key={step.index}>
                    <Parallax distance={travel(index)} className="h-full">
                    <div
                      ref={(element) => {
                        cards.current[index] = element;
                      }}
                      data-index={index}
                      onPointerOver={(event) => {
                        if (event.pointerType === "mouse") show(index);
                      }}
                      onFocus={() => show(index)}
                      onClick={() => {
                        setTurns(false);
                        show(index);
                      }}
                      className="flex h-full flex-col"
                    >
                      {/* the scene: what this step looks like as it happens */}
                      <div
                        className={cn(
                          "relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-linear-to-b from-emerald-50 to-emerald-100/70 transition-[box-shadow,opacity,filter] duration-700 sm:aspect-[16/9] xl:aspect-[4/3]",
                          current
                            ? "shadow-[0_26px_50px_-34px_rgb(3_39_26/0.55),inset_0_0_0_1px_rgb(10_79_53/0.16)]"
                            : "opacity-75 saturate-[0.7] shadow-[inset_0_0_0_1px_rgb(13_21_18/0.06)]",
                        )}
                      >
                        <div className="absolute inset-0">
                          <Scene
                            key={play ? `play-${view.run}` : "rest"}
                            index={index}
                            play={play}
                            plan={plan}
                            onChoosePlan={setChosenPlan}
                          />
                        </div>
                      </div>

                      {/* its number, and the line that fills while the step holds its turn */}
                      <div className="mt-5 flex items-center gap-3">
                        <span
                          aria-hidden
                          className={cn(
                            "size-2.5 flex-none shape-leaf transition-colors duration-500",
                            current || done ? "bg-emerald-600" : "bg-ink/20",
                          )}
                        />
                        <p
                          className={cn(
                            "eyebrow flex-none tabular-nums transition-colors duration-500",
                            current ? "text-emerald-700" : "text-ink-mute",
                          )}
                        >
                          Step {step.index}
                        </p>
                        <span aria-hidden className="relative h-px flex-1 bg-ink/12">
                          {current && timed ? (
                            <span
                              key={view.run}
                              onAnimationEnd={() => show((index + 1) % steps.length)}
                              style={{
                                animationDuration: `${HOLD_SECONDS}s`,
                                animationPlayState: running ? "running" : "paused",
                              }}
                              className="absolute inset-x-0 -top-px h-0.5 origin-left animate-[intro-line_1s_linear_both] rounded-full bg-emerald-600"
                            />
                          ) : current || done ? (
                            <span className="absolute inset-x-0 -top-px h-0.5 rounded-full bg-emerald-600" />
                          ) : null}
                        </span>
                      </div>

                      <h3 className="mt-3.5 font-display text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.016em] text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-pretty text-[0.98rem] leading-relaxed text-ink-soft">{step.description}</p>
                    </div>
                    </Parallax>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- scenes */

type SceneProps = {
  /** Act the step out from the start. Without it the scene is drawn finished and still. */
  play: boolean;
};

/** The scene for the step at this position. */
function Scene({
  index,
  play,
  plan,
  onChoosePlan,
}: SceneProps & { index: number; plan: number; onChoosePlan: (index: number) => void }) {
  switch (index) {
    case 0:
      return <ConversationScene play={play} />;
    case 1:
      return <PictureScene play={play} />;
    case PLAN_STEP:
      return <PlanScene play={play} plan={plan} onChoose={onChoosePlan} />;
    case 3:
      return <GrowthScene play={play} />;
    default:
      return null;
  }
}

/** Step 1. Someone says what brings them here, and is heard. */
function ConversationScene({ play }: SceneProps) {
  return (
    <div aria-hidden className="flex h-full flex-col justify-center gap-1.5 px-3.5 py-3">
      <Speaker play={play} delay={0.1}>
        You
      </Speaker>
      <Bubble play={play} delay={0.15} speaker="visitor">
        It has been a hard few months.
      </Bubble>
      <Speaker play={play} delay={1.5} right>
        Your counselor
      </Speaker>
      <Bubble play={play} delay={1.55} speaker="counselor">
        Take your time. I am listening.
      </Bubble>
      <motion.p
        className="mt-2 flex items-center gap-1.5 self-center rounded-full bg-white px-3 py-1.5 text-[0.7rem] font-medium leading-none text-emerald-800 shadow-[inset_0_0_0_1px_rgb(10_79_53/0.14)]"
        initial={play ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 2.95 }}
      >
        <Icon name="lock" className="size-3" strokeWidth={1.8} />
        In complete confidence
      </motion.p>
    </div>
  );
}

/** Names who is speaking, above their words. */
function Speaker({ children, play, delay, right }: SceneProps & { children: string; delay: number; right?: boolean }) {
  return (
    <motion.p
      className={cn("text-[0.64rem] font-semibold uppercase leading-none tracking-[0.14em] text-ink-mute", right && "self-end")}
      initial={play ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.p>
  );
}

/** One side of the conversation: it is typed first, then said. */
function Bubble({
  children,
  play,
  delay,
  speaker,
}: SceneProps & { children: string; delay: number; speaker: "visitor" | "counselor" }) {
  const visitor = speaker === "visitor";
  return (
    <motion.div
      className={cn(
        "relative max-w-[88%] rounded-2xl px-3.5 py-2 text-[0.78rem] leading-snug",
        visitor
          ? "self-start rounded-bl-md bg-white text-ink shadow-[inset_0_0_0_1px_rgb(13_21_18/0.08)]"
          : "self-end rounded-br-md bg-emerald-700 text-white",
      )}
      style={{ originX: visitor ? 0 : 1, originY: 1 }}
      initial={play ? { opacity: 0, scale: 0.6, y: 8 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {play ? (
        <motion.span
          className="absolute inset-0 flex items-center gap-1 px-3.5"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: delay + 0.95 }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="size-1.5 rounded-full bg-current opacity-60"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: 1, delay: delay + 0.1 + dot * 0.12 }}
            />
          ))}
        </motion.span>
      ) : null}
      <motion.span
        className="block"
        initial={play ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: delay + 1.05 }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
}

const PIECES = [
  {
    label: "Mind",
    icon: "bulb",
    className: "row-span-2 bg-emerald-700 text-white",
    from: { x: -22, y: 0, rotate: -6 },
  },
  { label: "Emotion", icon: "heart", className: "bg-emerald-200 text-emerald-900", from: { x: 20, y: -16, rotate: 5 } },
  {
    label: "Daily life",
    icon: "sun",
    className: "bg-white text-emerald-800 shadow-[inset_0_0_0_1px_rgb(10_79_53/0.14)]",
    from: { x: 22, y: 16, rotate: -4 },
  },
] as const;

/** Step 2. Three parts of a life are brought together and seen as one picture. */
function PictureScene({ play }: SceneProps) {
  return (
    <div aria-hidden className="flex h-full flex-col items-center justify-center gap-3 px-3.5 py-3">
      <div className="relative aspect-[8/5] h-[56%]">
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-1">
          {PIECES.map((piece, order) => (
            <motion.div
              key={piece.label}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl text-[0.72rem] font-medium leading-tight",
                piece.className,
              )}
              initial={play ? { opacity: 0, ...piece.from } : false}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 + order * 0.4 }}
            >
              <Icon name={piece.icon} className="size-4" />
              {piece.label}
            </motion.div>
          ))}
        </div>
        {/* the frame that makes one picture of the three */}
        <motion.span
          className="absolute -inset-1.5 rounded-[1.1rem] border-2 border-emerald-600"
          initial={play ? { opacity: 0, scale: 1.1 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.75 }}
        />
      </div>
      <motion.p
        className="rounded-full bg-emerald-700 px-3 py-1.5 text-[0.7rem] font-medium leading-none text-white"
        initial={play ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 2.2 }}
      >
        The whole picture
      </motion.p>
    </div>
  );
}

/** Step 3. A plan is agreed line by line; a visitor can change who it is for. */
function PlanScene({ play, plan, onChoose }: SceneProps & { plan: number; onChoose: (index: number) => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-3.5 py-3">
      <div
        role="group"
        aria-label="Who the plan is for"
        className="flex gap-0.5 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgb(13_21_18/0.08)]"
      >
        {PLANS.map((option, index) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={index === plan}
            onClick={() => onChoose(index)}
            className={cn(
              "tap flex-1 cursor-pointer rounded-full px-1.5 py-1.5 text-[0.72rem] font-medium leading-none transition-colors duration-300",
              index === plan ? "bg-emerald-700 text-white" : "text-ink-soft hover:bg-emerald-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div key={plan} className="rounded-xl bg-white px-3 py-2.5 shadow-[inset_0_0_0_1px_rgb(13_21_18/0.08)]">
        <motion.p
          id="approach-plan"
          className="text-[0.64rem] font-semibold uppercase leading-none tracking-[0.14em] text-emerald-700"
          initial={play ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {PLANS[plan].title}
        </motion.p>
        <ul aria-labelledby="approach-plan" className="mt-2 space-y-1.5">
          {PLANS[plan].items.map((item, position) => {
            const delay = 0.25 + position * 0.45;
            return (
              <motion.li
                key={item}
                className="flex items-center gap-2 text-[0.78rem] leading-tight text-ink"
                initial={play ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay }}
              >
                <motion.span
                  aria-hidden
                  className="grid size-4 flex-none place-items-center rounded-[5px] border"
                  initial={play ? { backgroundColor: "rgba(14, 102, 71, 0)", borderColor: "rgba(13, 21, 18, 0.28)" } : false}
                  animate={{ backgroundColor: "rgba(14, 102, 71, 1)", borderColor: "rgba(14, 102, 71, 1)" }}
                  transition={{ duration: 0.3, delay: delay + 0.3 }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3">
                    <motion.path
                      d="M3.5 8.4 6.6 11.3 12.5 4.9"
                      initial={play ? { pathLength: 0 } : false}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, delay: delay + 0.4 }}
                    />
                  </svg>
                </motion.span>
                <span className="truncate">{item}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Drawn on a 200 x 130 sheet. A leaf lies along +x from its stalk at the origin.
const LEAF = "M0 0C8 -11 24 -13 36 0C24 13 8 11 0 0Z";
const GROWTH = [
  { skill: "Awareness", at: "translate(76 87) rotate(-160)", fill: "#1c8560", branch: "M99 96C92 92 84 90 76 87", delay: 0.75 },
  { skill: "Resilience", at: "translate(122 62) rotate(-20)", fill: "#86b25a", branch: "M99 72C106 68 114 66 122 62", delay: 1.15 },
  { skill: "Balance", at: "translate(100 40) rotate(-90)", fill: "#0e6647", branch: null, delay: 1.55 },
] as const;

/** Step 4. A plant grows three leaves, one for each skill that is carried away. */
function GrowthScene({ play }: SceneProps) {
  return (
    <div aria-hidden className="flex h-full flex-col items-center gap-1.5 px-3 pb-3 pt-2">
      <svg viewBox="0 0 200 130" focusable="false" className="min-h-0 w-full flex-1">
        <path d="M56 127Q100 107 144 127Z" fill="#c2dfd0" />
        <motion.path
          d="M100 123C100 98 96 72 100 40"
          fill="none"
          stroke="#0a4f35"
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={play ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
        />
        {GROWTH.map((leaf) => (
          <g key={leaf.skill}>
            {leaf.branch ? (
              <motion.path
                d={leaf.branch}
                fill="none"
                stroke="#0a4f35"
                strokeWidth={2}
                strokeLinecap="round"
                initial={play ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: leaf.delay - 0.2 }}
              />
            ) : null}
            <g transform={leaf.at}>
              <motion.g
                style={{ originX: 0, originY: 0.5 }}
                initial={play ? { scale: 0, rotate: -35 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: leaf.delay + 0.15 }}
              >
                {/* once out, the leaf stirs a little */}
                <motion.g
                  style={{ originX: 0, originY: 0.5 }}
                  animate={play ? { rotate: [0, 5, 0, -4, 0] } : undefined}
                  transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay: leaf.delay + 1.2 }}
                >
                  <path d={LEAF} fill={leaf.fill} />
                  <path d="M3 0H28" fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={1.2} strokeLinecap="round" />
                </motion.g>
              </motion.g>
            </g>
          </g>
        ))}
      </svg>
      <ul className="flex justify-center gap-1">
        {GROWTH.map((leaf) => (
          <motion.li
            key={leaf.skill}
            className="rounded-full bg-white px-2 py-1.5 text-[0.7rem] font-medium leading-none text-emerald-800 shadow-[inset_0_0_0_1px_rgb(10_79_53/0.14)]"
            initial={play ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: leaf.delay + 0.55 }}
          >
            {leaf.skill}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------- icons */

const ICONS = {
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21.5h4" />
      <path d="M15.1 14.2c.2-1 .7-1.8 1.4-2.5A4.7 4.7 0 0 0 18 8.2a6 6 0 0 0-12 0c0 1 .2 2.2 1.5 3.5.7.7 1.2 1.5 1.4 2.5" />
    </>
  ),
  heart: (
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.500c0 2.3 1.500 4 3 5.500l7 7Z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M5.3 5.300l1.400 1.400M17.300 17.300l1.400 1.400M2.500 12h2M19.500 12h2M6.700 17.300l-1.400 1.400M18.700 5.300l-1.400 1.400" />
    </>
  ),
} satisfies Record<string, ReactNode>;

/** A small line drawing, in the style of the site's other icons. */
function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: keyof typeof ICONS;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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
