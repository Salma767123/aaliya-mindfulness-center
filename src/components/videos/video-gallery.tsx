"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Video } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { FilterChips } from "@/components/ui/filter-chips";
import { ArrowDown, PlayIcon } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";
import { VideoLightbox } from "./video-lightbox";

const delay = (seconds: number) => ({ "--d": `${seconds.toFixed(2)}s` }) as CSSProperties;
const countLabel = (total: number) => `${total} ${total === 1 ? "video" : "videos"}`;

/**
 * How wide a library tile is, chosen so that every row is full whatever the count.
 *
 * Large screens run three across: one tile left over leads the list at full width,
 * two left over share the first row. Tablets run two across, and an odd one out leads.
 * A tile that fills a whole row is set sideways, picture beside words.
 */
function tileShape(index: number, total: number) {
  const left = total % 3;
  const lg = left === 1 && index === 0 ? "full" : left === 2 && index < 2 ? "half" : "third";
  const sm = total % 2 === 1 && index === 0 ? "full" : "single";
  return { lg, sm } as const;
}

const SPAN_LG = { full: "lg:col-span-6", half: "lg:col-span-3", third: "lg:col-span-2" } as const;
const SPAN_SM = { full: "sm:col-span-2", single: "sm:col-span-1" } as const;

type VideoGalleryProps = {
  videos: Video[];
  categories: string[];
  /** Eyebrow and page heading, rendered by the page. */
  header: ReactNode;
  lede: string;
};

export function VideoGallery({ videos, categories, header, lede }: VideoGalleryProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  const featured = videos.find((video) => video.featured) ?? videos[0];
  const rest = videos.filter((video) => video.id !== featured?.id);
  // With no topic chosen the featured film is already on show above; a topic lists everything in it.
  const visible = category ? videos.filter((video) => video.category === category) : rest;

  const topics = categories
    .map((name) => {
      const inTopic = videos.filter((video) => video.category === name);
      // Prefer a picture that is not already the featured one.
      const cover = inTopic.find((video) => video.id !== featured?.id) ?? inTopic[0];
      return { name, total: inTopic.length, cover };
    })
    .filter((topic) => topic.total > 0);

  return (
    <>
      {/* ---------------------------------------------------------------- hero: heading, featured film, topics */}
      <section className="relative overflow-clip bg-paper pt-32 lg:pt-36">
        <div className="shell">
          <div className="flex items-end justify-between gap-x-10">
            <div>{header}</div>
            <p className="eyebrow intro-fade hidden flex-none pb-3.5 tabular-nums text-ink-mute lg:block" style={delay(0.5)}>
              {countLabel(videos.length)}
              <span aria-hidden className="mx-2.5 text-ink/25">/</span>
              {topics.length} topics
            </p>
          </div>
          <p className="lede intro-fade mt-6 max-w-xl text-ink-soft lg:hidden" style={delay(0.5)}>
            {lede}
          </p>

          <div className="mt-8 grid gap-x-10 lg:mt-9 lg:grid-cols-12">
            {featured ? (
              <div className="relative lg:col-span-8">
                {/* Sets the proportion on large screens. The frame fills the cell, so it always ends level with the topics. */}
                <div aria-hidden className="hidden aspect-[16/9] lg:block" />
                <div
                  className="intro-clip overflow-hidden rounded-[2rem] lg:absolute lg:inset-0 lg:rounded-[2.5rem]"
                  style={delay(0.45)}
                >
                  <button
                    type="button"
                    onClick={() => setPlaying(featured)}
                    data-cursor="Play"
                    aria-label={`Play video: ${featured.title}`}
                    className="group relative block aspect-[4/5] w-full overflow-hidden text-left text-white sm:aspect-video lg:aspect-auto lg:h-full"
                  >
                    <span className="intro-zoom absolute inset-0" style={delay(0.45)}>
                      <Image
                        src={featured.poster.src}
                        alt=""
                        fill
                        preload
                        sizes="(min-width: 1024px) 64vw, 94vw"
                        className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.04]"
                      />
                    </span>
                    <span aria-hidden className="absolute inset-0 bg-linear-to-t from-emerald-950/85 via-emerald-950/15 to-emerald-950/20" />

                    <span className="absolute left-6 top-6 flex items-center gap-3 sm:left-9 sm:top-9">
                      <span className="eyebrow rounded-full bg-white px-3.5 py-2 text-emerald-900">Featured</span>
                      {featured.sample ? <SampleTag tone="light" /> : null}
                    </span>

                    <span className="absolute inset-0 grid place-items-center">
                      <Magnetic strength={0.22}>
                        <span className="grid size-20 place-items-center rounded-full bg-white text-emerald-800 transition-transform duration-700 ease-out-expo group-hover:scale-110 sm:size-24">
                          <PlayIcon className="size-7 translate-x-0.5" />
                        </span>
                      </Magnetic>
                    </span>

                    <span className="absolute inset-x-6 bottom-6 block sm:inset-x-9 sm:bottom-9">
                      <span className="eyebrow block text-emerald-200">
                        {featured.category} · {featured.duration}
                      </span>
                      <span className="display-md mt-3 block max-w-2xl">
                        {featured.title}
                      </span>
                      <span className="mt-3 hidden max-w-xl text-[1rem] leading-relaxed text-white/75 sm:block">
                        {featured.description}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Topics. Each one opens the library below on that topic. */}
            <nav aria-label="Browse videos by topic" className="hidden lg:col-span-4 lg:flex lg:flex-col">
              <p className="lede intro-fade text-ink-soft" style={delay(0.55)}>
                {lede}
              </p>
              <p className="eyebrow intro-fade mt-7 border-t border-ink/12 pt-4 text-emerald-700" style={delay(0.62)}>
                Browse by topic
              </p>
              <ul className="mt-1.5 flex flex-1 flex-col">
                {topics.map((topic, index) => (
                  <li key={topic.name} className="intro-fade flex flex-1 border-b border-ink/12" style={delay(0.68 + index * 0.07)}>
                    <a
                      href="#library"
                      onClick={() => setCategory(topic.name)}
                      className="group flex w-full items-center gap-4 py-2.5"
                    >
                      <span className="relative block h-14 w-[4.75rem] flex-none overflow-hidden rounded-xl bg-emerald-100">
                        <Image
                          src={topic.cover.poster.src}
                          alt=""
                          fill
                          sizes="76px"
                          className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-110"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-display text-[1.375rem] leading-tight transition-colors duration-500 group-hover:text-emerald-700",
                            category === topic.name ? "text-emerald-700" : "text-ink",
                          )}
                        >
                          {topic.name}
                        </span>
                        <span className="mt-1 block text-[0.8rem] tabular-nums text-ink-mute">{countLabel(topic.total)}</span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-8 flex-none place-items-center rounded-full transition-[background-color,color,box-shadow] duration-500 group-hover:bg-emerald-700 group-hover:text-white group-hover:shadow-none",
                          category === topic.name
                            ? "bg-emerald-700 text-white"
                            : "text-ink-mute shadow-[inset_0_0_0_1px_rgb(13_21_18/0.16)]",
                        )}
                      >
                        <ArrowDown className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- library */}
      <section id="library" className="scroll-mt-20 bg-paper pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(3.5rem,6vw,6rem)]">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <Reveal className="flex items-baseline gap-4">
              <h2 className="display-lg text-ink">
                The <em className="text-emerald-600">library</em>
              </h2>
              <p aria-live="polite" className="eyebrow tabular-nums text-ink-mute">
                {countLabel(visible.length)}
                {category ? <span className="sr-only"> in {category}</span> : null}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <FilterChips options={categories} value={category} onChange={setCategory} label="Filter videos by topic" />
            </Reveal>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-11 lg:grid-cols-6 lg:gap-y-14">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((video, index) => {
                const shape = tileShape(index, visible.length);
                const wideSm = shape.sm === "full";
                const wideLg = shape.lg === "full";
                return (
                  <motion.article
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8, ease: EASE_OUT }}
                    className={cn(SPAN_SM[shape.sm], SPAN_LG[shape.lg])}
                  >
                    <button
                      type="button"
                      onClick={() => setPlaying(video)}
                      data-cursor="Play"
                      aria-label={`Play video: ${video.title}`}
                      className={cn(
                        "group block w-full text-left",
                        wideSm && "sm:grid sm:grid-cols-12 sm:items-center sm:gap-x-8",
                        wideSm && !wideLg && "lg:block",
                        wideLg && "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12",
                      )}
                    >
                      <span
                        className={cn(
                          "relative block aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-emerald-100",
                          wideSm && "sm:col-span-7",
                          wideLg && "lg:col-span-7 lg:aspect-[16/9]",
                        )}
                      >
                        <Image
                          src={video.poster.src}
                          alt=""
                          fill
                          sizes={
                            wideLg
                              ? "(min-width: 1024px) 54vw, 94vw"
                              : shape.lg === "half"
                                ? "(min-width: 640px) 46vw, 94vw"
                                : "(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 94vw"
                          }
                          className="object-cover transition-transform duration-[1500ms] ease-out-expo group-hover:scale-[1.06]"
                        />
                        <span aria-hidden className="absolute inset-0 bg-emerald-950/10 transition-colors duration-700 group-hover:bg-emerald-950/35" />
                        <span className="absolute left-4 top-4">{video.sample ? <SampleTag tone="light" /> : null}</span>
                        <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1.5 text-[0.76rem] font-medium tabular-nums text-white backdrop-blur">
                          {video.duration}
                        </span>
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid size-16 scale-75 place-items-center rounded-full bg-white text-emerald-800 opacity-0 transition-[opacity,scale] duration-700 ease-out-expo group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100">
                            <PlayIcon className="size-5 translate-x-0.5" />
                          </span>
                        </span>
                      </span>

                      <span
                        className={cn(
                          "mt-5 block",
                          wideSm && "sm:col-span-5 sm:mt-0",
                          wideSm && !wideLg && "lg:mt-5",
                          wideLg && "lg:col-span-5 lg:mt-0",
                        )}
                      >
                        <span className="eyebrow block text-emerald-700">{video.category}</span>
                        <span
                          className={cn(
                            "mt-2.5 block text-ink transition-colors duration-500 group-hover:text-emerald-700",
                            // A tile that fills its row carries the larger title. Tiles that share a row keep room
                            // for the same number of title lines, so the text below them lines up: two lines when
                            // two share a row on a tablet, three where three share a narrow row, two again from 1280px.
                            wideLg ? "display-sm lg:display-md" : shape.lg === "third" ? "display-sm lg:min-h-[3.72em] xl:min-h-[2.48em]" : "display-sm",
                            !wideSm && "sm:max-lg:min-h-[2.54em]",
                          )}
                        >
                          {video.title}
                        </span>
                        <span className={cn("mt-3 block text-[0.98rem] leading-relaxed text-ink-soft", wideLg ? "max-w-md lg:mt-4 lg:text-[1.05rem]" : "max-w-lg")}>
                          {video.description}
                        </span>
                      </span>
                    </button>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          {visible.length === 0 ? (
            <p className="mt-10 font-display text-3xl text-ink-mute">No videos in this topic yet.</p>
          ) : null}
        </div>
      </section>

      <VideoLightbox video={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
