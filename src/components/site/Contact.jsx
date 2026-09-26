import { business, filled } from '@/data/business'

const LINK = 'text-rose-500 underline underline-offset-2 hover:text-rose-600'

// Placeholders render as plain text: a mailto:[Contact email] link would
// look clickable and go nowhere.
export function EmailLink({ className = LINK }) {
  const email = filled(business.email)
  if (!email) return <span className="text-ink-900">{business.email}</span>
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  )
}

export function PhoneLink({ className = LINK }) {
  const phone = filled(business.phone)
  if (!phone) return <span className="text-ink-900">{business.phone}</span>
  return (
    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={className}>
      {phone}
    </a>
  )
}
