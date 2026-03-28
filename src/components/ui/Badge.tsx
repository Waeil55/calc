import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { CalcModule } from '@/types';

const MODULE_COLORS: Record<CalcModule, string> = {
  basic: '#6C63FF',
  scientific: '#00D4FF',
  graphing: '#00E5A0',
  financial: '#FFB547',
  unit: '#FF6B9D',
  currency: '#F59E0B',
  programmer: '#8B5CF6',
  statistics: '#EC4899',
  matrix: '#06B6D4',
  equation: '#10B981',
  datetime: '#F97316',
  health: '#EF4444',
};

interface BadgeProps {
  label: string;
  module?: CalcModule;
  color?: string;
}

export const Badge = React.memo(function Badge({ label, module, color }: BadgeProps) {
  const { colors } = useTheme();
  const bgColor = color ?? (module ? MODULE_COLORS[module] : colors.accentPrimary);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor + '33' }]}>
      <Text style={[styles.label, { color: bgColor }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
