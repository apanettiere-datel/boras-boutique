'use client'
import React from "react";

const tones = {
  paper: "bg-white border-line-soft",
  cream: "bg-cream-50 border-line-medium",
  blush: "bg-blush-100 border-blush-200",
  sage: "bg-sage-100 border-sage-300"
};
const pads = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ tone = "paper", padding = "md", hoverable, as = "div", className = "", children, ...rest }) {
  const Tag = as;
  return (
    <Tag className={["rounded-lg border transition-all duration-200 ease-boutique", tones[tone], pads[padding],
      hoverable ? "hover:shadow-lift hover:-translate-y-0.5 cursor-pointer" : "", className].join(" ")} {...rest}>
      {children}
    </Tag>
  );
}
