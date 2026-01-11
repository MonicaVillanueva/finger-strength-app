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
  status: string;
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
  status,
}) => {
  const percentage = Math.min((weight / maxPull) * 100, 100);
  const zoneColor = getZoneColor(percentage);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>FingerStrenth</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.ringContainer}>
        <View style={[styles.ring, { borderColor: zoneColor }]}>
          <Text style={styles.weightText}>{weight.toFixed(2)}</Text>
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statLabel}>Current Load</Text>
        <Text style={[styles.percentageText, { color: zoneColor }]}>
          {percentage.toFixed(0)}%
        </Text>
        <Text style={styles.subText}>of {maxPull.toFixed(1)}kg Max</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
  status: { color: COLORS.TEXT_SECONDARY, marginTop: 5 },
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  ring: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE,
  },
  weightText: { fontSize: 60, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
  unitText: { fontSize: 20, color: COLORS.TEXT_SECONDARY },
  statsContainer: { alignItems: 'center', marginVertical: 20 },
  statLabel: { color: COLORS.TEXT_ACCENT, fontSize: 16 },
  percentageText: { fontSize: 48, fontWeight: 'bold' },
  subText: { color: COLORS.TEXT_MUTED },
});
