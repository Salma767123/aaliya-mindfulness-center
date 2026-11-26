import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * The supplied logo artwork, used exactly as provided.
 * /public/brand/aaliya-logo.png is the full lockup and aaliya-mark.png the emblem,
 * both cropped from the brochure with the paper background removed. Swap in the
 * original vector or high-resolution files when they are available.
 */
export function LogoLockup({ className, width = 190 }: { className?: string; width?: number }) {
  return (
    <Image
      src="/brand/aaliya-logo.png"
      alt={site.name}
      width={386}
      height={417}
      sizes={`${width}px`}
      className={cn("h-auto", className)}
      style={{ width }}
    />
  );
}

/** Emblem beside the name set in type, for the narrow header bar. */
export function LogoInline({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src="/brand/aaliya-mark.png"
        alt=""
        width={311}
        height={291}
        sizes="56px"
        preload
        className="h-11 w-auto sm:h-12"
      />
      <span className="flex flex-col leading-none">
        <span className="font-wordmark text-[1.55rem] font-medium tracking-[0.16em] text-emerald-800 sm:text-[1.7rem]">
          AALIYA
        </span>
        <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-emerald-700 sm:text-[0.54rem]">
          {site.descriptor}
        </span>
      </span>
    </span>
  );
}
