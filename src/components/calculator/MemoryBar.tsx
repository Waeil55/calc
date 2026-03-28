import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useHaptics } from '@/hooks/useHaptics';

export const MemoryBar = React.memo(function MemoryBar() {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const { memory, memoryAdd, memorySubtract, memoryRecall, memoryClear } =
    useCalculatorStore();

  const hasMemory = memory !== 0;

  const ops: Array<{ label: string; action: () => void; hint: string }> = [
    { label: 'MC', action: memoryClear, hint: 'Memory clear' },
    { label: 'MR', action: memoryRecall, hint: 'Memory recall' },
    { label: 'M+', action: memoryAdd, hint: 'Memory add' },
    { label: 'M−', action: memorySubtract, hint: 'Memory subtract' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSurface }]}>
      {ops.map((op) => (
        <Pressable
          key={op.label}
          onPress={() => { trigger(); op.action(); }}
          accessibilityRole="button"
          accessibilityLabel={op.hint}
          style={[
            styles.btn,
            { minWidth: 44, minHeight: 36 },
            op.label === 'MR' && hasMemory && { backgroundColor: colors.accentPrimary + '33' },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color:
                  op.label === 'MR' && hasMemory
                    ? colors.accentPrimary
                    : colors.textSecondary,
              },
            ]}
          >
            {op.label}
          </Text>
        </Pressable>
      ))}
      {hasMemory && (
        <View style={[styles.indicator, { backgroundColor: colors.accentPrimary }]}>
          <Text style={styles.indicatorText}>M: {memory}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  label: { fontSize: 13, fontWeight: '600' },
  indicator: {
    marginLeft: 'auto',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  indicatorText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
});
