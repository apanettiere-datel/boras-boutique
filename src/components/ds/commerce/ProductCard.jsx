'use client'
import React from "react";
import Link from "next/link";
import { Badge } from "../core/Badge.jsx";
import { Price } from "../core/Price.jsx";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Button } from "../core/Button.jsx";
import { IconButton } from "../core/IconButton.jsx";
import { SwatchPicker } from "../forms/SwatchPicker.jsx";
import { useSaved } from "@/lib/saved";
import { stockOf } from "@/lib/variants";

export function ProductCard({ product, onQuickView, onAddToCart, className = "" }) {
  const { title, vendor, price, compareAt, badge, badgeTone, image, hoverImage, colors = [], sizes = [], soldOut, handle } = product;
  // A sized piece can't go in the bag from the card: the shopper has to pick a
  // size first, in Quick View when the page offers it, else on the product page.
  const needsSize = sizes.length > 0;
  const href = handle ? `/product/${handle}` : "#";
  const [hover, setHover] = React.useState(false);
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(handle);
  const [swatch, setSwatch] = React.useState(colors[0] ? colors[0].name : null);
  const active = colors.find((c) => c.name === swatch);
  // One-size pieces add the chosen color straight from the card, so check it
  const swatchSoldOut = !needsSize && stockOf(product, "", swatch || "") === 0;
  const base = (active && active.image) || image;
  const second = hoverImage || (colors[1] && colors[1].image) || image;

  return (
    <article className={["group flex flex-col gap-3", className].join(" ")}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative overflow-hidden rounded-lg bg-blush-200" style={{ aspectRatio: "3 / 4" }}>
        <img src={base} alt={title} loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[600ms] ease-boutique"
          style={{ opacity: hover ? 0 : 1, transform: hover ? "scale(1.04)" : "scale(1)" }} />
        <img src={second} alt="" aria-hidden="true" loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[600ms] ease-boutique"
          style={{ opacity: hover ? 1 : 0, transform: hover ? "scale(1)" : "scale(1.04)" }} />
        {badge ? <span className="absolute left-3 top-3"><Badge tone={badgeTone || "new"}>{badge}</Badge></span> : null}
        <span className={["absolute right-3 top-3 transition-opacity duration-200 group-hover:opacity-100", saved ? "opacity-100" : "opacity-0"].join(" ")}>
          <IconButton
            icon="heart"
            label={saved ? "Remove from saved" : "Save for later"}
            tone="onImage"
            size="sm"
            className={saved ? "text-rose-600" : ""}
            onClick={() => toggleSaved(handle)}
          />
        </span>
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-2 opacity-0 transition-all duration-200 ease-boutique group-hover:translate-y-0 group-hover:opacity-100">
          {soldOut ? (
            <Button variant="secondary" size="sm" fullWidth disabled>Sold out</Button>
          ) : needsSize ? (
            onQuickView ? (
              <Button variant="primary" size="sm" fullWidth onClick={() => onQuickView(product)}>Choose size</Button>
            ) : (
              <Button variant="primary" size="sm" fullWidth as={Link} href={href}>Choose size</Button>
            )
          ) : (
            <>
              {onQuickView ? <Button variant="secondary" size="sm" className="flex-1" onClick={() => onQuickView(product)}>Quick view</Button> : null}
              <Button variant="primary" size="sm" className="flex-1" disabled={swatchSoldOut} onClick={() => onAddToCart && onAddToCart(product, swatch)}>{swatchSoldOut ? "Sold out" : "Add"}</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Eyebrow>{vendor}</Eyebrow>
        <h3 className="font-display text-[19px] font-medium leading-snug text-ink-900">
          <Link href={href} className="transition-colors duration-150 hover:text-rose-600">{title}</Link>
        </h3>
        <Price price={price} compareAt={compareAt} size="sm" />
        {colors.length > 1 ? <SwatchPicker className="mt-1" size="sm" colors={colors} value={swatch} onChange={setSwatch} onHover={setSwatch} /> : null}
      </div>
    </article>
  );
}
