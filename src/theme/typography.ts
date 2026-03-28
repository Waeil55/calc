import { Platform } from 'react-native';

const systemFont = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const typography = {
  displayXl: {
    fontFamily: 'JetBrainsMono',
    fontSize: 56,
    fontWeight: '300' as const,
    lineHeight: 64,
  },
  displayLg: {
    fontFamily: 'JetBrainsMono',
    fontSize: 36,
    fontWeight: '400' as const,
    lineHeight: 44,
  },
  displayMd: {
    fontFamily: 'JetBrainsMono',
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
  },
  displaySm: {
    fontFamily: 'JetBrainsMono',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelLg: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  labelMd: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  body: {
    fontFamily: systemFont,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: systemFont,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const fontSizeScale = {
  sm: 0.85,
  md: 1.0,
  lg: 1.15,
  xl: 1.35,
} as const;
