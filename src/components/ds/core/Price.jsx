'use client'
import React from "react";

const sizes = { sm: "text-[13px]", md: "text-[15px]", lg: "text-[19px]" };
const fmt = (n) => "$" + Number(n).toFixed(Number(n) % 1 === 0 ? 0 : 2);

export function Price({ price, compareAt, size = "md", className = "" }) {
  const onSale = compareAt != null && compareAt > price;
  return (
    <span className={["font-body inline-flex items-baseline gap-2", sizes[size], className].join(" ")}>
      <span className={onSale ? "text-terracotta-700 font-bold" : "text-ink-900 font-semibold"}>{fmt(price)}</span>
      {onSale ? <span className="text-ink-500 line-through font-normal">{fmt(compareAt)}</span> : null}
    </span>
  );
}
