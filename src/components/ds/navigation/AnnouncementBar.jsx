'use client'
import React from "react";

export function AnnouncementBar({ messages = [], interval = 4500, tone = "rose", className = "" }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), interval);
    return () => clearInterval(t);
  }, [messages.length, interval]);
  const bg = tone === "sage" ? "bg-sage-500 text-cream-50" : tone === "terracotta" ? "bg-terracotta-500 text-cream-50" : "bg-rose-500 text-blush-50";
  return (
    <div className={["flex h-9 items-center justify-center overflow-hidden px-4", bg, className].join(" ")}>
      <p key={i} className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-center animate-[fadeIn_400ms_ease-out]">{messages[i]}</p>
      <style>{"@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"}</style>
    </div>
  );
}
