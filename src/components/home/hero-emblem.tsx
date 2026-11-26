"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import { cutouts } from "@/content/images";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   The emblem at the centre of the hero.

   A figure sits in meditation, in silhouette, before a lotus of twenty
   petals, with a pale sun behind her head and four leaves at her knees.
   It is built in layers, back to front: petals, sun, the two leaves
   behind, the two in front, the figure. Each layer is its own element,
   so each can move on its own:

   - the petals turn, very slowly, while the colour across them stays
     where it is (teal at the top, lime at the foot), and a soft light
     travels round them;
   - the sun and the petals swell with each breath in;
   - the leaves sway, each in its own time;
   - the layers shift by different amounts with the pointer, the
     furthest most, so the piece has depth;
   - as the page scrolls and the view moves in, the flower opens, the
     leaves spread and the nearer layers grow faster than the far ones.

   Shapes, colours and loops are in globals.css (.emblem-*). The figure
   is artwork supplied by the centre; everything round her is drawn here.
   ------------------------------------------------------------------ */

/** The emblem is laid out on a sheet this size; the lotus is a 960 circle hung from its top edge. */
const SHEET = { width: 1100, height: 1000 };

type LeafSpec = {
  id: string;
  /** Where the stalk stands, on the sheet. */
  x: number;
  y: number;
  /** Its length, and its width as a share of that. */
  length: number;
  width: number;
  /** How far it leans from upright, in degrees (negative is to the left). */
  turn: number;
  front?: boolean;
  /** Seconds for one sway, and how far into it the leaf starts. */
  sway: number;
  lag: number;
};

const LEAVES: LeafSpec[] = [
  { id: "back-left", x: 372, y: 806, length: 372, width: 0.62, turn: -27, sway: 7.5, lag: -2 },
  { id: "back-right", x: 728, y: 806, length: 372, width: 0.62, turn: 27, sway: 8.6, lag: -5 },
  { id: "front-left", x: 352, y: 908, length: 410, width: 0.66, turn: -62, front: true, sway: 6.4, lag: -1 },
  { id: "front-right", x: 748, y: 908, length: 410, width: 0.66, turn: 62, front: true, sway: 9.2, lag: -4 },
];

const percent = (value: number, of: number) => `${((value / of) * 100).toFixed(2)}%`;

function leafStyle(leaf: LeafSpec, order: number): CSSProperties {
  const breadth = leaf.length * leaf.width;
  return {
    left: percent(leaf.x - breadth / 2, SHEET.width),
    top: percent(leaf.y - leaf.length, SHEET.height),
    width: percent(breadth, SHEET.width),
    height: percent(leaf.length, SHEET.height),
    "--turn": `${leaf.turn}deg`,
    "--side": leaf.turn < 0 ? -1 : 1,
    "--sway": `${leaf.sway}s`,
    "--lag": `${leaf.lag}s`,
    "--d": `${(1 + order * 0.12).toFixed(2)}s`,
  } as CSSProperties;
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** What moves each layer. Left out, the emblem is drawn still. */
type Drive = {
  petals: MotionStyle;
  halo: MotionStyle;
  glow: MotionStyle;
  sun: MotionStyle;
  leavesBack: MotionStyle;
  leavesFront: MotionStyle;
  spreadLeft: MotionValue<number>;
  spreadRight: MotionValue<number>;
  figure: MotionStyle;
};

type EmblemProps = {
  /** The pointer's place across and down the window, eased: -0.5 to 0.5. */
  leanX: MotionValue<number>;
  leanY: MotionValue<number>;
  /** The breath: 0 breathed out, 1 breathed in. */
  air: MotionValue<number>;
  /** How far the scroll has moved the view in towards her, 0-1. */
  open: MotionValue<number>;
  /** Drawn without movement, for visitors who prefer less of it. */
  still?: boolean;
};

export function Emblem({ leanX, leanY, air, open, still }: EmblemProps) {
  // The figure is what the eye rests on, so she is the fixed point: everything behind her
  // slides the other way as the pointer moves, further the further back it is.
  const petalsX = useTransform(leanX, (value) => `${(value * -5.6).toFixed(3)}%`);
  const petalsY = useTransform(leanY, (value) => `${(value * -3.4).toFixed(3)}%`);
  const petalsScale = useTransform<number, number>([air, open], ([breath, opened]) => 1 + breath * 0.03 + opened * 0.06);

  const haloX = useTransform(leanX, (value) => `${(value * -3.8).toFixed(3)}%`);
  const haloY = useTransform(leanY, (value) => `${(value * -2.3).toFixed(3)}%`);
  const sunScale = useTransform<number, number>([air, open], ([breath, opened]) => 1 + breath * 0.07 + opened * 0.16);
  const glowScale = useTransform(air, [0, 1], [0.88, 1.18]);
  const glowOpacity = useTransform(air, [0, 1], [0.45, 1]);

  const backX = useTransform(leanX, (value) => `${(value * -2.2).toFixed(3)}%`);
  const backY = useTransform(leanY, (value) => `${(value * -1.3).toFixed(3)}%`);
  const frontX = useTransform(leanX, (value) => `${(value * -1).toFixed(3)}%`);
  const frontY = useTransform(leanY, (value) => `${(value * -0.6).toFixed(3)}%`);
  // moving in, what is nearer grows faster
  const backScale = useTransform(open, [0, 1], [1, 1.04]);
  const frontScale = useTransform(open, [0, 1], [1, 1.1]);

  // the leaves lift a little with the breath and spread as the flower opens
  const spreadLeft = useTransform<number, number>([air, open], ([breath, opened]) => -(breath * 1.6 + opened * 9));
  const spreadRight = useTransform(spreadLeft, (value) => -value);

  const figureScale = useTransform(air, [0, 1], [1, 1.012]);

  const drive: Drive = {
    petals: { x: petalsX, y: petalsY, scale: petalsScale, originX: 0.5, originY: 0.48 },
    halo: { x: haloX, y: haloY },
    glow: { scale: glowScale, opacity: glowOpacity },
    sun: { scale: sunScale },
    leavesBack: { x: backX, y: backY, scale: backScale, originX: 0.5, originY: 1 },
    leavesFront: { x: frontX, y: frontY, scale: frontScale, originX: 0.5, originY: 1 },
    spreadLeft,
    spreadRight,
    figure: { scale: figureScale, originX: 0.5, originY: 1 },
  };

  return <EmblemArt drive={still ? undefined : drive} />;
}

/**
 * The emblem's layers. With `reflection` it is the copy that lies on the water:
 * still, unnamed, and without the sun (only its foot shows there).
 */
export function EmblemArt({ drive, reflection }: { drive?: Drive; reflection?: boolean }) {
  const back = LEAVES.filter((leaf) => !leaf.front);
  const front = LEAVES.filter((leaf) => leaf.front);
  const prefix = reflection ? "mirror" : "emblem";

  const leaf = (spec: LeafSpec, order: number) => (
    <span
      key={spec.id}
      className={cn("emblem-leaf", spec.turn > 0 && "emblem-leaf--right")}
      style={leafStyle(spec, order)}
    >
      <motion.span
        className="emblem-leaf__part"
        style={drive ? { rotate: spec.turn < 0 ? drive.spreadLeft : drive.spreadRight, originX: 0.5, originY: 1 } : undefined}
      >
        <span className="emblem-leaf__part emblem-leaf__grow">
          <span className="emblem-leaf__part emblem-leaf__sway">
            <LeafArt id={`${prefix}-${spec.id}`} />
          </span>
        </span>
      </motion.span>
    </span>
  );

  return (
    <div className="emblem" data-still={drive ? undefined : ""}>
      {/* the lotus */}
      <motion.div aria-hidden className="emblem-layer" style={drive?.petals}>
        <div className="emblem-bloom" style={delay(0.2)}>
          <div className="emblem-ring">
            <div className="emblem-ring__hue">
              <i className="emblem-ring__gleam" />
              <i className="emblem-ring__disc" />
              <i className="emblem-ring__glow" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* the sun behind her head */}
      {!reflection ? (
        <motion.div aria-hidden className="emblem-layer" style={drive?.halo}>
          <div className="emblem-halo" style={delay(0.55)}>
            <motion.i className="emblem-halo__glow" style={drive?.glow} />
            <motion.i className="emblem-halo__sun" style={drive?.sun} />
          </div>
        </motion.div>
      ) : null}

      {/* the leaves, two behind and two in front */}
      <motion.div aria-hidden className="emblem-layer" style={drive?.leavesBack}>
        {back.map((spec, index) => leaf(spec, index))}
      </motion.div>
      <motion.div aria-hidden className="emblem-layer" style={drive?.leavesFront}>
        {front.map((spec, index) => leaf(spec, back.length + index))}
      </motion.div>

      {/* the figure */}
      <motion.div className="emblem-layer" style={drive?.figure}>
        <div className="emblem-figure">
          <div className="hero-figure__in relative size-full" style={delay(0.4)}>
            <Image
              src={cutouts.figure.src}
              alt={reflection ? "" : cutouts.figure.alt}
              fill
              preload={!reflection}
              loading={reflection ? "eager" : undefined}
              quality={90}
              sizes="(min-width: 1024px) 32vh, 27vh"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------- leaf */

// Drawn on a 240 x 400 sheet, growing from the middle of the bottom edge to its tip at the top.
const LEAF_BLADE = "M120 400C40 384 2 262 26 160C44 86 92 30 120 0C148 30 196 86 214 160C238 262 200 384 120 400Z";
const LEAF_LIGHT_HALF = "M120 400C40 384 2 262 26 160C44 86 92 30 120 0C114 130 114 270 120 400Z";
const LEAF_RIB = "M120 400C114 270 114 130 120 14";
const LEAF_VEINS =
  "M119 332Q84 318 44 258M121 318Q156 304 196 246M119 262Q80 240 44 178M121 248Q160 226 196 166" +
  "M119 190Q88 164 58 108M121 176Q152 150 182 96M119 122Q98 94 84 52M121 108Q142 80 156 40";

/** One leaf. `id` must be unique on the page: it names the leaf's gradients. */
export function LeafArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 240 400" focusable="false">
      <defs>
        <linearGradient id={`${id}-blade`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#1f8405" />
          <stop offset="0.4" stopColor="#3fae07" />
          <stop offset="1" stopColor="#6cdb0e" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8ee3c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a8ee3c" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-edge`}>
          <path d={LEAF_BLADE} />
        </clipPath>
      </defs>
      <path fill={`url(#${id}-blade)`} d={LEAF_BLADE} />
      <path fill={`url(#${id}-light)`} d={LEAF_LIGHT_HALF} />
      <g clipPath={`url(#${id}-edge)`} fill="none" strokeLinecap="round">
        <path stroke="#1f7d08" strokeOpacity="0.7" strokeWidth="3" d={LEAF_VEINS} />
        <path stroke="#1a7208" strokeOpacity="0.85" strokeWidth="4.4" d={LEAF_RIB} />
      </g>
    </svg>
  );
}
