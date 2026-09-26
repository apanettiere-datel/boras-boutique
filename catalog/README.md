# Product spreadsheet

`products.csv` is the whole catalog: one row per size and color of each piece. Edit it in Google Sheets, Numbers or Excel, export as CSV (UTF-8) over this file, then run:

```bash
npm run catalog        # checks every row, updates the site's product data and photo slots
npm run db:seed:local  # gives new variants their starting stock in the local database
```

If a row has a problem, nothing is written and the command lists each problem with its line number.

## Columns

| Column | Required | Notes |
| --- | --- | --- |
| `handle` | yes | The product's web address: `/product/<handle>`. Lowercase letters, numbers and dashes, like `marigold-tiered-maxi`. Every row of the same piece uses the same handle. Don't change it once the piece is live (saved bags, orders and Google listings point at it). |
| `title` | yes | `Marigold Tiered Maxi` |
| `vendor` | yes | Brand shown above the title, e.g. `Bora's House Label` |
| `collection` | yes | Category: `Dresses`, `Tops`, `Bottoms`, ... It becomes a page at `/shop/<category>` and a filter. |
| `price` | yes | Whole dollars: `98` or `$98`. Cents aren't supported. |
| `compare_at` | no | The "was" price on sale pieces. Must be higher than `price`. |
| `sku` | no | Your stock code. Must be unique. |
| `tags` | no | Separate with semicolons. `new` puts a piece in New Arrivals and "Just in" on the home page, `sale` in Sale, `linen` in the home page's linen edit. |
| `badge` | no | Short label on the photo: `Just in`, `30% off`. "Almost gone" and "Sold out" are added automatically from live stock. |
| `badge_tone` | no | `new`, `sale` or `restock`. Defaults to `sale` when there's a `compare_at`, otherwise `new`. |
| `description` | yes | A sentence or two for the product page and search results. |
| `fit` | no | Shown under "Fit & sizing". Leave blank to hide the section. |
| `fabric_care` | no | Shown under "Fabric & care". Leave blank to hide the section. |
| `color` | no | `Blush`. Leave blank on every row for a piece that comes in one color. |
| `color_hex` | with color | The swatch color, like `#F2D2C8`. Needed on the first row of each color. |
| `size` | no | `S`, `M`, `8`, ... Leave blank on every row for one-size pieces (bags, jewelry). |
| `stock` | yes | Starting count for that size and color. After launch, change live counts in `/admin/inventory`; re-running the seed never overwrites them. |

The product columns (`title` through `fabric_care`) only need filling on the first row of each piece; later rows can leave them blank. If a later row does fill one in, it has to match the first row.

Pieces appear in the order of the spreadsheet, and "Newest" sorting treats lower rows as newer, so add each week's drop at the bottom.

## Photos

Every color of every piece has a photo slot, plus one `detail` shot per piece. Until a real photo is in place the site shows a labeled placeholder. See [`photos/README.md`](../photos/README.md) for where to put photos.
