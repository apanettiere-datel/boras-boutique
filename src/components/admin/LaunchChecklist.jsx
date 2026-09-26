import { Card, Icon } from '@/components/ds'
import { missingBusinessDetails } from '@/data/business'
import { products } from '@/data/catalog'
import { placeholderCount } from '@/lib/store-data'

// What still stands between this build and a real launch. Everything the site
// can see is checked live; the rest is listed so it isn't forgotten.
// unsetVariants is null when no database is connected. Settings are only
// reported as present or missing, never shown.
function configured(name) {
  return Boolean(process.env[name])
}

function Row({ done, children, detail }) {
  return (
    <li className="flex gap-3 py-2.5">
      <span className={done ? 'mt-0.5 text-sage-700' : 'mt-0.5 text-terracotta-700'}>
        <Icon name={done ? 'check' : 'clock'} size={16} />
      </span>
      <div className="min-w-0">
        <p className={['font-body text-[14px]', done ? 'text-ink-500' : 'text-ink-900'].join(' ')}>
          {children}
        </p>
        {detail ? <p className="font-body text-[12.5px] text-ink-500">{detail}</p> : null}
      </div>
    </li>
  )
}

export function LaunchChecklist({ unsetVariants }) {
  const missing = missingBusinessDetails()
  const needPhotos = products.filter((p) => placeholderCount(p) > 0)
  const siteUrl = process.env.SITE_URL || ''
  const liveUrl = /^https:\/\//.test(siteUrl) && !siteUrl.includes('localhost')

  const checks = [
    {
      done: missing.length === 0,
      label: 'Shop details filled in (src/data/business.js)',
      detail: missing.length ? `Still missing: ${missing.join(', ')}` : null,
    },
    {
      done: needPhotos.length === 0,
      label: 'Real photos for every piece (photos/ then npm run catalog)',
      detail: needPhotos.length ? `${needPhotos.length} of ${products.length} pieces still show placeholders` : null,
    },
    {
      done: unsetVariants === 0,
      label: 'Stock counts loaded (npm run db:seed)',
      detail:
        unsetVariants === null
          ? 'No database connected yet'
          : unsetVariants
            ? `${unsetVariants} size/color variants have no count yet and show as sold out`
            : null,
    },
    { done: configured('STRIPE_SECRET_KEY'), label: 'Stripe secret key set' },
    { done: configured('STRIPE_WEBHOOK_SECRET'), label: 'Stripe webhook secret set' },
    {
      done: configured('RESEND_API_KEY') && configured('NEWSLETTER_FROM_EMAIL'),
      label: 'Email alerts configured (RESEND_API_KEY, NEWSLETTER_FROM_EMAIL)',
      detail: 'Oversold orders and failed order writes are emailed to the shop.',
    },
    { done: liveUrl, label: 'SITE_URL set to the https:// shop domain' },
  ]

  const manual = [
    'Florida sales tax registration (Department of Revenue) before the first sale',
    'Stripe Tax turned on, with the Florida registration added',
    'Stripe webhook sending checkout.session.completed, async_payment_succeeded and async_payment_failed',
    'Promotion code BORA10 created in Stripe (the newsletter and announcement bar promise it)',
    'A 4242 test purchase end to end, then a real one refunded',
  ]

  const open = checks.filter((c) => !c.done).length

  return (
    <Card tone="paper" padding="md">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-900">
          Launch checklist
        </p>
        <p className="font-body text-[12px] text-ink-500">
          {open === 0 ? 'Everything the site can check is done' : `${open} of ${checks.length} to do`}
        </p>
      </div>
      <ul className="mt-2 divide-y divide-line-soft">
        {checks.map((c) => (
          <Row key={c.label} done={c.done} detail={c.detail}>
            {c.label}
          </Row>
        ))}
      </ul>
      <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-eyebrow text-ink-500">
        Outside the site
      </p>
      <ul className="mt-1 list-disc pl-5 font-body text-[13px] leading-[1.8] text-ink-700">
        {manual.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </Card>
  )
}
