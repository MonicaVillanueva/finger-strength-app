Project file reference (concise)

Top-level
- `app.json` / `eas.json`: Expo/EAS configuration for building and publishing.
- `package.json`: npm dependencies and scripts for the project.
- `tsconfig.json`: TypeScript configuration.
- `README.md`: Project readme (this file links to this reference).

app/
- `_layout.tsx`: App shell and navigation layout for routes at the app root.
- `modal.tsx`: Shared modal used for app-level dialogs and overlays.

app/(tabs)/
- `_layout.tsx`: Layout for the tab-based area of the app (tab navigator container).
- `index.js`: Tab entry or simple route index (JS shim for navigation if needed).
 - `explore.tsx`: Example/demo screen — currently replaced with a minimal stub.

components/
- `ControlButtons.tsx`: UI for primary interactive buttons (start/stop, etc.).
- `DeviceModal.tsx`: Modal UI to list/select Bluetooth devices and show connection status.
- `DisplayRing.tsx`: Visual ring component (likely used to show progress or measured values).
- `haptic-tab.tsx`: A tab component focused on haptics or feedback features.
- `StatsSection.tsx`: UI showing statistics/metrics collected by the app.
- `themed-text.tsx` / `themed-view.tsx`: Small wrappers that apply theme colors to Text/View.

components/ui/
- `icon-symbol.ios.tsx` / `icon-symbol.tsx`: Platform-specific icon components; `.ios` is iOS-optimized if present.

constants/
- `colors.ts`: Color palette used across the app.
- `theme.ts`: Theme definitions and mappings (dark/light, semantic colors).

hooks/
- `use-color-scheme.ts` / `use-color-scheme.web.ts`: Hooks to detect system color scheme; web-specific variant.
- `use-theme-color.ts`: Hook to map semantic color names to concrete colors from `theme.ts`.
- `useBluetooth.ts`: Custom hook encapsulating Bluetooth scanning, connecting, and device communication.
  - This is the primary place for BLE logic and side-effects; it likely exposes connect/disconnect and read/notify handlers.

utils/
- `weightParser.ts`: Utility to parse and format weight values (probably for force measurements or conversions).

android/
- Native Android Gradle and project files live here. See `app/src/main/java/.../MainActivity.kt` and `MainApplication.kt` for the native entrypoints and any native module registration.

Notes about locating code
- UI is primarily under `app/` and `components/`.
- App-level layout and navigation lives in `app/_layout.tsx` and `app/(tabs)/_layout.tsx`.
- Platform differences are handled by filename suffixes (e.g., `.ios.tsx`) and small platform-specific hooks in `hooks/`.
- BLE and device logic is centralized in `hooks/useBluetooth.ts` — check that first when tracking connection behavior.

If you'd like, I can expand any individual file's description with function+prop summaries or add JSDoc blocks into source files themselves.
