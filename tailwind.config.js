/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0F',
        'bg-surface': '#13131A',
        'bg-elevated': '#1C1C27',
        'bg-muted': '#252535',
        'accent-primary': '#6C63FF',
        'accent-secondary': '#00D4FF',
        'accent-success': '#00E5A0',
        'accent-warning': '#FFB547',
        'accent-danger': '#FF4D6D',
        'text-primary': '#F0EFF8',
        'text-secondary': '#8B8AA3',
        'text-disabled': '#4A4A5F',
        'btn-operator': '#1E1E32',
        'btn-function': '#1A1A28',
        'btn-digit': '#16161F',
        'light-bg': '#FAF9F6',
        'light-text': '#0D0D2B',
      },
      fontFamily: {
        'mono': ['JetBrainsMono'],
        'mono-light': ['JetBrainsMono-Light'],
      },
      borderRadius: {
        'btn': '16px',
        'card': '24px',
        'modal': '32px',
      },
    },
  },
  plugins: [],
};
