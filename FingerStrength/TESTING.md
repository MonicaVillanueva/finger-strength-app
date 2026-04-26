# Testing Guide — FingerStrength

This document describes the test design for the FingerStrength app, how tests are organized, how native modules are mocked for Jest, and exact commands to run tests locally and in CI.

## Overview
- Test runner: `jest` with the `jest-expo` preset (handles Expo/React Native transforms).
- Component testing: `@testing-library/react-native`.
- Unit tests: Jest (fast, deterministic).
- Native modules mocked for unit tests (BLE, AsyncStorage, reanimated) so tests can run off-device.

Files added as part of initial test infra:
- `jest.config.js` — Jest configuration and transform rules.
- `jest.setup.js` — polyfills and module mocks.
- `jest.setupAfterEnv.js` — environment setup (clears AsyncStorage between tests).
- `__mocks__/react-native-ble-plx.js` — fake BleManager for scan simulations.
- `__tests__/utils/weightParser.test.ts` — unit tests for weight parsing.
- `__tests__/utils/userStorage.test.ts` — unit tests for AsyncStorage-backed utilities.

## Test types
- Unit tests: pure functions and small helpers (e.g., `parseWeightData`).
- Integration tests: small composed pieces (e.g., `UserContext` + `userStorage`).
- Component tests: render UI components and assert visible state and interactions.
- E2E (future): Full app tests on device/emulator (recommended: Detox or Appium). E2E requires building a dev client; see notes below.

## How mocking works
- `@react-native-async-storage/async-storage` is mocked using the package-provided Jest mock (configured in `jest.setup.js`). This makes reads/writes deterministic and isolated per test.
- `react-native-ble-plx` is manually mocked in `__mocks__` to provide a `BleManager` with `startDeviceScan`, `stopDeviceScan`, and a helper `_simulateDevice()` for tests to trigger simulated advertisements.
- `react-native-reanimated` is mocked with `react-native-reanimated/mock` to avoid native animation internals during tests.
- `Buffer` is polyfilled in `jest.setup.js` because some utilities use Node Buffer APIs.


Recommendation: keep the `__mocks__` directory at the project root (e.g. `FingerStrength/__mocks__/react-native-ble-plx.js`). Jest will automatically resolve manual mocks placed in a top-level `__mocks__` folder, which keeps test setup simple and avoids additional Jest configuration.

## Running tests locally
1. Install dependencies (this project uses `package-lock.json`; to avoid peer dependency issues run):

```bash
cd FingerStrength
npm install --legacy-peer-deps
```

2. Run all tests:

```bash
npm test
# or explicitly:
npm test -- --runInBand
```

3. Watch mode (during development):

```bash
npm run test:watch
```

4. Coverage report:

```bash
npm run test:coverage
# open coverage/lcov-report/index.html in a browser
```

Notes:
- `npm install --legacy-peer-deps` was used to avoid peer-dependency conflicts with the existing lockfile. After verifying locally, commit the updated `package-lock.json` so CI can use `npm ci`.

## Running tests in CI
- Minimal CI steps:
  1. Checkout repo
  2. Setup Node.js
  3. `npm ci` (if lockfile was updated) or `npm install --legacy-peer-deps` (less ideal)
  4. `npm test -- --ci --runInBand`

If a CI job must run E2E Detox tests, the runner needs Android SDK / Xcode or a cloud device provider and builds created by EAS for the Expo dev client.

## Writing new tests
- Unit tests: create files under `tests/unit` or alongside modules named `*.test.ts`.
- Component tests: use `render()` from `@testing-library/react-native`. If a component relies on context or hooks, wrap it with providers or mock the hook/module.
- Hook tests: use `@testing-library/react-hooks`'s `renderHook`, or mount a tiny component that uses the hook.

Example for simulating BLE data (in a test):

```ts
import { __lastBleManager } from 'react-native-ble-plx';

// After starting a scan in code under test, simulate a device:
const manager = require('react-native-ble-plx').__lastBleManager.instance;
manager._simulateDevice({ id: 'fake1', name: 'WH-C06', manufacturerData: base64Payload });
```

Example: creating a valid payload for `parseWeightData`:

```ts
const buf = Buffer.alloc(14);
buf.writeUInt16BE(1234, 12); // 12.34 kg
const payload = buf.toString('base64');
const weight = parseWeightData(payload);
```


## Next recommended steps
- Add integration tests for `UserContext` to validate load/save and active user flows.
- Add tests for `useBluetooth` using the BLE mock to simulate device discovery and manufacturer data parsing.
- Plan E2E: decide between Detox or Appium. For Expo, plan EAS dev-client builds for Detox.

If you want, I can add an example `UserContext` integration test and a `useBluetooth` test next.

