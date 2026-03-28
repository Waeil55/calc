/**
 * Unit tests for HistoryCard component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HistoryCard } from '@/components/history/HistoryCard';
import type { HistoryEntry } from '@/types';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      bgSurface: '#1A1A2E',
      bgMuted: '#252540',
      accentPrimary: '#6C63FF',
      textPrimary: '#FFFFFF',
      textSecondary: '#A0A0C0',
      textDisabled: '#606080',
      border: '#2E2E4E',
    },
  }),
}));

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'test-id-1',
    timestamp: new Date('2024-01-15T10:00:00').getTime(),
    module: 'basic',
    expression: '3 + 4',
    result: '7',
    isFavorited: false,
    isDeleted: false,
    ...overrides,
  };
}

describe('HistoryCard component', () => {
  it('renders expression and result', () => {
    const { getByText } = render(<HistoryCard entry={makeEntry()} />);
    expect(getByText('3 + 4')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <HistoryCard entry={makeEntry()} onPress={mockPress} />
    );
    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleFavorite when favorite button pressed', () => {
    const mockFav = jest.fn();
    const { getByLabelText } = render(
      <HistoryCard entry={makeEntry()} onToggleFavorite={mockFav} />
    );
    const favBtn = getByLabelText(/favorite/i);
    fireEvent.press(favBtn);
    expect(mockFav).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button pressed', () => {
    const mockDelete = jest.fn();
    const { getByLabelText } = render(
      <HistoryCard entry={makeEntry()} onDelete={mockDelete} />
    );
    const delBtn = getByLabelText(/delete/i);
    fireEvent.press(delBtn);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('shows filled star when entry is favorited', () => {
    const { getByText } = render(<HistoryCard entry={makeEntry({ isFavorited: true })} />);
    expect(getByText('★')).toBeTruthy();
  });

  it('shows empty star when entry is not favorited', () => {
    const { getByText } = render(<HistoryCard entry={makeEntry({ isFavorited: false })} />);
    expect(getByText('☆')).toBeTruthy();
  });

  it('renders optional note when present', () => {
    const { getByText } = render(
      <HistoryCard entry={makeEntry({ note: 'Important calculation' })} />
    );
    expect(getByText('Important calculation')).toBeTruthy();
  });

  it('renders the module badge', () => {
    const { getByText } = render(<HistoryCard entry={makeEntry({ module: 'scientific' })} />);
    expect(getByText('scientific')).toBeTruthy();
  });
});
