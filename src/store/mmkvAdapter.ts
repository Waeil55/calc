import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkvInstance = createMMKV({ id: 'calcpro-store' });

export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = mmkvInstance.getString(name);
    return value !== undefined ? value : null;
  },
  setItem: (name: string, value: string): void => {
    mmkvInstance.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkvInstance.remove(name);
  },
};
