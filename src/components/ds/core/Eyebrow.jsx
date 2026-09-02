'use client'
import React from "react";
const tones = { muted: "text-ink-500", rose: "text-rose-600", sage: "text-sage-700", inverse: "text-blush-200" };
export function Eyebrow({ tone = "muted", as = "p", className = "", children, ...rest }) {
  const Tag = as;
  return <Tag className={["font-body font-bold uppercase text-[11px] tracking-eyebrow leading-none", tones[tone], className].join(" ")} {...rest}>{children}</Tag>;
}
