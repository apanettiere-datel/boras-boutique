'use client'
import React from "react";
import { Logo } from "../core/Logo.jsx";
import { Icon } from "../core/Icon.jsx";
import { NewsletterForm } from "../forms/NewsletterForm.jsx";

const DEFAULT_SHOP_LINKS = [
  { label: "Shop all", href: "/shop" },
  { label: "New arrivals", href: "/shop/new" },
  { label: "Sale", href: "/shop/sale" },
];

const HELP_LINKS = [
  { label: "Visit us", href: "/visit" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Saved pieces", href: "/saved" },
];

// address, instagramUrl and email come from the shop's business details;
// icons are left out until there's something real to link to.
export function SiteFooter({ shopLinks = DEFAULT_SHOP_LINKS, name = "Bora's Boutique", address, instagramUrl, email, welcomeCode, className = "" }) {
  const cols = [
    { title: "Shop", links: shopLinks },
    { title: "Help", links: HELP_LINKS },
  ];
  return (
    <footer className={["border-t border-line-soft bg-cream-100", className].join(" ")}>
      <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(2,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo stacked className="self-start" />
            <p className="font-body text-[14px] leading-[1.7] text-ink-700 max-w-[34ch]">Boho pieces picked by hand in Naples, Florida. New arrivals every Tuesday at 11AM.</p>
            <NewsletterForm className="max-w-[360px]" welcomeCode={welcomeCode} />
            {instagramUrl || email ? (
              <div className="mt-1 flex gap-2 text-ink-700">
                {instagramUrl ? <a href={instagramUrl} aria-label="Instagram" rel="noopener noreferrer" target="_blank" className="transition-colors duration-150 hover:text-rose-600"><Icon name="instagram" size={19} /></a> : null}
                {email ? <a href={`mailto:${email}`} aria-label="Email us" className="transition-colors duration-150 hover:text-rose-600"><Icon name="mail" size={19} /></a> : null}
              </div>
            ) : null}
          </div>
          {cols.map((c) => (
            <nav key={c.title} className="flex flex-col gap-3">
              <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">{c.title}</p>
              <ul className="flex flex-col gap-2.5">
                {c.links.map((l) => <li key={l.label}><a href={l.href} className="font-body text-[14px] text-ink-700 transition-colors duration-150 hover:text-rose-600">{l.label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line-medium pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-[12px] text-ink-500">© {new Date().getFullYear()} {name}{address ? ` · ${address}` : ""}</p>
          <p className="flex gap-4 font-body text-[12px] text-ink-500">
            <a href="/privacy" className="hover:text-rose-600 transition-colors duration-150">Privacy</a>
            <a href="/terms" className="hover:text-rose-600 transition-colors duration-150">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
