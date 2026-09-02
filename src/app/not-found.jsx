import { EmptyState, Button } from '@/components/ds'

// App-wide 404 for routes outside the (store) group (admin typos and the
// like). No SiteShell here: the root layout does not render it.
export const metadata = { title: 'Page not found' }

export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-5 py-24 lg:px-10">
      <div>
        <EmptyState
          icon="leaf"
          title="Nothing grows here"
          body="That page does not exist. The shop is just a step away."
        />
        <div className="mt-6 text-center">
          <Button as="a" href="/" variant="secondary">
            Back to the shop
          </Button>
        </div>
      </div>
    </div>
  )
}
