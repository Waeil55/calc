import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useHaptics } from '@/hooks/useHaptics';

export const SecondFunctionKey = React.memo(function SecondFunctionKey() {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const { isSecondFunction, toggleSecondFunction } = useCalculatorStore();

  return (
    <Pressable
      onPress={() => { trigger(); toggleSecondFunction(); }}
      accessibilityRole="button"
      accessibilityLabel="Second function"
      accessibilityHint={isSecondFunction ? 'Active — tap to deactivate' : 'Tap to show alternate functions'}
      accessibilityState={{ selected: isSecondFunction }}
      style={[
        styles.btn,
        {
          backgroundColor: isSecondFunction ? colors.accentPrimary : colors.bgMuted,
          borderColor: colors.accentPrimary,
          minWidth: 44,
          minHeight: 36,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isSecondFunction ? '#FFFFFF' : colors.accentPrimary },
        ]}
      >
        2nd
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '700' },
});
