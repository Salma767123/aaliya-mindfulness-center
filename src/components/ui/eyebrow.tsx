import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: ReactNode;
  /** Section number shown before the label, e.g. "02". */
  index?: string;
  className?: string;
  tone?: "dark" | "light";
};

/** Small uppercase label that opens a section, led by the leaf from the logo. */
export function Eyebrow({ children, index, className, tone = "dark" }: EyebrowProps) {
  return (
    <p
      className={cn(
        "eyebrow flex items-center gap-3",
        tone === "dark" ? "text-emerald-700" : "text-emerald-200",
        className,
      )}
    >
      <span aria-hidden className={cn("size-2.5 shape-leaf", tone === "dark" ? "bg-emerald-600" : "bg-leaf")} />
      {index ? <span className="tabular-nums opacity-60">{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}
