import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useHaptics } from '@/hooks/useHaptics';
import type { AngleMode } from '@/types';

const MODES: AngleMode[] = ['deg', 'rad', 'grad'];
const MODE_LABELS: Record<AngleMode, string> = {
  deg: 'DEG',
  rad: 'RAD',
  grad: 'GRAD',
};

export const AngleModeToggle = React.memo(function AngleModeToggle() {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const { angleMode, setAngleMode } = useCalculatorStore();
  const flipValue = useSharedValue(0);

  const handlePress = () => {
    trigger();
    const currentIndex = MODES.indexOf(angleMode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length];
    flipValue.value = withTiming(flipValue.value + 1, { duration: 200 });
    setAngleMode(nextMode);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${flipValue.value * 180}deg` }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Angle mode: ${angleMode}. Tap to change.`}
      accessibilityHint="Toggles between degrees, radians, and gradians"
      style={[
        styles.toggle,
        {
          backgroundColor: colors.accentPrimary + '22',
          borderColor: colors.accentPrimary,
          minWidth: 56,
          minHeight: 36,
        },
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Text style={[styles.label, { color: colors.accentPrimary }]}>
          {MODE_LABELS[angleMode]}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  toggle: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
});
