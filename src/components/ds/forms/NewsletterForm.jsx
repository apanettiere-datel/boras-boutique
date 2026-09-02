'use client'
import React from "react";
import { Button } from "../core/Button.jsx";
import { Icon } from "../core/Icon.jsx";

export function NewsletterForm({ onSubmit, compact, className = "" }) {
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email || busy) return;
    // An onSubmit prop takes over delivery (demo/specimen use); the default posts to the API.
    if (onSubmit) { setDone(true); onSubmit(email); return; }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Something went sideways. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went sideways. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  if (done) return (
    <p className={["flex items-center gap-2 font-body text-[15px] text-sage-700", className].join(" ")}>
      <Icon name="check" size={18} /> You're on the list. Check your inbox for <strong className="font-bold">BORA10</strong>.
    </p>
  );
  return (
    <form onSubmit={submit} className={["flex flex-col gap-2", className].join(" ")}>
      <div className={["flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row"].join(" ")}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
          className="flex-1 min-w-0 rounded-full border border-line-medium bg-cream-50 px-5 py-3 font-body text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-colors duration-150 focus:border-rose-500 focus:ring-[3px] focus:ring-rose-500/25" />
        <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" />
        <Button type="submit" variant="primary" loading={busy}>Get 10% off</Button>
      </div>
      {error ? <p className="font-body text-[12.5px] text-terracotta-700">{error}</p> : null}
    </form>
  );
}
