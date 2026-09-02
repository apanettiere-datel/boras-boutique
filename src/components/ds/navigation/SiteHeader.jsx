'use client'
import React from "react";
import { Logo } from "../core/Logo.jsx";
import { Icon } from "../core/Icon.jsx";
import { IconButton } from "../core/IconButton.jsx";

const SHOP_ALL = ["Dresses", "Tops", "Bottoms", "Matching Sets", "Outerwear", "Shoes", "Accessories", "Jewelry", "Swim"].map((label) => ({ label, href: "#" }));

export function SiteHeader({ featured = { label: "Spring Break Shop", href: "#" }, shopLinks = SHOP_ALL, cartCount = 0, onCart, onNav, onSearch, onMenu, className = "" }) {
  const [mega, setMega] = React.useState(false);
  const link = "font-body text-[11.5px] font-bold uppercase tracking-eyebrow text-ink-900 transition-colors duration-150 hover:text-rose-600 cursor-pointer";
  return (
    <header className={["sticky top-0 z-40 border-b border-line-soft bg-blush-50/92 backdrop-blur-md", className].join(" ")}
      onMouseLeave={() => setMega(false)}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-5 lg:px-10">
        <div className="flex flex-1 items-center gap-7">
          <IconButton icon="menu" label="Menu" size="sm" className="lg:hidden -ml-2" onClick={onMenu} />
          <nav className="hidden lg:flex items-center gap-7">
            <a href="/shop/new" className={link}>New Arrivals</a>
            <button type="button" className={[link, "flex items-center gap-1.5"].join(" ")} onMouseEnter={() => setMega(true)} onClick={() => setMega(!mega)}>
              Shop All <Icon name="chevronDown" size={13} className={mega ? "rotate-180 transition-transform duration-200" : "transition-transform duration-200"} />
            </button>
            <a href={featured.href} className={[link, "text-rose-600"].join(" ")}>{featured.label}</a>
            <a href="/shop/sale" className={link}>Sale</a>
          </nav>
        </div>

        <a href="/" className="shrink-0"><Logo /></a>

        <div className="flex flex-1 items-center justify-end gap-1">
          <IconButton icon="search" label="Search" size="sm" onClick={onSearch} />
          <IconButton icon="user" label="Account" size="sm" className="hidden sm:inline-flex" onClick={() => onNav && onNav("account")} />
          <IconButton icon="bag" label="Cart" size="sm" badge={cartCount} onClick={onCart} />
        </div>
      </div>

      <div className={["absolute inset-x-0 top-full hidden overflow-hidden border-b border-line-soft bg-blush-50 shadow-lift transition-all duration-200 ease-boutique lg:block",
        mega ? "max-h-[420px] opacity-100" : "pointer-events-none max-h-0 opacity-0"].join(" ")}>
        <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_1fr_320px] gap-10 px-10 py-9">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 col-span-2">
            {shopLinks.map((c) => (
              <li key={c.label}><a href={c.href} onClick={() => setMega(false)} className="font-body text-[14px] text-ink-700 transition-colors duration-150 hover:text-rose-600">{c.label}</a></li>
            ))}
          </ul>
          <a href={featured.href} className="group relative block overflow-hidden rounded-md bg-blush-200" style={{ aspectRatio: "4 / 3" }}>
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=640&q=70" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(58,46,43,0) 40%,rgba(58,46,43,0.55) 100%)" }} />
            <span className="absolute bottom-4 left-4 font-display text-[22px] font-medium text-cream-50">{featured.label}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
