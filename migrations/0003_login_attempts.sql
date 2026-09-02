CREATE TABLE login_attempts (
  ip TEXT PRIMARY KEY,
  fails INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
