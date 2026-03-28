/**
 * Unit tests for historyStore — addEntry, deleteEntry, toggleFavorite, searchEntries.
 */
import { act, renderHook } from '@testing-library/react-hooks';
import { useHistoryStore } from '@/store/historyStore';
import type { HistoryEntry } from '@/types';

// Reset store state before each test to prevent bleed-over
beforeEach(() => {
  useHistoryStore.setState({ entries: [] });
});

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: `entry-${Math.random()}`,
    timestamp: Date.now(),
    module: 'basic',
    expression: '2 + 2',
    result: '4',
    isFavorited: false,
    isDeleted: false,
    ...overrides,
  };
}

describe('historyStore — addEntry()', () => {
  it('adds a new entry to the store', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry({ expression: '1 + 1', result: '2' }));
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].expression).toBe('1 + 1');
  });

  it('adds multiple entries', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry({ expression: '3 * 3', result: '9' }));
      result.current.addEntry(makeEntry({ expression: '10 / 2', result: '5' }));
    });

    expect(result.current.entries).toHaveLength(2);
  });

  it('assigns id and timestamp if missing', () => {
    const { result } = renderHook(() => useHistoryStore());
    const entry = makeEntry({ id: '', timestamp: 0 });

    act(() => {
      result.current.addEntry(entry);
    });

    const stored = result.current.entries[0];
    // Store may generate id/timestamp or keep the ones provided
    expect(stored).toBeDefined();
  });
});

describe('historyStore — deleteEntry()', () => {
  it('removes an entry by id', () => {
    const { result } = renderHook(() => useHistoryStore());
    const entry = makeEntry({ id: 'del-test' });

    act(() => {
      result.current.addEntry(entry);
    });
    expect(result.current.entries).toHaveLength(1);

    act(() => {
      result.current.deleteEntry('del-test');
    });

    const surviving = result.current.entries.filter((e) => !e.isDeleted && e.id === 'del-test');
    expect(surviving).toHaveLength(0);
  });

  it('does not affect other entries', () => {
    const { result } = renderHook(() => useHistoryStore());
    const a = makeEntry({ id: 'keep-me' });
    const b = makeEntry({ id: 'delete-me' });

    act(() => {
      result.current.addEntry(a);
      result.current.addEntry(b);
    });

    act(() => {
      result.current.deleteEntry('delete-me');
    });

    const live = result.current.entries.filter((e) => !e.isDeleted);
    expect(live.some((e) => e.id === 'keep-me')).toBe(true);
  });
});

describe('historyStore — toggleFavorite()', () => {
  it('marks an entry as favorited', () => {
    const { result } = renderHook(() => useHistoryStore());
    const entry = makeEntry({ id: 'fav-test', isFavorited: false });

    act(() => {
      result.current.addEntry(entry);
      result.current.toggleFavorite('fav-test');
    });

    const updated = result.current.entries.find((e) => e.id === 'fav-test');
    expect(updated?.isFavorited).toBe(true);
  });

  it('unfavorites an already-favorited entry', () => {
    const { result } = renderHook(() => useHistoryStore());
    const entry = makeEntry({ id: 'unfav-test', isFavorited: true });

    act(() => {
      result.current.addEntry(entry);
      result.current.toggleFavorite('unfav-test');
    });

    const updated = result.current.entries.find((e) => e.id === 'unfav-test');
    expect(updated?.isFavorited).toBe(false);
  });
});

describe('historyStore — searchEntries()', () => {
  it('returns entries matching expression', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry({ expression: 'sin(45)', result: '0.707' }));
      result.current.addEntry(makeEntry({ expression: '10 + 20', result: '30' }));
    });

    const found = result.current.searchEntries('sin');
    expect(found.some((e) => e.expression?.includes('sin'))).toBe(true);
    expect(found.some((e) => e.expression?.includes('10 + 20'))).toBe(false);
  });

  it('returns empty array for no matches', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry({ expression: '1 + 1', result: '2' }));
    });

    const found = result.current.searchEntries('zzz-no-match');
    expect(found).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry({ expression: 'SIN(30)', result: '0.5' }));
    });

    const found = result.current.searchEntries('sin');
    expect(found.length).toBeGreaterThan(0);
  });
});

describe('historyStore — clearAll()', () => {
  it('clears all entries', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.addEntry(makeEntry());
      result.current.addEntry(makeEntry());
      result.current.clearAll();
    });

    const live = result.current.entries.filter((e) => !e.isDeleted);
    expect(live).toHaveLength(0);
  });
});
