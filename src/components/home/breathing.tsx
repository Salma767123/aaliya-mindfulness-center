"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useMediaQuery } from "@/lib/use-media-query";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { MindfulNote } from "@/types/content";
import { images } from "@/content/images";
import { Parallax, ParallaxImage } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";

const PHASES = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 2, scale: 1 },
  { label: "Breathe out", seconds: 6, scale: 0.58 },
] as const;

/**
 * A pause in the middle of the page: a guided breath over still water,
 * followed by three short notes on everyday mental well-being.
 */
export function Breathing({ notes }: { notes: MindfulNote[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(0);
  const running = inView && !paused && !reduce;
  /* Depth as the page scrolls, in px either way: the lake furthest back, the words in front of it,
     the breath nearest of all, and the three notes each a little nearer than the last.
     Stacked, on a phone, things travel less so they never close on one another. */
  const beside = useMediaQuery("(min-width: 1024px)");
  const inThree = useMediaQuery("(min-width: 768px)");

  // Step through in / hold / out while the section is on screen.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setPhase((value) => (value + 1) % PHASES.length), PHASES[phase].seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [running, phase]);

  const current = PHASES[phase];

  return (
    <section className="relative overflow-clip bg-emerald-950 text-white">
      <div ref={ref} className="relative flex items-center lg:min-h-[64svh]">
        <ParallaxImage image={images.swanLake} sizes="100vw" amount={10.5} className="!absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-emerald-950/62" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-emerald-950/70 via-transparent to-emerald-950" />

        <div className="shell relative grid items-center gap-x-10 gap-y-12 py-16 lg:grid-cols-12 lg:py-20">
          <Parallax distance={beside ? -30 : -10} className="lg:col-span-6">
            <Reveal>
              <Eyebrow index="05" tone="light">
                A mindful moment
              </Eyebrow>
            </Reveal>
            <SplitHeading
              text={"Before you read on,\n*take one slow breath.*"}
              emClassName="text-emerald-200"
              className="display-lg mt-6"
            />
            <Reveal delay={0.15}>
              <p className="lede mt-8 max-w-md text-emerald-50/80">
                Follow the circle. In through the nose as it opens, a short pause, then out slowly as it settles.
                Three rounds is enough to feel the difference.
              </p>
            </Reveal>
          </Parallax>

          <Reveal variant="scale" className="lg:col-span-5 lg:col-start-8">
            <Parallax distance={beside ? 64 : 18}>
            <div className="relative mx-auto grid aspect-square w-full max-w-[26rem] place-items-center">
              {/* still rings */}
              <span aria-hidden className="absolute inset-0 rounded-full border border-white/14" />
              <span aria-hidden className="absolute inset-[9%] rounded-full border border-white/10" />
              {/* the breath */}
              <motion.span
                aria-hidden
                className="absolute inset-[9%] rounded-full bg-emerald-200/14 backdrop-blur-[2px]"
                initial={false}
                animate={{ scale: reduce ? 0.8 : running ? current.scale : 0.58 }}
                transition={{ duration: running ? current.seconds : 1.2, ease: [0.45, 0, 0.55, 1] }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-[24%] rounded-full bg-emerald-100/16"
                initial={false}
                animate={{ scale: reduce ? 0.8 : running ? current.scale : 0.58 }}
                transition={{ duration: running ? current.seconds : 1.2, ease: [0.45, 0, 0.55, 1], delay: running ? 0.15 : 0 }}
              />
              <div className="relative text-center">
                <p className="font-display text-[2.1rem] leading-none sm:text-[2.6rem]" aria-live="off">
                  {reduce ? "Breathe slowly" : paused ? "Paused" : current.label}
                </p>
                {!reduce ? (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-pressed={paused}
                    className="eyebrow mt-5 min-h-11 rounded-full border border-white/30 px-5 py-2 text-emerald-50 transition-colors duration-300 hover:border-white hover:bg-white hover:text-emerald-900"
                  >
                    {paused ? "Resume" : "Pause"}
                  </button>
                ) : null}
              </div>
            </div>
            </Parallax>
          </Reveal>
        </div>
      </div>

      {/* notes */}
      <div className="shell relative pb-14 lg:pb-20">
        <Stagger className="grid gap-x-10 gap-y-9 border-t border-white/14 pt-10 md:grid-cols-3">
          {notes.map((note, index) => (
            <StaggerItem key={note.title}>
              <Parallax distance={inThree ? index * 22 : 0}>
                <p className="eyebrow tabular-nums text-leaf">Note 0{index + 1}</p>
                <h3 className="display-sm mt-4">{note.title}</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-emerald-50/72">{note.body}</p>
              </Parallax>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.2}>
          <p className="mt-9 max-w-2xl text-[0.82rem] leading-relaxed text-emerald-100/65">
            These notes are general well-being information and are not a substitute for professional care. If you
            are struggling, please reach out to a mental health professional.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
