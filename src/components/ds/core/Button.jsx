'use client'
import React from "react";
import { Icon } from "./Icon.jsx";

const variants = {
  primary: "bg-rose-500 text-blush-50 border border-rose-500 hover:bg-rose-600 hover:border-rose-600 active:bg-rose-700 shadow-xs",
  secondary: "bg-cream-50 text-ink-900 border border-line-medium hover:bg-cream-100 hover:border-line-strong active:bg-sand-200",
  ghost: "bg-transparent text-ink-900 border border-transparent hover:bg-blush-200 active:bg-blush-300",
  link: "bg-transparent text-rose-600 border-0 px-0 underline underline-offset-4 decoration-rose-300 hover:text-rose-800 hover:decoration-rose-600",
  sage: "bg-sage-500 text-cream-50 border border-sage-500 hover:bg-sage-700 hover:border-sage-700 active:bg-sage-700 shadow-xs",
  inverse: "bg-cream-50 text-rose-700 border border-cream-50 hover:bg-blush-100 active:bg-blush-200"
};

const sizes = {
  sm: "text-[12px] tracking-eyebrow px-4 py-2",
  md: "text-[12.5px] tracking-eyebrow px-6 py-3",
  lg: "text-[13px] tracking-eyebrow px-8 py-4"
};

export function Button({
  variant = "primary", size = "md", icon, iconRight, fullWidth,
  disabled, loading, as = "button", className = "", children, ...rest
}) {
  const Tag = as;
  return (
    <Tag
      disabled={Tag === "button" ? disabled || loading : undefined}
      className={[
        "inline-flex items-center justify-center gap-2 font-body font-semibold uppercase",
        "rounded-full transition-all duration-150 ease-boutique select-none",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-rose-500/30",
        variants[variant], variant === "link" ? "" : sizes[size],
        fullWidth ? "w-full" : "",
        disabled || loading ? "opacity-45 pointer-events-none" : "cursor-pointer",
        className
      ].join(" ")}
      {...rest}
    >
      {loading ? <Icon name="leaf" size={15} className="animate-pulse" /> : icon ? <Icon name={icon} size={15} /> : null}
      <span>{children}</span>
      {iconRight ? <Icon name={iconRight} size={15} /> : null}
    </Tag>
  );
}
