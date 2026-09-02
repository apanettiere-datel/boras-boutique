'use client'
import React from "react";
import { IconButton } from "../core/IconButton.jsx";

export function Dialog({ open, onClose, title, size = "md", className = "", children }) {
  React.useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const maxW = { sm: 400, md: 640, lg: 900 }[size];
  return (
    <div className={["absolute inset-0 z-50 flex items-center justify-center p-4", open ? "" : "pointer-events-none"].join(" ")} aria-hidden={!open}>
      <div onClick={onClose} className={["absolute inset-0 bg-ink-900/35 backdrop-blur-[2px] transition-opacity duration-300 ease-boutique", open ? "opacity-100" : "opacity-0"].join(" ")} />
      <div role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: maxW }}
        className={["relative w-full max-h-full overflow-y-auto rounded-xl bg-blush-50 shadow-drawer transition-all duration-300 ease-boutique",
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-[0.985]", className].join(" ")}>
        <div className="absolute right-3 top-3 z-10"><IconButton icon="close" label="Close" onClick={onClose} size="sm" tone="onImage" /></div>
        {title ? <h2 className="sr-only">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
