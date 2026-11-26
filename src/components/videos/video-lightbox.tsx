"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import type { Video } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { CloseIcon } from "@/components/ui/icons";

const noopSubscribe = () => () => {};

type VideoLightboxProps = {
  /** The video to show, or null when closed. */
  video: Video | null;
  onClose: () => void;
};

/**
 * Full-screen player. Plays the linked YouTube video (privacy-enhanced embed);
 * entries without a `youtubeId` show their poster and say that no video is
 * linked yet, so sample entries never pretend to play.
 */
export function VideoLightbox({ video, onClose }: VideoLightboxProps) {
  const lenis = useLenis();
  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Close if the page is hidden or left while the player is open (routes are preserved, not unmounted).
  useLayoutEffect(() => () => onCloseRef.current(), []);

  useEffect(() => {
    if (!video) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      lenis?.start();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      opener?.focus({ preventScroll: true });
    };
  }, [video, lenis]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {video ? (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          data-lenis-prevent
          className="fixed inset-0 z-[120] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <button
            type="button"
            aria-label="Close video"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-emerald-950/90 backdrop-blur-md"
          />

          <motion.div
            className="relative w-full max-w-5xl"
            initial={{ y: 48, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.98 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]">
              {video.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                />
              ) : (
                <>
                  <Image src={video.poster.src} alt="" fill sizes="(min-width: 1100px) 1024px, 100vw" className="object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-emerald-950/72 p-6 text-center">
                    <div className="max-w-md">
                      <span aria-hidden className="mx-auto block size-4 shape-leaf bg-leaf" />
                      <p className="mt-5 font-display text-3xl leading-tight text-white sm:text-4xl">
                        This video has not been linked yet.
                      </p>
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-emerald-100/80">
                        This is a sample entry. Once a YouTube video is added from the admin panel, it will play
                        here.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex items-start justify-between gap-6 text-white">
              <div>
                <p className="eyebrow text-emerald-200">
                  {video.category} · {video.duration}
                </p>
                <p className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{video.title}</p>
              </div>
              <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                className="group flex flex-none items-center gap-3 rounded-full border border-white/25 py-2 pl-5 pr-2 text-sm transition-colors duration-300 hover:border-white hover:bg-white hover:text-emerald-900"
              >
                Close
                <span className="grid size-9 place-items-center rounded-full bg-white/12 transition-colors duration-300 group-hover:bg-emerald-900/10">
                  <CloseIcon className="size-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
