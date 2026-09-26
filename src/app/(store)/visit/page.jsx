import {
  Eyebrow,
  Icon,
  Card,
  SectionHeader,
  BotanicalDivider,
  Accordion,
} from '@/components/ds'
import { EmailLink, PhoneLink } from '@/components/site/Contact'
import { siteImages } from '@/data/catalog'
import { business, filled, isPlaceholder } from '@/data/business'
import { SITE_URL } from '@/lib/site'

export const metadata = { title: 'Visit us' }

// A small bounding box around the pin for the OpenStreetMap embed
function mapSrc(lat, lng) {
  const d = 0.006
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].map((n) => n.toFixed(5)).join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}

// schema.org ClothingStore for search results, only once the details are real
function storeJsonLd() {
  const b = business
  if ([b.streetAddress, b.postalCode, b.phone].some(isPlaceholder)) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: b.name,
    url: SITE_URL,
    telephone: b.phone,
    ...(filled(b.email) ? { email: b.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.streetAddress,
      addressLocality: b.city,
      addressRegion: b.region,
      postalCode: b.postalCode,
      addressCountry: 'US',
    },
    ...(b.latitude != null && b.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude } }
      : {}),
    ...(filled(b.instagramUrl) ? { sameAs: [b.instagramUrl] } : {}),
  }
}

export default function VisitPage() {
  const b = business
  const hasMap = b.latitude != null && b.longitude != null
  const jsonLd = storeJsonLd()

  const contactRows = [
    ['mapPin', b.streetAddress, `${b.city}, ${b.region} ${b.postalCode}`],
    ['phone', <PhoneLink key="p" className="hover:text-rose-600" />, b.phoneNote],
    ['mail', <EmailLink key="e" className="hover:text-rose-600" />, b.emailNote],
  ]

  return (
    <div>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // Escape < so catalog text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      ) : null}

      {/* Hero */}
      <div
        className="relative overflow-hidden bg-blush-200"
        style={{ aspectRatio: '16 / 6' }}
      >
        <img
          src={siteImages.visit}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(58,46,43,0.1) 40%,rgba(58,46,43,0.5) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1280px] px-5 pb-8 lg:px-10">
          <Eyebrow tone="inverse">
            {b.city}, Florida
          </Eyebrow>
          <h1
            className="mt-2 font-display font-medium text-cream-50"
            style={{ fontSize: 'var(--display-lg)' }}
          >
            Visit us
          </h1>
        </div>
      </div>

      {/* Info + map */}
      <div
        className={[
          'mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-16 lg:px-10',
          hasMap ? 'lg:grid-cols-[1fr_1fr]' : '',
        ].join(' ')}
      >
        <div className="flex flex-col gap-6">
          <p className="max-w-[46ch] font-body text-[17px] leading-[1.7] text-ink-700">
            {b.directions} Pop in: everything online is on the racks, and Bora is
            usually there.
          </p>
          <div className="flex flex-col gap-4">
            {contactRows.map(([ic, a, note]) => (
              <div key={ic} className="flex gap-3">
                <span className="mt-0.5 text-rose-500">
                  <Icon name={ic} size={19} />
                </span>
                <div>
                  <p className="font-body text-[15px] font-semibold text-ink-900">{a}</p>
                  <p className="font-body text-[13px] text-ink-500">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <Card tone="cream" padding="md" className="max-w-[420px]">
            <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
              Hours
            </p>
            <dl className="flex flex-col gap-1.5 font-body text-[14px]">
              {b.hours.map(([d, h]) => (
                <div
                  key={d}
                  className="flex justify-between gap-4 border-b border-line-soft pb-1.5 last:border-0"
                >
                  <dt className="text-ink-500">{d}</dt>
                  <dd className="text-ink-900">{h}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {hasMap ? (
          <div className="min-h-[380px] overflow-hidden rounded-lg border border-line-medium bg-sage-100">
            <iframe
              title={`Map to ${b.name}`}
              className="h-full min-h-[380px] w-full border-0"
              loading="lazy"
              src={mapSrc(b.latitude, b.longitude)}
            />
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-[880px] px-5">
        <BotanicalDivider />
      </div>

      {/* FAQ */}
      <div className="mx-auto w-full max-w-[720px] px-5 py-16">
        <SectionHeader
          align="center"
          eyebrow="Good to know"
          title="Questions we get a lot"
        />
        <Accordion
          items={[
            {
              title: 'Do you hold pieces?',
              body: "We'll hold anything for 24 hours. Text the shop and we'll put your name on it.",
            },
            {
              title: 'Can I return an online order in store?',
              body: "Yes. Bring the piece unworn with tags within 30 days and we'll refund the original payment method. Sale pieces are final.",
            },
            {
              title: 'Do you restock sold-out sizes?',
              body: 'Sometimes. Runs are small, so join the newsletter: restocks go out there first.',
            },
            {
              title: 'Is there parking?',
              body: b.parking,
            },
          ]}
        />
      </div>
    </div>
  )
}
