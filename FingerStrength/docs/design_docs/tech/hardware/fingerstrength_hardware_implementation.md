# Hardware Implementation — WH-C06 (from existing TS code)

Reviewed files:
- C:\Users\monik\Documents\dev\finger-strength-app\FingerStrength\utils\weightParser.ts
- C:\Users\monik\Documents\dev\finger-strength-app\FingerStrength\hooks\useBluetooth.ts

Findings
- Device reading approach: the app parses BLE advertisement manufacturerData (base64) and extracts a 16-bit unsigned value at offset 12 (big-endian), then divides by 100 to yield weight in kilograms.
- UI throttling: weight UI updates are limited to a min interval of 50ms (~20Hz) to avoid flooding the renderer.
- Connection strategy: rather than GATT notifications, the current code keeps scanning and reads broadcasts from the connected device.
- parseWeightData currently returns 0 for short/invalid payloads (buf.length < 14) in the repository code.

Recommendations
- Treat short/invalid packets and sentinel values as "no reading" (return null) instead of 0.0 to avoid false-zero readings and spurious audio cues.
- Implement a robust parser that attempts both big-endian and little-endian parsing and checks for sentinel values (0xFFFF, 0x0000) used to signal no-data.
- Add a "probe" mode in the app to let power users map offsets/scales if different firmware variants exist.
- Keep using advertisement parsing (lightweight) unless GATT notifications are required for higher sample rates or device-specific features.
- For reliable background scanning on Android, implement a native foreground service (or use a small native module/library). React Native alone cannot reliably keep BLE scanning alive in the background without platform-native support.

TypeScript adaptation (advertisement / manufacturer data)

```ts
import { Buffer } from 'buffer';

/**
 * Parse WH-C06 weight from base64 manufacturerData.
 * Returns weight in kilograms, or null when no valid measurement is found.
 */
export function parseWeightDataBase64(mfrBase64: string | null): number | null {
  if (!mfrBase64) return null;
  try {
    const buf = Buffer.from(mfrBase64, 'base64');
    if (buf.length < 14) return null;

    const rawBE = buf.readUInt16BE(12);
    const rawLE = buf.readUInt16LE(12);

    const isInvalid = (v: number) => v === 0xFFFF || v === 0 || v > 20000;

    // Prefer BE if plausible, otherwise fallback to LE
    if (!isInvalid(rawBE)) return rawBE / 100;
    if (!isInvalid(rawLE)) return rawLE / 100;

    return null;
  } catch (err) {
    console.warn('parseWeightDataBase64 error', err);
    return null;
  }
}
```

Edge cases / UX notes
- When the parser returns null: do not update the displayed weight; keep the last valid reading and show an optional "No data" indicator.
- Avoid writing a 0 reading into profile statistics; require non-null readings for session summaries and max-pull updates.
- Store internal measurements in kilograms (kg) and convert for display.
- Consider a small calibration UI (probe mode) allowing the user to confirm mapping and units if multiple firmware variants exist.

Open questions (need confirmation)
1. Is the WH-C06 advertising manufacturerData always >= 14 bytes and using BE uint16 at offset 12 across your devices? If not, what variants exist?
2. Can the scale be configured to use lb instead of kg, or does it always advertise kg? How does firmware signal unit?
3. Are there sentinel or flag values (0xFFFF, 0) used to indicate "no measurement" or error states?
