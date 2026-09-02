'use client'
import React from "react";

export function SwatchPicker({ colors = [], value, onChange, onHover, size = "md", showLabel, className = "" }) {
  const box = size === "sm" ? "h-[18px] w-[18px]" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const active = colors.find((c) => c.name === value);
  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      {showLabel ? (
        <p className="font-body text-[12px] text-ink-500">
          <span className="font-bold uppercase tracking-eyebrow text-[11px] text-ink-500">Color</span>
          {active ? <span className="ml-2 text-ink-900">{active.name}</span> : null}
        </p>
      ) : null}
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((c) => (
          <button key={c.name} type="button" title={c.name} aria-label={c.name}
            onClick={() => onChange && onChange(c.name)}
            onMouseEnter={() => onHover && onHover(c.name)}
            className={["rounded-full transition-all duration-150 cursor-pointer p-[2px] border",
              value === c.name ? "border-ink-900" : "border-transparent hover:border-line-strong"].join(" ")}>
            <span className={["block rounded-full border border-black/10", box].join(" ")} style={{ background: c.hex }} />
          </button>
        ))}
      </div>
    </div>
  );
}
