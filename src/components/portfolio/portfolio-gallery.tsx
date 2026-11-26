"use client";

import { useState, ViewTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { ImageAsset, PortfolioEntry } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ParallaxImage } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { FilterChips } from "@/components/ui/filter-chips";
import { ArrowUpRight } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

// Each entry gets its own frame; the sequence repeats after four.
// The ratio is the least height a frame takes. Beside the words on large screens it
// grows to their height, so picture and words always start and end level.
const FRAMES = [
  {
    ratio: "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3]",
    shape: "rounded-[1.25rem] rounded-tr-[5rem] sm:rounded-tr-[10rem]",
    phone: 4 / 3,
  },
  {
    ratio: "aspect-square sm:aspect-[16/9] lg:aspect-[8/7]",
    shape: "shape-arch sm:max-lg:rounded-t-[10rem]",
    phone: 1,
  },
  {
    ratio: "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3]",
    shape: "rounded-[1.25rem] rounded-tl-[5rem] sm:rounded-tl-[10rem]",
    phone: 4 / 3,
  },
  {
    ratio: "aspect-square sm:aspect-[16/9] lg:aspect-[8/7]",
    shape: "shape-leaf",
    phone: 1,
  },
];

/**
 * The `sizes` hint for a cover. The picture is drawn 28% taller than its frame so it
 * can drift, then cut to fill it, so a wide photograph is drawn wider than the frame.
 * Frame shapes by screen: about 6:5 beside the words, nearer 5:6 on small laptops
 * where the words run longer, 16:9 on tablets, and the frame's own ratio on phones.
 */
function coverSizes(photo: ImageAsset, phoneFrame: number) {
  const wide = photo.width / photo.height;
  const drawn = (frame: number) => Math.max(1, (wide * 1.28) / frame);
  return [
    `(min-width: 1280px) ${Math.ceil(46 * drawn(1.2))}vw`,
    `(min-width: 1024px) ${Math.ceil(46 * drawn(0.85))}vw`,
    `(min-width: 640px) ${Math.ceil(92 * drawn(16 / 9))}vw`,
    `${Math.ceil(92 * drawn(phoneFrame))}vw`,
  ].join(", ");
}

type PortfolioGalleryProps = {
  entries: PortfolioEntry[];
  categories: string[];
};

/** The body of work as an alternating spread: picture and words trade sides down the page. */
export function PortfolioGallery({ entries, categories }: PortfolioGalleryProps) {
  const [category, setCategory] = useState<string | null>(null);
  const used = categories.filter((item) => entries.some((entry) => entry.category === item));
  const visible = category ? entries.filter((entry) => entry.category === category) : entries;

  return (
    <section className="bg-paper pb-14 lg:pb-24">
      <div className="shell">
        <Reveal className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-y border-ink/12 py-6">
          <FilterChips options={used} value={category} onChange={setCategory} label="Filter portfolio by kind of work" />
          <p aria-live="polite" className="text-[0.86rem] text-ink-mute">
            {visible.length} {visible.length === 1 ? "entry" : "entries"}
          </p>
        </Reveal>

        <div className="mt-12 space-y-16 md:space-y-20 lg:mt-20 lg:space-y-28">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((entry, index) => {
              const frame = FRAMES[index % FRAMES.length];
              // picture and words trade sides from one entry to the next
              const flip = index % 2 === 1;
              const titleId = `work-${entry.slug}`;
              return (
                <motion.article
                  key={entry.slug}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                >
                  <Link
                    href={`/portfolio/${entry.slug}`}
                    prefetch
                    data-cursor="View"
                    aria-labelledby={titleId}
                    className={cn(
                      "group grid gap-y-7 lg:gap-x-14 xl:gap-x-20",
                      flip
                        ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]"
                        : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
                    )}
                  >
                    {/* The picture. The empty block holds the frame's ratio open; the frame itself
                        stretches with the row, so it is never shorter than the words beside it. */}
                    <div className={cn("relative overflow-hidden bg-emerald-100", frame.shape, flip && "lg:order-last")}>
                      <div aria-hidden className={frame.ratio} />
                      <div className="absolute inset-0">
                        <ViewTransition name={`portfolio-${entry.slug}`} share="morph" default="none">
                          <ParallaxImage
                            image={entry.cover}
                            sizes={coverSizes(entry.cover, frame.phone)}
                            className="size-full"
                            imageClassName="transition-transform duration-[1500ms] ease-out-expo group-hover:scale-[1.05]"
                          />
                        </ViewTransition>
                      </div>
                    </div>

                    {/* The words: what the work is at the head of the picture, what it covers and
                        the way in at its foot. Tablets set the two side by side under the picture. */}
                    <div className="flex flex-col md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-start md:max-lg:gap-x-10">
                      <div>
                        <p className="eyebrow flex flex-wrap items-center gap-3 text-emerald-700">
                          <span className="tabular-nums text-ink-mute">0{index + 1}</span>
                          {entry.category}
                          {entry.sample ? <SampleTag /> : null}
                        </p>
                        <h2
                          id={titleId}
                          className="display-md mt-4 text-ink transition-colors duration-500 group-hover:text-emerald-700"
                        >
                          {entry.title}
                        </h2>
                        <p className="mt-2 font-display text-xl text-emerald-700">{entry.scope}</p>
                        <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{entry.summary}</p>
                      </div>

                      <div className="mt-8 md:max-lg:mt-0 lg:mt-auto lg:pt-9">
                        <p className="eyebrow text-ink-mute">Programme areas</p>
                        <ul className="mt-4 border-t border-ink/12">
                          {entry.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="flex gap-3.5 border-b border-ink/12 py-3 text-[0.98rem] leading-snug text-ink"
                            >
                              <span aria-hidden className="mt-1.5 size-2 flex-none shape-leaf bg-emerald-600" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                        <span className="mt-7 inline-flex items-center gap-3 text-[0.92rem] font-medium text-ink">
                          <span className="grid size-11 place-items-center rounded-full border border-ink/15 transition-colors duration-500 group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
                            <ArrowUpRight className="size-4" />
                          </span>
                          View this work
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
