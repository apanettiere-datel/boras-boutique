import { Eyebrow } from '@/components/ds'
import { EmailLink, PhoneLink } from '@/components/site/Contact'
import { business, fullAddress } from '@/data/business'

export const metadata = {
  title: 'Terms of sale',
  description: "Terms that apply when you place an order at Bora's Boutique.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-16 lg:px-0">
      <Eyebrow>Legal</Eyebrow>
      <h1
        className="mt-3 font-display text-ink-900"
        style={{ fontSize: 'var(--display-md)' }}
      >
        Terms of sale
      </h1>
      <p className="mt-2 font-body text-[14px] text-ink-500">Updated September 2026</p>

      <div className="mt-10 flex flex-col gap-10">

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Who we are</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            This site is operated by{' '}
            <span className="text-ink-900">{business.legalName}</span>, doing business as {business.name}, located at{' '}
            <span className="text-ink-900">{fullAddress()}</span>. By placing an order you agree to these terms.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Prices and currency</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            All prices are listed in US dollars and do not include applicable sales tax, which is calculated at checkout. Prices may change without notice, but we will always charge the price shown at the time you place your order.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Order acceptance</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Placing an order is an offer to buy, not a confirmed purchase. We accept your order when we send a shipping confirmation email. We reserve the right to cancel any order before shipment, in which case we will refund the full amount to your original payment method promptly.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Inventory and availability</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Our runs are small and sizes sell out. If a piece in your order is no longer available after you have paid, we will refund the cost of that piece in full and ship the rest of your order. We will email you to let you know.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Shipping</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            We ship within the United States only. Orders leave our shop within 1 to 2 business days of your purchase, and shipping costs are shown at checkout. We are not responsible for carrier delays once a package leaves our shop.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Limitation of liability</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            To the extent permitted by law, our total liability to you for any claim related to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses. This does not affect any rights you have that cannot legally be limited.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Governing law</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            These terms are governed by the laws of the State of Florida. Any disputes will be resolved in the courts of Collier County, Florida.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Questions</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Email us at{' '}
            <EmailLink />{' '}
            or call us at <PhoneLink />.
          </p>
        </section>

      </div>
    </div>
  )
}
