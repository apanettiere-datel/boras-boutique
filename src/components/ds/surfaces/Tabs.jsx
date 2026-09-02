'use client'
import React from "react";

export function Tabs({ tabs = [], value, onChange, className = "" }) {
  return (
    <div className={["flex gap-6 border-b border-line-soft overflow-x-auto", className].join(" ")}>
      {tabs.map((t) => {
        const v = typeof t === "string" ? t : t.value;
        const l = typeof t === "string" ? t : t.label;
        const active = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange && onChange(v)}
            className={["relative shrink-0 pb-3 font-body text-[12px] font-bold uppercase tracking-eyebrow transition-colors duration-150 cursor-pointer",
              active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"].join(" ")}>
            {l}
            <span className={["absolute -bottom-px left-0 h-[2px] w-full bg-rose-500 transition-transform duration-200 ease-boutique origin-left", active ? "scale-x-100" : "scale-x-0"].join(" ")} />
          </button>
        );
      })}
    </div>
  );
}
