'use client'
import React from "react";

/* No logo file was supplied with the brief. The wordmark is set in the brand
   display face; swap this for an <img src="assets/logo.svg"> when a mark exists. */
export function Logo({ size = "md", tone = "ink", stacked = false, className = "" }) {
  const scale = { sm: 0.72, md: 1, lg: 1.6 }[size];
  const color = tone === "light" ? "text-blush-50" : tone === "rose" ? "text-rose-600" : "text-ink-900";
  return (
    <span className={["inline-flex font-display leading-none select-none", color,
      stacked ? "flex-col items-center gap-1" : "items-baseline gap-2", className].join(" ")}>
      <span style={{ fontSize: 26 * scale, fontStyle: "italic", fontWeight: 500, letterSpacing: "-0.02em" }}>Bora's</span>
      <span style={{ fontSize: 14 * scale, textTransform: "uppercase", letterSpacing: "0.28em", fontWeight: 400 }}>Boutique</span>
    </span>
  );
}
