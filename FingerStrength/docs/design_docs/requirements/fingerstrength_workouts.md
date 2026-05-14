# Workouts and Exercise Model

- Workout = ordered list of Exercises.
- Supported exercise metrics (initial rollout, prioritized):
  1. hold_time (isometric holds with repetitions) — MVP
  2. %_of_max — secondary
  3. %_of_body_weight — tertiary

- Exercise fields:
  - id, workout_id, name
  - metric_type: {"hold_time","%_of_max","%_of_body_weight","absolute_force"}
  - Optional specificity:
    - grip_type (string, nullable) -- optional preferred grip for the exercise; when specified, use grip-specific maxs if available (e.g., 'crimp', 'open_hand')
    - edge_size_mm (float, nullable) -- optional preferred edge width; used to match ProfileMaxHistory entries and for recommendations
  - For hold_time:
    - target_hold_seconds (int)
    - target_reps (int)
    - sets (int)
    - rest_between_reps_seconds (int)
    - rest_between_sets_seconds (int)
    - force_threshold_pct_of_max (float, nullable)  -- optional confirmation threshold to validate the hold by measured force
    - endurance_mode (bool, default false)  -- when true, measure time until failure at force_threshold_pct_of_max; record duration as 'endurance_seconds'
    - auto_rep_detection (bool, default true)
    - rep_detection_params (json, nullable)  -- {min_hold_ms, hysteresis_pct, refractory_ms, sample_rate_hint}
  - For %_of_max / %_of_body_weight:
    - lower_pct (float), upper_pct (float), target_reps_or_duration (int|seconds), sets, rest_seconds
  - audio_cue: {on/off}, cue_type

Future work: support multiple maxs per profile per grip_type, edge_size, and finger configuration. When supported, current_max computation and workout calculations should be able to select a max by (profile_id, grip_type, finger_configuration, edge_size_mm) with sensible fallbacks (exact edge match → nearest edge_size → grip-only max → generic profile max). Workouts should allow specifying grip/edge/fingers or inherit a default.

Initial grip taxonomy for MVP: open_hand, half_crimp, full_crimp. Pinch and sloper, and finer-grained finger/pocket distinctions are planned post-MVP.

Exercise metadata fields (to add later):
- finger_configuration (string, nullable) -- e.g., 'index_middle', 'index_middle_ring', 'middle_ring'
- edge_size_mm (float, nullable)

UX note: when an exercise specifies grip/finger/edge, show which max will be used and provide a fallback explanation for the user.

- Favorite flag: mark a workout as favorite for quick-start.

Built-in templates (suggested defaults):

1) Max Pull Test
   - Purpose: establish a recent personal max (peak force)
   - Exercises: 3 attempts
     - metric: absolute_force
     - target: peak test (10s window) — record peak
     - rest_between_reps_seconds: 120
     - sets: 3
   - Notes: measure peak force per attempt; record best into ProfileMaxHistory.

2) Repeaters (7/7 style)
   - Purpose: strength endurance/hangboard repeaters
   - Exercises: 7 reps per set, 3 sets
     - metric: hold_time
     - target_hold_seconds: 7
     - target_reps: 7
     - sets: 3
     - rest_between_reps_seconds: 3
     - rest_between_sets_seconds: 180
     - force_threshold_pct_of_max: 0.7 (optional; use %_of_max for strict programs)

3) Timed Hangs (5x10s)
   - Purpose: general strength
   - Exercises: 5 reps per set, 3 sets
     - metric: hold_time
     - target_hold_seconds: 10
     - target_reps: 5
     - sets: 3
     - rest_between_reps_seconds: 10
     - rest_between_sets_seconds: 180
     - force_threshold_pct_of_max: 0.6

4) Pyramid
   - Purpose: variable-intensity session
   - Exercises sequence: 10s, 7s, 5s, 3s (1 rep each), repeat for 2 sets
     - rest_between_reps_seconds: 3
     - rest_between_sets_seconds: 180

5) Warm-up
   - Purpose: progressive warm-up
   - Exercises: 3 sets of easy hangs and 2 short pulls
     - e.g., 15s @ easy, 10s @ easy, 5 short pulls (not timed)

6) Max Endurance
   - Purpose: measure maximum hold duration at 60% of current_max
   - Exercises: 1 attempt per hand
     - metric: hold_time
     - endurance_mode: true
     - force_threshold_pct_of_max: 0.6
     - target_reps: 1
     - sets: 1
     - rest_between_reps_seconds: 0
     - rest_between_sets_seconds: 0
   - Notes: the app will monitor force and end the attempt when measured force drops below the threshold for more than 2000 ms (2 seconds). Record the longest continuous hold time in seconds as 'endurance_seconds' and include it in the session summary.

Each template should have a short description, estimated duration, and option to "Customize" which opens the advanced editor with fields prefilled.


Behavior notes:
- Auto-detection policy: By default, hold-time rep auto-detection is enabled only when a BLE device is connected and measured pull exceeds a configurable safety threshold. Manual tap-to-record is planned as an optional extension after MVP. Default safety threshold: absolute force in kilograms (kg) — default 5 kg (user-editable in Settings; per-profile override optional). The threshold applies as a minimum force required for auto-detection to consider a pull "engaged". This prevents false positives from light contacts or noise.

- Hold-time (MVP): A rep counts when measured force (when available) is >= force_threshold (if configured) for at least target_hold_seconds (allow small tolerance). If no force data is available, a timer-only hold counts when the user completes the timer or taps to record manually.
- Auto-detection: use hysteresis and a refractory window to avoid double-counts. Default detection params: min_hold_ms = target_hold_seconds * 0.9; hysteresis_pct = 5; refractory_ms = 1000. Make editable per-exercise and as global defaults.
- UI: show progress bar/timer, numeric readout, per-rep success cues (audio/haptic), rest countdown. Display a large target-hand indicator (left/right) prominently during runs. Manual record is future work; rep acceptance/validation happens automatically—no manual accept/reject in MVP. Auto-advance between reps/sets is allowed. No Start/Pause/Stop controls are required in the MVP; if BLE is disconnected, the workout is paused until reconnection. Editing is not available while a workout is running.
- Workouts apply percentage metrics to the active current_max (computed from ProfileMaxHistory) or to profile weight for body-weight metrics.
- Guest runs are isolated and do not update profile maxima or streaks.
- Acceptance criteria: detection accuracy ≥95% on recorded traces for common hold durations; clear stale/estimated labels when using decayed current_max.

Progression & max updates: New personal bests are recorded automatically. When a session's peak measured value exceeds the profile's current_max (no additional threshold), the app must create a ProfileMaxHistory entry with source_session_id and note='auto' and immediately update cached_current_max_kg and cached_current_max_timestamp. At session end, show a transient notification "New personal best recorded" with an Undo action available for 30 seconds to allow rollback. Manual entry and correction flows remain available in Profile settings.

MVP rep-counting policy:
- Simplified counting (temporary): For hold_time exercises, a repetition starts when the measured force rises above the configured safety threshold (absolute kg) and the repetition interval equals the exercise's target_hold_seconds. The repetition ends at the end of that interval. A repetition is considered valid if at least 50% of the interval had measured force >= threshold. After a counted repetition, enforce rest_seconds before the next repetition may start.
- BLE & manual fallback: Auto-detection is enabled only when a BLE device is connected and measured pull exceeds the safety threshold (default 5 kg). If BLE data is unavailable, the timer-only hold counts when the user completes the timer or taps to record manually.
- Future work: Replace simplified counting with advanced detection (hysteresis, smoothing, sample-rate-aware logic, refractory windows, per-exercise tuning). Add replayable trace fixtures and QA test vectors.