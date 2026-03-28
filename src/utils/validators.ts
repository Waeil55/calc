/**
 * Validates and sanitizes calculator input
 */

export function sanitizeExpression(expr: string): string {
  // Replace display math symbols with standard ASCII equivalents
  let result = expr;
  result = result.replace(/×/g, '*');
  result = result.replace(/÷/g, '/');
  result = result.replace(/−/g, '-');
  // Remove any remaining characters not in the valid set for math expressions
  result = result.replace(/[^0-9+\-*/().πeφ,^!%\s]/g, '');
  return result;
}

export function hasUnbalancedParens(expr: string): boolean {
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth < 0) return true;
  }
  return depth !== 0;
}

export function isValidNumberInput(value: string): boolean {
  return /^-?\d*\.?\d*$/.test(value);
}

export function detectInvalidSequences(expr: string): string | null {
  // Double operators
  if (/[+\-*/]{2,}/.test(expr.replace(/--/g, 'OK'))) {
    return 'Invalid operator sequence';
  }
  // Leading operator (not minus)
  if (/^[+*/]/.test(expr.trim())) {
    return 'Expression starts with operator';
  }
  // Unbalanced parens
  if (hasUnbalancedParens(expr)) {
    return 'Unbalanced parentheses';
  }
  return null;
}

export function isNumericString(s: string): boolean {
  return !isNaN(parseFloat(s)) && isFinite(Number(s));
}
