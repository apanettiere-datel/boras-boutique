'use client'
import React from "react";
import { Icon } from "./Icon.jsx";

export function BotanicalDivider({ glyph = "leaf", tone = "rose", className = "" }) {
  const color = tone === "sage" ? "text-sage-500" : tone === "sand" ? "text-sand-400" : "text-rose-300";
  return (
    <div role="presentation" className={["flex items-center gap-4 w-full", color, className].join(" ")}>
      <span className="h-px flex-1 bg-current opacity-45" />
      <Icon name={glyph} size={16} strokeWidth={1.3} />
      <span className="h-px w-10 bg-current opacity-45" />
      <Icon name={glyph} size={22} strokeWidth={1.3} />
      <span className="h-px w-10 bg-current opacity-45" />
      <Icon name={glyph} size={16} strokeWidth={1.3} />
      <span className="h-px flex-1 bg-current opacity-45" />
    </div>
  );
}
