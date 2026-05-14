# Development

1. Create a custom expo app: Because Bluetooth requires low-level hardware access, you cannot use the standard "Expo Go" app from the store. Instead, you must build a "Development Client", basically your own custom version of the Expo Go app that includes the Bluetooth drivers.
* Install the EAS CLI: `npm install -g eas-cli`
* Login: `eas login`
* Configure (Select Android): `eas build:configure`
* Build a development client:
    ```
    eas build --profile development --platform android
    ```

    Wait for the build to finish, download the .apk file, and install it on your phone. Use it instead of the standard Expo app whenever you are developing, e.g. when you scan the QR code after starting the server with `npx expo start --dev-client`.

2. Debug:
* Start the server: `npx expo start --dev-client`
* Connect on the phone using the QR code.
* Open the menu in the phone by shaking it and click on "JS debugger": The React NativeDevTools window will open.
* Go to the "Sources" tab and use it to create breakpoints and debug.

# Production
* Build the production APK development:
    ```
    * eas build --platform android --profile production
    ```

    Wait for the build to finish, download the .apk file, and install it on your phone. Note: If you haven't logged in, it will ask you to run `eas login`.

# Repository Code
## Hierarchy

A concise overview of where to find code in this repository and what each area holds. For a short file-by-file reference, see docs/FILES.md.

- App entry and navigation: `app/` and `app/(tabs)/`
- Reusable UI components: `components/` and `components/ui/`
- Theme and colors: `constants/`
- React hooks and platform helpers: `hooks/`
- Small utility helpers: `utils/`
- Native Android entry and Gradle config: `android/`

See the detailed file reference: docs/FILES.md

## Design notes & possible improvements

- Centralized BLE logic: `hooks/useBluetooth.ts` currently holds BLE side-effects and state. Consider adding stricter separation between device communication (low-level read/notify) and higher-level app state to make testing and error handling simpler.
- Error handling: Ensure BLE errors and permission failures are surfaced to the UI and logged; add retry/backoff where appropriate.
- Resource cleanup: Verify that subscriptions and event listeners from BLE are removed on unmount to avoid leaks.
- State management: If multiple UI pieces depend on device data, a small global store or React context can avoid prop-drilling and duplicated state.
- Platform-specific code: Keep platform-specific components small; prefer feature-detection where possible.
- Tests: Add unit tests for `utils/weightParser.ts` and integration tests for `useBluetooth` using mocks.

# Future Plans

## Development Tests
- [ ] TODO

## New Features
[x] Add profile information: Weight, Max effort 
    [x] Add date to max effort
    [x] Add profile to Home screen
    🪲 Make users have unique names
    [ ] Implement "Guest" user

## Improvements
- [ ] Error display when asking for Bluetooth permissions
- [ ] Max effort persistance
