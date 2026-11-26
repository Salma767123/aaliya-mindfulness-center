"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { BookPost } from "@/lib/article-pages";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

type BlogHeroProps = {
  /** Articles, the lead one first. */
  posts: BookPost[];
  /** Eyebrow and page heading, rendered by the page. */
  header: ReactNode;
  lede: string;
  /** What a visitor might have on their mind, by article slug. An article without one is offered by its topic. */
  prompts: Record<string, string>;
};

const delay = (seconds: number) => ({ "--d": `${seconds.toFixed(2)}s` }) as CSSProperties;
/** How fast the page is read, in pixels a second. */
const READING_SPEED = 30;

/**
 * Opens the blog by asking what is on the visitor's mind.
 *
 * Each answer is one article. Choosing one opens it on a reading tablet beside
 * the question: its photograph, title and first paragraphs, which scroll by at
 * reading pace while a bar at the top keeps the place. Left alone, the answers
 * take turns, each as its article is read to the foot of the screen; resting the
 * pointer on the tablet holds the page still. The tablet leans a little toward
 * the pointer.
 */
export function BlogHero({ posts, header, lede, prompts }: BlogHeroProps) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.35 });
  const count = posts.length;

  const [active, setActive] = useState(0);
  /** The answers take turns until the visitor chooses one. */
  const [turns, setTurns] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const progress = useMotionValue(0);

  const auto = useRef(true);
  useEffect(() => {
    auto.current = turns;
  }, [turns]);
  const next = useCallback(() => {
    if (auto.current) setActive((index) => (index + 1) % count);
  }, [count]);

  const choose = (index: number) => {
    setTurns(false);
    setActive(index);
  };

  // the tablet leans toward the pointer
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 60, damping: 16, mass: 0.6 });
  const leanY = useSpring(pointerY, { stiffness: 60, damping: 16, mass: 0.6 });
  const rotateY = useTransform(leanX, (value) => value * 10);
  const rotateX = useTransform(leanY, (value) => value * -7);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const current = posts[active];
  if (!current) return null;
  const reading = inView && !hovered && !focused;

  return (
    <section
      ref={root}
      className="relative overflow-clip bg-paper pb-12 pt-28 lg:pb-16 lg:pt-36"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="shell grid items-center gap-x-12 gap-y-10 lg:grid-cols-12">
        {/* ------------------------------------------------------------ the question */}
        <div className="lg:col-span-7 xl:col-span-6">
          {header}
          <p className="lede intro-fade mt-5 max-w-xl text-pretty text-ink-soft" style={delay(0.5)}>
            {lede}
          </p>

          <div className="intro-fade mt-8 lg:mt-10" style={delay(0.62)}>
            <p className="eyebrow flex items-center gap-3 text-emerald-700">
              <span aria-hidden className="h-px w-8 bg-emerald-700/50" />
              What is on your mind today?
            </p>
            <ul className="mt-4 flex max-w-2xl flex-wrap gap-2">
              {posts.map((post, index) => {
                const chosen = index === active;
                return (
                  <li key={post.slug}>
                    <button
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => choose(index)}
                      className={cn(
                        "min-h-11 cursor-pointer rounded-full border px-4 py-2.5 text-left text-[0.95rem] font-medium leading-tight transition-[background-color,border-color,color,box-shadow] duration-500",
                        chosen
                          ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_14px_28px_-16px_rgb(3_39_26/0.7)]"
                          : "border-ink/14 bg-white text-ink hover:border-emerald-700/50 hover:text-emerald-800",
                      )}
                    >
                      {prompts[post.slug] ?? post.category}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* the article that answers it, named in words as well as shown on the tablet */}
            <div className="mt-6 flex max-w-xl items-start gap-3.5 border-t border-ink/12 pt-5">
              <span aria-hidden className="mt-1.5 size-2.5 flex-none shape-leaf bg-emerald-600" />
              <div className="min-w-0">
                <p className="eyebrow text-ink-mute">A good place to start</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={current.slug}
                    className="mt-1.5"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  >
                    <Link href={current.href} prefetch className="link-line pb-0.5 text-[1.05rem] font-medium leading-snug text-ink">
                      {current.title}
                    </Link>
                    <span className="mt-1 block text-[0.86rem] text-ink-mute">
                      {current.category} · {current.note}
                    </span>
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ the tablet */}
        <div className="intro-fade lg:col-span-5 xl:col-span-6" style={delay(0.4)}>
          <div
            className="relative mx-auto w-full max-w-[24rem] lg:max-w-[27rem] [perspective:1600px]"
            onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={onBlur}
          >
            {/* its light on the page behind */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[14%] rounded-full"
              style={{ background: "radial-gradient(closest-side, var(--color-emerald-100), transparent)" }}
            />
            <motion.div
              className="relative aspect-[3/4] rounded-[2.4rem] bg-emerald-950 p-3 shadow-[0_40px_70px_-36px_rgb(2_26_17/0.75),inset_0_0_0_1.5px_rgb(255_255_255/0.08)]"
              style={reduce ? undefined : { rotateX, rotateY }}
            >
              <span aria-hidden className="absolute left-1/2 top-[0.3rem] size-1.5 -translate-x-1/2 rounded-full bg-white/25" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-white">
                <div className="flex flex-none items-center justify-between gap-4 px-5 pb-2.5 pt-4">
                  <p className="eyebrow text-emerald-700">Aaliya · Blogs</p>
                  <p className="text-[0.78rem] tabular-nums text-ink-mute">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </p>
                </div>
                {/* how far down the page the reading has gone */}
                <div aria-hidden className="h-[3px] flex-none bg-ink/8">
                  <motion.div className="h-full origin-left bg-emerald-600" style={{ scaleX: progress }} />
                </div>

                <div className="relative min-h-0 flex-1">
                  <AnimatePresence mode="wait" initial={false}>
                    <Page
                      key={current.slug}
                      post={current}
                      first={active === 0}
                      reading={reading}
                      still={reduce}
                      progress={progress}
                      onRead={next}
                    />
                  </AnimatePresence>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-white to-transparent" />
                </div>

                <div className="flex-none px-4 pb-4 pt-1">
                  <Link
                    href={current.href}
                    prefetch
                    data-cursor="Read"
                    className="group flex items-center justify-between gap-4 rounded-full bg-emerald-700 py-2 pl-5 pr-2 text-[0.95rem] font-medium text-white transition-colors duration-500 hover:bg-emerald-800"
                  >
                    <span>
                      Read this article
                      <span className="ml-2 font-normal text-emerald-100/80">{current.note}</span>
                    </span>
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-white/14 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PageProps = {
  post: BookPost;
  /** The page the hero opens on: its photograph is fetched at once. */
  first: boolean;
  /** The page is being read: it scrolls. Off, it holds where it is. */
  reading: boolean;
  still: boolean;
  progress: MotionValue<number>;
  /** The reading has reached the foot of the page. */
  onRead: () => void;
};

/** One article on the tablet: photograph, title, standfirst and opening, scrolled through at reading pace. */
function Page({ post, first, reading, still, progress, onRead }: PageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const playback = useRef<ReturnType<typeof animate> | null>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const view = frame.current;
    const page = sheet.current;
    progress.set(0);
    if (!view || !page || still) return;
    const travel = Math.max(0, page.offsetHeight - view.offsetHeight);
    let rest: ReturnType<typeof setTimeout> | undefined;
    const controls = animate(0, 1, {
      duration: Math.max(6, travel / READING_SPEED),
      delay: 1.4,
      ease: "linear",
      onUpdate: (value) => {
        y.set(-travel * value);
        progress.set(value);
      },
      onComplete: () => {
        rest = setTimeout(onRead, 1500);
      },
    });
    playback.current = controls;
    return () => {
      controls.stop();
      clearTimeout(rest);
      playback.current = null;
    };
  }, [still, onRead, progress, y]);

  useEffect(() => {
    const controls = playback.current;
    if (!controls) return;
    if (reading) controls.play();
    else controls.pause();
  }, [reading]);

  return (
    <motion.div
      ref={frame}
      className="absolute inset-0 overflow-hidden"
      initial={still ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={still ? undefined : { opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      <motion.div ref={sheet} style={{ y }} className="px-5 pb-16 pt-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-emerald-100">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            fill
            sizes="(min-width: 1024px) 24rem, 84vw"
            preload={first}
            loading={first ? undefined : "eager"}
            className="object-cover"
          />
        </div>
        <p className="eyebrow mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-emerald-700">
          {post.category}
          {post.sample ? <SampleTag /> : null}
        </p>
        <h2 className="mt-2 font-display text-[1.375rem] font-semibold leading-[1.22] tracking-[-0.016em] text-ink">
          {post.title}
        </h2>
        <p className="mt-2 text-[0.95rem] font-medium leading-snug text-emerald-700">{post.excerpt}</p>
        <div className="mt-3 space-y-2.5 text-[0.9rem] leading-[1.62] text-ink-soft">
          {post.opening.map((passage, index) => (
            <p key={index} className={cn(passage.kind === "quote" && "border-l-2 border-emerald-600 pl-3 text-emerald-800")}>
              {passage.head ? (
                <span className="mb-1 mt-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink">
                  {passage.head}
                </span>
              ) : null}
              {passage.text}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
