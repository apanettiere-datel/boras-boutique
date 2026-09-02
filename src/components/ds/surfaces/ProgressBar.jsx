'use client'
import React from "react";

export function ProgressBar({ value = 0, tone = "rose", label, className = "" }) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = tone === "sage" ? "bg-sage-500" : tone === "terracotta" ? "bg-terracotta-500" : "bg-rose-500";
  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      {label ? <p className="font-body text-[13px] text-ink-700 text-center">{label}</p> : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush-300">
        <div className={["h-full rounded-full transition-[width] duration-500 ease-boutique", fill].join(" ")} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
