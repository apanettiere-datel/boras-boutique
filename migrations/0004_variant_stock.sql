-- Stock per size and color. Each color of a piece is a different physical
-- garment, so one count per product (the old `inventory` table) could sell a
-- Sage M that was really a Blush M. Empty string means "no size" (one-size
-- pieces) or "no color" (one colorway). Starting counts come from
-- seed/stock.sql (npm run db:seed / db:seed:local); live counts are edited in
-- /admin/inventory.
CREATE TABLE variant_stock (
  handle TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL CHECK (stock >= 0),
  PRIMARY KEY (handle, size, color)
);

-- A paid order that wanted more of a variant than was left (two shoppers
-- checking out the last piece at the same time). Written in the same batch as
-- the stock decrement, so it can't miss one. Cleared from the admin "needs
-- attention" list by setting resolved_at once it's refunded or restocked.
CREATE TABLE order_shortfalls (
  session_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  wanted INTEGER NOT NULL,
  available INTEGER NOT NULL,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, handle, size, color)
);

-- The per-product counts only ever held seed data (the shop has never been
-- deployed), so there is nothing to carry over.
DROP TABLE inventory;
