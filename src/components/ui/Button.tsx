import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, AccessibilityRole } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import type { ButtonVariant } from '@/types';

interface ButtonProps {
  label: string;
  altLabel?: string;
  isAlt?: boolean;
  variant?: ButtonVariant;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  flex?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = React.memo(function Button({
  label,
  altLabel,
  isAlt = false,
  variant = 'digit',
  onPress,
  onLongPress,
  disabled = false,
  flex = 1,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.93, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    trigger();
    onPress();
  }, [trigger, onPress]);

  const bgColor = getBackgroundColor(variant, colors);
  const textColor = getTextColor(variant, colors);
  const borderColor = variant === 'operator' ? colors.accentPrimary : 'transparent';

  const displayLabel = isAlt && altLabel ? altLabel : label;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        animatedStyle,
        {
          flex,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'operator' ? 1 : 0,
          opacity: disabled ? 0.4 : 1,
          minWidth: 44,
          minHeight: 44,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontSize: displayLabel.length > 3 ? 14 : 20,
            fontFamily: 'System',
            fontWeight: '600',
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayLabel}
      </Text>
    </AnimatedPressable>
  );
});

function getBackgroundColor(variant: ButtonVariant, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (variant) {
    case 'digit': return colors.btnDigit;
    case 'operator': return colors.btnOperator;
    case 'function': return colors.btnFunction;
    case 'equals': return colors.accentPrimary;
    case 'clear': return '#FF4D6D33';
    default: return colors.btnDigit;
  }
}

function getTextColor(variant: ButtonVariant, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (variant) {
    case 'equals': return '#FFFFFF';
    case 'clear': return '#FF4D6D';
    case 'operator': return colors.accentPrimary;
    default: return colors.textPrimary;
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  label: {
    textAlign: 'center',
  },
});
