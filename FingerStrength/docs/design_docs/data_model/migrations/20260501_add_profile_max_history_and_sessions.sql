-- Example SQLite migration: add profile_max_history, settings, and session schema additions
-- File: 20260501_add_profile_max_history_and_sessions.sql
-- Purpose: design-only example DDL for mobile app SQLite database migration

BEGIN TRANSACTION;

-- 1) Profile Max History: stores historical max pulls per profile/grip/edge
CREATE TABLE IF NOT EXISTS profile_max_history (
  id TEXT PRIMARY KEY, -- UUID
  profile_id TEXT NOT NULL DEFAULT 'default',
  value_kg REAL NOT NULL,
  recorded_at_ms INTEGER NOT NULL, -- epoch ms
  source_session_id TEXT, -- optional reference to sessions.id
  grip_type TEXT, -- open_hand, half_crimp, full_crimp
  edge_size_mm REAL,
  metadata TEXT, -- JSON as TEXT
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_max_history_profile_recorded_at ON profile_max_history (profile_id, recorded_at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_profile_max_history_value ON profile_max_history (value_kg DESC);

-- 2) Key-Value settings table (device-local user settings)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_text TEXT,
  value_num REAL,
  value_int INTEGER,
  value_type TEXT, -- 'text' | 'number' | 'int'
  updated_at_ms INTEGER NOT NULL
);

-- Optional defaults (INSERT OR IGNORE so migration is idempotent)
INSERT OR IGNORE INTO settings (key, value_num, value_type, updated_at_ms) VALUES
  ('max_window_days', 7, 'int', (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('max_decay_percent_per_week', 5, 'number', (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('safety_threshold_kg', 5, 'number', (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('failure_debounce_ms', 2000, 'int', (CAST(strftime('%s','now') AS INTEGER) * 1000));

-- 3) Sessions table: canonical schema (create if missing). If you already have a sessions table, use the ALTERs below.
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER,
  device_id TEXT,
  target_hand TEXT, -- 'left' | 'right' | 'both'
  measurements_file_path TEXT,
  measurements_format_version INTEGER NOT NULL DEFAULT 1,
  summary_stats TEXT, -- JSON (versioned) stored as TEXT
  peak_load_kg REAL,
  avg_load_kg REAL,
  total_load_kg_s REAL,
  profile_id TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sessions_start_ms ON sessions (start_ms);
CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions (profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_device_hand ON sessions (device_id, target_hand);

-- If sessions already exists in older schema, add these columns manually (SQLite ALTER TABLE does not support IF NOT EXISTS for columns):
-- ALTER TABLE sessions ADD COLUMN measurements_file_path TEXT;
-- ALTER TABLE sessions ADD COLUMN measurements_format_version INTEGER DEFAULT 1;
-- ALTER TABLE sessions ADD COLUMN summary_stats TEXT;
-- ALTER TABLE sessions ADD COLUMN peak_load_kg REAL;
-- ALTER TABLE sessions ADD COLUMN avg_load_kg REAL;
-- ALTER TABLE sessions ADD COLUMN total_load_kg_s REAL;
-- ALTER TABLE sessions ADD COLUMN profile_id TEXT;
-- ALTER TABLE sessions ADD COLUMN updated_at_ms INTEGER;

-- Bump schema version for client migration tracking (adjust number as appropriate for your app lifecycle)
PRAGMA user_version = 2;

COMMIT;

-- Down migration (for reference only; use with caution):
-- BEGIN TRANSACTION;
-- DROP INDEX IF EXISTS idx_profile_max_history_profile_recorded_at;
-- DROP INDEX IF EXISTS idx_profile_max_history_value;
-- DROP TABLE IF EXISTS profile_max_history;
-- DROP TABLE IF EXISTS settings;
-- -- Do not drop sessions unless you intend to remove data:
-- PRAGMA user_version = 1;
-- COMMIT;
