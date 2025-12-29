import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../constants/colors';

interface StatsSectionProps {
  weight: number;
  maxPull: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  weight,
  maxPull,
}) => {
  const percentage = Math.min((weight / maxPull) * 100, 100);

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
