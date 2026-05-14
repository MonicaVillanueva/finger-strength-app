# Proposed Tech Stack

- Language: TypeScript (React Native)
- Framework: React Native (recommend Expo with EAS + custom dev client for faster iteration, or Bare React Native if you need full native control)
- Platform target: Android minSdk 29 (Android 10). Background BLE scanning requires a native foreground service; Expo-managed apps must use a custom dev client/EAS build to include native modules.
- UI: Functional React components with Hooks; React Navigation for routing; optional UI kit (React Native Paper / NativeBase) for standard controls
- State & Architecture: React Context + useReducer for simple state, or Redux Toolkit / Recoil for more complex state and predictable flows
- Local DB: SQLite for structured data (expo-sqlite or react-native-sqlite-storage). Store large time-series/measurements as CSV files via expo-file-system or react-native-fs. Consider Realm or MMKV for high-performance needs.
- BLE: react-native-ble-plx (advertisement scanning as in current code). Parse manufacturerData for WH-C06. Handle Android runtime permissions (BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION) and implement a native foreground service for reliable background streaming when needed.
- Charts: victory-native or react-native-chart-kit + react-native-svg for graphs
- Audio & Haptics: expo-av or react-native-sound for short cues; expo-haptics or react-native-haptic-feedback for vibration; expo-speech or react-native-tts for optional voice cues
- File I/O & Sharing: expo-file-system / react-native-fs and expo-sharing / react-native-share for export/import
- CSV export/import: simple CSV writer/reader (manual or small library), measurements stored as timestamped CSV rows
- Testing: Jest + React Native Testing Library for unit/interaction tests; Detox (or Appium) for E2E testing on real devices
- CI/CD: GitHub Actions + EAS Build (recommended) or Fastlane; run unit tests and UI/e2e where possible

Rationales: Matches the existing codebase (TypeScript + react-native-ble-plx + expo-device). Keeps the app lightweight, offline-first, and uses mature RN libraries for BLE, file I/O, audio and testing. Store measurements internally in kilograms (kg) and convert to display units at the UI layer.