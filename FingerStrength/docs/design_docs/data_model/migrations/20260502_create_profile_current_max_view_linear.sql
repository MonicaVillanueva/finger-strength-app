-- Design-only SQL: portability-friendly linear-decay view for current_max
-- File: 20260502_create_profile_current_max_view_linear.sql
-- This view computes max_in_window, last_value, a linearly-decayed last value, and current_max_kg.
-- Linear decay = last_value * (1 - decay_percent_per_week * weeks_elapsed). Clamped to >= 0.

BEGIN TRANSACTION;

CREATE VIEW IF NOT EXISTS profile_current_max_view_linear AS
SELECT
  p.id AS profile_id,
  (CAST(strftime('%s','now') AS INTEGER) * 1000) AS now_ms,

  -- Maximum recorded value inside the configured window (nullable)
  (
    SELECT pmh.value_kg FROM profile_max_history pmh
      WHERE pmh.profile_id = p.id
        AND pmh.recorded_at_ms >= ((CAST(strftime('%s','now') AS INTEGER) * 1000) - (COALESCE((SELECT value_int FROM settings WHERE key='max_window_days'), 7) * 24 * 60 * 60 * 1000))
      ORDER BY pmh.value_kg DESC
      LIMIT 1
  ) AS max_in_window_kg,

  -- Most recent recorded value (nullable)
  (
    SELECT pmh2.value_kg FROM profile_max_history pmh2 WHERE pmh2.profile_id = p.id ORDER BY pmh2.recorded_at_ms DESC LIMIT 1
  ) AS last_value_kg,
  (
    SELECT pmh2.recorded_at_ms FROM profile_max_history pmh2 WHERE pmh2.profile_id = p.id ORDER BY pmh2.recorded_at_ms DESC LIMIT 1
  ) AS last_recorded_at_ms,

  -- Whether there is no value in the window (1 = stale, 0 = fresh)
  CASE WHEN EXISTS (
      SELECT 1 FROM profile_max_history pmh WHERE pmh.profile_id = p.id
        AND pmh.recorded_at_ms >= ((CAST(strftime('%s','now') AS INTEGER) * 1000) - (COALESCE((SELECT value_int FROM settings WHERE key='max_window_days'), 7) * 24 * 60 * 60 * 1000))
    ) THEN 0 ELSE 1 END AS is_stale,

  -- Linearly decayed last value (nullable): value * (1 - decay_pct * weeks_elapsed), clamped to >= 0
  (
    SELECT
      CASE WHEN pmh_last.value_kg IS NULL THEN NULL
      ELSE
        CASE
          WHEN (pmh_last.value_kg * (1.0 - (COALESCE((SELECT value_num FROM settings WHERE key='max_decay_percent_per_week'), 5) / 100.0) * (((CAST(strftime('%s','now') AS INTEGER) * 1000) - pmh_last.recorded_at_ms) / (7.0 * 24.0 * 60.0 * 60.0 * 1000.0)))) < 0.0
          THEN 0.0
          ELSE (pmh_last.value_kg * (1.0 - (COALESCE((SELECT value_num FROM settings WHERE key='max_decay_percent_per_week'), 5) / 100.0) * (((CAST(strftime('%s','now') AS INTEGER) * 1000) - pmh_last.recorded_at_ms) / (7.0 * 24.0 * 60.0 * 60.0 * 1000.0))))
        END
      END
    FROM (
      SELECT value_kg, recorded_at_ms FROM profile_max_history WHERE profile_id = p.id ORDER BY recorded_at_ms DESC LIMIT 1
    ) AS pmh_last
  ) AS decayed_value_kg_linear,

  -- Final computed current_max_kg: prefer max_in_window; else decayed last value; else NULL
  COALESCE(
    (
      SELECT pmh.value_kg FROM profile_max_history pmh
        WHERE pmh.profile_id = p.id
          AND pmh.recorded_at_ms >= ((CAST(strftime('%s','now') AS INTEGER) * 1000) - (COALESCE((SELECT value_int FROM settings WHERE key='max_window_days'), 7) * 24 * 60 * 60 * 1000))
        ORDER BY pmh.value_kg DESC
        LIMIT 1
    ),
    (
      SELECT
        CASE WHEN pmh_last.value_kg IS NULL THEN NULL
        WHEN (pmh_last.value_kg * (1.0 - (COALESCE((SELECT value_num FROM settings WHERE key='max_decay_percent_per_week'), 5) / 100.0) * (((CAST(strftime('%s','now') AS INTEGER) * 1000) - pmh_last.recorded_at_ms) / (7.0 * 24.0 * 60.0 * 60.0 * 1000.0)))) < 0.0 THEN 0.0
        ELSE (pmh_last.value_kg * (1.0 - (COALESCE((SELECT value_num FROM settings WHERE key='max_decay_percent_per_week'), 5) / 100.0) * (((CAST(strftime('%s','now') AS INTEGER) * 1000) - pmh_last.recorded_at_ms) / (7.0 * 24.0 * 60.0 * 60.0 * 1000.0))))
        END
      FROM (
        SELECT value_kg, recorded_at_ms FROM profile_max_history WHERE profile_id = p.id ORDER BY recorded_at_ms DESC LIMIT 1
      ) AS pmh_last
    )
  ) AS current_max_kg

FROM profiles p;

COMMIT;
