import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid-dark" | "outline-dark" | "outline-light" | "solid-tan";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide transition-colors duration-200";

const variants: Record<Variant, string> = {
  "solid-dark": "bg-ink text-paper hover:bg-ink/80",
  "outline-dark": "border border-ink-on-sand/70 text-ink-on-sand bg-transparent hover:bg-ink-on-sand/5",
  "outline-light": "border border-white/20 text-paper bg-transparent hover:bg-white/10",
  "solid-tan": "bg-tan text-ink-on-sand hover:bg-tan/80",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({
  children,
  variant = "solid-dark",
  className = "",
  href,
  ...props
}: ButtonProps | LinkProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
