'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Checkbox } from "../forms/Checkbox.jsx";

export function FilterGroup({ title, options = [], selected = [], onToggle, swatches, defaultOpen = true, className = "" }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={["border-b border-line-soft py-4", className].join(" ")}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 cursor-pointer group">
        <span className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">{title}</span>
        <span className={["text-ink-500 transition-transform duration-200 ease-boutique", open ? "rotate-180" : ""].join(" ")}><Icon name="chevronDown" size={15} /></span>
      </button>
      {open ? (
        <div className={["mt-3", swatches ? "flex flex-wrap gap-2" : "flex flex-col"].join(" ")}>
          {options.map((o) => {
            const label = typeof o === "string" ? o : o.label;
            const on = selected.includes(label);
            if (swatches) return (
              <button key={label} type="button" title={label} aria-label={label} onClick={() => onToggle && onToggle(label)}
                className={["rounded-full border p-[2px] transition-all duration-150 cursor-pointer", on ? "border-ink-900" : "border-transparent hover:border-line-strong"].join(" ")}>
                <span className="block h-6 w-6 rounded-full border border-black/10" style={{ background: o.hex }} />
              </button>
            );
            return <Checkbox key={label} label={label} count={typeof o === "object" ? o.count : undefined} checked={on} onChange={() => onToggle && onToggle(label)} />;
          })}
        </div>
      ) : null}
    </div>
  );
}
