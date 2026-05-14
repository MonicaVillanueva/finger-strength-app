-- Example SQLite migration: add profiles, devices, workouts, workout_exercises, and measurement_files index
-- File: 20260502_add_profiles_workouts_devices.sql
-- Purpose: design-only example DDL for mobile app SQLite database migration

-- Note: safety_threshold is a global user setting (see settings table in prior migration). No per-exercise safety_threshold column included here.

BEGIN TRANSACTION;

-- Profiles table: user profiles (weight, prefs, cached max)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default',
  weight_kg REAL,
  preferred_unit TEXT NOT NULL DEFAULT 'kg', -- 'kg' | 'lb'
  streak_current INTEGER NOT NULL DEFAULT 0,
  cached_current_max_kg REAL,
  cached_current_max_timestamp_ms INTEGER,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles (name);

-- Devices table: BLE scale devices observed by the app
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  last_seen_ms INTEGER,
  paired_flag INTEGER NOT NULL DEFAULT 0,
  metadata TEXT, -- JSON
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices (last_seen_ms DESC);

-- Workouts: high-level workout objects (may be user-created or built-in templates)
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_template INTEGER NOT NULL DEFAULT 0,
  metadata TEXT, -- JSON: description, difficulty, built_in_id
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_workouts_profile_id ON workouts (profile_id);

-- Workout exercises: normalized list of exercises for a workout
CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  metric_type TEXT NOT NULL, -- 'hold_time' | 'reps' | 'endurance' | 'percent_max' | 'absolute'
  lower_pct REAL,
  upper_pct REAL,
  hold_time_seconds REAL,
  reps INTEGER,
  sets INTEGER,
  rest_between_reps_seconds INTEGER,
  rest_between_sets_seconds INTEGER,
  endurance_mode INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order ON workout_exercises (workout_id, order_index);

-- Measurement files index: track measurement CSV files stored on disk
CREATE TABLE IF NOT EXISTS measurement_files (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  format_version INTEGER NOT NULL DEFAULT 1,
  size_bytes INTEGER,
  hash TEXT,
  created_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_measurement_files_session ON measurement_files (session_id);

-- Bump schema version
PRAGMA user_version = 3;

COMMIT;

-- Down migration (reference): DROP tables and reset user_version with caution
-- BEGIN TRANSACTION;
-- DROP INDEX IF EXISTS idx_profiles_name;
-- DROP INDEX IF EXISTS idx_devices_last_seen;
-- DROP INDEX IF EXISTS idx_workouts_profile_id;
-- DROP INDEX IF EXISTS idx_workout_exercises_workout_order;
-- DROP INDEX IF EXISTS idx_measurement_files_session;
-- DROP TABLE IF EXISTS profiles;
-- DROP TABLE IF EXISTS devices;
-- DROP TABLE IF EXISTS workouts;
-- DROP TABLE IF EXISTS workout_exercises;
-- DROP TABLE IF EXISTS measurement_files;
-- PRAGMA user_version = 2;
-- COMMIT;
