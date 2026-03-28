import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvAdapter';
import { evaluate as mathEvaluate } from '@/utils/mathEngine';
import type { CalcModule, AngleMode } from '@/types';

interface CalculatorState {
  currentExpression: string;
  currentResult: string;
  previousResult: string;
  memory: number;
  angleMode: AngleMode;
  isSecondFunction: boolean;
  activeModule: CalcModule;
  setExpression: (expr: string) => void;
  appendToExpression: (token: string) => void;
  evaluate: () => void;
  clear: () => void;
  clearEntry: () => void;
  backspace: () => void;
  toggleNegative: () => void;
  toggleSecondFunction: () => void;
  setAngleMode: (mode: AngleMode) => void;
  setActiveModule: (module: CalcModule) => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  insertAnswer: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      currentExpression: '',
      currentResult: '0',
      previousResult: '0',
      memory: 0,
      angleMode: 'deg',
      isSecondFunction: false,
      activeModule: 'basic',

      setExpression: (expr) => set({ currentExpression: expr }),

      appendToExpression: (token) => {
        const { currentExpression } = get();
        set({ currentExpression: currentExpression + token });
      },

      evaluate: () => {
        const { currentExpression, angleMode } = get();
        if (!currentExpression.trim()) return;
        const result = mathEvaluate(currentExpression, angleMode);
        if (result.error) {
          set({ currentResult: 'Error' });
        } else {
          set({
            currentResult: result.value,
            previousResult: result.value,
          });
        }
      },

      clear: () =>
        set({ currentExpression: '', currentResult: '0' }),

      clearEntry: () => {
        const { currentExpression } = get();
        // Remove the last number token
        const trimmed = currentExpression.replace(/[\d.]+$/, '');
        set({ currentExpression: trimmed });
      },

      backspace: () => {
        const { currentExpression } = get();
        set({ currentExpression: currentExpression.slice(0, -1) });
      },

      toggleNegative: () => {
        const { currentExpression } = get();
        // Toggle negative on last number
        const match = currentExpression.match(/(.*?)(-?[\d.]+)$/);
        if (match) {
          const prefix = match[1];
          const num = match[2];
          const toggled = num.startsWith('-') ? num.slice(1) : '-' + num;
          set({ currentExpression: prefix + toggled });
        } else if (!currentExpression) {
          set({ currentExpression: '-' });
        }
      },

      toggleSecondFunction: () =>
        set((s) => ({ isSecondFunction: !s.isSecondFunction })),

      setAngleMode: (mode) => set({ angleMode: mode }),
      setActiveModule: (module) => set({ activeModule: module }),

      memoryAdd: () => {
        const { memory, currentResult } = get();
        const num = parseFloat(currentResult);
        if (!isNaN(num)) set({ memory: memory + num });
      },

      memorySubtract: () => {
        const { memory, currentResult } = get();
        const num = parseFloat(currentResult);
        if (!isNaN(num)) set({ memory: memory - num });
      },

      memoryRecall: () => {
        const { memory, currentExpression } = get();
        set({ currentExpression: currentExpression + String(memory) });
      },

      memoryClear: () => set({ memory: 0 }),

      insertAnswer: () => {
        const { previousResult, currentExpression } = get();
        set({ currentExpression: currentExpression + previousResult });
      },
    }),
    {
      name: 'calculator-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        angleMode: state.angleMode,
        memory: state.memory,
        previousResult: state.previousResult,
        activeModule: state.activeModule,
      }),
    }
  )
);
