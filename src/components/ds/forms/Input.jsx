'use client'
import React from "react";

export function Input({ label, hint, error, id, prefix, suffix, className = "", ...rest }) {
  const fid = id || "in-" + (label || "field").toLowerCase().replace(/\W+/g, "-");
  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      {label ? <label htmlFor={fid} className="font-body font-bold uppercase text-[11px] tracking-eyebrow text-ink-500">{label}</label> : null}
      <div className={["flex items-center gap-2 rounded-md border bg-cream-50 px-4 transition-colors duration-150",
        error ? "border-terracotta-500" : "border-line-medium focus-within:border-rose-500 focus-within:ring-[3px] focus-within:ring-rose-500/25"].join(" ")}>
        {prefix ? <span className="text-ink-300 text-sm">{prefix}</span> : null}
        <input id={fid} className="flex-1 bg-transparent py-3 font-body text-[15px] text-ink-900 placeholder:text-ink-300 outline-none" {...rest} />
        {suffix ? <span className="text-ink-300 text-sm">{suffix}</span> : null}
      </div>
      {error ? <p className="font-body text-[12px] text-terracotta-700">{error}</p>
        : hint ? <p className="font-body text-[12px] text-ink-500">{hint}</p> : null}
    </div>
  );
}
