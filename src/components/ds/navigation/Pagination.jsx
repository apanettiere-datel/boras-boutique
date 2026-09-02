'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Pagination({ page = 1, pages = 1, onChange, className = "" }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  const btn = "flex h-9 w-9 items-center justify-center rounded-full font-body text-[13px] transition-all duration-150 cursor-pointer";
  return (
    <nav className={["flex items-center justify-center gap-1.5", className].join(" ")} aria-label="Pagination">
      <button type="button" aria-label="Previous" disabled={page <= 1} onClick={() => onChange && onChange(page - 1)}
        className={[btn, "text-ink-700 hover:bg-blush-200 disabled:opacity-30 disabled:pointer-events-none"].join(" ")}><Icon name="chevronLeft" size={16} /></button>
      {nums.map((n) => (
        <button key={n} type="button" onClick={() => onChange && onChange(n)}
          className={[btn, n === page ? "bg-rose-500 text-blush-50 font-bold" : "text-ink-700 hover:bg-blush-200"].join(" ")}>{n}</button>
      ))}
      <button type="button" aria-label="Next" disabled={page >= pages} onClick={() => onChange && onChange(page + 1)}
        className={[btn, "text-ink-700 hover:bg-blush-200 disabled:opacity-30 disabled:pointer-events-none"].join(" ")}><Icon name="chevronRight" size={16} /></button>
    </nav>
  );
}
