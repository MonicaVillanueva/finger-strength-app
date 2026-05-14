# FingerStrength — Overview

FingerStrength is a lightweight, free Android app for climbers to train finger strength using a WH-C06 crane scale (BLE).

Key goals:
- Minimal, fast, offline-first app
- Profile-based stats (streak, historic max pull, current max)
  - current_max is computed from profile max history within a configurable window (default 7 days); if older than the window it is marked 'stale' and a decay of 5% per week is applied to the cached estimate. Both window length and decay rate are user-configurable in Settings.
- Quick-start favorites + Live Data mode (guest option)
- Workout exercises defined by ranges (percent of profile max or percent of body weight)
- Audio cues when measured pull is outside a defined range

Inspired by Frez / ClimbHarder (user expects similar core features) but focused on simplicity and offline operation.