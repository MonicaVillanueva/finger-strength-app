# Testing & QA Plan

- Unit tests:
  - Business logic: workout calculations, range checks, rep/duration handling.
  - Parser tests: parseWeightDataBase64 with BE/LE/sentinel cases.
  - Storage layer: SQLite helpers and CSV read/write functions.
  - Tools: Jest + ts-jest, use mocks for native modules.

- Integration tests:
  - BLE layer: provide a mock BleManager for react-native-ble-plx in Jest, and run integration tests that simulate advertisement payloads.
  - File I/O: test CSV export/import with temporary directories.

- UI tests:
  - React Native Testing Library for component/integration tests (screens, navigation flows).
  - E2E tests: Detox (recommended) for automated device tests (workout creation/run, live data recording, guest mode).

- Manual device QA:
  - Test pairing, auto-reconnect, continuous live streaming, reconnection behavior, and background behavior on real Android devices.
  - Verify audio/haptic cues across device models.
  - Validate CSV export, and that guest sessions never mutate profile stats.

- Acceptance criteria:
  - Reliable live stream on target devices (advertisement-based parsing).
  - Accurate range detection and cueing.
  - Guest runs do not alter profiles.
  - Exports are correct and importable.