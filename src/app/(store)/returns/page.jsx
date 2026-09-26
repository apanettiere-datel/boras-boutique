import { Eyebrow } from '@/components/ds'
import { EmailLink } from '@/components/site/Contact'
import { fullAddress } from '@/data/business'

export const metadata = {
  title: 'Returns and exchanges',
  description: "How to return or exchange a piece from Bora's Boutique.",
}

export default function ReturnsPage() {
  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-16 lg:px-0">
      <Eyebrow>Policy</Eyebrow>
      <h1
        className="mt-3 font-display text-ink-900"
        style={{ fontSize: 'var(--display-md)' }}
      >
        Returns and exchanges
      </h1>
      <p className="mt-2 font-body text-[14px] text-ink-500">Updated September 2026</p>

      <div className="mt-10 flex flex-col gap-10">

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Our promise</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            We accept returns within 30 days of delivery, no questions asked. Pieces must be unworn, unwashed, and returned with all original tags attached.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Sale pieces</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Sale pieces are final sale and cannot be returned or exchanged.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Refunds</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Once we receive and inspect your return, we will refund the original payment method within 5 to 7 business days. You will get a confirmation email when the refund is issued.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Exchanges</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            You can exchange a piece by mail or in the Naples shop. For an in-person exchange, bring the piece unworn with tags and we will sort it out on the spot. For a mail exchange, follow the return steps below and place a new order for the piece you want.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">Return shipping</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Return shipping is your responsibility unless the piece arrived damaged or was the wrong item. In that case, email us and we will send a prepaid label.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[22px] text-ink-900">How to start a return</h2>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            Email us at{' '}
            <EmailLink />{' '}
            with your order number and we will walk you through the next steps. Please allow one business day for a reply.
          </p>
          <p className="font-body text-[15px] leading-[1.65] text-ink-700">
            You can also bring an in-store or online purchase directly to the shop at{' '}
            <span className="text-ink-900">{fullAddress()}</span>.
          </p>
        </section>

      </div>
    </div>
  )
}
