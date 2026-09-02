'use client'
import React from "react";

const tones = {
  new: "bg-cream-50 text-ink-900 border-line-medium",
  sale: "bg-terracotta-500 text-cream-50 border-terracotta-500",
  low: "bg-blush-200 text-rose-700 border-blush-300",
  restock: "bg-sage-100 text-sage-700 border-sage-300",
  soldout: "bg-ink-100 text-ink-500 border-ink-100"
};

export function Badge({ tone = "new", className = "", children, ...rest }) {
  return (
    <span className={["inline-block border rounded-full font-body font-bold uppercase",
      "text-[10px] tracking-eyebrow leading-none px-3 py-[7px]", tones[tone], className].join(" ")} {...rest}>
      {children}
    </span>
  );
}
