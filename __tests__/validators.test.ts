/**
 * Unit tests for validators utility.
 */
import { sanitizeExpression, hasUnbalancedParens } from '@/utils/validators';

describe('validators — sanitizeExpression()', () => {
  it('passes through valid expressions unchanged', () => {
    expect(sanitizeExpression('2 + 3')).toBe('2 + 3');
  });

  it('replaces × with *', () => {
    const result = sanitizeExpression('3 × 4');
    expect(result).toContain('*');
  });

  it('replaces ÷ with /', () => {
    const result = sanitizeExpression('8 ÷ 2');
    expect(result).toContain('/');
  });

  it('replaces − (minus sign) with -', () => {
    const result = sanitizeExpression('5 − 3');
    expect(result).toContain('-');
  });

  it('removes disallowed characters', () => {
    const result = sanitizeExpression('2 + 3; DROP TABLE users;');
    // Should strip the semicolon and SQL, or at minimum strip ;
    expect(result).not.toContain(';');
  });

  it('handles empty string', () => {
    expect(sanitizeExpression('')).toBe('');
  });

  it('allows parentheses, digits, operators, spaces, and decimal points', () => {
    const expr = '(3.14 + 2.71) / 2';
    const result = sanitizeExpression(expr);
    expect(result).toBe(expr);
  });
});

describe('validators — hasUnbalancedParens()', () => {
  it('returns false for balanced parentheses', () => {
    expect(hasUnbalancedParens('(2 + 3) * (4 - 1)')).toBe(false);
  });

  it('returns true for missing closing paren', () => {
    expect(hasUnbalancedParens('(2 + 3')).toBe(true);
  });

  it('returns true for missing opening paren', () => {
    expect(hasUnbalancedParens('2 + 3)')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(hasUnbalancedParens('')).toBe(false);
  });

  it('returns false for expression without parentheses', () => {
    expect(hasUnbalancedParens('3 + 4 * 2')).toBe(false);
  });

  it('handles deeply nested balanced parens', () => {
    expect(hasUnbalancedParens('((2 + 3) * (4 / (1 + 1)))')).toBe(false);
  });

  it('handles deeply nested unbalanced parens', () => {
    expect(hasUnbalancedParens('((2 + 3) * (4 / (1 + 1))')).toBe(true);
  });
});
