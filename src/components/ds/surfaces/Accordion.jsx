'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Accordion({ items = [], defaultOpen = null, className = "" }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={["divide-y divide-line-soft border-y border-line-soft", className].join(" ")}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.title}>
            <button type="button" onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer group">
              <span className="font-body text-[14px] font-bold uppercase tracking-eyebrow text-ink-900 group-hover:text-rose-600 transition-colors duration-150">{it.title}</span>
              <span className={["text-ink-500 transition-transform duration-200 ease-boutique", isOpen ? "rotate-180" : ""].join(" ")}><Icon name="chevronDown" size={18} /></span>
            </button>
            <div className="grid transition-all duration-300 ease-boutique" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <div className="pb-5 font-body text-[14px] leading-[1.7] text-ink-700">{it.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
