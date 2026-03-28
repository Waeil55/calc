import React from 'react';
import { Pressable, StyleSheet, AccessibilityRole } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'default' | 'primary' | 'danger';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const IconButton = React.memo(function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  variant = 'default',
}: IconButtonProps) {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgColor =
    variant === 'primary'
      ? colors.accentPrimary + '22'
      : variant === 'danger'
        ? '#FF4D6D22'
        : colors.bgMuted;

  return (
    <AnimatedPressable
      onPress={() => { trigger(); onPress(); }}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[
        animatedStyle,
        styles.btn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
});
