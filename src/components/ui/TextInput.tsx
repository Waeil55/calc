import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StyledTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  accessibilityLabel: string;
}

export const TextInput = React.memo(function TextInput({
  label,
  error,
  accessibilityLabel,
  ...props
}: StyledTextInputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <RNTextInput
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: colors.bgMuted,
            borderColor: error ? colors.accentDanger : colors.border,
            color: colors.textPrimary,
          },
        ]}
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={props.placeholder}
      />
      {error && (
        <Text style={[styles.error, { color: colors.accentDanger }]}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
  },
  error: { fontSize: 12, marginTop: 4 },
});
