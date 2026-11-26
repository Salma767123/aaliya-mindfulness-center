"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { Video } from "@/types/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PlayIcon } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";
import { VideoLightbox } from "@/components/videos/video-lightbox";

/**
 * One video, on a screen that opens as it is scrolled to.
 *
 * The screen comes up the page as a small, round-ended window on the picture
 * and widens to the full frame, its corners squaring off as it goes. Inside it
 * the picture starts close and settles back, and drifts a little against the
 * scroll, so it sits behind the frame like a view through a window. The title
 * and the play button arrive once the screen is open. Pressing anywhere on it
 * plays the video in the full-screen player. The rest of the library is one
 * button away.
 */
export function FeaturedVideos({ videos }: { videos: Video[] }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Video | null>(null);
  const video = videos.find((entry) => entry.featured) ?? videos[0];

  // how far the screen has opened: from the moment its top edge enters at the foot of the window
  // until it has climbed most of the way up
  const { scrollYProgress: entering } = useScroll({ target: stage, offset: ["start 0.96", "start 0.24"] });
  const open = useSpring(entering, { stiffness: 120, damping: 28, mass: 0.4 });
  const clipPath = useTransform(open, (value) => {
    const shut = 1 - value;
    return `inset(${(shut * 13).toFixed(2)}% ${(shut * 21).toFixed(2)}% round ${(1.75 + shut * 12).toFixed(2)}rem)`;
  });
  const zoom = useTransform(open, [0, 1], [1.28, 1]);
  const words = useTransform(open, [0.62, 1], [0, 1]);
  const wordsY = useTransform(open, [0.62, 1], [26, 0]);
  const button = useTransform(open, [0.45, 0.95], [0.5, 1]);

  // the picture drifts against the scroll for as long as the screen is in view
  const { scrollYProgress: passing } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const drift = useTransform(passing, [0, 1], ["-7%", "7%"]);

  if (!video) return null;

  return (
    <section className="section-y relative overflow-clip bg-paper">
      <div className="shell">
        <div className="mx-auto max-w-[62rem]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div>
            <Reveal>
              <Eyebrow index="06">Videos</Eyebrow>
            </Reveal>
            <SplitHeading text={"Watch, pause, *reflect.*"} className="display-lg mt-6 text-ink" />
          </div>
          <Reveal delay={0.15}>
            <Button href="/videos" variant="outline">
              All videos
            </Button>
          </Reveal>
        </div>

        <div ref={stage} className="mt-8 lg:mt-10">
          <motion.button
            type="button"
            onClick={() => setPlaying(video)}
            data-cursor="Play"
            aria-label={`Play video: ${video.title}`}
            style={reduce ? undefined : { clipPath }}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-emerald-100 text-left text-white sm:aspect-video lg:aspect-[2/1]"
          >
            <motion.span className="absolute -inset-y-[9%] inset-x-0 block" style={reduce ? undefined : { y: drift, scale: zoom }}>
              <Image
                src={video.poster.src}
                alt=""
                fill
                sizes="(min-width: 1100px) 62rem, 94vw"
                className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.04]"
              />
            </motion.span>
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-ink/25" />

            <motion.span className="absolute left-5 top-5 sm:left-8 sm:top-8" style={reduce ? undefined : { opacity: words }}>
              {video.sample ? <SampleTag tone="light" /> : null}
            </motion.span>

            <motion.span className="absolute inset-0 grid place-items-center" style={reduce ? undefined : { scale: button, opacity: button }}>
              <Magnetic strength={0.2}>
                <span className="relative grid size-16 place-items-center rounded-full bg-white text-emerald-800 transition-transform duration-700 ease-out-expo group-hover:scale-110 sm:size-20">
                  <PlayIcon className="size-6 translate-x-0.5 sm:size-7" />
                </span>
              </Magnetic>
            </motion.span>

            <motion.span
              className="absolute inset-x-5 bottom-5 block sm:inset-x-8 sm:bottom-8"
              style={reduce ? undefined : { opacity: words, y: wordsY }}
            >
              <span className="eyebrow block text-emerald-200">
                {video.category} · {video.duration}
              </span>
              <span className="display-sm mt-2 block max-w-2xl">{video.title}</span>
            </motion.span>
          </motion.button>
        </div>
        </div>
      </div>

      <VideoLightbox video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}
