# Photos drop-in folder

Put original photos here, named after the slot they fill, then run `npm run catalog`. It straightens each photo (using the camera's rotation), removes the location and camera details phones embed, resizes it, and saves it to `public/images/` in place of the placeholder. No code or spreadsheet changes are needed.

Originals in this folder are never committed (they're large and carry that metadata); only the processed copies in `public/images/` are.

## Names

| Photo | Put it at |
| --- | --- |
| A piece in one color | `photos/products/<handle>/<color>.jpg`, e.g. `photos/products/marigold-tiered-maxi/blush.jpg` |
| A one-color piece | `photos/products/<handle>/main.jpg` |
| Second angle or detail shot (shown on hover and in the gallery) | `photos/products/<handle>/detail.jpg` |
| Home page hero | `photos/site/banner.jpg` (wide, 16:9) |
| "From the owner" photo | `photos/site/story.jpg` (4:3) |
| Visit page hero | `photos/site/visit.jpg` (very wide, 8:3) |
| Shop menu feature | `photos/site/menu.jpg` (4:3) |
| Collection tiles | `photos/site/collections/<collection>.jpg`, e.g. `spring-break.jpg` (square works best) |
| Instagram strip | `photos/site/instagram/1.jpg` to `6.jpg` (square) |

Color names become lowercase with dashes: `Dusty Rose` is `dusty-rose.jpg`. Product photos look best at 3:4 (portrait); the site crops to fill, so keep the piece centered.

`.jpg`, `.png`, `.webp` and `.tiff` all work. iPhone HEIC photos don't: set Settings > Camera > Formats > Most Compatible, or share them as JPEG first.

If a file name doesn't match a slot (a typo in the handle or color), `npm run catalog` says so and skips it. `npm run catalog` also prints which pieces are still waiting on photos, and the admin Products page shows the same.
