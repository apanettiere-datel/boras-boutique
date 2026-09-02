'use client'
import React from "react";
import { Icon } from "./Icon.jsx";

const tones = {
  plain: "text-ink-900 hover:bg-blush-200 active:bg-blush-300",
  outline: "text-ink-900 border border-line-medium bg-cream-50 hover:border-line-strong hover:bg-cream-100",
  filled: "text-blush-50 bg-rose-500 hover:bg-rose-600 active:bg-rose-700",
  onImage: "text-ink-900 bg-white/85 backdrop-blur-sm hover:bg-white shadow-soft"
};
const boxes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };

export function IconButton({ icon, label, tone = "plain", size = "md", badge, className = "", ...rest }) {
  return (
    <button type="button" aria-label={label} title={label}
      className={["relative inline-flex items-center justify-center rounded-full cursor-pointer",
        "transition-all duration-150 ease-boutique focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-rose-500/30",
        tones[tone], boxes[size], className].join(" ")} {...rest}>
      <Icon name={icon} size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
      {badge != null && badge !== 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-blush-50 text-[10px] font-body font-bold leading-[17px] text-center">{badge}</span>
      ) : null}
    </button>
  );
}
