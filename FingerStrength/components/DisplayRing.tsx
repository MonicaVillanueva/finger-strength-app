/**
 * components/DisplayRing.tsx
 * Brief: Visual ring component to display current weight, percent of max, and status.
 * Exports: `DisplayRing` React component. Props: `weight`, `maxPull`, `status`.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface DisplayRingProps {
  weight: number;
  maxPull: number;
}

/**
 * Returns a zone color based on the given percentage.
 * - Green if percentage is less than 50,
 * - Orange if percentage is less than 85,
 * - Red otherwise.
 * @param {number} percentage - Percentage value to determine zone color.
 * @return {string} - Zone color as a string.
 */
const getZoneColor = (percentage: number): string => {
  if (percentage < 50) return COLORS.ZONE_GREEN; // Green
  if (percentage < 85) return COLORS.ZONE_ORANGE; // Orange
  return COLORS.ZONE_RED;// Red
};

/**
 * Visual ring component to display current weight, percent of max, and status.
 *
 * @param {number} weight - Current weight in kg.
 * @param {number} maxPull - Maximum weight in kg.
 * @param {string} status - Current connection status.
 */
export const DisplayRing: React.FC<DisplayRingProps> = ({
  weight,
  maxPull,
}) => {
  const percentage = Math.min((weight / maxPull) * 100, 100);
  const zoneColor = getZoneColor(percentage);

  return (
    <View style={styles.ringContainer}>
      <View style={[styles.ring, { borderColor: zoneColor }]}>
        <Text style={styles.weightText}>{weight.toFixed(2)}</Text>
        <Text style={styles.unitText}>kg</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE,
  },
  weightText: { fontSize: 50, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
  unitText: { fontSize: 18, color: COLORS.TEXT_SECONDARY },
});
