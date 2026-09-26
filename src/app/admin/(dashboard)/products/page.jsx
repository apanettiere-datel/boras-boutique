import { Badge } from '@/components/ds'
import { products } from '@/data/catalog'
import { placeholderCount } from '@/lib/store-data'
import { TH, TD } from '@/components/admin/ui'

export const metadata = { title: 'Products - Admin' }

const code = 'rounded bg-blush-200 px-1.5 py-0.5 font-mono text-[12px] text-rose-700'

export default function ProductsPage() {
  const waiting = products.filter((p) => placeholderCount(p) > 0).length

  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Products</h1>
      </header>

      <div className="flex flex-col gap-4 p-6">
        <p className="max-w-[80ch] font-body text-[13px] leading-[1.6] text-ink-500">
          Products are edited in <code className={code}>catalog/products.csv</code> and photos
          dropped into <code className={code}>photos/</code>; <code className={code}>npm run catalog</code>{' '}
          applies both and the site ships with the result. Live stock counts are edited on the
          Inventory page. {products.length} pieces
          {waiting ? `, ${waiting} still waiting on real photos` : ', all with real photos'}.
        </p>

        <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="border-b border-line-soft bg-cream-50">
              <tr>
                <TH>Product</TH>
                <TH>Vendor</TH>
                <TH>Category</TH>
                <TH>Price</TH>
                <TH>Colors / sizes</TH>
                <TH>Photos</TH>
                <TH>Tags</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {products.map((p) => {
                const missing = placeholderCount(p)
                return (
                  <tr key={p.handle} className="hover:bg-blush-50">
                    <TD>
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-11 w-9 shrink-0 rounded-sm object-cover" />
                        <div>
                          <a
                            href={`/product/${p.handle}`}
                            className="font-semibold leading-snug text-ink-900 hover:text-rose-600"
                          >
                            {p.title}
                          </a>
                          <p className="font-body text-[11px] text-ink-500">
                            {[p.handle, p.sku].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD>{p.vendor}</TD>
                    <TD>{p.collection}</TD>
                    <TD className="whitespace-nowrap">
                      ${p.price}
                      {p.compareAt ? <span className="ml-1 text-ink-500 line-through">${p.compareAt}</span> : null}
                    </TD>
                    <TD className="text-[12.5px]">
                      {p.colors.map((c) => c.name).join(', ') || 'One color'}
                      <br />
                      <span className="text-ink-500">{p.sizes.map((s) => s.label).join(', ') || 'One size'}</span>
                    </TD>
                    <TD>
                      {missing ? (
                        <Badge tone="low">{missing} needed</Badge>
                      ) : (
                        <Badge tone="restock">Done</Badge>
                      )}
                    </TD>
                    <TD>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((tag) => (
                          <Badge key={tag} tone="new">{tag}</Badge>
                        ))}
                      </div>
                    </TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
