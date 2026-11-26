"use client";

import { Fragment, useEffect, useRef, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { mapLinkUrl, site } from "@/content/site";
import { EASE_OUT, VIEWPORT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { parseHeading, plainHeading } from "@/lib/utils";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowUpRight, ClockIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

/* ------------------------------------------------------------------
   The closing invitation, as a consultation screen on a tablet.

   Everything a visitor needs to reach the center is on the one screen:
   the invitation and its two actions on the left, where to find the
   center on the right. The tablet is drawn the way the phone in "Kind
   words" is: metal band, black bezel, glass.

   On large screens it arrives with the scroll (GSAP ScrollTrigger reads
   the scroll; the devices are moved in 3D):

   - On the home page, with `journey`, the phone from "Kind words" is the
     same object. It lifts out of its place, tips back and turns as the
     page scrolls under it; edge-on it is the phone for the last time,
     and it comes round as the tablet, which settles into this section.
     One path, one turn, one size at the moment they meet.
   - On every other page the tablet rises on its own, tipped back, and
     straightens as it reaches the middle of the screen.

   Either way the screen is asleep in flight and wakes from its centre as
   the tablet lands.

   Scrolling on, the section leaves in depth: the tablet tips back and
   falls behind the page, the light behind it falls further behind still,
   a reflection crosses the glass, and the footer closes over them all. Small screens and reduced motion get it standing
   still, awake.

   On a phone (below 768px) there is no tablet: a device drawn inside a
   device only takes room from the words. The invitation is set straight
   on the green there, as it was before the tablet: rings spreading from
   behind the heading, the two actions, and where to find the center
   (see <PhoneInvitation>).
   ------------------------------------------------------------------ */

type CallToActionProps = {
  /** Heading copy. *Asterisks* mark emphasis, "\n" starts a new line. */
  heading?: string;
  body?: string;
  /** Home page: the phone in "Kind words" becomes this tablet as the page scrolls. */
  journey?: boolean;
};

/** The header bar that stays over the page, in px. The devices fly in the middle of what is left. */
const HEADER = 72;
const LARGE = "(min-width: 1024px)";

const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
/** Eases in and out of a 0–1 run. */
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const pad = (value: number) => String(value).padStart(2, "0");

/** The visitor's own time of day, as a status bar shows it: "3:42". */
function timeNow() {
  const now = new Date();
  return `${now.getHours() % 12 || 12}:${pad(now.getMinutes())}`;
}

function everyFewSeconds(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

type Flight = {
  /** Scroll positions between which the device is in the air. */
  start: number;
  end: number;
  /** How far across the page the phone's place is from the tablet's. */
  across: number;
  /** The phone's size at the moment it turns edge-on: it draws back a little as it leaves its place. */
  lift: number;
  /** The tablet's size at that same moment, so the two are one height. Zero when there is no phone. */
  meet: number;
  /** Scroll position at which the section has gone under the header bar. */
  leave: number;
};

export function CallToAction({
  heading = "Begin with a\n*conversation.*",
  body = "Reaching out is often the hardest part. Tell us a little about what you are looking for, and we will take it from there, in confidence.",
  journey = false,
}: CallToActionProps) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const place = useRef<HTMLDivElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const shade = useRef<HTMLSpanElement>(null);
  const glare = useRef<HTMLSpanElement>(null);
  const clock = useSyncExternalStore(everyFewSeconds, timeNow, () => "");

  /* ---------------------------------------------------------------- the flight */
  useEffect(() => {
    const slot = place.current;
    const tablet = device.current;
    const face = screen.current;
    if (reduce || !slot || !tablet || !face) return;

    gsap.registerPlugin(ScrollTrigger);
    const sync = () => ScrollTrigger.update();
    lenis?.on("scroll", sync);

    const phone = journey ? document.querySelector<HTMLElement>('[data-journey="phone"]') : null;
    const phonePlace = phone?.parentElement ?? null;
    const phoneSection = phone?.closest<HTMLElement>("section") ?? null;
    let flight: Flight = { start: 0, end: 1, across: 0, lift: 1, meet: 0, leave: 2 };
    /** How far through the flight (0–1), and how far through leaving for the footer (0–1). */
    let at = 0;
    let away = 0;

    /** Where the devices stand on the page. Their places never move, so this holds until the layout changes. */
    const measure = () => {
      const middle = (window.innerHeight + HEADER) / 2;
      const last = document.documentElement.scrollHeight - window.innerHeight - 1;
      const to = slot.getBoundingClientRect();
      const end = Math.min(last, to.top + window.scrollY + to.height / 2 - middle);
      const room = slot.closest("section")?.getBoundingClientRect();
      const leave = Math.max(end + 160, Math.min(last, (room ? room.bottom + window.scrollY : end + window.innerHeight) - HEADER));
      const from = phonePlace?.getBoundingClientRect();
      if (from && from.height > 0) {
        const start = from.top + window.scrollY + from.height / 2 - middle;
        if (end - start > 240) {
          const lift = Math.min(0.78, (window.innerHeight - HEADER - 56) / from.height);
          flight = {
            start,
            end,
            across: to.left + to.width / 2 - (from.left + from.width / 2),
            lift,
            meet: (from.height * lift) / to.height,
            leave,
          };
          return;
        }
      }
      flight = { start: end - window.innerHeight * 0.75, end, across: 0, lift: 1, meet: 0, leave };
    };

    const rest = () => {
      tablet.style.transform = "";
      tablet.style.opacity = "";
      tablet.style.pointerEvents = "";
      face.style.clipPath = "";
      for (const layer of [glow.current, shade.current, glare.current]) {
        if (!layer) continue;
        layer.style.opacity = "";
        layer.style.transform = "";
      }
      if (phone) {
        phone.style.transform = "";
        phone.style.opacity = "";
      }
      if (phoneSection) phoneSection.style.zIndex = "";
    };

    /** Sets everything for a point `at` (0–1) along the flight. */
    const fly = () => {
      const scrolled = clamp(window.scrollY, flight.start, flight.end);

      // Leaving for the footer: each layer falls behind the page at its own rate, the furthest the most,
      // and the tablet tips back as it goes. The section's lower edge closes over them.
      const drop = away * (flight.leave - flight.end) * 0.34;
      const leaving =
        away > 0
          ? `perspective(1800px) translate3d(0, ${drop.toFixed(1)}px, 0) rotateX(${(smooth(away) * 15).toFixed(2)}deg) scale(${(1 - 0.07 * away).toFixed(4)})`
          : "";
      if (shade.current) {
        shade.current.style.opacity = away > 0 ? (1 - away * 0.7).toFixed(3) : "";
        shade.current.style.transform = away > 0 ? `translate3d(0, ${(drop * 1.15).toFixed(1)}px, 0) scaleX(${(1 - 0.14 * away).toFixed(3)})` : "";
      }
      if (glare.current) glare.current.style.transform = away > 0 ? `translate3d(${(away * 28).toFixed(2)}%, 0, 0)` : "";

      // the screen wakes from its centre as the tablet lands
      const awake = smooth((at - 0.62) / 0.35);
      const shut = ((1 - awake) * 50).toFixed(2);
      face.style.clipPath = awake >= 1 ? "" : `inset(${shut}% ${shut}% round 1.2rem)`;
      if (glow.current) {
        glow.current.style.opacity = (awake * (1 - away)).toFixed(3);
        glow.current.style.transform = `translate3d(0, ${(drop * 1.7).toFixed(1)}px, 0) scale(${(0.7 + 0.3 * awake).toFixed(3)})`;
      }

      if (!flight.meet) {
        // on its own: low and tipped back, it rises and straightens
        const up = smooth(at);
        tablet.style.opacity = clamp(at / 0.25).toFixed(3);
        tablet.style.transform =
          at >= 1
            ? leaving
            : `perspective(1800px) translate3d(0, ${((1 - up) * 110).toFixed(1)}px, 0) rotateX(${((1 - up) * 30).toFixed(2)}deg) scale(${(0.86 + 0.14 * up).toFixed(4)})`;
        return;
      }

      // one object: the same tip, lean and turn carry across the moment the phone becomes the tablet
      const arc = Math.sin(Math.PI * at);
      const pose = `rotateX(${(arc * 12).toFixed(2)}deg) rotateZ(${(arc * -4).toFixed(2)}deg)`;
      const over = smooth(at);
      const rise = arc * -14;
      const asPhone = at > 0 && at < 0.5;

      if (phone) {
        phone.style.opacity = at >= 0.5 ? "0" : "";
        phone.style.transform = asPhone
          ? `perspective(2600px) translate3d(${(flight.across * over).toFixed(1)}px, ${(scrolled - flight.start + rise).toFixed(1)}px, 0) ${pose} rotateY(${(at * 180).toFixed(2)}deg) scale(${(1 + (flight.lift - 1) * smooth(at * 2)).toFixed(4)})`
          : "";
      }
      // whichever device is in the air is drawn over the neighbouring section
      if (phoneSection) phoneSection.style.zIndex = asPhone ? "30" : "";

      tablet.style.opacity = at < 0.5 ? "0" : "";
      tablet.style.pointerEvents = at < 0.5 ? "none" : "";
      tablet.style.transform =
        at < 0.5
          ? ""
          : at >= 1
            ? leaving
          : `perspective(2600px) translate3d(${(-flight.across * (1 - over)).toFixed(1)}px, ${(scrolled - flight.end + rise).toFixed(1)}px, 0) ${pose} rotateY(${(at * 180 - 180).toFixed(2)}deg) scale(${(flight.meet + (1 - flight.meet) * smooth(at * 2 - 1)).toFixed(4)})`;
    };

    const media = gsap.matchMedia();
    media.add(LARGE, () => {
      const trigger = ScrollTrigger.create({
        start: () => {
          measure();
          return flight.start;
        },
        end: () => flight.end,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          at = self.progress;
          fly();
        },
        onRefresh: (self) => {
          at = self.progress;
          fly();
        },
      });
      // from the moment the tablet has landed until the section has gone under the header
      const exit = ScrollTrigger.create({
        start: () => {
          measure();
          return flight.end;
        },
        end: () => flight.leave,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          away = self.progress;
          fly();
        },
        onRefresh: (self) => {
          away = self.progress;
          fly();
        },
      });
      at = trigger.progress;
      away = exit.progress;
      fly();

      // pictures loading or a section opening moves the places: measure again once the page settles
      let height = document.body.offsetHeight;
      let timer = 0;
      const watcher = new ResizeObserver(() => {
        if (Math.abs(document.body.offsetHeight - height) < 2) return;
        height = document.body.offsetHeight;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      watcher.observe(document.body);

      return () => {
        window.clearTimeout(timer);
        watcher.disconnect();
        trigger.kill();
        exit.kill();
        rest();
      };
    });

    return () => {
      media.revert();
      lenis?.off("scroll", sync);
    };
  }, [reduce, lenis, journey]);

  /* Standing, the tablet leans a little toward the pointer. */
  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const rotateX = useSpring(leanX, { stiffness: 70, damping: 16, mass: 0.6 });
  const rotateY = useSpring(leanY, { stiffness: 70, damping: 16, mass: 0.6 });

  const handleLean = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    leanY.set(((event.clientX - box.left) / box.width - 0.5) * 5);
    leanX.set((0.5 - (event.clientY - box.top) / box.height) * 4);
  };

  const settle = () => {
    leanX.set(0);
    leanY.set(0);
  };

  return (
    <section
      className="grain relative z-20 overflow-x-clip bg-emerald-800 text-white"
      style={{ clipPath: "inset(-200vh 0 0 0)" }}
    >
      <PhoneInvitation heading={heading} body={body} />

      <div
        className="shell hidden items-center justify-center py-14 md:flex lg:min-h-[calc(100svh-4.5rem)] lg:py-12"
        onPointerMove={handleLean}
        onPointerLeave={settle}
      >
        {/* the tablet's place on the page; the tablet itself is what moves */}
        <div ref={place} className="relative w-full max-w-[32rem] lg:w-[clamp(48rem,calc((100svh-10rem)*1.6),58rem)] lg:max-w-full">
          <span
            ref={glow}
            aria-hidden
            className="pointer-events-none absolute -inset-x-[14%] -inset-y-[22%] bg-[radial-gradient(closest-side,rgb(194_223_208/0.2),transparent)]"
          />
          <span
            ref={shade}
            aria-hidden
            className="pointer-events-none absolute inset-x-[7%] -bottom-7 h-12 rounded-[50%] bg-emerald-950/70 blur-2xl"
          />

          <div ref={device} className="relative [perspective:1800px] lg:will-change-transform">
            {/* the metal band */}
            <motion.div
              style={reduce ? undefined : { rotateX, rotateY }}
              className="relative rounded-[2rem] bg-linear-to-br from-ink-mute via-ink to-ink-soft p-[3px] shadow-[0_50px_70px_-40px_rgb(2_26_17/0.9)] lg:aspect-[8/5] lg:rounded-[2.4rem]"
            >
              {/* power and volume, on the long edge */}
              <span aria-hidden className="absolute -top-[2px] right-[9%] h-[3px] w-12 rounded-t-sm bg-ink-soft" />
              <span aria-hidden className="absolute -top-[2px] right-[17%] h-[3px] w-9 rounded-t-sm bg-ink-soft" />

              {/* the bezel, then the screen: asleep underneath, awake on top */}
              <div className="h-full rounded-[1.82rem] bg-black p-2.5 lg:rounded-[2.22rem] lg:p-3.5">
                <div className="relative h-full overflow-hidden rounded-[1.2rem] bg-emerald-950 lg:rounded-[1.35rem]">
                  <span aria-hidden className="absolute left-1/2 top-1.5 z-10 size-1.5 -translate-x-1/2 rounded-full bg-ink-soft/70 ring-1 ring-white/10" />

                  <div ref={screen} className="relative flex h-full flex-col bg-paper text-ink">
                    {/* status bar */}
                    <div aria-hidden className="flex h-9 flex-none items-center justify-between px-5 text-[0.74rem] font-semibold lg:px-6">
                      <span className="tabular-nums">{clock}</span>
                      <span className="flex items-center gap-2 text-ink-soft">
                        <Image src="/brand/aaliya-mark.png" alt="" width={311} height={291} sizes="16px" className="h-3.5 w-auto" />
                        {site.name}
                      </span>
                      <svg viewBox="0 0 27 12" className="h-[0.66rem] w-auto">
                        <rect x="0.6" y="0.6" width="22.8" height="10.8" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
                        <rect x="2.3" y="2.3" width="15.5" height="7.4" rx="1.8" fill="currentColor" />
                        <rect x="24.6" y="4" width="1.8" height="4" rx="0.9" fill="currentColor" fillOpacity="0.5" />
                      </svg>
                    </div>

                    <div className="grid min-h-0 flex-1 gap-y-7 p-5 pt-3 sm:p-7 sm:pt-4 lg:grid-cols-[1.12fr_1fr] lg:gap-x-7 lg:p-7 lg:pt-3">
                      {/* the invitation and its two actions */}
                      <div className="flex flex-col justify-center lg:pr-2">
                        <p className="eyebrow flex items-center gap-3 text-emerald-700">
                          <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                          Book a consultation
                        </p>
                        <h2 aria-label={plainHeading(heading)} className="display-sm mt-4 text-ink xl:display-md">
                          {parseHeading(heading).map((line, row) => (
                            <span key={row} aria-hidden className="block">
                              {line.map((word, index) => (
                                <Fragment key={index}>
                                  <span className={word.em ? "text-emerald-600" : undefined}>{word.text}</span>{" "}
                                </Fragment>
                              ))}
                            </span>
                          ))}
                        </h2>
                        <p className="mt-3.5 text-[0.98rem] leading-relaxed text-ink-soft xl:text-[1.05rem]">{body}</p>
                        <div className="mt-6 flex flex-wrap gap-2.5">
                          <Button href="/contact">Request an appointment</Button>
                          <Button href={site.phone.href} variant="outline" icon={false}>
                            {`Call ${site.phone.display}`}
                          </Button>
                        </div>
                      </div>

                      {/* where to find the center */}
                      <ul className="flex flex-col justify-center gap-2 rounded-[1.1rem] bg-mist p-2">
                        <Detail
                          icon={<PinIcon className="size-[1.15rem]" />}
                          label="Visit"
                          href={mapLinkUrl()}
                          action="Get directions"
                          external
                        >
                          {site.address.lines.slice(1).join(", ")}
                        </Detail>
                        <Detail icon={<PhoneIcon className="size-[1.15rem]" />} label="Call" href={site.phone.href} action="Call now">
                          {site.phone.display}
                        </Detail>
                        <Detail icon={<ClockIcon className="size-[1.15rem]" />} label="Hours">
                          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            {site.hours.text}
                            {site.hours.placeholder ? <SampleTag label="To be confirmed" /> : null}
                          </span>
                        </Detail>
                      </ul>
                    </div>

                    <span aria-hidden className="mx-auto mb-2 block h-1 w-28 flex-none rounded-full bg-ink/25" />
                  </div>

                  {/* light across the glass */}
                  <span
                    ref={glare}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgb(255_255_255/0.2)_0%,rgb(255_255_255/0)_22%,rgb(255_255_255/0)_78%,rgb(255_255_255/0.08)_100%)]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** One line of "where to find us". With a link, the whole row is the link and says what it will do. */
function Detail({
  icon,
  label,
  href,
  action,
  external,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  action?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="grid size-10 flex-none place-items-center rounded-full bg-white text-emerald-700 transition-colors duration-500 group-hover:bg-emerald-700 group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-ink-mute">{label}</span>
        <span className="mt-1 block text-[0.95rem] leading-snug text-ink">{children}</span>
        {action ? (
          <span className="mt-1 inline-flex items-center gap-1.5 text-[0.84rem] font-medium text-emerald-700">
            {action}
            <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : null}
      </span>
    </>
  );
  const row = "group flex items-center gap-3.5 rounded-[0.85rem] px-3.5 py-3";

  return (
    <li>
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`${row} transition-[background-color,box-shadow] duration-500 hover:bg-white hover:shadow-[0_10px_24px_-18px_rgb(5_58_37/0.55)] focus-visible:bg-white`}
        >
          {inner}
        </a>
      ) : (
        <div className={row}>{inner}</div>
      )}
    </li>
  );
}

/* ----------------------------------------------------------------------- phones */

/**
 * The invitation on a phone: set straight on the green, with rings spreading from behind
 * the heading. The words rise in turn as the section comes into view, the rules between
 * the ways to reach the center draw themselves, and each of those ways has a small sign
 * of life: the pin bobs, the phone rings, the clock turns.
 */
function PhoneInvitation({ heading, body }: { heading: string; body: string }) {
  const reduce = useReducedMotion();
  const ways = useRef<HTMLDivElement>(null);
  const waysInView = useInView(ways, { margin: "0px 0px -10% 0px" });
  const live = waysInView && !reduce;

  return (
    <div className="relative overflow-clip md:hidden">
      {/* ripples, drifting a little against the page, and a light that breathes with them */}
      <Parallax
        distance={-36}
        className="pointer-events-none absolute left-1/2 top-[38%] size-[min(120vw,34rem)] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.span
          aria-hidden
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(194_223_208/0.24),transparent)]"
          animate={reduce ? undefined : { scale: [0.88, 1.1, 0.88], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((ring) => (
          <span
            key={ring}
            aria-hidden
            className="absolute inset-0 animate-ripple rounded-full border border-emerald-200/35"
            style={{ animationDelay: `${ring * 1.75}s` }}
          />
        ))}
      </Parallax>

      <div className="shell relative pb-12 pt-16 text-center">
        <Reveal className="flex justify-center">
          <Eyebrow tone="light">Book a consultation</Eyebrow>
        </Reveal>
        <SplitHeading text={heading} emClassName="text-emerald-200" className="display-xl mx-auto mt-6 max-w-[17ch]" />
        <Reveal delay={0.2}>
          <p className="lede mx-auto mt-6 max-w-xl text-emerald-50/80">{body}</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/contact" variant="light">
            Request an appointment
          </Button>
          <Button href={site.phone.href} variant="ghost-light" icon={false}>
            {`Call ${site.phone.display}`}
          </Button>
        </Reveal>

        {/* where to find us */}
        <div ref={ways} className="relative mx-auto mt-12 max-w-lg text-left">
          <Rule />
          <Stagger as="ul" stagger={0.14}>
            <Way
              label="Visit"
              href={mapLinkUrl()}
              action="Get directions"
              external
              icon={
                <motion.span
                  className="grid place-items-center"
                  animate={live ? { y: [0, -3.5, 0] } : { y: 0 }}
                  transition={live ? { duration: 2.2, ease: "easeInOut", repeat: Infinity } : { duration: 0.3 }}
                >
                  <PinIcon className="size-5" />
                </motion.span>
              }
            >
              {site.address.lines.slice(1).join(", ")}
            </Way>
            <Way
              label="Call"
              href={site.phone.href}
              action="Call now"
              icon={
                <motion.span
                  className="grid place-items-center"
                  animate={live ? { rotate: [0, -16, 13, -10, 7, 0] } : { rotate: 0 }}
                  transition={live ? { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.4 } : { duration: 0.3 }}
                >
                  <PhoneIcon className="size-5" />
                </motion.span>
              }
            >
              {site.phone.display}
            </Way>
            <Way
              label="Hours"
              icon={
                <motion.span
                  className="grid place-items-center"
                  animate={live ? { rotate: [0, 360] } : { rotate: 0 }}
                  transition={live ? { duration: 9, ease: "linear", repeat: Infinity } : { duration: 0.3 }}
                >
                  <ClockIcon className="size-5" />
                </motion.span>
              }
            >
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                {site.hours.text}
                {site.hours.placeholder ? <SampleTag label="To be confirmed" tone="light" /> : null}
              </span>
            </Way>
          </Stagger>
        </div>
      </div>
    </div>
  );
}

/** A hairline that draws itself from the left as it comes into view. */
function Rule({ className = "top-0" }: { className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={`absolute inset-x-0 h-px origin-left bg-white/18 ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE_OUT }}
    />
  );
}

/** One way to reach the center, on the green. With a link, the whole row is the link and says what it will do. */
function Way({
  icon,
  label,
  href,
  action,
  external,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  action?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="grid size-11 flex-none place-items-center rounded-full bg-white/10 text-leaf ring-1 ring-inset ring-white/15">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-emerald-200/80">{label}</span>
        <span className="mt-1.5 block text-[0.98rem] leading-snug text-white/90">{children}</span>
        {action ? (
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-[0.86rem] font-medium text-emerald-200">
            {action}
            <ArrowUpRight className="size-3.5" />
          </span>
        ) : null}
      </span>
    </>
  );
  const row = "flex items-center gap-4 py-4";

  return (
    <StaggerItem as="li" className="relative">
      {href ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={row}>
          {inner}
        </a>
      ) : (
        <div className={row}>{inner}</div>
      )}
      <Rule className="bottom-0" />
    </StaggerItem>
  );
}
