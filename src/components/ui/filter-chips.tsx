"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FilterChipsProps = {
  /** Options after "All". */
  options: string[];
  /** The selected option, or null for "All". */
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  className?: string;
  tone?: "dark" | "light";
};

/** A row of filter pills. The emerald fill glides from the old choice to the new one. */
export function FilterChips({ options, value, onChange, label, className, tone = "dark" }: FilterChipsProps) {
  const id = useId();
  const all: Array<{ key: string | null; text: string }> = [
    { key: null, text: "All" },
    ...options.map((option) => ({ key: option, text: option })),
  ];

  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {all.map((option) => {
        const selected = option.key === value;
        return (
          <button
            key={option.text}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            className={cn(
              "relative min-h-11 rounded-full px-5 py-2.5 text-[0.88rem] font-medium transition-colors duration-500",
              tone === "dark"
                ? selected
                  ? "text-white"
                  : "text-ink-soft ring-1 ring-inset ring-ink/15 hover:text-ink hover:ring-ink/40"
                : selected
                  ? "text-emerald-900"
                  : "text-white/75 ring-1 ring-inset ring-white/25 hover:text-white hover:ring-white/60",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`chip-${id}`}
                aria-hidden
                className={cn("absolute inset-0 rounded-full", tone === "dark" ? "bg-emerald-700" : "bg-white")}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
            ) : null}
            <span className="relative">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
