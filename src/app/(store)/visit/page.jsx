import {
  Eyebrow,
  Icon,
  Card,
  SectionHeader,
  BotanicalDivider,
  Accordion,
} from '@/components/ds'

export const metadata = { title: 'Visit us' }

export default function VisitPage() {
  return (
    <div>
      {/* Hero */}
      <div
        className="relative overflow-hidden bg-blush-200"
        style={{ aspectRatio: '16 / 6' }}
      >
        <img
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=70&auto=format&fit=crop"
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
          <Eyebrow tone="inverse">Naples, Florida</Eyebrow>
          <h1
            className="mt-2 font-display font-medium text-cream-50"
            style={{ fontSize: 'var(--display-lg)' }}
          >
            Visit us
          </h1>
        </div>
      </div>

      {/* Info + map */}
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-16 lg:grid-cols-[1fr_1fr] lg:px-10">
        <div className="flex flex-col gap-6">
          <p className="max-w-[46ch] font-body text-[17px] leading-[1.7] text-ink-700">
            We&apos;re the little pink storefront halfway down Fifth Avenue South,
            between the bookshop and the gelato place. Pop in, everything online is
            on the racks, and Bora is usually there.
          </p>
          <div className="flex flex-col gap-4">
            {[
              ['mapPin', '812 Fifth Avenue South', 'Naples, FL 34102'],
              ['phone', '(239) 555-0188', 'Text us, we answer faster'],
              ['mail', 'hello@borasboutique.com', 'We reply within a day'],
            ].map(([ic, a, b]) => (
              <div key={a} className="flex gap-3">
                <span className="mt-0.5 text-rose-500">
                  <Icon name={ic} size={19} />
                </span>
                <div>
                  <p className="font-body text-[15px] font-semibold text-ink-900">{a}</p>
                  <p className="font-body text-[13px] text-ink-500">{b}</p>
                </div>
              </div>
            ))}
          </div>
          <Card tone="cream" padding="md">
            <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
              Hours
            </p>
            <dl className="flex flex-col gap-1.5 font-body text-[14px]">
              {[
                ['Mon – Thu', '10AM – 6PM'],
                ['Friday', '10AM – 8PM'],
                ['Saturday', '10AM – 8PM'],
                ['Sunday', '11AM – 5PM'],
              ].map(([d, h]) => (
                <div
                  key={d}
                  className="flex justify-between border-b border-line-soft pb-1.5 last:border-0"
                >
                  <dt className="text-ink-500">{d}</dt>
                  <dd className="text-ink-900">{h}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="min-h-[380px] overflow-hidden rounded-lg border border-line-medium bg-sage-100">
          <iframe
            title="Map to Bora's Boutique"
            className="h-full min-h-[380px] w-full border-0"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-81.800%2C26.135%2C-81.780%2C26.148&layer=mapnik&marker=26.1417%2C-81.7900"
          />
        </div>
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
              body: 'Yes. Bring the item unworn with tags within 30 days and we\'ll refund the original payment method.',
            },
            {
              title: 'Do you restock sold-out sizes?',
              body: "Sometimes. Runs are small, so tap 'Back in stock' on the product page and we'll email you first.",
            },
            {
              title: 'Is there parking?',
              body: 'Free two-hour street parking on Fifth, and the 8th Street garage is a two-minute walk.',
            },
          ]}
        />
      </div>
    </div>
  )
}
