'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ label, options = [], className = "", id, ...rest }) {
  const fid = id || "sel-" + (label || "field").toLowerCase().replace(/\W+/g, "-");
  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      {label ? <label htmlFor={fid} className="font-body font-bold uppercase text-[11px] tracking-eyebrow text-ink-500">{label}</label> : null}
      <div className="relative">
        <select id={fid} className="w-full appearance-none rounded-md border border-line-medium bg-cream-50 py-3 pl-4 pr-10 font-body text-[15px] text-ink-900 outline-none transition-colors duration-150 focus:border-rose-500 focus:ring-[3px] focus:ring-rose-500/25" {...rest}>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500"><Icon name="chevronDown" size={16} /></span>
      </div>
    </div>
  );
}
