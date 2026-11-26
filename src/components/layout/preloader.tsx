import Image from "next/image";

/**
 * First-visit intro: the logo settles on white while two rings spread like
 * ripples, then the panel lifts and an emerald veil follows it away.
 * Driven entirely by CSS (see .preloader in globals.css). It is only shown when
 * the inline script in the layout sets html[data-intro="play"], which happens
 * once per browser session and never for visitors who prefer reduced motion.
 */
export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader__veil" />
      <div className="preloader__panel">
        <div className="relative">
          <span className="preloader__ring" />
          <span className="preloader__ring" />
          <Image
            src="/brand/aaliya-logo.png"
            alt=""
            width={386}
            height={417}
            sizes="200px"
            loading="eager"
            className="preloader__logo h-auto w-[10.5rem] sm:w-[12.5rem]"
          />
        </div>
        <span className="preloader__bar" />
      </div>
    </div>
  );
}
