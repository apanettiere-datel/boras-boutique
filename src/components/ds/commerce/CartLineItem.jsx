'use client'
import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Price } from "../core/Price.jsx";
import { QuantityStepper } from "../forms/QuantityStepper.jsx";
import { Icon } from "../core/Icon.jsx";

export function CartLineItem({ line, onQty, onRemove, maxQty, className = "" }) {
  const { title, vendor, price, compareAt, image, color, size, qty } = line;
  return (
    <div className={["flex gap-4 py-5", className].join(" ")}>
      <div className="h-[104px] w-[78px] shrink-0 overflow-hidden rounded-md bg-blush-200">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Eyebrow>{vendor}</Eyebrow>
        <h4 className="font-display text-[17px] font-medium leading-snug text-ink-900 truncate">{title}</h4>
        <p className="font-body text-[12.5px] text-ink-500">{[color, size].filter(Boolean).join(" · ")}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <QuantityStepper size="sm" value={qty} max={maxQty} onChange={(n) => onQty && onQty(line, n)} />
          <Price price={price * qty} compareAt={compareAt ? compareAt * qty : undefined} size="sm" />
        </div>
      </div>
      <button type="button" aria-label="Remove" onClick={() => onRemove && onRemove(line)}
        className="h-7 shrink-0 self-start text-ink-300 transition-colors duration-150 hover:text-terracotta-700 cursor-pointer"><Icon name="close" size={15} /></button>
    </div>
  );
}
