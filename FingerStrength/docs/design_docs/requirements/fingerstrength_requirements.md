# Functional & Non-functional Requirements

Functional
- Profiles: create/modify/delete/switch; store weight, units, max pull, historic maxs, streaks.
- Max pull expiry & decay: current_max is computed from ProfileMaxHistory as the max value within a configurable window (default 7 days). If no max exists within the window, the last recorded max is used but marked 'stale' and subject to decay (default 5% per week). Acceptance criteria: UI shows a 'stale' indicator when last max > window; current_max updates when new max_history entries are recorded; decay is applied to cached values and reflected in workouts.
- Workouts: create/edit/save workouts made of exercises with ranges (lower/upper in % of max or % of body weight), sets/reps/durations/rests.
- Quick Start: launch favorite workout or Live Data session from home screen.
- Live Data: real-time BLE stream from WH-C06, graph, numeric readout, sound/haptic cues, save/discard session. Guest mode must not modify profile stats.
- BLE handling: advertisement-based scanning (react-native-ble-plx), device selection, permissions workflow, and probe mode for mapping.

Non-functional
- Small binary size, low permissions by default, battery-efficient.
- Reliable background streaming on Android requires a native foreground service; for React Native this should target Android minSdk 29 (Android 10) and be implemented as a small native module or via an existing library. Expo-managed apps must use a custom dev client / EAS build to include native modules.
- Secure local storage, optionally encrypted (user decision).
- No remote analytics by default (privacy-first).
- Offline-first: all features should work without network connectivity. Export/import is user-triggered.