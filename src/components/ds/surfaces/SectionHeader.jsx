'use client'
import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Button } from "../core/Button.jsx";

export function SectionHeader({ eyebrow, title, blurb, action, actionHref = "#", align = "left", className = "" }) {
  const centered = align === "center";
  return (
    <div className={["flex gap-6 mb-8", centered ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-end sm:justify-between", className].join(" ")}>
      <div className={centered ? "max-w-[560px] flex flex-col items-center gap-3" : "flex flex-col gap-2.5"}>
        {eyebrow ? <Eyebrow tone="rose">{eyebrow}</Eyebrow> : null}
        <h2 className="font-display text-ink-900 leading-[1.08] tracking-[-0.015em]" style={{ fontSize: "var(--display-md)", fontWeight: 500 }}>{title}</h2>
        {blurb ? <p className="font-body text-[15px] leading-[1.65] text-ink-700 max-w-[52ch]">{blurb}</p> : null}
      </div>
      {action ? <Button as="a" href={actionHref} variant="link" iconRight="arrowRight" className="shrink-0">{action}</Button> : null}
    </div>
  );
}
