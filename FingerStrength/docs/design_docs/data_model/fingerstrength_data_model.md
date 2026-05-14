# Data Model (local storage)

Entities (SQLite schema):

- Profile
  - id (UUID)
  - name
  - weight_kg (float)
  - preferred_unit ('kg'|'lb')
  - streak_current (int)
  - cached_current_max_kg (float, nullable)  -- optional cache for UI/performance
  - cached_current_max_timestamp (ISO, nullable)

- ProfileMaxHistory
  - id (UUID)
  - profile_id (UUID)
  - value_kg (float)
  - recorded_at (ISO)
  - source_session_id (UUID, nullable)
  - grip_type (string, nullable) -- e.g., 'open_hand', 'crimp', 'half_crimp', 'pinch', 'sloper'
  - edge_size_mm (float, nullable) -- optional physical edge width in millimeters or null when not applicable
  - note (string, nullable)  -- e.g. 'manual' or 'auto'
  - metadata (json, nullable) -- optional free-form metadata such as hold_type, finger_configuration

- Workout
  - id, name, owner_profile_id, is_favorite (bool), exercises (serialized list or normalized table)

- Exercise
  - id, workout_id, name, metric_type, lower_pct, upper_pct, reps_or_duration, sets, rest_seconds

- Session
  - id (UUID, primary key)
  - profile_id (UUID, nullable) -- null for guest sessions
  - start_ts_ms (integer, epoch milliseconds, UTC)
  - end_ts_ms (integer, epoch milliseconds, UTC, nullable)
  - device_id (string, nullable) -- persisted device identifier or friendly name
  - target_hand (string, nullable) -- 'left' | 'right' | 'both' | null
  - saved_as_guest (bool) -- true if session should not update profile stats
  - measurements_file_path (string, nullable) -- absolute path to time-series file stored on device
  - measurements_format_version (int) -- file schema version (increment when format changes)
  - summary_stats (json, nullable) -- precomputed summary for fast UI and indexing (schema below)
  - peak_force_kg (float, nullable) -- overall peak across session (quick index)
  - avg_force_kg (float, nullable)
  - total_load_kg_seconds (float, nullable) -- integrated load (force × time)
  - created_at (ISO)
  - updated_at (ISO)

Session.summary_stats JSON schema (versioned)
- Purpose: store computed aggregates used by the UI and exports. Keep as a single JSON blob to avoid large schema churn while allowing new derived fields.
- Example (version 1):
{
  "version": 1,
  "duration_ms": 90000,
  "total_samples": 1800,
  "per_hand": {
    "left": {
      "duration_ms": 45000,
      "total_load_kg_seconds": 36000.0,
      "avg_load_kg": 0.8,
      "max_load_kg": 2.5,
      "endurance_seconds": 45.0
    },
    "right": {
      "duration_ms": 45000,
      "total_load_kg_seconds": 27000.0,
      "avg_load_kg": 0.6,
      "max_load_kg": 2.0,
      "endurance_seconds": null
    }
  },
  "peaks": [
    { "hand": "left", "value_kg": 2.5, "ts_ms": 1650000000000 },
    { "hand": "right", "value_kg": 2.0, "ts_ms": 1650000005000 }
  ],
  "derived": {
    "estimated_current_max_from_session_kg": 2.5
  }
}

Measurement file format (CSV v1)
- Naming convention: session_<session_id>_measurements_v<version>.csv or session_<session_id>_measurements_v<version>.csv.gz when gzip-compressed.
- Optional first line: metadata JSON comment beginning with '# ' — e.g. '# {"version":1,"session_id":"...","profile_id":"...","start_ts_ms":...}'
- Data columns (CSV header expected): timestamp_ms,force_kg,hand
  - timestamp_ms: epoch milliseconds (UTC)
  - force_kg: numeric, kilograms
  - hand: optional string 'left'|'right' or empty when not applicable
- Example rows:
timestamp_ms,force_kg,hand
1650000000000,0.00,left
1650000000050,1.23,left
...
- Ordering: timestamps must be non-decreasing. Files should be UTF-8 newline-separated. For large recordings, gzip-compressed CSV (.gz) is supported; when switching to compressed format, increment measurements_format_version.

Notes and constraints
- Canonical unit: kilograms (kg) for all stored numerical force values. Convert to display units at UI layer.
- For quick listing and filtering, populate peak_force_kg, avg_force_kg, and total_load_kg_seconds on Session when the session is finalized.
- Endurance results: populate per_hand.endurance_seconds in summary_stats when endurance_mode exercises are present. Also save a top-level session_endurance object when useful.
- Measurements are stored on disk (not as BLOBs in SQLite) to keep DB small. Measurements_file_path should be an absolute path accessible by the app and included when exporting the session (export process should include copying or compressing the measurement file).
- Backward compatibility: include measurements_format_version and summary_stats.version to allow migrations and future derived fields.


- Measurement storage
  - Large time-series measurements are stored as CSV files on disk (timestamp, force_kg), with a pointer in the Session row.

- Device
  - id, name, address, last_seen, paired_flag

Storage notes:
- Use expo-sqlite or react-native-sqlite-storage for structured data. For heavy time-series, store CSV files via expo-file-system or react-native-fs and keep a filepath in the Session record to avoid bloating the DB.
- Keep canonical units in kilograms (kg) internally; convert to user's preferred unit for display and export.
- Consider optional encryption for exported files or for the database if the user requests privacy features.