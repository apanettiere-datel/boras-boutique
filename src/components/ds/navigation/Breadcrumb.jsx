'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Breadcrumb({ items = [], className = "" }) {
  return (
    <nav aria-label="Breadcrumb" className={["flex flex-wrap items-center gap-1.5 font-body text-[12px]", className].join(" ")}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          {i > 0 ? <span className="text-ink-300"><Icon name="chevronRight" size={12} /></span> : null}
          {i === items.length - 1
            ? <span className="text-ink-900">{it.label}</span>
            : <a href={it.href || "#"} className="text-ink-500 transition-colors duration-150 hover:text-rose-600">{it.label}</a>}
        </React.Fragment>
      ))}
    </nav>
  );
}
