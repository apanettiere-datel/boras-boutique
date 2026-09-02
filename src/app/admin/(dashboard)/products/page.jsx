import { Badge } from '@/components/ds'
import { products } from '@/data/catalog'
import { TH, TD } from '@/components/admin/ui'

export const metadata = { title: 'Products - Admin' }

export default function ProductsPage() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-line-soft bg-blush-50/90 px-6 py-4 backdrop-blur-sm">
        <h1 className="font-display text-[26px] font-medium text-ink-900">Products</h1>
      </header>

      <div className="p-6 flex flex-col gap-4">
        <p className="font-body text-[13px] text-ink-400">
          Products are defined in <code className="rounded bg-blush-200 px-1.5 py-0.5 font-mono text-[12px] text-rose-700">src/data/catalog.js</code> and deployed with the site.
        </p>

        <div className="overflow-x-auto rounded-lg border border-line-soft bg-white">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="border-b border-line-soft bg-cream-50">
              <tr>
                <TH>Product</TH>
                <TH>Vendor</TH>
                <TH>Collection</TH>
                <TH>Price</TH>
                <TH>SKU</TH>
                <TH>Tags</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {products.map((p) => (
                <tr key={p.id || p.handle} className="hover:bg-blush-50">
                  <TD>
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt=""
                          className="h-11 w-9 rounded-sm object-cover shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-ink-900 leading-snug">{p.title}</p>
                        <p className="font-body text-[11px] text-ink-300">{p.handle}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>{p.vendor}</TD>
                  <TD>{p.collection}</TD>
                  <TD className="whitespace-nowrap">${p.price}</TD>
                  <TD className="text-[12px] text-ink-400">{p.sku}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {(p.tags || []).map((tag) => (
                        <Badge key={tag} tone="new">{tag}</Badge>
                      ))}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
