'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Checkbox({ label, count, checked, onChange, disabled, className = "" }) {
  return (
    <label className={["group flex items-center gap-3 cursor-pointer select-none py-1.5",
      disabled ? "opacity-40 pointer-events-none" : "", className].join(" ")}>
      <input type="checkbox" checked={!!checked} onChange={onChange} className="sr-only peer" />
      <span className={["flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150",
        checked ? "border-rose-500 bg-rose-500 text-blush-50" : "border-line-strong bg-cream-50 group-hover:border-rose-400"].join(" ")}>
        {checked ? <Icon name="check" size={12} strokeWidth={2.6} /> : null}
      </span>
      <span className="font-body text-[14px] text-ink-700 flex-1">{label}</span>
      {count != null ? <span className="font-body text-[12px] text-ink-300">{count}</span> : null}
    </label>
  );
}
