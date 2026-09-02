'use client'
import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Icon } from "../core/Icon.jsx";

export function CollectionTile({ title, eyebrow, image, href = "#", ratio = "4 / 5", size = "md", className = "" }) {
  const titleSize = size === "lg" ? "text-[38px]" : size === "sm" ? "text-[22px]" : "text-[28px]";
  return (
    <a href={href} className={["group relative block overflow-hidden rounded-lg bg-blush-200", className].join(" ")} style={{ aspectRatio: ratio }}>
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-boutique group-hover:scale-[1.05]" />
      <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(58,46,43,0) 38%, rgba(58,46,43,0.55) 100%)" }} />
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
        {eyebrow ? <Eyebrow tone="inverse">{eyebrow}</Eyebrow> : null}
        <span className={["font-display font-medium leading-tight text-cream-50", titleSize].join(" ")}>{title}</span>
        <span className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-eyebrow text-cream-50 opacity-80 transition-all duration-200 group-hover:gap-3 group-hover:opacity-100">
          Shop now <Icon name="arrowRight" size={14} />
        </span>
      </span>
    </a>
  );
}
