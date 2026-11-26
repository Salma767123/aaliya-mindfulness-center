"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  /** The id a <label htmlFor> points at. */
  id: string;
  name: string;
  /** Read out as the name of the list of choices. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Classes for the closed field, so it lines up with the inputs beside it. */
  className?: string;
};

/**
 * A select whose list is drawn by the site instead of the operating system, so the
 * open menu matches the form around it. It behaves like a native select: arrow keys,
 * Home and End, typing to jump to a choice, Enter or Space to choose, Escape to close.
 * Focus stays on the field while the list is open.
 */
export function SelectField({ id, name, label, value, onChange, options, className }: SelectFieldProps) {
  const listId = `${id}-list`;
  const selected = Math.max(0, options.findIndex((option) => option.value === value));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const typed = useRef({ text: "", at: 0 });

  // Keep the highlighted choice in view when the list is longer than its box.
  useEffect(() => {
    if (open) optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show(at = selected) {
    setActive(at);
    setOpen(true);
  }

  function choose(position: number) {
    onChange(options[position].value);
    setOpen(false);
  }

  /** Typing letters jumps to the next choice that starts with them. */
  function jumpTo(character: string) {
    const now = Date.now();
    const text = now - typed.current.at > 700 ? character : typed.current.text + character;
    typed.current = { text, at: now };
    const from = open ? active : selected;
    // a repeated single letter cycles through the matches; a longer word stays where it fits
    const start = text.length === 1 ? from + 1 : from;
    for (let step = 0; step < options.length; step++) {
      const position = (start + step) % options.length;
      if (options[position].label.toLowerCase().startsWith(text.toLowerCase())) {
        show(position);
        return;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        show(open ? Math.min(last, active + 1) : selected);
        break;
      case "ArrowUp":
        event.preventDefault();
        show(open ? Math.max(0, active - 1) : selected);
        break;
      case "Home":
        event.preventDefault();
        show(0);
        break;
      case "End":
        event.preventDefault();
        show(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) choose(active);
        else show();
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        // like a native select, leaving the field keeps the highlighted choice
        if (open) choose(active);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          jumpTo(event.key);
        }
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
        className={cn("relative cursor-pointer pr-9 text-left", open && "border-emerald-700", className)}
      >
        <span className="block truncate">{options[selected]?.label}</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "absolute right-0.5 top-1.5 size-4 transition-[rotate,color] duration-500 ease-out-expo",
            open ? "rotate-180 text-emerald-700" : "text-ink-mute",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            // pressing a choice must not take focus from the field, or the list would close before the click lands
            onMouseDown={(event) => event.preventDefault()}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-paper p-1.5 shadow-[0_24px_60px_-28px_rgb(5_58_37/0.5)]"
          >
            <ul
              id={listId}
              role="listbox"
              aria-label={label}
              data-lenis-prevent
              className="max-h-[min(21rem,55svh)] overflow-y-auto overscroll-contain"
            >
              {options.map((option, position) => {
                const chosen = position === selected;
                return (
                  <li
                    key={option.value}
                    ref={(element) => {
                      optionRefs.current[position] = element;
                    }}
                    id={`${id}-option-${position}`}
                    role="option"
                    aria-selected={chosen}
                    onPointerMove={() => setActive(position)}
                    onClick={() => choose(position)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 text-[1rem] leading-snug transition-colors duration-200",
                      position === active ? "bg-emerald-50" : "bg-transparent",
                      chosen ? "font-medium text-emerald-800" : "text-ink",
                    )}
                  >
                    <span>{option.label}</span>
                    <CheckIcon
                      className={cn(
                        "size-4 flex-none text-emerald-700 transition-opacity duration-200",
                        chosen ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
