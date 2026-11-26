"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useAnimationFrame, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { LeafArt } from "./hero-emblem";

/* ------------------------------------------------------------------
   The stream: leaves carried slowly across the water in front of her,
   drawn like the leaves of the emblem.

   It is the old exercise of putting each passing thought on a leaf and
   watching it float by. The leaves move on their own, slower on the
   out-breath; they ease away from the pointer, and the stream slows
   while the pointer rests over it. Touch a leaf and the thought it
   carries is named and let go: the leaf slips away downstream and a
   fresh one comes in from the left.

   Positions are worked out each frame and written straight to the
   elements, so nothing here re-renders while it moves.
   ------------------------------------------------------------------ */

type StreamLeaf = {
  /** 0 is far across the water (small, slow); 1 is close (large, quicker). */
  depth: number;
  /** Where along the stream it starts, 0-1. */
  start: number;
  /** Which way it lies, in degrees. */
  turn: number;
  /** The thought it carries. */
  word: string;
  /** Left off the smallest screens, where the stream is short. */
  extra?: boolean;
};

const LEAVES: StreamLeaf[] = [
  { depth: 0.1, start: 0.05, turn: 18, word: "a worry" },
  { depth: 0.92, start: 0.15, turn: -35, word: "a what-if" },
  { depth: 0.42, start: 0.28, turn: 72, word: "a to-do", extra: true },
  { depth: 0.7, start: 0.37, turn: 140, word: "a doubt" },
  { depth: 0.2, start: 0.5, turn: -82, word: "a memory", extra: true },
  { depth: 1, start: 0.63, turn: 24, word: "a plan" },
  { depth: 0.54, start: 0.73, turn: -150, word: "a worry", extra: true },
  { depth: 0.3, start: 0.85, turn: 104, word: "a what-if" },
  { depth: 0.82, start: 0.94, turn: -62, word: "a to-do", extra: true },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
/** How far down the band a leaf of this depth rides, 0-1. */
const lane = (depth: number) => 0.14 + depth * 0.6;

type Drift = { x: number; pushX: number; pushY: number; gone: number | null };

export function Stream({
  air,
  rise,
  still,
}: {
  /** The breath, 0-1: the stream runs a little quicker on the way in. */
  air: MotionValue<number>;
  /** How far the scroll has gone, 0-1: the stream rests once it is out of sight. */
  rise: MotionValue<number>;
  still: boolean;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const drift = useRef<Drift[]>(LEAVES.map((leaf) => ({ x: leaf.start, pushX: 0, pushY: 0, gone: null })));
  const pointer = useRef({ x: 0, y: 0, here: false });
  const pace = useRef(1);
  const clock = useRef(0);

  useEffect(() => {
    if (still) return;
    function handleMove(event: PointerEvent) {
      pointer.current = { x: event.clientX, y: event.clientY, here: event.pointerType === "mouse" };
    }
    function handleLeave() {
      pointer.current.here = false;
    }
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [still]);

  useAnimationFrame((time, delta) => {
    clock.current = time;
    const band = bandRef.current;
    if (still || !band || rise.get() > 0.5) return;

    const rect = band.getBoundingClientRect();
    if (rect.bottom < 0 || rect.width === 0) return;
    const seconds = Math.min(delta, 60) / 1000;
    const local = { x: pointer.current.x - rect.left, y: pointer.current.y - rect.top };
    const over = pointer.current.here && local.y > -24 && local.y < rect.height + 28;

    // the stream slows while the pointer rests over it, so a leaf is easy to touch
    pace.current += ((over ? 0.36 : 1) - pace.current) * Math.min(1, seconds * 3.5);
    const flow = (0.84 + 0.34 * air.get()) * pace.current * Math.max(0.62, rect.width / 1440);

    LEAVES.forEach((leaf, index) => {
      const element = items.current[index];
      if (!element) return;
      const state = drift.current[index];
      const letGo = state.gone === null ? 0 : (time - state.gone) / 1000;

      const speed = (15 + leaf.depth * 26) * (state.gone === null ? flow : 1.2 + letGo * 1.5);
      state.x += (speed * seconds) / rect.width;
      if (state.x > 1.09) {
        // a fresh leaf comes in from the left
        state.x = -0.09;
        state.pushX = 0;
        state.pushY = 0;
        if (state.gone !== null) {
          state.gone = null;
          element.removeAttribute("data-let-go");
        }
      }

      const baseX = state.x * rect.width;
      const baseY = lane(leaf.depth) * rect.height;

      // ease away from the pointer, then settle back
      const awayX = baseX + state.pushX - local.x;
      const awayY = baseY + state.pushY - local.y;
      const distance = Math.hypot(awayX, awayY);
      if (pointer.current.here && state.gone === null && distance > 0.5 && distance < 84) {
        const force = (84 - distance) / 84;
        state.pushX += (awayX / distance) * force * 70 * seconds;
        state.pushY += (awayY / distance) * force * 34 * seconds;
      }
      state.pushX *= 1 - Math.min(1, seconds * 1.5);
      state.pushY *= 1 - Math.min(1, seconds * 2.1);

      const bob = Math.sin(time * 0.0011 + index * 1.9) * 2.4;
      const spin = leaf.turn + Math.sin(time * 0.0005 + index * 2.3) * 9 + letGo * 40;
      const ends = clamp((state.x + 0.07) / 0.09) * clamp((1.07 - state.x) / 0.09);
      const opacity = state.gone === null ? ends : ends * clamp(1 - (letGo - 1.1) / 1.7);
      if (state.gone !== null && letGo > 2.9) state.x = 1.1;

      element.style.transform = `translate3d(${(baseX + state.pushX).toFixed(1)}px, ${(baseY + state.pushY + bob).toFixed(1)}px, 0) translate(-50%, -50%)`;
      element.style.opacity = opacity.toFixed(3);
      element.style.setProperty("--spin", `${spin.toFixed(1)}deg`);
      element.style.setProperty("--shrink", (1 - 0.4 * clamp(letGo / 2.6)).toFixed(3));
    });
  });

  function letGo(index: number) {
    if (still) return;
    const state = drift.current[index];
    if (state.gone !== null) return;
    state.gone = clock.current;
    items.current[index]?.setAttribute("data-let-go", "");
  }

  return (
    <div ref={bandRef} className="hero-stream" aria-hidden>
      {LEAVES.map((leaf, index) => (
        <button
          key={index}
          ref={(element) => {
            items.current[index] = element;
          }}
          type="button"
          tabIndex={-1}
          onPointerDown={() => letGo(index)}
          className={cn("hero-leaf", leaf.extra && "hidden sm:block")}
          style={
            {
              zIndex: Math.round(leaf.depth * 10),
              width: `clamp(${(14 + leaf.depth * 16).toFixed(0)}px, calc(${(1.3 + leaf.depth * 2.2).toFixed(2)} * var(--w)), ${(22 + leaf.depth * 28).toFixed(0)}px)`,
              // where it rests if nothing moves (reduced motion), and before the first frame
              transform: `translate3d(calc(${(leaf.start * 100).toFixed(1)}vw), calc(${lane(leaf.depth).toFixed(3)} * var(--band)), 0) translate(-50%, -50%)`,
              "--spin": `${leaf.turn}deg`,
            } as CSSProperties
          }
        >
          <span className="hero-leaf__shade" />
          <span className={cn("hero-leaf__body", leaf.depth < 0.35 && "blur-[0.5px]")}>
            <LeafArt id={`stream-${index}`} />
          </span>
          <span className="hero-leaf__word hero-type text-[1.2rem] font-semibold text-emerald-900 lg:text-[1.4rem]">
            {leaf.word}
          </span>
        </button>
      ))}
    </div>
  );
}
