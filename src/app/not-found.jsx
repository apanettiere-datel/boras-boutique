import { EmptyState, Button } from '@/components/ds'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-24 lg:px-10">
      <EmptyState
        icon="bag"
        title="Nothing here"
        body="That page doesn't exist or may have moved. New pieces land every Tuesday at 11AM."
        action={undefined}
      />
      <div className="mt-2 flex justify-center">
        <Button as="a" href="/" variant="secondary">
          Back to the shop
        </Button>
      </div>
    </div>
  )
}
