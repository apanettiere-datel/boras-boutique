'use client'
import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

export function EmptyState({ icon = "bag", title, body, action, onAction, className = "" }) {
  return (
    <div className={["flex flex-col items-center justify-center gap-4 px-8 py-16 text-center", className].join(" ")}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-200 text-rose-500"><Icon name={icon} size={26} strokeWidth={1.3} /></span>
      <h3 className="font-display text-[26px] font-medium leading-tight text-ink-900">{title}</h3>
      {body ? <p className="font-body text-[14px] leading-[1.65] text-ink-500 max-w-[34ch]">{body}</p> : null}
      {action ? <Button variant="primary" onClick={onAction} className="mt-1">{action}</Button> : null}
    </div>
  );
}
