import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvAdapter';
import type { ThemeMode, AccentColor, FontSize, HapticLevel, AngleMode, AutoSave } from '@/types';

interface SettingsState {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  precision: number;
  thousandsSeparator: boolean;
  numberFormat: 'comma-dot' | 'dot-comma';
  angleMode: AngleMode;
  hapticLevel: HapticLevel;
  soundEnabled: boolean;
  autoSave: AutoSave;
  clearOnNewSession: boolean;
  historyRetention: 30 | 90 | 365 | 0; // 0 = forever
  baseCurrency: string;
  currencyAutoUpdate: 'wifi' | 'always' | 'manual';
  isPro: boolean;
  // Setters
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: FontSize) => void;
  setPrecision: (p: number) => void;
  setThousandsSeparator: (v: boolean) => void;
  setNumberFormat: (f: 'comma-dot' | 'dot-comma') => void;
  setAngleMode: (m: AngleMode) => void;
  setHapticLevel: (l: HapticLevel) => void;
  setSoundEnabled: (v: boolean) => void;
  setAutoSave: (a: AutoSave) => void;
  setClearOnNewSession: (v: boolean) => void;
  setHistoryRetention: (d: 30 | 90 | 365 | 0) => void;
  setBaseCurrency: (c: string) => void;
  setCurrencyAutoUpdate: (m: 'wifi' | 'always' | 'manual') => void;
  setIsPro: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      accentColor: 'indigo',
      fontSize: 'md',
      precision: 10,
      thousandsSeparator: true,
      numberFormat: 'comma-dot',
      angleMode: 'deg',
      hapticLevel: 'medium',
      soundEnabled: false,
      autoSave: 'always',
      clearOnNewSession: false,
      historyRetention: 0,
      baseCurrency: 'USD',
      currencyAutoUpdate: 'wifi',
      isPro: false,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontSize: (fontSize) => set({ fontSize }),
      setPrecision: (precision) => set({ precision }),
      setThousandsSeparator: (thousandsSeparator) => set({ thousandsSeparator }),
      setNumberFormat: (numberFormat) => set({ numberFormat }),
      setAngleMode: (angleMode) => set({ angleMode }),
      setHapticLevel: (hapticLevel) => set({ hapticLevel }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setClearOnNewSession: (clearOnNewSession) => set({ clearOnNewSession }),
      setHistoryRetention: (historyRetention) => set({ historyRetention }),
      setBaseCurrency: (baseCurrency) => set({ baseCurrency }),
      setCurrencyAutoUpdate: (currencyAutoUpdate) => set({ currencyAutoUpdate }),
      setIsPro: (isPro) => set({ isPro }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
