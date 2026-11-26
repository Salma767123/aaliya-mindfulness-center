"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import type { ImageAsset } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem, Wipe } from "@/components/motion/reveal";
import { ArrowRight } from "@/components/ui/icons";

export type PracticeForm = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  /** What this kind of work includes, as the brochure lists it. */
  items: string[];
  image: ImageAsset;
  /** CSS object-position, for photographs whose subject sits off-centre. */
  focus?: string;
};

type Layer = { id: number; index: number };

const STAGE_SIZES = "(min-width: 1024px) 54vw, 1px";
const INLINE_SIZES = "(min-width: 1024px) 1px, 92vw";
const DESKTOP = "(min-width: 1024px)";

/**
 * Holds a row where it is on screen while the rows above it close.
 * Without this, opening a row low in the list on a phone slides it out from under the finger.
 */
function holdInPlace(element: HTMLElement) {
  const start = element.getBoundingClientRect().top;
  const began = performance.now();
  const step = (now: number) => {
    const drift = element.getBoundingClientRect().top - start;
    if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
    if (now - began < 800) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * The five kinds of work as a set of cards with one photograph.
 *
 * Large screens: the cards sit beside a single frame. Pointing at, focusing or
 * choosing a card pours its photograph across the frame and names what that work
 * includes on it; left alone, the cards take turns, and the rule along the top of
 * the open card shows how long it has left.
 * Smaller screens: no shared frame. Each card opens to its own photograph and list.
 */
export function PracticeForms({ forms, className }: { forms: PracticeForm[]; className?: string }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const [{ active, layers }, setView] = useState<{ active: number; layers: Layer[] }>({
    active: 0,
    layers: [{ id: 0, index: 0 }],
  });
  /** Rows take turns until the visitor chooses one. */
  const [turns, setTurns] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const inView = useInView(root, { amount: 0.3 });
  const near = useInView(root, { once: true, margin: "600px 0px" });
  const running = turns && inView && !hovered && !focused;

  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const show = (index: number) =>
    setView((view) =>
      view.active === index
        ? view
        : { active: index, layers: [...view.layers, { id: view.layers[view.layers.length - 1].id + 1, index }] },
    );

  /** A row opened by the visitor. Below the large breakpoint its photograph opens in the list itself. */
  const choose = (index: number, row: HTMLElement) => {
    if (index !== active && !window.matchMedia(DESKTOP).matches) holdInPlace(row);
    show(index);
  };

  /** Once a photograph has fully arrived, the ones beneath it are no longer needed. */
  const settle = (id: number) =>
    setView((view) => {
      const at = view.layers.findIndex((layer) => layer.id === id);
      return at > 0 ? { ...view, layers: view.layers.slice(at) } : view;
    });

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const current = forms[active];

  return (
    <div
      ref={root}
      className={cn("grid gap-x-12 lg:grid-cols-12", className)}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      {/* ------------------------------------------------------------ the cards */}
      <Stagger as="ol" stagger={0.07} className="flex flex-col gap-2.5 lg:col-span-5">
        {forms.map((form, index) => {
          const open = index === active;
          return (
            <StaggerItem
              as="li"
              key={form.slug}
              className={cn(
                "relative overflow-hidden rounded-[1.5rem] border transition-[background-color,border-color,box-shadow] duration-700",
                open
                  ? "border-emerald-700/20 bg-white shadow-[0_22px_44px_-30px_rgb(3_39_26/0.45)]"
                  : "border-ink/10 bg-white/45 hover:bg-white/85",
              )}
            >
              {open ? (
                <span
                  key={form.slug}
                  aria-hidden
                  onAnimationEnd={() => show((index + 1) % forms.length)}
                  style={{ animationPlayState: running ? "running" : "paused" }}
                  className={cn(
                    "absolute inset-x-0 top-0 h-[2px] origin-left bg-emerald-600",
                    turns && "lg:animate-[intro-line_6.5s_linear_both]",
                  )}
                />
              ) : null}

              <h3>
                <button
                  type="button"
                  id={`practice-${form.slug}`}
                  aria-expanded={open}
                  aria-controls={`practice-${form.slug}-panel`}
                  onPointerEnter={(event) =>
                    event.pointerType === "mouse" && window.matchMedia(DESKTOP).matches && show(index)
                  }
                  onFocus={(event) => choose(index, event.currentTarget)}
                  onClick={(event) => {
                    setTurns(false);
                    choose(index, event.currentTarget);
                  }}
                  className="flex w-full cursor-pointer items-center gap-4 px-4 py-3.5 text-left sm:px-5 sm:py-4"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-11 flex-none place-items-center rounded-full transition-colors duration-500 sm:size-12",
                      open ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    <PracticeIcon slug={form.slug} className="size-[1.35rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "eyebrow block tabular-nums transition-colors duration-500",
                        open ? "text-emerald-700" : "text-ink-mute",
                      )}
                    >
                      {form.index}
                    </span>
                    <span
                      className={cn(
                        "display-sm mt-1 block transition-colors duration-500",
                        open ? "text-ink" : "text-ink/65",
                      )}
                    >
                      {form.title}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-8 flex-none place-items-center rounded-full transition-[background-color,color,box-shadow,rotate] duration-700 ease-out-expo",
                      open
                        ? "rotate-90 bg-emerald-700 text-white lg:rotate-0"
                        : "text-ink-mute shadow-[inset_0_0_0_1px_rgb(13_21_18/0.16)]",
                    )}
                  >
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              </h3>

              <div
                id={`practice-${form.slug}-panel`}
                role="region"
                aria-labelledby={`practice-${form.slug}`}
                aria-hidden={!open}
                inert={!open}
                className={cn(
                  "grid transition-[grid-template-rows] duration-700 ease-out-expo motion-reduce:transition-none",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="px-4 pb-5 sm:px-5 lg:pl-[5.25rem] lg:pr-6">
                    <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-tl-[3.5rem] rounded-br-[3.5rem] bg-emerald-100 sm:aspect-[16/9] lg:hidden">
                      <Image
                        src={form.image.src}
                        alt={form.image.alt}
                        fill
                        sizes={INLINE_SIZES}
                        className="object-cover"
                        style={{ objectPosition: form.focus }}
                      />
                    </div>
                    <p className="max-w-[34rem] text-[1rem] leading-[1.65] text-ink-soft lg:min-h-[4.95rem]">
                      {form.summary}
                    </p>
                    {/* on large screens these are named on the photograph instead */}
                    <ul className="mt-4 flex flex-wrap gap-2 lg:hidden">
                      {form.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1.5 text-[0.84rem] font-medium leading-tight text-emerald-800"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className="tap link-line mt-4 inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium text-emerald-700 lg:mt-3"
                    >
                      Ask about this
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* ------------------------------------------------------------ the frame */}
      <div ref={stage} className="relative hidden min-h-[27rem] lg:col-span-7 lg:block">
        <Wipe from="bottom" className="absolute inset-0 overflow-hidden rounded-tl-[8rem] rounded-br-[8rem] bg-emerald-100">
          <motion.div className="absolute inset-x-0 -inset-y-[6%]" style={reduce ? undefined : { y: drift }}>
            {reduce ? (
              <Image
                key={current.slug}
                src={current.image.src}
                alt={current.image.alt}
                fill
                sizes={STAGE_SIZES}
                className="object-cover"
                style={{ objectPosition: current.focus }}
              />
            ) : (
              layers.map((layer, position) => {
                const form = forms[layer.index];
                return (
                  <motion.div
                    key={layer.id}
                    className="absolute inset-0"
                    initial={layer.id === 0 ? false : { clipPath: "inset(0% 100% 0% 0%)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    transition={{ duration: 1.15, ease: EASE_OUT }}
                    onAnimationComplete={() => settle(layer.id)}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={layer.id === 0 ? false : { scale: 1.14 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.7, ease: EASE_OUT }}
                    >
                      <Image
                        src={form.image.src}
                        alt={position === layers.length - 1 ? form.image.alt : ""}
                        fill
                        sizes={STAGE_SIZES}
                        className="object-cover"
                        style={{ objectPosition: form.focus }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-emerald-950/85 via-emerald-950/30 via-50% to-transparent" />
        </Wipe>

        <Reveal variant="fade" delay={0.55} className="pointer-events-none absolute inset-x-8 bottom-8 text-white xl:inset-x-10 xl:bottom-9">
          <p aria-hidden className="eyebrow tabular-nums">
            {current.index} <span className="opacity-55">/ 0{forms.length}</span>
          </p>
          <p aria-hidden className="display-md mt-2">
            <span className="intro-mask">
              <motion.span
                key={current.slug}
                className="inline-block"
                initial={reduce ? false : { y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.95, ease: EASE_OUT, delay: 0.12 }}
              >
                {current.title}
              </motion.span>
            </span>
          </p>
          {/* what this kind of work includes, in the brochure's words */}
          <ul key={current.slug} aria-label={`${current.title} includes`} className="mt-4 flex flex-wrap gap-2">
            {current.items.map((item, position) => (
              <motion.li
                key={item}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 + position * 0.05 }}
                className="rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-[0.84rem] font-medium leading-tight backdrop-blur-md"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </Reveal>

        {/* The other photographs are fetched as the section nears, so a change never opens on an empty frame. */}
        {near ? (
          <div aria-hidden className="pointer-events-none absolute left-0 top-0 size-px overflow-hidden opacity-0">
            {forms.map((form) => (
              <Image key={form.slug} src={form.image.src} alt="" fill sizes={STAGE_SIZES} loading="eager" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}


/* ----------------------------------------------------------------------- facts */

const AUDIENCES = ["Individuals", "Families", "Institutions", "Organizations"];

/**
 * The practice in two figures and the people it is for, on one rule under the heading.
 * On large screens it keeps the section's own columns: the figures under the heading,
 * the audiences under the paragraph. The figures count up as they come into view.
 */
export function PracticeFacts({ kinds, offerings, className }: { kinds: number; offerings: number; className?: string }) {
  return (
    <Reveal delay={0.18} className={className}>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ink/12 pt-6 lg:grid-cols-12 lg:gap-x-12">
        <Fact label="Kinds of work" className="lg:col-span-2">
          <CountUp to={kinds} />
        </Fact>
        <Fact label="Services and programmes" className="lg:col-span-3">
          <CountUp to={offerings} />
        </Fact>
        <div className="col-span-2 flex flex-col-reverse justify-end gap-3 lg:col-span-7">
          <dt className="eyebrow text-ink-mute">Who it is for</dt>
          <dd>
            <ul className="flex flex-wrap gap-2">
              {AUDIENCES.map((audience) => (
                <li
                  key={audience}
                  className="flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white px-4 py-2 text-[0.95rem] font-medium leading-none text-ink"
                >
                  <span aria-hidden className="size-2 shape-leaf bg-emerald-600" />
                  {audience}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </Reveal>
  );
}

function Fact({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col-reverse justify-end gap-2", className)}>
      <dt className="eyebrow text-ink-mute">{label}</dt>
      <dd className="font-display text-[2.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-emerald-700">
        {children}
      </dd>
    </div>
  );
}

/** A two-digit figure that counts up from zero the first time it is seen. */
function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const text = String(to).padStart(2, "0");

  useEffect(() => {
    const element = ref.current;
    if (!element || !seen || reduce) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (value) => {
        element.textContent = String(Math.round(value)).padStart(2, "0");
      },
    });
    return () => controls.stop();
  }, [seen, reduce, to]);

  // the real figure is in the markup from the start; the count only plays over it
  return <span ref={ref}>{text}</span>;
}

/* ----------------------------------------------------------------------- icons */

const ICONS: Record<string, ReactNode> = {
  "psychological-counseling": (
    <>
      <path d="M4.5 5h8.6a2 2 0 0 1 2 2v3.8a2 2 0 0 1-2 2H8.9L6 15.3v-2.5H4.5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M17.6 9.6h1.9a2 2 0 0 1 2 2v3.6a2 2 0 0 1-2 2H18v2.4l-2.9-2.4h-2.6a2 2 0 0 1-1.6-.8" />
    </>
  ),
  "mindfulness-wellness": (
    <>
      <path d="M12 4.5c1.9 2.3 2.9 4.7 2.9 7 0 2.4-1.2 4.2-2.9 4.2s-2.9-1.8-2.9-4.2c0-2.3 1-4.7 2.9-7Z" />
      <path d="M9.3 9.2C7.4 8.6 5.6 8.6 4 9.2c.2 3.6 2.4 6.2 6 6.6" />
      <path d="M14.7 9.2c1.9-.6 3.7-.6 5.3 0-.2 3.6-2.4 6.2-6 6.6" />
      <path d="M5 19.2c2.2.6 4.5.9 7 .9s4.8-.3 7-.9" />
    </>
  ),
  "training-development": (
    <>
      <rect x="3.8" y="4.2" width="16.4" height="10.8" rx="1.6" />
      <path d="M12 15v3.4M8.4 20.6 12 18.4l3.6 2.2" />
      <path d="m7.4 11.6 2.6-2.6 2.2 2 4-4" />
    </>
  ),
  "educational-programs": (
    <>
      <path d="M2.8 9.3 12 5l9.2 4.3L12 13.6 2.8 9.3Z" />
      <path d="M6.8 11.4v4c1.4 1.4 3.2 2.1 5.2 2.1s3.8-.7 5.2-2.1v-4" />
      <path d="M21.2 9.3v4.9" />
    </>
  ),
  "community-outreach": (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5v-1A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5v1" />
      <path d="M15.6 5.1a3.2 3.2 0 0 1 0 5.8" />
      <path d="M17.3 14.2a4.5 4.5 0 0 1 3.2 4.3v1" />
    </>
  ),
};

/** The small drawing for one kind of work, in the line style of the site's other icons. */
function PracticeIcon({ slug, className }: { slug: string; className?: string }) {
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
      {ICONS[slug] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}
