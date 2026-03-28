import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { HistoryEntry } from '@/types';

const MODULE_COLORS: Record<string, string> = {
  basic: '#6C63FF',
  scientific: '#00D4FF',
  graphing: '#00E5A0',
  financial: '#FFB547',
  currency: '#FF6B9D',
  unit: '#A78BFA',
  programmer: '#F59E0B',
  statistics: '#10B981',
  matrix: '#EF4444',
  equation: '#8B5CF6',
  datetime: '#06B6D4',
  health: '#EC4899',
};

interface Props {
  entry: HistoryEntry;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export function HistoryCard({ entry, onPress, onToggleFavorite, onDelete }: Props) {
  const { colors } = useTheme();
  const moduleColor = MODULE_COLORS[entry.module] ?? colors.accentPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.bgSurface }]}
      accessibilityRole="button"
      accessibilityLabel={`${entry.expression} equals ${entry.result}`}
    >
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: moduleColor }]} />

      <View style={styles.body}>
        {/* Module badge + timestamp */}
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: moduleColor + '22' }]}>
            <Text style={[styles.badgeLabel, { color: moduleColor }]}>{entry.module}</Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.textDisabled }]}>
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Expression */}
        <Text style={[styles.expression, { color: colors.textSecondary }]} numberOfLines={2}>
          {entry.expression}
        </Text>

        {/* Result */}
        <Text style={[styles.result, { color: colors.textPrimary }]} numberOfLines={1} selectable>
          = {entry.result}
        </Text>

        {/* Note if present */}
        {!!entry.note && (
          <Text style={[styles.note, { color: colors.textDisabled }]} numberOfLines={1}>
            📝 {entry.note}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={onToggleFavorite}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel={entry.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={8}
        >
          <Text style={{ fontSize: 20 }}>{entry.isFavorited ? '★' : '☆'}</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Delete entry"
          hitSlop={8}
        >
          <Text style={[styles.deleteIcon, { color: colors.textDisabled }]}>🗑</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 12, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLabel: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  timestamp: { fontSize: 11 },
  expression: { fontSize: 13 },
  result: { fontSize: 20, fontWeight: '700' },
  note: { fontSize: 11 },
  actions: { paddingVertical: 8, paddingRight: 8, justifyContent: 'space-around' },
  actionBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
});
