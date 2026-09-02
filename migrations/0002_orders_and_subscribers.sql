CREATE TABLE orders (
  session_id TEXT PRIMARY KEY,
  email TEXT,
  amount_total INTEGER,
  items TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE newsletter_subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
