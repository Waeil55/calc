import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

export function useHaptics() {
  const hapticLevel = useSettingsStore((s) => s.hapticLevel);

  const trigger = () => {
    if (hapticLevel === 'off') return;
    const style =
      hapticLevel === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : hapticLevel === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;
    Haptics.impactAsync(style);
  };

  const triggerSuccess = () => {
    if (hapticLevel === 'off') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerError = () => {
    if (hapticLevel === 'off') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return { trigger, triggerSuccess, triggerError };
}
