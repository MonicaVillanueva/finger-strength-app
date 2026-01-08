/**
 * components/StatsSection.tsx
 * Brief: Small section that displays current effort percentage and context compared to max pull.
 * Exports: `StatsSection` component. Props: `weight`, `maxPull`.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '@/constants/colors';

interface StatsSectionProps {
  weight: number;
  maxPull: number;
}

/**
 * Displays a small section with the current effort percentage and context compared to max pull.
 * 
 * @param {number} weight - Current weight in kg.
 * @param {number} maxPull - Maximum weight in kg.
 * @returns {React.ReactElement} - JSX element representing the stats section.
 */
export const StatsSection: React.FC<StatsSectionProps> = ({
  weight,
  maxPull,
}) => {
  const percentage = Math.min((weight / maxPull) * 100, 100);

  /**
   * Returns a zone color based on the given percentage.
   * 
   * @returns {string} - Zone color as a string. Green if percentage is less than 50, Orange if less than 85, and Red otherwise.
  */
  const getZoneColor = (): string => {
    if (percentage < 50) return COLORS.ZONE_GREEN; // Green
    if (percentage < 85) return COLORS.ZONE_ORANGE; // Orange
    return COLORS.ZONE_RED; // Red
  };

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statLabel}>Current Effort</Text>
      <Text style={[styles.percentageText, { color: getZoneColor() }]}>
        {percentage.toFixed(0)}%
      </Text>
      <Text style={styles.subText}>of {maxPull.toFixed(1)}kg Max</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: { alignItems: 'center', marginVertical: 20 },
  statLabel: { color: COLORS.TEXT_ACCENT, fontSize: 16 },
  percentageText: { fontSize: 48, fontWeight: 'bold' },
  subText: { color: COLORS.TEXT_MUTED },
});
