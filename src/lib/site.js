// Canonical site origin for sitemaps, canonicals, and OG URLs.
// SITE_URL is set in production; the fallback keeps local builds working.
export const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'
