# Hardware integration (WH-C06 BLE)

Current knowns:
- Device: WH-C06 connects over Bluetooth Low Energy (BLE) (confirmed by user).
- In this project the app reads manufacturerData from BLE advertisements (react-native-ble-plx) and extracts weight from a 16-bit value at offset 12 (/100 → kg).

Approach (React Native)
- BLE library: react-native-ble-plx for scanning and device metadata. Use advertisement scanning (no GATT connect) for lightweight live streaming.
- Permissions:
  - Android: request runtime permissions using PermissionsAndroid or react-native-permissions. On Android 12+ request BLUETOOTH_SCAN and BLUETOOTH_CONNECT; for older Android also request ACCESS_FINE_LOCATION. Example: PermissionsAndroid.requestMultiple([...]).
  - iOS: include NSBluetoothAlwaysUsageDescription / NSBluetoothPeripheralUsageDescription in Info.plist and handle background modes if needed.
  - Expo-managed: Bluetooth support requires a custom dev client/EAS build for react-native-ble-plx.
- Background/long sessions:
  - Android: to keep scanning while app backgrounded, start a native foreground service with a persistent notification. Implement directly in native code or use a small native package. The foreground service must manage the BleManager lifecycle.
  - iOS: background BLE scanning is limited and requires correct Info.plist background modes; behavior differs and may not support continuous scanning.
- Device pairing & reconnection:
  - Offer a simple scan-and-select UI, persist device id/name for quick reconnect.
  - Use manufacturerData filtering to detect WH-C06 adverts and optionally mark a device as "preferred".
- Probe mode:
  - Provide a probe UI that shows raw manufacturerData (base64/hex) and numeric candidates (e.g., readUInt16BE/LE at offsets). Let advanced users choose mapping and save it for the device.
- Data encoding & units:
  - Primary assumption (confirmed): BE uint16 at offset 12 → raw/100 = kg. Parser should be robust to variants and return null when unclear.

Decisions (added):
- Android minSdk: 29 (Android 10) — background BLE scanning will require a native foreground service implementation on Android.
- Foreground service for RN:
  - React Native cannot natively create long-lived background tasks without platform code. Options:
    - Write a small native Android service that maintains BleManager and communicates with JS via events (recommended for production).
    - Use an existing community package that supports Android foreground services and BLE.
    - For Expo, create a custom dev client and build with EAS to include native modules.

Security & UX
- No remote pairing key exchange; treat WH-C06 as a local trusted peripheral.
- Persist only device metadata by default; allow the user to forget devices.
- Expose device diagnostics for troubleshooting (lastSeen, lastPayload).