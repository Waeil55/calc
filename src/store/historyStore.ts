import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvAdapter';
import { v4 as uuidv4 } from 'uuid';
import type { HistoryEntry, HistoryFilter, CalcModule } from '@/types';

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'isFavorited' | 'isDeleted'>) => void;
  updateEntry: (id: string, updates: Partial<HistoryEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearAll: () => void;
  searchEntries: (query: string) => HistoryEntry[];
  getFilteredEntries: (filter: HistoryFilter) => HistoryEntry[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: uuidv4(),
              timestamp: Date.now(),
              isFavorited: false,
              isDeleted: false,
            },
            ...state.entries,
          ],
        })),

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isDeleted: true } : e
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isFavorited: !e.isFavorited } : e
          ),
        })),

      clearAll: () => set({ entries: [] }),

      searchEntries: (query) => {
        const { entries } = get();
        const q = query.toLowerCase();
        return entries.filter(
          (e) =>
            !e.isDeleted &&
            (e.expression?.toLowerCase().includes(q) ||
              e.result.toLowerCase().includes(q) ||
              e.label?.toLowerCase().includes(q) ||
              e.note?.toLowerCase().includes(q) ||
              e.tags?.some((t) => t.toLowerCase().includes(q)))
        );
      },

      getFilteredEntries: (filter) => {
        const { entries } = get();
        return entries.filter((e) => {
          if (e.isDeleted) return false;
          if (filter.module && e.module !== filter.module) return false;
          if (filter.dateFrom && e.timestamp < filter.dateFrom) return false;
          if (filter.dateTo && e.timestamp > filter.dateTo) return false;
          if (filter.isFavorited && !e.isFavorited) return false;
          if (filter.hasNote && !e.note) return false;
          if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase();
            const matches =
              e.expression?.toLowerCase().includes(q) ||
              e.result.toLowerCase().includes(q) ||
              e.label?.toLowerCase().includes(q) ||
              e.note?.toLowerCase().includes(q);
            if (!matches) return false;
          }
          return true;
        });
      },
    }),
    {
      name: 'history-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
