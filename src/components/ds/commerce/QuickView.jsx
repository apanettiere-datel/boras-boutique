'use client'
import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Price } from "../core/Price.jsx";
import { Button } from "../core/Button.jsx";
import { SizePicker } from "../forms/SizePicker.jsx";
import { SwatchPicker } from "../forms/SwatchPicker.jsx";
import { QuantityStepper } from "../forms/QuantityStepper.jsx";

export function QuickView({ product, onAddToCart, className = "" }) {
  const { title, vendor, price, compareAt, image, blurb, colors = [], sizes = [] } = product;
  const [color, setColor] = React.useState(colors[0] ? colors[0].name : null);
  const [size, setSize] = React.useState(null);
  const [qty, setQty] = React.useState(1);
  const active = colors.find((c) => c.name === color);
  return (
    <div className={["grid gap-0 sm:grid-cols-2", className].join(" ")}>
      <div className="bg-blush-200" style={{ aspectRatio: "3 / 4" }}>
        <img src={(active && active.image) || image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>{vendor}</Eyebrow>
          <h2 className="font-display text-[30px] font-medium leading-tight text-ink-900">{title}</h2>
          <Price price={price} compareAt={compareAt} size="lg" />
        </div>
        {blurb ? <p className="font-body text-[14px] leading-[1.65] text-ink-700">{blurb}</p> : null}
        {colors.length ? <SwatchPicker showLabel colors={colors} value={color} onChange={setColor} /> : null}
        {sizes.length ? (
          <div className="flex flex-col gap-2">
            <p className="font-body font-bold uppercase text-[11px] tracking-eyebrow text-ink-500">Size</p>
            <SizePicker sizes={sizes} value={size} onChange={setSize} />
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
          <Button variant="primary" className="flex-1" onClick={() => onAddToCart && onAddToCart({ product, color, size, qty })}>Add to bag</Button>
        </div>
        <a href="#" className="font-body text-[13px] text-rose-600 underline underline-offset-4 decoration-rose-300 hover:text-rose-800">View full details</a>
      </div>
    </div>
  );
}
