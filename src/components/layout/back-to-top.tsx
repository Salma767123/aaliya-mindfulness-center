"use client";

import { useLenis } from "lenis/react";
import { ArrowDown } from "@/components/ui/icons";

export function BackToTop() {
  const lenis = useLenis();

  function handleClick() {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0 });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="tap group inline-flex flex-none items-center gap-3 whitespace-nowrap text-[0.82rem] text-emerald-200/80 transition-colors duration-300 hover:text-white"
    >
      Back to top
      <span className="grid size-9 place-items-center rounded-full border border-white/20 transition-colors duration-300 group-hover:border-white/60">
        <ArrowDown className="size-4 rotate-180 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
      </span>
    </button>
  );
}
