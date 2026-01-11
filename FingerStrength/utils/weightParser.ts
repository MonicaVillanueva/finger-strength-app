/**
 * utils/weightParser.ts
 * Brief: Helpers for parsing weight values out of BLE manufacturer/advertisement data.
 * - `base64ToHex`: convert base64-encoded manufacturer data to a hex string.
 * - `parseWeightData`: extract weight value (kg) from the advertisement payload.
 * Notes: Parsing logic derived from WH-C06 device format (see project source comments).
 * 
 * Code adapted from github.com/Stevie-Ray/hangtime-grip-connect, in particular,
 * main/packages/react-native/src/models/device/wh-c06.model.ts
 */
import { Buffer } from 'buffer';


/**
 * Convert base64-encoded manufacturer data to a hex string.
 * @param {string} base64 - The base64-encoded manufacturer data.
 * @returns {string} The hex string representation of the manufacturer data.
 * @throws {Error} If the base64 string is invalid. 
 */
export const base64ToHex = (base64: string): string => {
  const binary = Buffer.from(base64, 'base64').toString('binary');
  return Array.from(binary)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Parse the weight value (kg) from the advertisement payload.
 * @param {string | null} manufacturerData - The base64-encoded manufacturer data.
 * @returns {number} The parsed weight value in kg.
 * @throws {Error} If the base64 string is invalid.
 * @example
 * const weight = parseWeightData('gAEBHgw='); // 12.34
 */
export const parseWeightData = (manufacturerData: string | null): number => {
  if (!manufacturerData) return 0;

  try {
    // Work directly with Buffer to avoid creating intermediate strings/arrays.
    const buf = Buffer.from(manufacturerData, 'base64');
    // Ensure we have at least 14 bytes (we read 2 bytes starting at offset 12)
    if (buf.length >= 14) {
      const raw = buf.readUInt16BE(12);
      return raw / 100;
    }
    return 0;
  } catch (error) {
    console.error('Error parsing weight data:', error);
    return 0;
  }
};
