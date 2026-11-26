"use client";

import type { MouseEvent } from "react";

/**
 * "Skip to content" for keyboard users. Recently visited pages stay mounted
 * but hidden, so more than one <main> can exist at a time; this moves focus to
 * the one that is actually on screen instead of relying on the #main anchor.
 */
export function SkipLink() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const main = Array.from(document.querySelectorAll<HTMLElement>("main")).find(
      (element) => element.getClientRects().length > 0,
    );
    if (!main) return;
    event.preventDefault();
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView();
  }

  return (
    <a
      href="#main"
      onClick={handleClick}
      className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white transition-transform duration-300 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
