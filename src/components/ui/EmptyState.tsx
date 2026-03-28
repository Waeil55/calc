import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState = React.memo(function EmptyState({ title, message, icon }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
