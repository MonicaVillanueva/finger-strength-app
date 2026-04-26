import { base64ToHex, parseWeightData } from '../../../utils/weightParser';

describe('weightParser', () => {
  test('base64ToHex converts base64 to hex', () => {
    const b64 = 'AQID'; // bytes 0x01,0x02,0x03
    const hex = base64ToHex(b64);
    expect(hex).toBe('010203');
  });

  test('parseWeightData returns parsed weight for valid payload', () => {
    // construct a 14-byte payload with value 1234 at offset 12 -> 12.34 kg
    const buf = Buffer.alloc(14);
    buf.writeUInt16BE(1234, 12);
    const payload = buf.toString('base64');
    const weight = parseWeightData(payload);
    expect(weight).toBeCloseTo(12.34, 2);
  });

  test('parseWeightData returns 0 for null or short payloads', () => {
    expect(parseWeightData(null)).toBe(0);
    expect(parseWeightData('AAA='))
      .toBe(0);
  });
});
