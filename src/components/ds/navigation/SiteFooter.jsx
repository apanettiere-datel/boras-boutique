'use client'
import React from "react";
import { Logo } from "../core/Logo.jsx";
import { Icon } from "../core/Icon.jsx";
import { NewsletterForm } from "../forms/NewsletterForm.jsx";

const COLS = [
  { title: "Shop", links: ["New Arrivals", "Dresses", "Tops", "Jewelry", "Sale", "Gift Cards"] },
  { title: "Help", links: ["Contact", "Sizing Guide", "Shipping", "Returns & Refunds", "Track Order"] },
  { title: "Boutique", links: ["About", "Visit Us", "Careers", "Stockists"] }
];

export function SiteFooter({ className = "" }) {
  return (
    <footer className={["border-t border-line-soft bg-cream-100", className].join(" ")}>
      <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo stacked className="self-start" />
            <p className="font-body text-[14px] leading-[1.7] text-ink-700 max-w-[34ch]">Boho pieces picked by hand in Naples, Florida. New arrivals every Tuesday at 11AM.</p>
            <NewsletterForm className="max-w-[360px]" />
            <div className="mt-1 flex gap-2 text-ink-700">
              <a href="#" aria-label="Instagram" className="transition-colors duration-150 hover:text-rose-600"><Icon name="instagram" size={19} /></a>
              <a href="#" aria-label="Email us" className="transition-colors duration-150 hover:text-rose-600"><Icon name="mail" size={19} /></a>
            </div>
          </div>
          {COLS.map((c) => (
            <nav key={c.title} className="flex flex-col gap-3">
              <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">{c.title}</p>
              <ul className="flex flex-col gap-2.5">
                {c.links.map((l) => <li key={l}><a href="#" className="font-body text-[14px] text-ink-700 transition-colors duration-150 hover:text-rose-600">{l}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line-medium pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-[12px] text-ink-500">© 2026 Bora's Boutique · 812 Fifth Ave S, Naples FL</p>
          <p className="flex gap-4 font-body text-[12px] text-ink-500">
            <a href="#" className="hover:text-rose-600 transition-colors duration-150">Privacy</a>
            <a href="#" className="hover:text-rose-600 transition-colors duration-150">Terms</a>
            <a href="#" className="hover:text-rose-600 transition-colors duration-150">Accessibility</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
