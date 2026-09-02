import { Eyebrow } from '@/components/ds'

export const metadata = {
  title: 'Privacy policy',
  description: "How Bora's Boutique collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-16 lg:px-0">
      <Eyebrow>Privacy</Eyebrow>
      <h1
        className="mt-3 font-display text-ink-900"
        style={{ fontSize: 'var(--display-md)' }}
      >
        How we handle your info
      </h1>
      <p className="mt-2 font-body text-[14px] text-ink-500">Updated September 2026</p>

      <div className="mt-10 flex flex-col gap-10">

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">The short version</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            We collect only what we need to send you your order and, if you sign up, our newsletter. We do not sell your data to anyone, and we do not run any ad tracking on this site.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Payments</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            All payments are handled by{' '}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 underline underline-offset-2 hover:text-rose-600"
            >
              Stripe
            </a>
            . Your card number, CVV, and billing address go directly to Stripe&apos;s servers over a secure connection. They never touch our servers and we never see them.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Order information</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            When you place an order we collect your name, email address, and shipping address. We use that information to fulfill your order, send you a confirmation, and handle any returns or questions. We do not use it for marketing unless you separately sign up for the newsletter.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Newsletter</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            If you subscribe to our newsletter we store your email address and send you occasional updates about new arrivals and in-store events. You can unsubscribe at any time using the link at the bottom of any newsletter email. When you unsubscribe your email is removed from our list.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Your bag and saved pieces</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Your shopping bag and any pieces you save are stored in your browser&apos;s local storage. That data lives on your device, not on our servers. Clearing your browser data or switching browsers will clear your bag and saved list.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Analytics</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            We do not currently run any analytics or tracking software on this site. No cookies are set for advertising or tracking purposes.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Contact</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Questions about your data? Email us at{' '}
            <a
              href="mailto:[Contact email]"
              className="text-rose-500 underline underline-offset-2 hover:text-rose-600"
            >
              [Contact email]
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  )
}
