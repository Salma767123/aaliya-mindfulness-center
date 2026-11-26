"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Service } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";

/** How long the pointer rests on a row before it opens, and how long the rows take to settle afterwards (ms). */
const HOVER_REST = 90;
const HOVER_SETTLE = 450;

/**
 * The five areas of work as one compact list beside a small photograph.
 *
 * One area is open at a time: its summary and what it includes, set as short
 * labels. Pointing at another opens it and closes the first (a tap, or focus from
 * the keyboard, does the same), and the photograph changes with it, so the section
 * keeps to a single screen whichever is open. On small screens the
 * open area carries its own photograph. Each row keeps its anchor
 * (`/#psychological-counseling` and so on).
 */
export function Services({ services }: { services: Service[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  /* Opening on hover. Three things keep it calm:
     - the pointer has to rest on a row for a moment, so crossing the list on the way
       somewhere else opens nothing;
     - while the rows are still sliding from the last change, nothing new opens;
     - a row that slides under a pointer that is not moving is not a choice. */
  const hover = useRef({ x: -1, y: -1, moved: false, waiting: -1, timer: 0, settled: 0 });
  useEffect(() => {
    const state = hover.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const state = hover.current;
    state.moved = event.clientX !== state.x || event.clientY !== state.y;
    state.x = event.clientX;
    state.y = event.clientY;
  };

  const pointAt = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    const state = hover.current;
    if (event.pointerType !== "mouse" || !state.moved || index === active || state.waiting === index) return;
    window.clearTimeout(state.timer);
    state.waiting = index;
    state.timer = window.setTimeout(
      () => {
        if (state.waiting !== index) return;
        state.waiting = -1;
        state.settled = performance.now() + HOVER_SETTLE;
        setActive(index);
      },
      Math.max(HOVER_REST, state.settled - event.timeStamp),
    );
  };

  const pointAway = (index: number) => {
    const state = hover.current;
    if (state.waiting !== index) return;
    window.clearTimeout(state.timer);
    state.waiting = -1;
  };

  return (
    <section id="services" className="section-y relative scroll-mt-10 bg-paper">
      <div className="shell">
        <div className="mx-auto max-w-[66rem]">
          <div className="grid items-end gap-x-10 gap-y-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow index="03">Our services</Eyebrow>
              </Reveal>
              <SplitHeading text={"Support that meets\nyou *where you are.*"} className="display-lg mt-5 text-ink" />
            </div>
            <Reveal delay={0.15} className="lg:col-span-5">
              <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-soft lg:ml-auto">
                Five areas of work, one approach: evidence-based, attentive to the whole person, and shaped around
                the people in front of us.
              </p>
            </Reveal>
          </div>

          <div className="mt-8 grid items-start gap-x-14 gap-y-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            {/* ---------------------------------------------------------- the five areas */}
            <div onPointerMoveCapture={trackPointer}>
            <Stagger as="ol" stagger={0.06} className="border-b border-ink/12">
              {services.map((service, index) => {
                const open = index === active;
                return (
                  <StaggerItem as="li" key={service.slug} className="border-t border-ink/12">
                    <h3 id={service.slug} className="scroll-mt-28">
                      <button
                        type="button"
                        id={`service-${service.slug}`}
                        aria-expanded={open}
                        aria-controls={`service-${service.slug}-panel`}
                        onClick={() => setActive(index)}
                        onFocus={() => setActive(index)}
                        onPointerMove={(event) => pointAt(event, index)}
                        onPointerLeave={() => pointAway(index)}
                        className="group flex w-full cursor-pointer items-center gap-4 py-4 text-left sm:gap-5"
                      >
                        <span
                          className={cn(
                            "eyebrow w-6 flex-none tabular-nums transition-colors duration-500",
                            open ? "text-emerald-700" : "text-ink-mute",
                          )}
                        >
                          {service.index}
                        </span>
                        <span
                          className={cn(
                            "display-sm flex-1 transition-[color,translate] duration-500 ease-out-expo",
                            open ? "text-ink" : "text-ink/60 group-hover:translate-x-1 group-hover:text-ink",
                          )}
                        >
                          {service.title}
                        </span>
                        <span className="hidden flex-none text-[0.84rem] tabular-nums text-ink-mute sm:block">
                          {service.items.length} services
                        </span>
                        {/* a plus that closes to a minus when the row is open */}
                        <span
                          aria-hidden
                          className={cn(
                            "relative grid size-8 flex-none place-items-center rounded-full transition-colors duration-500",
                            open
                              ? "bg-emerald-700 text-white"
                              : "text-ink-mute shadow-[inset_0_0_0_1px_rgb(13_21_18/0.16)] group-hover:text-emerald-700",
                          )}
                        >
                          <span className="absolute h-px w-3 bg-current" />
                          <span
                            className={cn(
                              "absolute h-3 w-px bg-current transition-transform duration-500 ease-out-expo",
                              open && "scale-y-0",
                            )}
                          />
                        </span>
                      </button>
                    </h3>

                    <div
                      id={`service-${service.slug}-panel`}
                      role="region"
                      aria-labelledby={`service-${service.slug}`}
                      aria-hidden={!open}
                      inert={!open}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-700 ease-out-expo motion-reduce:transition-none",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="pb-6 sm:pl-11">
                          <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-emerald-100 sm:max-w-md lg:hidden">
                            <Image src={service.image.src} alt={service.image.alt} fill sizes="92vw" className="object-cover" />
                          </div>
                          <p className="max-w-xl text-[1rem] leading-relaxed text-ink-soft">{service.summary}</p>
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {service.items.map((item, position) => (
                              <motion.li
                                key={item}
                                initial={false}
                                animate={open && !reduce ? { opacity: [0, 1], y: [8, 0] } : { opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: EASE_OUT, delay: open ? 0.12 + position * 0.04 : 0 }}
                                className="rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1.5 text-[0.86rem] font-medium leading-tight text-emerald-800"
                              >
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
            </div>

            {/* ---------------------------------------------------------- a small picture of the open area */}
            <Reveal delay={0.1} className="hidden lg:block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-emerald-100">
                {/* Stacked in order: each picture wipes up over the one before it, and back down on the way up. */}
                {services.map((service, index) => (
                  <motion.div
                    key={service.slug}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ clipPath: index <= active ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                    transition={{ duration: reduce ? 0 : 1, ease: EASE_OUT }}
                  >
                    <motion.div
                      className="relative size-full"
                      initial={false}
                      animate={{ scale: index === active ? 1 : 1.14 }}
                      transition={{ duration: reduce ? 0 : 1.5, ease: EASE_OUT }}
                    >
                      <Image
                        src={service.image.src}
                        alt={index === active ? service.image.alt : ""}
                        fill
                        sizes="(min-width: 1024px) 20rem, 1px"
                        className="object-cover"
                      />
                    </motion.div>
                  </motion.div>
                ))}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-t from-emerald-950/65 to-transparent" />
                <p aria-hidden className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 text-white">
                  <span className="text-[0.95rem] font-medium leading-tight">{services[active].title}</span>
                  <span className="eyebrow flex-none tabular-nums text-white/75">
                    {services[active].index} / 0{services.length}
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
