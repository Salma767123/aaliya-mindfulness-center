import type { MouseEventHandler } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "./icons";

type ButtonProps = {
  children: string;
  /** Internal path, or an external / tel: / mailto: URL. Omit for a real <button>. */
  href?: string;
  variant?: "primary" | "outline" | "light" | "ghost-light";
  /** Show the arrow disc. */
  icon?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  "data-cursor"?: string;
};

const VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "",
  outline: "btn--outline",
  light: "btn--light",
  "ghost-light": "btn--ghost-light",
};

/** Pill button: the label rolls and a fill rises from the base on hover. */
export function Button({
  children,
  href,
  variant = "primary",
  icon = true,
  className,
  type = "button",
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = cn("btn group", VARIANT_CLASS[variant], !icon && "btn--plain", className);
  const inner = (
    <>
      <span className="btn__label">
        <span data-text={children}>{children}</span>
      </span>
      {icon ? (
        <span className="btn__icon" aria-hidden>
          <ArrowUpRight />
          <ArrowUpRight />
        </span>
      ) : null}
    </>
  );

  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={classes} onClick={onClick} {...rest}>
        {inner}
      </Link>
    );
  }

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={cn(classes, "disabled:opacity-60")} disabled={disabled} onClick={onClick} {...rest}>
      {inner}
    </button>
  );
}
