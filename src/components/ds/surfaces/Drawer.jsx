'use client'
import React from "react";
import { IconButton } from "../core/IconButton.jsx";

export function Drawer({ open, onClose, title, side = "right", width = 420, footer, className = "", children }) {
  React.useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className={["absolute inset-0 z-50", open ? "" : "pointer-events-none"].join(" ")} aria-hidden={!open}>
      <div onClick={onClose}
        className={["absolute inset-0 bg-ink-900/35 backdrop-blur-[2px] transition-opacity duration-300 ease-boutique", open ? "opacity-100" : "opacity-0"].join(" ")} />
      <aside role="dialog" aria-modal="true" aria-label={title}
        style={{ width, maxWidth: "100%", transform: open ? "translateX(0)" : `translateX(${side === "right" ? "" : "-"}102%)` }}
        className={["absolute top-0 bottom-0 flex flex-col bg-blush-50 shadow-drawer transition-transform duration-[420ms]",
          side === "right" ? "right-0" : "left-0", className].join(" ")}
        onTransitionEnd={undefined}>
        <header className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4 shrink-0">
          <h2 className="font-body text-[12px] font-bold uppercase tracking-eyebrow text-ink-900">{title}</h2>
          <IconButton icon="close" label="Close" onClick={onClose} size="sm" />
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="border-t border-line-soft bg-cream-50 px-5 py-5 shrink-0">{footer}</footer> : null}
      </aside>
    </div>
  );
}
