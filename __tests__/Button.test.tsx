/**
 * Unit tests for the Button UI component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

// Mock hooks used by Button
jest.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({ trigger: jest.fn() }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      bgSurface: '#1A1A2E',
      bgMuted: '#252540',
      accentPrimary: '#6C63FF',
      textPrimary: '#FFFFFF',
      textSecondary: '#A0A0C0',
      bgElevated: '#22223B',
      border: '#2E2E4E',
    },
  }),
}));

describe('Button component', () => {
  it('renders with given label', () => {
    const { getByText } = render(<Button label="7" onPress={jest.fn()} />);
    expect(getByText('7')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <Button label="=" onPress={mockPress} accessibilityLabel="equals" />
    );
    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <Button label="+" onPress={mockPress} disabled accessibilityLabel="plus" />
    );
    fireEvent.press(getByRole('button'));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('shows altLabel when isAlt is true', () => {
    const { getByText } = render(
      <Button label="sin" altLabel="sin⁻¹" isAlt onPress={jest.fn()} />
    );
    expect(getByText('sin⁻¹')).toBeTruthy();
  });

  it('shows label when isAlt is false', () => {
    const { getByText } = render(
      <Button label="cos" altLabel="cos⁻¹" isAlt={false} onPress={jest.fn()} />
    );
    expect(getByText('cos')).toBeTruthy();
  });

  it('has accessible label', () => {
    const { getByLabelText } = render(
      <Button label="C" onPress={jest.fn()} accessibilityLabel="clear" />
    );
    expect(getByLabelText('clear')).toBeTruthy();
  });

  it('calls onLongPress when long-pressed', () => {
    const mockLongPress = jest.fn();
    const { getByRole } = render(
      <Button label="0" onPress={jest.fn()} onLongPress={mockLongPress} accessibilityLabel="zero" />
    );
    fireEvent(getByRole('button'), 'longPress');
    expect(mockLongPress).toHaveBeenCalledTimes(1);
  });
});
