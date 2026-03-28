import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface DividerProps {
  label?: string;
}

export const Divider = React.memo(function Divider({ label }: DividerProps) {
  const { colors } = useTheme();

  if (label) {
    return (
      <View style={styles.row}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return <View style={[styles.line, styles.solo, { backgroundColor: colors.border }]} />;
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  line: { flex: 1, height: 1 },
  solo: { marginVertical: 8 },
  label: { fontSize: 12, fontWeight: '500', marginHorizontal: 10 },
});
