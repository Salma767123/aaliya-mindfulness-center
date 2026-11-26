import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page so route changes animate: the old page lifts away and the new
 * one rises in (see ::view-transition-*(.page) in globals.css).
 * It has to sit in each page, not the layout, because layouts persist across
 * navigations and would never enter or exit.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <main id="main" className="relative">
        {children}
      </main>
    </ViewTransition>
  );
}
