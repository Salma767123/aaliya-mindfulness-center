"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { navigation, site } from "@/content/site";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PhoneIcon, PinIcon } from "@/components/ui/icons";
import { LogoInline } from "@/components/ui/logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // The bar stays in view the whole way down the page and back; it turns solid once the page moves.
  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  return (
    <>
      <header
        style={{ viewTransitionName: "site-header" }}
        className="fixed inset-x-0 top-0 z-[90]"
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 border-b border-ink/8 bg-paper/95 backdrop-blur-xl transition-opacity duration-500",
            scrolled && !open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "shell intro-fade flex items-center justify-between transition-[height] duration-500 ease-out-expo",
            scrolled ? "h-[4.5rem]" : "h-[5.5rem] lg:h-24",
          )}
        >
          <Link href="/" aria-label={`${site.name}, home`} onClick={() => setOpen(false)} className="relative z-10">
            <LogoInline />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9 xl:gap-11">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block py-2 text-[0.92rem] font-medium tracking-[0.01em] transition-colors duration-300",
                        active ? "text-emerald-800" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      <span className="roll">
                        <span data-text={item.label}>{item.label}</span>
                      </span>
                      {active ? (
                        <motion.span
                          layoutId="nav-leaf"
                          aria-hidden
                          className="absolute -bottom-0.5 left-1/2 -ml-1 size-2 shape-leaf bg-emerald-600"
                          transition={{ duration: 0.7, ease: EASE_OUT }}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button href="/contact" className="hidden sm:inline-flex" onClick={() => setOpen(false)}>
              Book a consultation
            </Button>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="relative z-10 grid size-12 place-items-center rounded-full bg-emerald-800 text-white transition-colors duration-300 hover:bg-emerald-900 lg:hidden"
            >
              <span aria-hidden className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-out-expo",
                    open && "translate-y-[5.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-out-expo",
                    open && "-translate-y-[5.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} pathname={pathname} onClose={() => setOpen(false)} />
    </>
  );
}

function MobileMenu({ open, pathname, onClose }: { open: boolean; pathname: string; onClose: () => void }) {
  const lenis = useLenis();
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Hold the page still behind the menu, close on Escape, and move focus into it.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus({ preventScroll: true });

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      lenis?.start();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, lenis, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[80] overflow-hidden bg-mist lg:hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: EASE_OUT }}
        >
          {/* still-water rings, bottom right; the sheet cuts off the part that hangs past the corner */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-40 -right-40 size-[30rem]">
              <span className="absolute inset-0 rounded-full border border-emerald-600/15" />
              <span className="absolute inset-16 rounded-full border border-emerald-600/15" />
              <span className="absolute inset-32 rounded-full border border-emerald-600/15" />
            </div>
          </div>

          {/* The list scrolls only if the screen is too short for it, only up and down, and only in the
              room under the header bar, so a link can never slide up behind the logo or the close button. */}
          <div
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 top-[5.5rem] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain"
          >
          <div className="shell relative flex min-h-full flex-col pb-6 pt-2">
            <nav aria-label="Mobile">
              <ul className="border-t border-ink/10">
                {navigation.map((item, index) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href} className="overflow-hidden border-b border-ink/10">
                      <motion.div
                        initial={{ y: "105%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "105%", transition: { duration: 0.3 } }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.18 + index * 0.06 }}
                      >
                        <Link
                          ref={index === 0 ? firstLink : undefined}
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className="flex items-center justify-between py-3.5"
                        >
                          <span
                            className={cn(
                              "display-sm",
                              active ? "text-emerald-700" : "text-ink",
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="eyebrow text-ink-mute">0{index + 1}</span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              className="mt-auto space-y-5 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.55 }}
            >
              <div className="space-y-3 text-[0.95rem] text-ink-soft">
                <a href={site.phone.href} className="flex items-center gap-3">
                  <PhoneIcon className="size-5 text-emerald-700" />
                  {site.phone.display}
                </a>
                <p className="flex items-start gap-3">
                  <PinIcon className="mt-0.5 size-5 flex-none text-emerald-700" />
                  <span>{site.address.lines.slice(1).join(", ")}</span>
                </p>
              </div>
              <Button href="/contact" onClick={onClose} className="w-full justify-between">
                Book a consultation
              </Button>
            </motion.div>
          </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
