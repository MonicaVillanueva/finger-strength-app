import { Buffer } from 'buffer';

export const base64ToHex = (base64: string): string => {
  const binary = Buffer.from(base64, 'base64').toString('binary');
  return Array.from(binary)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
};

export const parseWeightData = (manufacturerData: string | null): number => {
  if (!manufacturerData) return 0;

  try {
    const hexData = base64ToHex(manufacturerData);
    const weightHex = hexData.substring(24, 28);
    return parseInt(weightHex, 16) / 100;
  } catch (error) {
    console.error('Error parsing weight data:', error);
    return 0;
  }
};
