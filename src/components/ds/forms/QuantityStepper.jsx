'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function QuantityStepper({ value = 1, min = 1, max = 99, onChange, size = "md", className = "" }) {
  const h = size === "sm" ? "h-8" : "h-11";
  const btn = "flex items-center justify-center w-9 text-ink-700 transition-colors duration-150 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer";
  return (
    <div className={["inline-flex items-center rounded-full border border-line-medium bg-cream-50", h, className].join(" ")}>
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange && onChange(value - 1)}><Icon name="minus" size={14} /></button>
      <span className="w-7 text-center font-body text-[14px] font-semibold text-ink-900 tabular-nums">{value}</span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange && onChange(value + 1)}><Icon name="plus" size={14} /></button>
    </div>
  );
}
