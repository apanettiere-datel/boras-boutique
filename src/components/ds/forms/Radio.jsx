'use client'
import React from "react";

export function Radio({ label, description, name, value, checked, onChange, className = "" }) {
  return (
    <label className={["group flex items-start gap-3 cursor-pointer select-none rounded-md border p-4 transition-all duration-150",
      checked ? "border-rose-500 bg-blush-100" : "border-line-medium bg-cream-50 hover:border-line-strong", className].join(" ")}>
      <input type="radio" name={name} value={value} checked={!!checked} onChange={onChange} className="sr-only" />
      <span className={["mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-150",
        checked ? "border-rose-500" : "border-line-strong group-hover:border-rose-400"].join(" ")}>
        <span className={["h-2.5 w-2.5 rounded-full bg-rose-500 transition-transform duration-150", checked ? "scale-100" : "scale-0"].join(" ")} />
      </span>
      <span className="flex-1">
        <span className="block font-body text-[14px] font-semibold text-ink-900">{label}</span>
        {description ? <span className="block font-body text-[13px] text-ink-500 mt-0.5">{description}</span> : null}
      </span>
    </label>
  );
}
