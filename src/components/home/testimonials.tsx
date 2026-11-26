"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { site } from "@/content/site";
import type { Testimonial } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

/* ------------------------------------------------------------------
   Kind words, arriving the way kind words do now: as messages.

   A phone stands beside the words, drawn as a phone is built: a metal
   band with its buttons, a black bezel, glass. On its screen is a
   messaging thread, with the status bar, the conversation header and the
   message field where they would be. Each testimonial comes in as a
   message: the header says who is typing, three dots show it being
   written, then the bubble opens out to the words, is stamped with the
   time and has a leaf left on it. Earlier messages move up the thread.

   Beside the phone is the list of who is speaking, which doubles as the
   way to choose one. Left alone the messages keep arriving; the line
   under the thread fills while one is being read. Resting the pointer
   on the phone or the list holds it there.
   ------------------------------------------------------------------ */

/** Seconds a message is held before the next one starts to arrive. */
const HOLD_SECONDS = 7;
/** How long the three dots show before the words. */
const TYPING_MS = 1500;
/** Messages kept in the thread. */
const KEPT = 3;

type Message = { key: number; index: number; typing: boolean; time: string };

const pad = (value: number) => String(value).padStart(2, "0");

/** The visitor's own time of day, as a phone's status bar shows it: "3:42". */
function timeNow() {
  const now = new Date();
  return `${now.getHours() % 12 || 12}:${pad(now.getMinutes())}`;
}

/** Re-reads the clock a few times a minute. */
function everyFewSeconds(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const reduce = useReducedMotion();
  const count = testimonials.length;
  const phone = useRef<HTMLDivElement>(null);
  const inView = useInView(phone, { amount: 0.35 });
  /** The status bar keeps the visitor's own time. Empty until the page is running in the browser. */
  const clock = useSyncExternalStore(everyFewSeconds, timeNow, () => "");

  const [feed, setFeed] = useState<Message[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  /** The testimonial last chosen by hand, read out to screen readers. */
  const [spoken, setSpoken] = useState<number | null>(null);
  const serial = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  /** Starts a message arriving. One still being written is dropped; the thread keeps the last few that landed. */
  const send = useCallback(
    (index: number) => {
      window.clearTimeout(timer.current);
      const key = ++serial.current;
      const arrival = { key, index, typing: !reduce, time: timeNow() };
      setFeed((items) => [...items.filter((item) => !item.typing).slice(1 - KEPT), arrival]);
      if (reduce) return;
      timer.current = window.setTimeout(() => {
        setFeed((items) => items.map((item) => (item.key === key ? { ...item, typing: false } : item)));
      }, TYPING_MS);
    },
    [reduce],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const latest = feed[feed.length - 1];
  const active = latest?.index ?? 0;
  const landed = Boolean(latest && !latest.typing);
  const running = inView && !hovered && !focused;
  const takesTurns = landed && !reduce && count > 1;

  const choose = (index: number) => {
    setSpoken(index);
    if (latest?.index !== index) send(index);
  };

  /* Resting the pointer on the phone or the list holds the message that is up. */
  const hold = {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") setHovered(true);
    },
    onPointerLeave: () => setHovered(false),
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  /* The phone leans a little toward the pointer. */
  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const rotateX = useSpring(leanX, { stiffness: 70, damping: 16, mass: 0.6 });
  const rotateY = useSpring(leanY, { stiffness: 70, damping: 16, mass: 0.6 });

  const handleLean = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    leanY.set(((event.clientX - box.left) / box.width - 0.5) * 11);
    leanX.set((0.5 - (event.clientY - box.top) / box.height) * 8);
  };

  const settle = () => {
    leanX.set(0);
    leanY.set(0);
  };

  if (count === 0) return null;

  const controls = (className: string) => (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => choose((active - 1 + count) % count)}
          aria-label="Previous testimonial"
          className="grid size-12 place-items-center rounded-full border border-ink/18 text-ink transition-colors duration-500 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => choose((active + 1) % count)}
          aria-label="Next testimonial"
          className="grid size-12 place-items-center rounded-full border border-ink/18 text-ink transition-colors duration-500 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
      <p className="eyebrow tabular-nums text-ink-mute">
        <span className="text-emerald-700">{pad(active + 1)}</span> / {pad(count)}
      </p>
      {testimonials.some((testimonial) => testimonial.sample) ? (
        <SampleTag label="Sample testimonials" className="ml-auto" />
      ) : null}
    </div>
  );

  return (
    <section className="section-y relative bg-mist" onFocus={() => setFocused(true)} onBlur={handleBlur}>
      <div className="shell">
      <div className="mx-auto grid max-w-[58rem] gap-y-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-10 lg:gap-x-16">
        {/* ---------------------------------------------------------------- words + who is speaking */}
        <div className="flex flex-col">
          <Reveal>
            <Eyebrow index="09">Kind words</Eyebrow>
          </Reveal>
          <SplitHeading text={"What people\n*carry with them.*"} className="display-lg mt-6 text-ink" />

          <Reveal delay={0.1} className="mt-9 hidden flex-1 flex-col md:flex">
            <p id="voices-label" className="eyebrow text-ink-mute">
              Who is speaking
            </p>
            <ol aria-labelledby="voices-label" {...hold} className="mt-4 flex flex-1 flex-col border-b border-ink/12">
              {testimonials.map((testimonial, index) => {
                const isActive = index === active && feed.length > 0;
                return (
                  <li key={testimonial.id} className="flex flex-1">
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => choose(index)}
                      className="group relative flex w-full cursor-pointer items-center gap-5 border-t border-ink/12 py-4 text-left"
                    >
                      {/* its message is up: the line fills while it is being read */}
                      {isActive ? (
                        <span
                          aria-hidden
                          key={latest.key}
                          style={
                            takesTurns
                              ? { animationDuration: `${HOLD_SECONDS}s`, animationPlayState: running ? "running" : "paused" }
                              : undefined
                          }
                          className={cn(
                            "absolute inset-x-0 -top-px h-0.5 origin-left bg-emerald-600",
                            takesTurns ? "animate-[intro-line_1s_linear_both]" : landed ? "" : "scale-x-0",
                          )}
                        />
                      ) : null}
                      <span
                        aria-hidden
                        className={cn(
                          "eyebrow w-6 flex-none tabular-nums transition-colors duration-500",
                          isActive ? "text-emerald-600" : "text-ink-mute group-hover:text-emerald-600",
                        )}
                      >
                        {pad(index + 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[1.08rem] font-semibold leading-snug transition-colors duration-500",
                            isActive ? "text-ink" : "text-ink-soft group-hover:text-ink",
                          )}
                        >
                          {testimonial.attribution}
                        </span>
                        <span className="mt-1 block text-[0.88rem] text-ink-mute">{testimonial.context}</span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "size-3 flex-none shape-leaf bg-emerald-600 transition-transform duration-500 ease-out-expo",
                          isActive ? "scale-100" : "scale-0",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
            {controls("mt-8")}
          </Reveal>
        </div>

        {/* ---------------------------------------------------------------- the phone */}
        <div
          className="flex flex-col items-center"
          onPointerMove={handleLean}
          onPointerLeave={settle}
        >
          {/* The phone's place on the page, and the phone, which the closing section lifts out of it
              and turns into its tablet as the page scrolls on (see CallToAction). */}
          <div className="relative">
          <div data-journey="phone" className="lg:will-change-transform">
          <motion.div
            ref={phone}
            aria-hidden
            onViewportEnter={() => {
              if (!serial.current) send(0);
            }}
            viewport={{ once: true, amount: 0.35 }}
            className="relative [perspective:1600px]"
            initial={reduce ? false : { y: 70, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
          >
            {/* the shadow it stands on */}
            <span className="pointer-events-none absolute inset-x-[10%] -bottom-4 h-9 rounded-[50%] bg-emerald-950/35 blur-xl" />

            {/* the metal band */}
            <motion.div
              {...hold}
              style={reduce ? undefined : { rotateX, rotateY }}
              className="relative h-(--tall) w-[calc(var(--tall)*0.486)] rounded-[3.2rem] bg-linear-to-br from-ink-mute via-ink to-ink-soft p-[3px] shadow-[0_45px_55px_-38px_rgb(5_58_37/0.6),0_18px_28px_-20px_rgb(13_21_18/0.6)] [--tall:clamp(35rem,calc(100svh-16.5rem),39rem)]"
            >
              {/* silent switch, volume, power */}
              <span className="absolute -left-[2px] top-[16%] h-6 w-[3px] rounded-l-sm bg-ink-soft" />
              <span className="absolute -left-[2px] top-[23.5%] h-11 w-[3px] rounded-l-sm bg-ink-soft" />
              <span className="absolute -left-[2px] top-[32.5%] h-11 w-[3px] rounded-l-sm bg-ink-soft" />
              <span className="absolute -right-[2px] top-[27%] h-[4.25rem] w-[3px] rounded-r-sm bg-ink-soft" />

              {/* the bezel, then the screen */}
              <div className="size-full rounded-[3.02rem] bg-black p-[9px]">
                <div className="relative flex size-full flex-col overflow-hidden rounded-[2.48rem] bg-paper text-ink">
                  {/* status bar */}
                  <div className="relative flex h-11 flex-none items-center justify-between px-5 pt-1.5 text-[0.78rem] font-semibold">
                    <span className="tabular-nums">{clock}</span>
                    <span className="absolute left-1/2 top-2.5 h-[1.45rem] w-[29%] -translate-x-1/2 rounded-full bg-black">
                      <span className="absolute right-2.5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-ink-soft/80 ring-1 ring-white/10" />
                    </span>
                    <span className="flex items-center gap-[0.3rem]">
                      <svg viewBox="0 0 18 12" className="h-[0.66rem] w-auto" fill="currentColor">
                        <rect x="0" y="8" width="3" height="4" rx="0.8" />
                        <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
                        <rect x="10" y="3" width="3" height="9" rx="0.8" />
                        <rect x="15" y="0" width="3" height="12" rx="0.8" />
                      </svg>
                      <svg viewBox="0 0 16 12" className="h-[0.66rem] w-auto" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M1.2 4.2a10 10 0 0 1 13.6 0" />
                        <path d="M3.9 7a6 6 0 0 1 8.2 0" />
                        <circle cx="8" cy="10.2" r="1.1" fill="currentColor" stroke="none" />
                      </svg>
                      <svg viewBox="0 0 27 12" className="h-[0.7rem] w-auto">
                        <rect x="0.6" y="0.6" width="22.8" height="10.8" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
                        <rect x="2.3" y="2.3" width="15.5" height="7.4" rx="1.8" fill="currentColor" />
                        <rect x="24.6" y="4" width="1.8" height="4" rx="0.9" fill="currentColor" fillOpacity="0.5" />
                      </svg>
                    </span>
                  </div>

                  {/* the conversation, and who is writing in it */}
                  <div className="flex flex-none items-center gap-2.5 border-b border-ink/8 px-3 pb-2.5 pt-1">
                    <svg viewBox="0 0 24 24" className="size-5 flex-none text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 5-7 7 7 7" />
                    </svg>
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                      <Image src="/brand/aaliya-mark.png" alt="" width={311} height={291} sizes="24px" className="h-[1.35rem] w-auto" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.88rem] font-semibold leading-tight">Kind words</span>
                      {latest?.typing ? (
                        <span className="mt-0.5 flex text-[0.7rem] leading-tight text-emerald-700">
                          <span className="truncate">{testimonials[latest.index].attribution}</span>
                          <span className="flex-none whitespace-pre"> is typing…</span>
                        </span>
                      ) : (
                        <span className="mt-0.5 block truncate text-[0.7rem] leading-tight text-ink-mute">{site.name}</span>
                      )}
                    </span>
                    <svg viewBox="0 0 24 24" className="size-[1.1rem] flex-none text-emerald-700" fill="currentColor">
                      <circle cx="12" cy="5" r="1.7" />
                      <circle cx="12" cy="12" r="1.7" />
                      <circle cx="12" cy="19" r="1.7" />
                    </svg>
                  </div>

                  {/* the thread: newest at the foot, earlier ones pushed up and out under the fade */}
                  <div className="relative min-h-0 flex-1 overflow-hidden bg-mist">
                    <div className="@container absolute inset-0 flex flex-col justify-end px-3 pb-1">
                      {feed.map((message) => (
                        <Arrival key={message.key} message={message} testimonial={testimonials[message.index]} still={reduce} />
                      ))}
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-mist to-transparent" />
                  </div>

                  {/* the message field */}
                  <div className="flex flex-none items-center gap-2 border-t border-ink/8 px-2.5 pb-1.5 pt-2">
                    <svg viewBox="0 0 24 24" className="size-6 flex-none text-emerald-700" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 5.5v13M5.5 12h13" />
                    </svg>
                    <span className="flex h-9 min-w-0 flex-1 items-center rounded-full border border-ink/12 bg-white px-3.5 text-[0.84rem] text-ink-mute">
                      Message
                    </span>
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-emerald-700 text-white">
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5m-6 6 6-6 6 6" />
                      </svg>
                    </span>
                  </div>
                  <span className="mx-auto mb-2 mt-1 block h-[0.3rem] w-[36%] flex-none rounded-full bg-ink" />

                  {/* Unseen: it runs for as long as a message is held, then the next one starts to arrive. */}
                  {takesTurns ? (
                    <span
                      key={latest.key}
                      onAnimationEnd={() => send((active + 1) % count)}
                      style={{ animationDuration: `${HOLD_SECONDS}s`, animationPlayState: running ? "running" : "paused" }}
                      className="pointer-events-none absolute left-0 top-0 size-px animate-[intro-line_1s_linear_both] opacity-0"
                    />
                  ) : null}

                  {/* light across the glass */}
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgb(255_255_255/0.28)_0%,rgb(255_255_255/0)_24%,rgb(255_255_255/0)_74%,rgb(255_255_255/0.1)_100%)]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
          </div>
          </div>

          {controls("mt-9 w-full md:hidden")}
        </div>
      </div>
      </div>

      {/* The phone is a picture of these; this is the text itself, for screen readers and search. */}
      <ul className="sr-only">
        {testimonials.map((testimonial) => (
          <li key={testimonial.id}>
            <figure>
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption>
                {testimonial.attribution}, {testimonial.context}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        {spoken === null
          ? ""
          : `${testimonials[spoken].quote} ${testimonials[spoken].attribution}, ${testimonials[spoken].context}`}
      </p>
    </section>
  );
}

/** One message: a bubble that shows three dots, then opens out to who is speaking, the words and the time. */
function Arrival({ message, testimonial, still }: { message: Message; testimonial: Testimonial; still: boolean }) {
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const words = testimonial.quote.split(" ");

  // The bubble follows the size of what is in it, so it grows from the dots to the words.
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.offsetWidth, height: element.offsetHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className="flex-none overflow-hidden px-0.5 pb-3.5 pt-0.5"
      initial={still ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ height: { duration: still ? 0 : 0.5, ease: EASE_OUT }, opacity: { duration: 0.4 } }}
    >
      <div className="relative w-fit">
        <motion.div
          className="overflow-hidden rounded-[1.15rem] rounded-bl-[0.3rem] bg-white shadow-[0_1px_1.5px_rgb(13_21_18/0.16)]"
          initial={false}
          animate={size ? { width: size.width, height: size.height } : undefined}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 28 }}
        >
          <div ref={content} className="w-max max-w-[min(15.5rem,93cqw)] px-3 py-2.5">
            {message.typing ? (
              <span className="flex h-5 items-center gap-1.5 px-1">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="size-1.5 rounded-full bg-ink-mute"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </span>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-1.5">
                  <span className="grid size-[1.35rem] flex-none place-items-center shape-leaf bg-emerald-700 text-[0.52rem] font-semibold tabular-nums text-white">
                    {pad(message.index + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.74rem] font-semibold leading-tight text-emerald-700">{testimonial.attribution}</span>
                    <span className="mt-px block text-[0.66rem] leading-tight text-ink-mute">{testimonial.context}</span>
                  </span>
                </div>
                <p className="text-[0.875rem] leading-[1.45] text-ink">
                  {words.map((word, index) => (
                    <Fragment key={index}>
                      <motion.span
                        className="inline-block"
                        initial={still ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + index * 0.028, ease: EASE_OUT }}
                      >
                        {word}
                      </motion.span>{" "}
                    </Fragment>
                  ))}
                </p>
                <p className="mt-0.5 pr-5 text-right text-[0.62rem] tabular-nums text-ink-mute">{message.time}</p>
              </>
            )}
          </div>
        </motion.div>

        {/* a leaf left on the message once it has been read */}
        {message.typing ? null : (
          <motion.span
            className="absolute -bottom-2 right-2.5 grid size-[1.4rem] place-items-center rounded-full bg-white shadow-[0_1px_3px_rgb(13_21_18/0.22)]"
            initial={still ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: still ? 0 : 0.55 + words.length * 0.028 }}
          >
            <span className="size-2.5 shape-leaf bg-emerald-600" />
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
