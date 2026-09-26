// Every shop detail the site shows, in one place. Values in [brackets] are
// placeholders still waiting on Bora: they render as-is so they're easy to
// spot, links built from them are left out, and /admin lists what's missing.

export const business = {
  name: "Bora's Boutique",
  // The registered business name for the Terms page (LLC, sole prop, ...)
  legalName: '[Business legal name]',

  streetAddress: '[Shop street address]',
  city: 'Naples',
  region: 'FL',
  postalCode: '[ZIP code]',
  // Map pin on the Visit page; leave null to hide the map
  latitude: null,
  longitude: null,

  phone: '[Phone]',
  phoneNote: 'Text us, we answer faster',
  email: '[Contact email]',
  emailNote: 'We reply within a day',

  // Full profile URL, e.g. 'https://www.instagram.com/<handle>/'. Empty hides
  // the Instagram links and the home page Instagram strip.
  instagramUrl: '',

  hours: [
    ['Monday – Saturday', '[Hours]'],
    ['Sunday', '[Hours]'],
  ],

  // First-order discount promised by the newsletter signup and announcement
  // bar. Create it in Stripe (Products > Coupons > promotion code) before launch.
  welcomeCode: 'BORA10',

  // Visit page copy
  directions: '[A sentence or two on finding the shop, e.g. what it is next to]',
  parking: '[Where to park]',
}

export function isPlaceholder(value) {
  return value == null || value === '' || /\[[^\]]*\]/.test(String(value))
}

export function filled(value) {
  return isPlaceholder(value) ? null : value
}

// "812 Fifth Ave S, Naples, FL 34102" once the details are real
export function fullAddress() {
  const { streetAddress, city, region, postalCode } = business
  const tail = [region, filled(postalCode)].filter(Boolean).join(' ')
  return `${streetAddress}, ${city}, ${tail}`
}

// @handle from the profile URL, or null
export function instagramHandle() {
  const m = /instagram\.com\/([A-Za-z0-9._]+)/.exec(business.instagramUrl || '')
  return m ? `@${m[1]}` : null
}

// Labels of the details still waiting on Bora, for the admin launch checklist
export function missingBusinessDetails() {
  const b = business
  const checks = [
    ['Legal business name', b.legalName],
    ['Street address', b.streetAddress],
    ['ZIP code', b.postalCode],
    ['Phone', b.phone],
    ['Contact email', b.email],
    ['Instagram profile URL', b.instagramUrl],
    ['Store hours', b.hours.map(([, h]) => h).join(' ')],
    ['Map location (latitude/longitude)', b.latitude != null && b.longitude != null ? 'set' : ''],
    ['Visit page directions', b.directions],
    ['Parking details', b.parking],
  ]
  return checks.filter(([, v]) => isPlaceholder(v)).map(([label]) => label)
}
