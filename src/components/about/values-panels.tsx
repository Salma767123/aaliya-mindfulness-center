"use client";

import { useState } from "react";
import type { Value } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * The five values as panels that open sideways. Pointing at, focusing or
 * tapping a panel gives it the room; the others fold to a spine.
 * Below the large breakpoint they stack and all stay open.
 */
export function ValuesPanels({ values }: { values: Value[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col border-t border-white/16 lg:h-[30rem] lg:flex-row lg:border-l lg:border-t-0">
      {values.map((value, index) => {
        const open = index === active;
        return (
          <button
            key={value.title}
            type="button"
            aria-pressed={open}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            className={cn(
              "group relative overflow-hidden border-b border-white/16 text-left transition-[flex-grow,background-color] duration-[900ms] ease-out-expo lg:basis-0 lg:border-b-0 lg:border-r",
              open ? "lg:grow-[3.4] lg:bg-white/[0.06]" : "lg:grow lg:bg-transparent",
            )}
          >
            <span className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <span className="eyebrow tabular-nums text-leaf">0{index + 1}</span>

              {/* spine title, large screens, while folded */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-8 left-1/2 hidden origin-bottom-left -rotate-90 whitespace-nowrap font-display text-[2rem] leading-none text-white/75 transition-opacity duration-500 lg:block",
                  open ? "opacity-0" : "opacity-100 delay-200",
                )}
              >
                {value.title}
              </span>

              <span
                className={cn(
                  "block transition-[opacity,translate] duration-700 ease-out-expo",
                  open ? "lg:translate-y-0 lg:opacity-100 lg:delay-200" : "lg:translate-y-4 lg:opacity-0",
                )}
              >
                <span className="block font-display text-[clamp(2.4rem,4.4vw,4.2rem)] leading-none text-white">
                  {value.title}
                </span>
                <span className="mt-4 block max-w-sm text-[1.05rem] leading-relaxed text-emerald-50/80 lg:w-[22rem]">
                  {value.description}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
