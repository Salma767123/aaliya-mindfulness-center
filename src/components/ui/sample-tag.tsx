import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type SampleTagProps = {
  /** What the mark says. Defaults to "Sample". */
  label?: string;
  className?: string;
  tone?: "dark" | "light";
};

/**
 * Marks stand-in content while the site is in preview mode (site.preview).
 * Renders nothing once preview mode is switched off.
 */
export function SampleTag({ label = "Sample", className, tone = "dark" }: SampleTagProps) {
  if (!site.preview) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em]",
        tone === "dark"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-white/12 text-emerald-100 ring-1 ring-inset ring-white/20 backdrop-blur",
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-current" />
      {label}
    </span>
  );
}
