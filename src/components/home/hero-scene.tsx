"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";
import { cutouts } from "@/content/images";
import { LeafArt } from "./hero-emblem";

/* ------------------------------------------------------------------
   The scene round the emblem: a lake at first light.

   Behind her two ranges of hills stand in mist under a pale sky. The
   mist drifts, thin cloud crosses, and a soft light at the horizon
   swells with each breath. The hills lean a little with the pointer,
   the further range less. On the water a lotus rides on its pads at one
   side of her, and at the other a swan, the bird of the center's mark.

   The scroll is read as a camera (see hero.tsx). It sinks to the
   water's edge and moves in while dusk falls: sky and hills darken,
   stars come out, and leaves on the bank rise into the foreground, out
   of focus. Nearer things grow faster than far ones, as they do.

   Layout, colours and loops are in globals.css (.hero-hills,
   .hero-mist, .hero-night, .hero-fore, .hero-lotus, .hero-swan).
   ------------------------------------------------------------------ */

/** What the scroll, the pointer and the breath are doing, for every layer that answers them. */
export type Camera = {
  /** The pointer's place across and down the window, eased: -0.5 to 0.5. */
  leanX: MotionValue<number>;
  leanY: MotionValue<number>;
  /** The breath: 0 breathed out, 1 breathed in. */
  air: MotionValue<number>;
  /** 0 is morning, 1 is night. */
  dusk: MotionValue<number>;
  /** How far the view has moved in, 0-1. */
  push: MotionValue<number>;
  /** How far the horizon has dropped down the screen, in pixels. */
  drop: MotionValue<number>;
};

// Each range is drawn low in the middle, where she sits, and higher to either side.
const FAR_RANGE =
  "M0 240V150C60 120 140 60 250 46C330 36 380 96 460 112C540 128 580 150 660 170C720 185 760 196 820 196C900 196 940 150 1020 118C1090 90 1130 110 1190 92C1260 70 1300 34 1380 30C1470 26 1540 90 1600 120V240Z";
const NEAR_RANGE =
  "M0 160V96C80 70 180 44 300 52C400 58 470 96 560 112C640 126 700 138 800 140C910 142 960 112 1060 96C1180 76 1250 40 1370 46C1470 50 1540 80 1600 92V160Z";

/** Hill colours by day and by night; the day values are repeated in globals.css for the still scene. */
const FAR_COLORS = ["#cfe6da", "#0b3a2a"];
const NEAR_COLORS = ["#b9d9c9", "#06291c"];

export function Backdrop({ camera, still }: { camera: Camera; still: boolean }) {
  const { leanX, leanY, air, dusk, push, drop } = camera;

  const day = useTransform(dusk, [0, 0.75], [1, 0]);
  const stars = useTransform(dusk, [0.45, 1], [0, 1]);
  const dawnScale = useTransform(air, [0, 1], [0.92, 1.1]);
  const dawnOpacity = useTransform<number, number>([air, dusk], ([breath, night]) => (0.62 + breath * 0.38) * (1 - night));

  // The horizon drops as the view tilts up, and takes everything standing on it down with it.
  // Moving in, each range grows about its foot: the near one more.
  const farColor = useTransform(dusk, [0, 1], FAR_COLORS);
  const farX = useTransform(leanX, (value) => value * -12);
  const farY = useTransform<number, number>([leanY, drop], ([lean, down]) => lean * -4 + down);
  const farScale = useTransform(push, [0, 1], [1, 1.05]);

  const nearColor = useTransform(dusk, [0, 1], NEAR_COLORS);
  const nearX = useTransform(leanX, (value) => value * -26);
  const nearY = useTransform<number, number>([leanY, drop], ([lean, down]) => lean * -7 + down);
  const nearScale = useTransform(push, [0, 1], [1, 1.14]);

  const mistX = useTransform(leanX, (value) => value * -40);
  const mistOpacity = useTransform(dusk, [0, 1], [1, 0.26]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="hero-daysky" />

      <motion.div className="hero-light absolute inset-0" style={still ? undefined : { opacity: day }}>
        <div className="hero-glow" />
        <div className="hero-wisp hero-wisp--a" />
        <div className="hero-wisp hero-wisp--b" />
      </motion.div>

      {!still ? (
        <motion.div className="hero-night" style={{ opacity: dusk }}>
          <motion.div className="hero-stars" style={{ opacity: stars }}>
            <i />
            <i />
          </motion.div>
        </motion.div>
      ) : null}

      <div className="intro-fade absolute inset-0">
        <motion.div className="hero-dawn" style={still ? undefined : { scale: dawnScale, opacity: dawnOpacity, y: drop }} />

        <motion.div
          className="hero-hills hero-hills--far"
          style={still ? undefined : { x: farX, y: farY, scale: farScale, color: farColor, originX: 0.5, originY: 1 }}
        >
          <Range id="far" d={FAR_RANGE} height={240} />
        </motion.div>

        <motion.div className="hero-mist" style={still ? undefined : { x: mistX, y: drop, opacity: mistOpacity }}>
          <i />
          <i />
          <i />
        </motion.div>

        <motion.div
          className="hero-hills hero-hills--near"
          style={still ? undefined : { x: nearX, y: nearY, scale: nearScale, color: nearColor, originX: 0.5, originY: 1 }}
        >
          <Range id="near" d={NEAR_RANGE} height={160} />
        </motion.div>
      </div>
    </div>
  );
}

/** One range of hills, in the colour of its wrapper, thinning into the mist at its foot. */
function Range({ id, d, height }: { id: string; d: string; height: number }) {
  return (
    <svg viewBox={`0 0 1600 ${height}`} preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id={`hero-range-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path fill={`url(#hero-range-${id})`} d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ foreground */

/** The leaves of one cluster: where each stands in the cluster's box, how tall, how far it leans. */
const CLUSTER: Array<{ id: string; style: CSSProperties }> = [
  { id: "a", style: { left: "-22%", top: "4%", height: "92%", rotate: "13deg" } },
  { id: "b", style: { left: "-14%", top: "24%", height: "76%", rotate: "44deg" } },
  { id: "c", style: { left: "-6%", top: "44%", height: "56%", rotate: "74deg" } },
];

/**
 * Leaves on the near bank. They are below the frame until the scroll lowers the view,
 * then rise into its corners, dark and out of focus, and move most with the pointer.
 */
export function Foreground({ camera }: { camera: Camera }) {
  const { leanX, push } = camera;
  const y = useTransform(push, (value) => `${((1 - value) * 120).toFixed(2)}%`);
  const x = useTransform(leanX, (value) => value * 44);
  const leftTurn = useTransform(push, [0, 1], [-16, 0]);
  const rightTurn = useTransform(push, [0, 1], [16, 0]);

  const leaves = (side: string) =>
    CLUSTER.map((leaf) => (
      <span key={leaf.id} className="hero-fore__leaf" style={leaf.style}>
        <LeafArt id={`fore-${side}-${leaf.id}`} />
      </span>
    ));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div className="hero-fore hero-fore--left" style={{ x, y, rotate: leftTurn, originX: 0, originY: 1 }}>
        {leaves("left")}
      </motion.div>
      <motion.div className="hero-fore hero-fore--right" style={{ x, y, rotate: rightTurn, originX: 1, originY: 1 }}>
        <div className="hero-fore__flip">{leaves("right")}</div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ the lotus */

/** The lotus on the water beside her, on its pads, with its reflection. */
export function WaterLotus() {
  return (
    <div className="hero-lotus">
      <LilyPad id="hero-pad-under" className="hero-pad hero-pad--under" />
      <LilyPad id="hero-pad-side" className="hero-pad hero-pad--side" />
      <Image
        src={cutouts.lotus.src}
        alt=""
        width={cutouts.lotus.width}
        height={cutouts.lotus.height}
        sizes="(min-width: 1024px) 16vh, 12vh"
        loading="eager"
        className="hero-lotus__mirror"
      />
      <Image
        src={cutouts.lotus.src}
        alt=""
        width={cutouts.lotus.width}
        height={cutouts.lotus.height}
        sizes="(min-width: 1024px) 16vh, 12vh"
        loading="eager"
        className="relative block h-auto w-full"
      />
    </div>
  );
}

/* -------------------------------------------------------------------- the swan */

/** The swan on the water at her other side, wings raised, facing her as it does in the center's mark. */
export function WaterSwan() {
  const picture = (className: string) => (
    <Image
      src={cutouts.swan.src}
      alt=""
      width={cutouts.swan.width}
      height={cutouts.swan.height}
      sizes="(min-width: 1024px) 26vh, 16vh"
      quality={90}
      loading="eager"
      className={className}
    />
  );

  return (
    <div className="hero-swan">
      <div className="hero-swan__float">
        <span className="hero-swan__shade" />
        {picture("hero-swan__mirror")}
        {picture("relative block h-auto w-full")}
      </div>
    </div>
  );
}

/** A lily pad lying on the water, seen from the bank: a flattened round leaf with its one notch. */
function LilyPad({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 84" className={className} focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#74dc14" />
          <stop offset="1" stopColor="#2c9606" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M100 42L197 31A98 40 0 1 0 196 53Z" />
      <path
        fill="none"
        stroke="#1f7d08"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M100 42L22 20M100 42L62 6M100 42L122 4M100 42L8 50M100 42L42 74M100 42L106 80M100 42L162 72"
      />
    </svg>
  );
}
