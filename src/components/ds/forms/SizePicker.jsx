'use client'
import React from "react";

export function SizePicker({ sizes = [], value, onChange, className = "" }) {
  return (
    <div className={["flex flex-wrap gap-2", className].join(" ")}>
      {sizes.map((s) => {
        const label = typeof s === "string" ? s : s.label;
        const out = typeof s === "object" && s.soldOut;
        return (
          <button key={label} type="button" disabled={out} onClick={() => onChange && onChange(label)}
            className={["relative min-w-[52px] rounded-md border px-3 py-2.5 font-body text-[13px] font-semibold transition-all duration-150 cursor-pointer",
              out ? "border-line-soft text-ink-300 pointer-events-none overflow-hidden"
                : value === label ? "border-rose-500 bg-rose-500 text-blush-50"
                : "border-line-medium bg-cream-50 text-ink-900 hover:border-ink-900"].join(" ")}>
            {label}
            {out ? <span className="absolute left-0 top-1/2 h-px w-full -rotate-[18deg] bg-line-strong" /> : null}
          </button>
        );
      })}
    </div>
  );
}
