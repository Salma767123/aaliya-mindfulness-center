"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "motion/react";
import type { BookPost } from "@/lib/article-pages";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

/** What the book calls its contents, where it has to name them. */
export type BookWords = {
  /** Names the whole book for assistive technology, e.g. "Articles". */
  all: string;
  /** One of them, in lower case, e.g. "article". */
  one: string;
  /** The link at the foot of a page, e.g. "Continue reading". */
  more: string;
  /** The word the pointer carries over a spread, e.g. "Read". */
  cursor: string;
  /** Under the row on small screens, e.g. "Swipe through 6 articles". */
  swipe: string;
};

type ArticleBookProps = {
  /** Spreads in the order the pages run, the lead one first. */
  posts: BookPost[];
  /** How the book names its contents. Left out, it speaks of articles. */
  words?: BookWords;
  /** Heading level of the article titles, one below the heading the book sits under. */
  titleAs?: "h2" | "h3";
  /** The book opens a page: it arrives with the page's intro and its first photograph is fetched at once. */
  opensPage?: boolean;
  className?: string;
};

/** 1 turns a page forward (the right page lifts), -1 turns one back (the left page lifts). */
type Direction = 1 | -1;
/** A page off the table: which way it is going, the article it uncovers, and whether it has been let go. */
type Lift = { id: number; slot: 0 | 1; dir: Direction; to: number; turning: boolean };
type Goal = { to: number; dir: Direction };
type Drag = {
  leaf: Lift;
  /** Pointer position across the book: 1 at the page's own outer edge, 0 at the spine, -1 at the far edge. */
  at: (clientX: number) => number;
  grab: number;
  startX: number;
  moved: boolean;
  lastX: number;
  lastTime: number;
  speed: number;
};

const delay = (seconds: number) => ({ "--d": `${seconds.toFixed(2)}s` }) as CSSProperties;
const pad = (value: number) => String(value).padStart(2, "0");

/** One `sizes` for every cover here, so the first one is fetched once for both layouts. */
const SIZES = "(min-width: 1536px) 680px, (min-width: 1024px) 47vw, (min-width: 640px) 56vw, 84vw";
/** Distance of the viewer from the book. Far enough that a turning page barely grows. */
const PERSPECTIVE = "4200px";
/** One page turned: an unhurried lift, a steady sweep across, a soft landing. */
const TURN_SECONDS = 1.55;
const TURN_EASE = [0.32, 0.08, 0.42, 1] as const;
/** After several quick presses the pages still owed are leafed past quickly, at an even pace so they follow on. */
const LEAF_SECONDS = 0.5;
const LEAF_EASE = [0.3, 0.2, 0.6, 0.9] as const;

/* ------------------------------------------------------------------
   The bend of a turning page.

   The page is cut into narrow strips from the spine to the outer edge, each
   hinged on the one before. A turn runs from 0 (lying where it started) to 1
   (lying on the other side). The outer edge is the part a hand takes hold
   of, so it leads and the spine follows: the page curls up from its edge,
   arches over the spine and lies down again from the edge inward.
   ------------------------------------------------------------------ */
const STRIPS = 16;
/** How far behind the outer edge the spine runs, as a share of the turn. */
const LAG = 0.46;
/** How far a page curls while the pointer rests on its edge. */
const PEEK = 0.2;

const radians = (degrees: number) => (degrees * Math.PI) / 180;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** Which way the page points at `along` (0 at the spine, 1 at the outer edge), in degrees: 0 lying on its own side, 180 on the other. */
function tilt(progress: number, along: number) {
  return 180 * smooth(clamp(progress * (1 + LAG) - LAG * (1 - along), 0, 1));
}

/** Which way strip `index` (0 at the spine) points: the tilt of the page at the middle of the strip. */
const bend = (progress: number, index: number) => tilt(progress, (index + 0.5) / STRIPS);

/** Where the outer edge of the page is: 1 over its own outer edge, 0 over the spine, -1 over the far edge. */
function edge(progress: number) {
  let across = 0;
  for (let index = 0; index < STRIPS; index++) across += Math.cos(radians(bend(progress, index)));
  return across / STRIPS;
}

/** How high the page stands off the book, as a share of its width. */
function rise(progress: number) {
  let up = 0;
  for (let index = 0; index < STRIPS; index++) up += Math.sin(radians(bend(progress, index)));
  return up / STRIPS;
}

const EDGE = Array.from({ length: 201 }, (_, step) => edge(step / 200));

/** The point in the turn at which the outer edge is at `across`, so a dragged edge stays under the pointer. */
function progressAt(across: number) {
  let low = 0;
  let high = EDGE.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (EDGE[middle] > across) low = middle;
    else high = middle;
  }
  const span = EDGE[low] - EDGE[high];
  return (low + (span ? (EDGE[low] - across) / span : 0)) / (EDGE.length - 1);
}

/* ------------------------------------------------------------------
   Light on a turning page. It falls from above and a little to the left,
   so a page leaning toward it brightens slightly and one leaning away, or
   standing on edge, goes into shade. The light is worked out along the
   curve of the page, not strip by strip, so no bands show.
   ------------------------------------------------------------------ */
const LIGHT = { x: -0.34, z: 0.94 };
/** How dark a face can go: a photograph deeper than a page of text. */
const DEPTH = { plate: 0.62, paper: 0.36 };

/** How brightly a face tilted to `angle` is lit, where 1 is a page lying flat. */
function lit(angle: number, dir: Direction, back: boolean) {
  const turn = radians(angle);
  const side = back ? -1 : 1;
  // the way the face looks: straight up when the page lies flat
  const x = side * -dir * Math.sin(turn);
  const z = side * Math.cos(turn);
  return (x * LIGHT.x + z * LIGHT.z) / LIGHT.z;
}

const tone = (light: number, depth: number) =>
  light >= 1
    ? `rgb(255 255 255 / ${(Math.min(1, (light - 1) / 0.064) * 0.1).toFixed(3)})`
    : `rgb(2 26 17 / ${(Math.min(1, 1 - light) * depth).toFixed(3)})`;

/** The light across one strip of a face, from its spine side to its outer side. */
function sheen(progress: number, index: number, dir: Direction, back: boolean, depth: number) {
  const inner = tone(lit(tilt(progress, index / STRIPS), dir, back), depth);
  const outer = tone(lit(tilt(progress, (index + 1) / STRIPS), dir, back), depth);
  // a face reads left to right as it faces the reader: the spine is on the left of a
  // forward page's front and of a backward page's back
  return `linear-gradient(to ${(dir === 1) !== back ? "right" : "left"}, ${inner}, ${outer})`;
}

const FACE: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/* A page falls away into the spine and lifts a little at its outer edge. */
const SHADE = "2 26 17";
const GUTTER = {
  left: `linear-gradient(to left, rgb(${SHADE} / 0.2), rgb(${SHADE} / 0.07) 3%, rgb(${SHADE} / 0.02) 9%, transparent 18%), linear-gradient(to right, rgb(${SHADE} / 0.05), transparent 5%)`,
  right: `linear-gradient(to right, rgb(${SHADE} / 0.46), rgb(${SHADE} / 0.17) 3%, rgb(${SHADE} / 0.05) 9%, transparent 18%), linear-gradient(to left, rgb(${SHADE} / 0.12), transparent 5%)`,
};
/* The edges of the pages lying under the open one. */
const PAGE_EDGES = {
  left: `linear-gradient(to left, transparent, rgb(${SHADE} / 0.22)), repeating-linear-gradient(to right, #f7f9f6 0 1.4px, #c5cfc8 1.4px 2px)`,
  right: `linear-gradient(to right, transparent, rgb(${SHADE} / 0.22)), repeating-linear-gradient(to right, #f7f9f6 0 1.4px, #c5cfc8 1.4px 2px)`,
};

/**
 * The articles as a book lying open on the page.
 *
 * Large screens show one article per spread: its opening set in columns on the
 * left page, its photograph on the right. The pages turn the way paper does,
 * curling up from the outer edge: by pressing or dragging an edge, with the arrow
 * keys, or by themselves when left alone.
 * Smaller screens set the same articles in a row to swipe through.
 * Every spread links to its article.
 */
export function ArticleBook({ posts, words, titleAs = "h2", opensPage = false, className }: ArticleBookProps) {
  const named: BookWords = words ?? {
    all: "Articles",
    one: "article",
    more: "Continue reading",
    cursor: "Read",
    swipe: `Swipe through ${posts.length} articles`,
  };
  const reduce = useReducedMotion();
  const book = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [lift, setLift] = useState<Lift | null>(null);
  /** Width of one page in pixels; the turning page is cut to it. */
  const [width, setWidth] = useState(0);
  /** The pages turn by themselves until the visitor turns one. */
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inView = useInView(book, { amount: 0.4 });
  const running = auto && inView && !hovered && !focused && !lift;

  // Two turns in hand, used alternately, so a fresh page always starts flat
  // while the one that has just landed still lies where it came down.
  const first = useMotionValue(0);
  const second = useMotionValue(0);
  const progressOf = (slot: 0 | 1) => (slot ? second : first);

  /** The same state as above, for the moments between renders (animation and pointer callbacks). */
  const live = useRef({
    page: 0,
    lift: null as Lift | null,
    id: 0,
    slot: 1 as 0 | 1,
    goal: null as Goal | null,
    over: null as Direction | null,
  });
  const flight = useRef<{ stop: () => void } | null>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);

  useEffect(() => () => flight.current?.stop(), []);

  useEffect(() => {
    const element = block.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width / 2));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const count = posts.length;
  const wrap = (index: number) => (index + count) % count;
  const current = posts[page];

  function show(next: Lift | null) {
    live.current.lift = next;
    setLift(next);
  }

  /** Takes hold of the next page in a direction. It starts lying flat. */
  function raise(dir: Direction) {
    const slot = live.current.slot ? 0 : 1;
    live.current.slot = slot;
    progressOf(slot).jump(0);
    const next: Lift = { id: ++live.current.id, slot, dir, to: wrap(live.current.page + dir), turning: false };
    show(next);
    return next;
  }

  /** Lets a held page go over to the other side. */
  function fly(leaf: Lift, leafing = false) {
    const progress = progressOf(leaf.slot);
    const flying = { ...leaf, turning: true };
    show(flying);
    flight.current?.stop();
    flight.current = animate(progress, 1, {
      // a page already part of the way over has less far to go
      duration: (leafing ? LEAF_SECONDS : TURN_SECONDS) * (0.4 + 0.6 * (1 - progress.get())),
      ease: leafing ? LEAF_EASE : TURN_EASE,
      onComplete: () => land(flying),
    });
  }

  function land(leaf: Lift) {
    live.current.page = leaf.to;
    setPage(leaf.to);
    const goal = live.current.goal;
    if (goal && goal.to !== leaf.to) {
      fly(raise(goal.dir), true);
      return;
    }
    live.current.goal = null;
    show(null);
    // the pointer is still on an edge: the page now on top curls under it
    if (live.current.over) rest(live.current.over);
  }

  function go(to: number, dir: Direction, byVisitor: boolean) {
    if (byVisitor) setAuto(false);
    const { lift: leaf, page: from } = live.current;
    if (reduce) {
      flight.current?.stop();
      live.current.goal = null;
      show(null);
      live.current.page = to;
      setPage(to);
      return;
    }
    if (leaf?.turning) {
      // a page is in the air: it lands first, then the leafing goes on from there
      live.current.goal = { to, dir };
      return;
    }
    if (to === from) return;
    live.current.goal = { to, dir };
    fly(leaf && leaf.dir === dir ? leaf : raise(dir));
  }

  function step(dir: Direction, byVisitor = true) {
    const { lift: leaf, goal, page: at } = live.current;
    const base = leaf?.turning ? (goal?.to ?? leaf.to) : at;
    go(wrap(base + dir), dir, byVisitor);
  }

  /** The pointer rests on an edge: the page under it curls up a little. */
  function rest(dir: Direction) {
    if (reduce || drag.current) return;
    const leaf = live.current.lift;
    if (leaf?.turning) return;
    flight.current?.stop();
    const held = leaf && leaf.dir === dir ? leaf : raise(dir);
    flight.current = animate(progressOf(held.slot), PEEK, { type: "spring", stiffness: 120, damping: 17 });
  }

  /** Lays a held page back down where it came from. */
  function lower() {
    const leaf = live.current.lift;
    if (!leaf || leaf.turning || drag.current) return;
    flight.current?.stop();
    flight.current = animate(progressOf(leaf.slot), 0, {
      duration: 0.55,
      ease: EASE_OUT,
      onComplete: () => {
        const now = live.current.lift;
        if (now && now.id === leaf.id && !now.turning) show(null);
      },
    });
  }

  /* ---- an edge of the book: rest on it, press it, or take it and pull the page across */
  function enterEdge(dir: Direction, event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    live.current.over = dir;
    rest(dir);
  }

  function leaveEdge() {
    live.current.over = null;
    lower();
  }

  function pressEdge(dir: Direction, event: PointerEvent<HTMLButtonElement>) {
    dragged.current = false;
    const element = block.current;
    const leaf = live.current.lift;
    if (reduce || !element || leaf?.turning || (event.pointerType === "mouse" && event.button !== 0)) return;
    flight.current?.stop();
    const held = leaf && leaf.dir === dir ? leaf : raise(dir);
    const box = element.getBoundingClientRect();
    const half = box.width / 2;
    const at = (clientX: number) => ((clientX - box.left - half) / half) * dir;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      leaf: held,
      at,
      grab: edge(progressOf(held.slot).get()) - at(event.clientX),
      startX: event.clientX,
      moved: false,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      speed: 0,
    };
  }

  function pullEdge(event: PointerEvent<HTMLButtonElement>) {
    const pull = drag.current;
    if (!pull) return;
    if (!pull.moved && Math.abs(event.clientX - pull.startX) < 6) return;
    if (!pull.moved) {
      pull.moved = true;
      setAuto(false);
    }
    progressOf(pull.leaf.slot).set(progressAt(clamp(pull.at(event.clientX) + pull.grab, -1, 1)));
    const elapsed = event.timeStamp - pull.lastTime;
    if (elapsed > 0) pull.speed = (pull.at(event.clientX) - pull.at(pull.lastX)) / elapsed;
    pull.lastX = event.clientX;
    pull.lastTime = event.timeStamp;
  }

  function releaseEdge() {
    const pull = drag.current;
    if (!pull) return;
    drag.current = null;
    // a plain press: the click that follows turns the page
    if (!pull.moved) return;
    dragged.current = true;
    // let go past the middle, or with a flick, and the page goes over; otherwise it falls back
    if (progressOf(pull.leaf.slot).get() > 0.5 || pull.speed < -0.0009) {
      live.current.goal = { to: pull.leaf.to, dir: pull.leaf.dir };
      fly(pull.leaf);
    } else if (live.current.over === pull.leaf.dir) rest(pull.leaf.dir);
    else lower();
  }

  function cancelEdge() {
    if (!drag.current) return;
    drag.current = null;
    lower();
  }

  function clickEdge(dir: Direction) {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    step(dir);
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  if (!current) return null;

  // Entrance classes of a page hero (see .intro-* in globals.css); elsewhere the section reveals the book.
  const fade = opensPage && "intro-fade";
  const clip = opensPage && "intro-clip";
  const zoom = opensPage && "intro-zoom";
  const Title = titleAs;

  /** The article a lifted page uncovers, and what then lies on each side of the book. */
  const toward = lift ? lift.to : page;
  const onLeft = lift?.dir === -1 ? toward : page;
  const onRight = lift?.dir === 1 ? toward : page;
  /** Books number their pages from the first left-hand one. */
  const folio = (index: number, side: "left" | "right") => index * 2 + (side === "left" ? 2 : 3);

  return (
    <div className={className}>
      {/* ------------------------------------------------------------ the book (large screens) */}
      <div
        ref={book}
        role="group"
        aria-roledescription="carousel"
        aria-label={named.all}
        className="hidden lg:block"
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        <div className="relative h-[clamp(26.5rem,32vw,31rem)]">
          {/* Keeps time while the book is left alone: when this runs out, the page turns. Nothing is drawn. */}
          {auto ? (
            <span
              aria-hidden
              key={current.slug}
              onAnimationEnd={() => step(1, false)}
              style={{ animationPlayState: running ? "running" : "paused" }}
              className="pointer-events-none absolute size-px animate-[intro-line_7s_linear_both] opacity-0"
            />
          ) : null}
          {/* the cover boards, showing all round the pages */}
          <span
            aria-hidden
            className={cn(fade, "absolute inset-0 rounded-[14px] bg-emerald-800 shadow-[0_46px_70px_-40px_rgb(2_26_17/0.75)] ring-1 ring-inset ring-white/10")}
            style={delay(0.4)}
          />

          <div ref={block} className="absolute inset-x-[18px] inset-y-[9px]" style={{ perspective: PERSPECTIVE }}>
            {/* the pages already turned, and those still to come: each side thickens as the other thins */}
            <span
              aria-hidden
              className={cn(fade, "absolute inset-y-[2px] right-full rounded-l-[2px] transition-[width] duration-700 ease-out-expo")}
              style={{ ...delay(0.45), width: 3 + 2 * page, backgroundImage: PAGE_EDGES.left }}
            />
            <span
              aria-hidden
              className={cn(fade, "absolute inset-y-[2px] left-full rounded-r-[2px] transition-[width] duration-700 ease-out-expo")}
              style={{ ...delay(0.45), width: 3 + 2 * (count - 1 - page), backgroundImage: PAGE_EDGES.right }}
            />

            <Link href={current.href} prefetch data-cursor={named.cursor} className="group relative grid h-full grid-cols-2 grid-rows-1">
              <div className={cn(fade, "min-w-0")} style={delay(0.45)}>
                <Sheet side="left">
                  <ArticlePage post={posts[onLeft]} folio={folio(onLeft, "left")} more={named.more} titleAs={titleAs} />
                </Sheet>
              </div>
              <div className={cn(clip, "min-w-0")} style={delay(0.45)}>
                <Sheet side="right">
                  <Plate caption={posts[onRight].cover.alt} folio={folio(onRight, "right")}>
                    <div className={cn(zoom, "absolute inset-0")} style={delay(0.45)}>
                      {/* every cover is kept here, so the next one is already loaded when a page turns */}
                      {posts.map((post, index) => (
                        <Image
                          key={post.slug}
                          src={post.cover.src}
                          alt={index === onRight ? post.cover.alt : ""}
                          aria-hidden={index === onRight ? undefined : true}
                          fill
                          sizes={SIZES}
                          preload={opensPage && index === 0}
                          decoding="sync"
                          className={cn("object-cover", index === onRight ? "opacity-100" : "opacity-0")}
                        />
                      ))}
                    </div>
                  </Plate>
                </Sheet>
              </div>
            </Link>

            {/* the page in the air, and the shadow it throws */}
            {lift && width ? (
              <>
                <Cast key={`cast-${lift.id}`} progress={progressOf(lift.slot)} dir={lift.dir} width={width} />
                <Leaf
                  key={lift.id}
                  progress={progressOf(lift.slot)}
                  dir={lift.dir}
                  width={width}
                  article={
                    <Sheet side="left">
                      <ArticlePage
                        more={named.more}
                        post={posts[lift.dir === 1 ? toward : page]}
                        folio={folio(lift.dir === 1 ? toward : page, "left")}
                      />
                    </Sheet>
                  }
                  plate={
                    <Sheet side="right">
                      <Plate
                        caption={posts[lift.dir === 1 ? page : toward].cover.alt}
                        folio={folio(lift.dir === 1 ? page : toward, "right")}
                      >
                        <Image
                          src={posts[lift.dir === 1 ? page : toward].cover.src}
                          alt=""
                          fill
                          sizes={SIZES}
                          loading="eager"
                          decoding="sync"
                          className="object-cover"
                        />
                      </Plate>
                    </Sheet>
                  }
                />
              </>
            ) : null}

            {/* the outer edges: rest the pointer to curl the page, press to turn it, or pull it across */}
            <button
              type="button"
              aria-label={`Previous ${named.one}`}
              data-cursor="Turn"
              onPointerEnter={(event) => enterEdge(-1, event)}
              onPointerLeave={() => leaveEdge()}
              onPointerDown={(event) => pressEdge(-1, event)}
              onPointerMove={(event) => pullEdge(event)}
              onPointerUp={() => releaseEdge()}
              onPointerCancel={() => cancelEdge()}
              onClick={() => clickEdge(-1)}
              className="group/edge absolute inset-y-0 -left-10 z-30 w-[calc(6%+2.5rem)] cursor-pointer touch-pan-y"
            >
              <span
                className={cn(fade, "absolute left-0 top-1/2 -mt-[1.375rem] grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_12px_30px_-12px_rgb(2_26_17/0.55)] ring-4 ring-(--book-ground,var(--color-paper)) transition-[scale] duration-500 ease-out-expo group-hover/edge:scale-110 group-active/edge:scale-95")}
                style={delay(1.1)}
              >
                <ArrowLeft className="size-4" />
              </span>
            </button>
            <button
              type="button"
              aria-label={`Next ${named.one}`}
              data-cursor="Turn"
              onPointerEnter={(event) => enterEdge(1, event)}
              onPointerLeave={() => leaveEdge()}
              onPointerDown={(event) => pressEdge(1, event)}
              onPointerMove={(event) => pullEdge(event)}
              onPointerUp={() => releaseEdge()}
              onPointerCancel={() => cancelEdge()}
              onClick={() => clickEdge(1)}
              className="group/edge absolute inset-y-0 -right-10 z-30 w-[calc(6%+2.5rem)] cursor-pointer touch-pan-y"
            >
              <span
                className={cn(fade, "absolute right-0 top-1/2 -mt-[1.375rem] grid size-11 place-items-center rounded-full bg-emerald-700 text-white shadow-[0_12px_30px_-12px_rgb(2_26_17/0.7)] ring-4 ring-(--book-ground,var(--color-paper)) transition-[scale] duration-500 ease-out-expo group-hover/edge:scale-110 group-active/edge:scale-95")}
                style={delay(1.1)}
              >
                <ArrowRight className="size-4" />
              </span>
            </button>
          </div>
        </div>

        </div>

      {/* ------------------------------------------------------------ the same articles in a row (small screens) */}
      <ul
        aria-label={named.all}
        className="-mx-[clamp(1.25rem,4.6vw,4.75rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4.6vw,4.75rem)] pb-5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post, index) => (
          <li
            key={post.slug}
            className={cn(fade, "w-[84vw] max-w-[23rem] flex-none snap-center sm:w-[56vw] sm:max-w-none md:w-[44vw]")}
            style={delay(0.45 + index * 0.07)}
          >
            <Link href={post.href} prefetch className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white">
              <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
                <Image
                  src={post.cover.src}
                  alt={post.cover.alt}
                  fill
                  sizes={SIZES}
                  loading={opensPage && index === 0 ? "eager" : "lazy"}
                  className="object-cover"
                />
                {post.featured ? (
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-emerald-700 px-3 py-1.5 text-white">Featured</span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-2 text-emerald-700">
                  <span className="tabular-nums text-ink-mute">{pad(index + 1)}</span>
                  {post.category}
                  {post.sample ? <SampleTag /> : null}
                </p>
                <Title className="display-sm mt-4 text-ink">{post.title}</Title>
                <p className="mt-3 line-clamp-3 text-[1rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
                <p className="mt-auto flex items-center justify-between gap-4 pt-6 text-[0.86rem] text-ink-mute">
                  <span>
                    {post.noteLead ? `${post.noteLead} · ` : null}
                    {post.note}
                  </span>
                  <span className="grid size-9 flex-none place-items-center rounded-full bg-emerald-700 text-white">
                    <ArrowRight className="size-4" />
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="eyebrow flex items-center gap-3 text-ink-mute lg:hidden">
        <span aria-hidden className="h-px w-8 bg-ink/25" />
        {named.swipe}
      </p>
    </div>
  );
}

/** One page of the book: white paper that falls away into the spine. */
function Sheet({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div className={cn("relative h-full overflow-hidden bg-white", side === "left" ? "rounded-l-[3px]" : "rounded-r-[3px]")}>
      {children}
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: GUTTER[side] }} />
    </div>
  );
}

/**
 * A left-hand page: the opening of an article as it would be printed. A running
 * head, the title and standfirst, the first lines of the text in columns, and
 * the page number at the foot.
 */
function ArticlePage({
  post,
  folio,
  more = "Continue reading",
  titleAs: Title = "p",
}: {
  post: BookPost;
  folio: number;
  more?: string;
  titleAs?: "h2" | "h3" | "p";
}) {
  return (
    <div className="flex h-full flex-col px-9 pb-5 pt-7 xl:px-12 xl:pb-6 xl:pt-8">
      <p className="flex items-center gap-3 border-b border-ink/15 pb-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {post.featured ? <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-white">Featured</span> : null}
        {post.category}
        {post.sample ? <SampleTag /> : null}
        <span className="ml-auto flex-none text-[0.78rem] font-normal normal-case tracking-normal text-ink-mute">
          {/* the date joins the reading time where the page is wide enough for both */}
          {post.noteLead ? <span className="hidden xl:inline">{post.noteLead} · </span> : null}
          {post.note}
        </span>
      </p>
      <Title className="display-sm mt-5 text-ink transition-colors duration-500 group-hover:text-emerald-700 min-[90rem]:display-md">
        {post.title}
      </Title>
      <p className="mt-2.5 line-clamp-2 font-display text-[1.05rem] leading-snug text-emerald-700">
        {post.excerpt}
      </p>
      {/* the text runs down the first column, then the second, and off the foot of the page */}
      <div className="relative mt-4 min-h-0 flex-1">
        <div className="absolute inset-0 columns-1 gap-x-7 overflow-hidden text-justify text-[0.8125rem] leading-[1.62] text-ink-soft hyphens-auto [column-fill:auto] xl:columns-2">
          {post.opening.map((passage, index) => (
            <p
              key={index}
              className={cn(
                passage.kind === "quote" && "text-emerald-700",
                index === 0
                  ? "first-letter:float-left first-letter:mr-2 first-letter:mt-[0.14em] first-letter:font-display first-letter:text-[2.9em] first-letter:font-semibold first-letter:leading-[0.76] first-letter:text-emerald-700"
                  : "indent-4",
              )}
            >
              {/* a sub-heading runs in as the first words of the paragraph it introduces */}
              {passage.head ? (
                <span className="mr-1.5 inline-block max-w-full indent-0 text-left text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink">
                  {passage.head}.
                </span>
              ) : null}
              {passage.text}
            </p>
          ))}
        </div>
      </div>
      <p className="mt-3 flex items-end justify-between border-t border-ink/15 pt-3 text-[0.84rem]">
        <span className="tabular-nums text-ink-mute">{folio}</span>
        <span className="flex flex-none items-center gap-2.5 font-medium text-emerald-700">
          {more}
          <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5" />
        </span>
      </p>
    </div>
  );
}

/** A right-hand page: the article's photograph to the edges of the paper, with its caption and page number. */
function Plate({ caption, folio, children }: { caption: string; folio: number; children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-emerald-950/65 to-transparent" />
      <span aria-hidden className="absolute bottom-5 left-9 right-24 text-[0.84rem] leading-snug text-white/90 xl:left-11">
        {caption}
      </span>
      <span aria-hidden className="absolute bottom-5 right-9 text-[0.84rem] tabular-nums text-white/85 xl:right-11">
        {folio}
      </span>
    </>
  );
}

type LeafProps = {
  progress: MotionValue<number>;
  dir: Direction;
  /** Width of the page in pixels. */
  width: number;
  /** The two sides of the page: its left-hand face and its right-hand face. */
  article: ReactNode;
  plate: ReactNode;
};

/**
 * The page being turned, printed on both sides: going forward the photograph
 * lifts and the next article comes down on the left; going back the article
 * lifts and the earlier photograph comes down on the right.
 */
function Leaf(props: LeafProps) {
  return <Strip index={0} {...props} />;
}

/**
 * One strip of the turning page, hinged on the strip before it (the first on the
 * spine), carrying its slice of both faces and the rest of the page beyond it.
 */
function Strip({ index, progress, dir, width, article, plate }: LeafProps & { index: number }) {
  const forward = dir === 1;
  const slice = width / STRIPS;
  const hinge = useTransform(progress, (value) => -dir * (bend(value, index) - (index ? bend(value, index - 1) : 0)));
  // Each side is shown only while it faces the reader. Said outright as well as through
  // backface-visibility, which some browsers ignore for layers inside a hidden face.
  const facing = useTransform(progress, (value) => (bend(value, index) < 90 ? "visible" : "hidden"));
  const turned = useTransform(progress, (value) => (bend(value, index) < 90 ? "hidden" : "visible"));
  const lightFront = useTransform(progress, (value) => sheen(value, index, dir, false, forward ? DEPTH.plate : DEPTH.paper));
  const lightBack = useTransform(progress, (value) => sheen(value, index, dir, true, forward ? DEPTH.paper : DEPTH.plate));

  // A face is a pixel wider than its strip, toward the next one, so no gap opens at the hinge.
  const face = { ...FACE, width: slice + 1, [forward ? "left" : "right"]: 0 };
  // Where this strip's slice begins on each face of the whole page.
  const ofPlate = -index * slice;
  const ofArticle = 1 - (STRIPS - 1 - index) * slice;
  const front = forward ? plate : article;
  const back = forward ? article : plate;

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0",
        index ? (forward ? "left-full" : "right-full") : cn("z-20 will-change-transform", forward ? "left-1/2" : "right-1/2"),
      )}
      style={{ width: slice, rotateY: hinge, transformOrigin: forward ? "left center" : "right center", transformStyle: "preserve-3d" }}
    >
      <motion.div className="absolute inset-y-0 overflow-hidden" style={{ ...face, visibility: facing }}>
        <div className="absolute inset-y-0" style={{ width, left: forward ? ofPlate : ofArticle }}>
          {front}
        </div>
        <motion.span className="absolute inset-0" style={{ backgroundImage: lightFront }} />
      </motion.div>
      <motion.div className="absolute inset-y-0 overflow-hidden" style={{ ...face, rotateY: 180, visibility: turned }}>
        <div className="absolute inset-y-0" style={{ width, left: forward ? ofArticle : ofPlate }}>
          {back}
        </div>
        <motion.span className="absolute inset-0" style={{ backgroundImage: lightBack }} />
      </motion.div>
      {index < STRIPS - 1 ? (
        <Strip index={index + 1} progress={progress} dir={dir} width={width} article={article} plate={plate} />
      ) : null}
    </motion.div>
  );
}

/** The shadow of the page in the air: it lies under the page's outer edge and deepens as the page stands up. */
function Cast({ progress, dir, width }: { progress: MotionValue<number>; dir: Direction; width: number }) {
  const x = useTransform(progress, (value) => dir * edge(value) * width);
  const opacity = useTransform(progress, (value) => Math.min(1, rise(value) * 1.7));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[3px]">
      <motion.span
        className="absolute inset-y-0 left-1/2 -ml-[19%] w-[38%] bg-linear-to-r from-transparent via-emerald-950/55 to-transparent"
        style={{ x, opacity }}
      />
    </div>
  );
}
