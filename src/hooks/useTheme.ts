import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { darkColors, lightColors, accentPresets } from '@/theme/colors';
import { fontSizeScale } from '@/theme/typography';
import type { ColorPalette } from '@/theme/colors';

export interface ThemeValues {
  colors: ColorPalette;
  isDark: boolean;
  accent: { primary: string; gradient: readonly string[] };
  fontScale: number;
}

export function useTheme(): ThemeValues {
  const systemScheme = useColorScheme();
  const { theme, accentColor, fontSize } = useSettingsStore();

  const isDark =
    theme === 'system' ? systemScheme !== 'light' : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;
  const accent = accentPresets[accentColor];
  const fontScale = fontSizeScale[fontSize];

  return { colors, isDark, accent, fontScale };
}
