export const darkColors = {
  bgBase: '#0A0A0F',
  bgSurface: '#13131A',
  bgElevated: '#1C1C27',
  bgMuted: '#252535',
  accentPrimary: '#6C63FF',
  accentSecondary: '#00D4FF',
  accentSuccess: '#00E5A0',
  accentWarning: '#FFB547',
  accentDanger: '#FF4D6D',
  textPrimary: '#F0EFF8',
  textSecondary: '#8B8AA3',
  textDisabled: '#4A4A5F',
  btnOperator: '#1E1E32',
  btnFunction: '#1A1A28',
  btnDigit: '#16161F',
  btnEquals: '#6C63FF',
  btnClear: '#FF4D6D',
  border: '#2A2A3D',
};

export const lightColors = {
  bgBase: '#FAF9F6',
  bgSurface: '#FFFFFF',
  bgElevated: '#F0EFF5',
  bgMuted: '#E8E7ED',
  accentPrimary: '#6C63FF',
  accentSecondary: '#00D4FF',
  accentSuccess: '#00E5A0',
  accentWarning: '#FFB547',
  accentDanger: '#FF4D6D',
  textPrimary: '#0D0D2B',
  textSecondary: '#5A5A7A',
  textDisabled: '#A0A0B8',
  btnOperator: '#E8E7F0',
  btnFunction: '#EEEDF5',
  btnDigit: '#F5F4FA',
  btnEquals: '#6C63FF',
  btnClear: '#FF4D6D',
  border: '#D8D8E5',
};

export const accentPresets = {
  indigo: { primary: '#6C63FF', gradient: ['#6C63FF', '#8B83FF'] },
  cyan: { primary: '#00D4FF', gradient: ['#00D4FF', '#33DFFF'] },
  emerald: { primary: '#00E5A0', gradient: ['#00E5A0', '#33EBB3'] },
  amber: { primary: '#FFB547', gradient: ['#FFB547', '#FFC76C'] },
  rose: { primary: '#FF4D6D', gradient: ['#FF4D6D', '#FF708A'] },
  violet: { primary: '#A855F7', gradient: ['#A855F7', '#BC79F9'] },
} as const;

export type ColorPalette = typeof darkColors;
