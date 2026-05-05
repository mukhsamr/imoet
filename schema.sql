CREATE TABLE IF NOT EXISTS letters (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  style     TEXT    NOT NULL,
  content   TEXT    NOT NULL,
  used      INTEGER DEFAULT 0,
  created_at TEXT   DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_style ON letters(style);