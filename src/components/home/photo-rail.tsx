"use client";

import { useEffect, useRef, useState, ViewTransition, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { ImageAsset } from "@/types/content";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowUpRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

type Frame = {
  /** Frame width in vw: phone, from 640px, from 1024px. */
  vw: [number, number, number];
  /** Frame width divided by height. */
  aspect: number;
  shape: string;
  /** How far down the row the frame starts on large screens, as a share of the room for pictures. */
  lift: number;
};

// Frames alternate in proportion and height so the row reads as a gallery wall, not a carousel.
const FRAMES: Frame[] = [
  { vw: [72, 44, 27], aspect: 4 / 5, shape: "rounded-t-[999px]", lift: 0 },
  { vw: [78, 52, 36], aspect: 4 / 3, shape: "rounded-[1.5rem]", lift: 0.2 },
  { vw: [72, 44, 25], aspect: 3 / 4, shape: "shape-leaf", lift: 0.07 },
  { vw: [78, 52, 33], aspect: 5 / 4, shape: "rounded-[1.5rem]", lift: 0.26 },
];

/** One picture in the row, with its caption and where it leads. */
export type RailItem = {
  slug: string;
  href: string;
  /** The small label over the title, e.g. the kind of work or the topic. */
  category: string;
  title: string;
  /** The quiet line under the title, e.g. who it was for, or the date and reading time. */
  note: string;
  cover: ImageAsset;
  sample: boolean;
  /** Shared-element name of the picture on the page it leads to, so the picture travels there. */
  transition?: string;
};

type PhotoRailProps = {
  /** Section number and label. */
  index: string;
  eyebrow: string;
  /** Section heading. *Asterisks* mark emphasis. */
  heading: string;
  /** The button beside the heading. */
  action: { href: string; label: string };
  items: RailItem[];
  /** The tile that ends the row: a line, a button, and the mark shown while entries are samples. */
  closing: { text: string; label: string; sampleLabel: string };
  /** The word the pointer carries over a picture. */
  cursor?: string;
  /** The ground the section sits on. */
  tone?: "mist" | "paper";
};

/** Height kept under each picture for its caption: a label, a title of up to three lines, a note. */
const CAPTION = "11rem";

/**
 * `sizes` for a photo that covers its frame. Any photo fits any frame without
 * stretching: it is scaled until it fills the frame and the overflow is cropped.
 * A photo wider than its frame is therefore scaled by height and drawn wider
 * than the frame, so it needs more pixels than the frame's own width suggests.
 */
function coverSizes(frame: Frame, photo: ImageAsset) {
  const scale = Math.max(1, photo.width / photo.height / frame.aspect);
  const [phone, sm, lg] = frame.vw.map((vw) => `${Math.ceil(vw * scale)}vw`);
  return `(min-width: 1024px) ${lg}, (min-width: 640px) ${sm}, ${phone}`;
}

/**
 * A horizontal gallery: pictures in frames of different shapes, each with its
 * caption. On large screens the section pins and vertical scrolling carries the
 * row sideways; on touch screens it is a native swipeable row. The home page
 * uses it for the latest articles.
 *
 * Pinned, the stage is one screen tall and starts under the site header, which
 * stays in view. The row takes the height the heading leaves, and each picture
 * is as tall as that allows, so the stage fits a short laptop screen as well as
 * a tall one without anything running under the header or off the bottom.
 */
export function PhotoRail({ index, eyebrow, heading, action, items, closing, cursor = "View", tone = "mist" }: PhotoRailProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);

  // Pinned travel equals the row's overflow, so one pixel of scroll moves the row one pixel.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const desktop = window.matchMedia("(min-width: 1024px)");

    function measure() {
      if (!track) return;
      const pinned = desktop.matches && !reduce;
      setDistance(pinned ? Math.max(0, track.scrollWidth - window.innerWidth) : 0);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const pinned = distance > 0;

  return (
    <section
      ref={sectionRef}
      className={cn("relative", tone === "mist" ? "bg-mist" : "bg-paper")}
      style={{ height: pinned ? `calc(100svh + ${distance}px)` : undefined } as CSSProperties}
    >
      <div
        className={cn(
          "flex flex-col",
          pinned
            ? "sticky top-0 h-svh overflow-hidden pb-[clamp(1rem,3svh,2.5rem)] pt-[calc(4.5rem+clamp(1rem,3svh,2.5rem))]"
            : "section-y",
        )}
      >
        <div className="shell flex flex-none flex-wrap items-end justify-between gap-x-10 gap-y-6 lg:flex-nowrap">
          <div>
            <Reveal>
              <Eyebrow index={index}>{eyebrow}</Eyebrow>
            </Reveal>
            <SplitHeading text={heading} className="display-lg mt-5 text-ink" />
          </div>
          <Reveal delay={0.15} className="flex-none">
            <Button href={action.href} variant="outline">
              {action.label}
            </Button>
          </Reveal>
        </div>

        {/* Pinned, this box is whatever height is left, and the pictures measure themselves against it. */}
        <div
          className={cn(
            pinned
              ? "mt-[clamp(1.25rem,3.5svh,3rem)] min-h-0 flex-1 [container-type:size]"
              : "mt-10 snap-x snap-proximity scroll-px-[clamp(1.25rem,4.6vw,4.75rem)] overflow-x-auto [scrollbar-width:none] lg:mt-12 [&::-webkit-scrollbar]:hidden",
          )}
          style={pinned ? ({ "--pic": `calc(100cqh - ${CAPTION})` } as CSSProperties) : undefined}
        >
          <motion.div
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className={cn(
              "flex w-max items-start gap-5 px-[clamp(1.25rem,4.6vw,4.75rem)] sm:gap-8 lg:gap-12",
              pinned && "h-full",
            )}
          >
            {items.map((item, position) => {
              const frame = FRAMES[position % FRAMES.length];
              const picture = (
                <Image
                  src={item.cover.src}
                  alt={item.cover.alt}
                  fill
                  sizes={coverSizes(frame, item.cover)}
                  className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]"
                />
              );
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  prefetch
                  data-cursor={cursor}
                  className="group block w-[var(--w)] flex-none snap-start sm:w-[var(--w-sm)] lg:mt-[var(--lift)] lg:w-[var(--w-lg)]"
                  style={
                    {
                      "--w": `${frame.vw[0]}vw`,
                      "--w-sm": `${frame.vw[1]}vw`,
                      "--w-lg": `${frame.vw[2]}vw`,
                      "--lift": pinned ? `calc(var(--pic) * ${frame.lift})` : `${(frame.lift * 70).toFixed(1)}svh`,
                    } as CSSProperties
                  }
                >
                  {/* Pinned: the frame's own proportion, or shorter where the screen is. The photograph
                      covers the frame either way, so it is cropped, never stretched. */}
                  <div
                    className={cn("relative overflow-hidden bg-emerald-100", frame.shape)}
                    style={
                      pinned
                        ? {
                            height: `max(9rem, min(calc(var(--w-lg) / ${frame.aspect}), calc(var(--pic) * ${1 - frame.lift})))`,
                          }
                        : { aspectRatio: frame.aspect }
                    }
                  >
                    {item.transition ? (
                      <ViewTransition name={item.transition} share="morph" default="none">
                        {picture}
                      </ViewTransition>
                    ) : (
                      picture
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow flex items-center gap-3 text-emerald-700">
                        <span className="tabular-nums text-ink-mute">0{position + 1}</span>
                        {item.category}
                      </p>
                      <h3 className={cn("display-sm mt-2 text-ink", pinned && "line-clamp-3")}>{item.title}</h3>
                      <p className="mt-1.5 text-[0.9rem] text-ink-mute">{item.note}</p>
                    </div>
                    <span className="mt-1 grid size-10 flex-none place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* closing tile */}
            <div className="flex w-[70vw] flex-none snap-start flex-col justify-center self-stretch pr-6 sm:w-[40vw] lg:w-[24vw]">
              <p className="display-md text-emerald-800">{closing.text}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button href={action.href}>{closing.label}</Button>
                {items.some((item) => item.sample) ? <SampleTag label={closing.sampleLabel} /> : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
