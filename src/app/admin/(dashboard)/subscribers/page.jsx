import { Card, EmptyState } from '@/components/ds'
import { getSubscribers } from '@/lib/store-data'
import { SetupCard, TH, TD } from '@/components/admin/ui'
import { RemoveButton } from './RemoveButton'

export const metadata = { title: 'Subscribers - Admin' }

const SHOWN = 500

function formatDate(ts) {
  const d = new Date(`${String(ts).replace(' ', 'T')}Z`)
  return isNaN(d)
    ? String(ts)
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers(SHOWN + 1)

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Subscribers</h1>
        {subscribers?.length ? (
          <a
            href="/api/admin/subscribers/export"
            className="ml-auto rounded-full border border-line-medium bg-cream-50 px-4 py-2 font-body text-[12px] font-semibold uppercase tracking-eyebrow text-ink-900 hover:border-line-strong"
          >
            Download CSV
          </a>
        ) : null}
      </header>

      <div className="flex flex-col gap-4 p-6">
        <Card tone="cream" padding="md" className="max-w-[760px]">
          <p className="font-body text-[14px] font-semibold text-ink-900">
            This list is for exporting, not for mailing directly
          </p>
          <p className="mt-1.5 font-body text-[13.5px] leading-[1.6] text-ink-700">
            Newsletters must carry a working unsubscribe link (US CAN-SPAM law, and the privacy
            policy promises one). This site doesn&apos;t send newsletters, so never mail these
            addresses from a regular inbox. Download the CSV and import it into an email service
            (Mailchimp, Klaviyo, Kit and the like), which adds the unsubscribe link and keeps
            track of who opted out. If someone emails asking to be removed, remove them here and
            in the email service.
          </p>
        </Card>

        {subscribers === null ? (
          <SetupCard />
        ) : subscribers.length === 0 ? (
          <EmptyState
            icon="mail"
            title="No subscribers yet"
            body="Signups from the home page and footer will appear here."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
              <table className="w-full min-w-[520px] border-collapse">
                <thead className="border-b border-line-soft bg-cream-50">
                  <tr>
                    <TH>Email</TH>
                    <TH>Signed up</TH>
                    <TH></TH>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {subscribers.slice(0, SHOWN).map((s) => (
                    <tr key={s.email} className="hover:bg-blush-50">
                      <TD className="font-semibold text-ink-900">{s.email}</TD>
                      <TD className="whitespace-nowrap">{formatDate(s.created_at)}</TD>
                      <TD className="text-right">
                        <RemoveButton email={s.email} />
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {subscribers.length > SHOWN ? (
              <p className="font-body text-[12.5px] text-ink-500">
                Showing the newest {SHOWN}. The CSV has everyone.
              </p>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}
