/**
 * Unit tests for mathEngine utility functions.
 * Tests evaluate, solveQuadratic, computeStatistics, matrixOp, and convertUnit.
 */
import { evaluate, solveQuadratic, computeStatistics, matrixOp } from '@/utils/mathEngine';
import { convertUnit, UNIT_CATEGORIES } from '@/utils/constants';

function findUnit(categoryName: string, unitId: string) {
  const cat = UNIT_CATEGORIES.find((c) => c.name === categoryName)!;
  return cat.units.find((u) => u.id === unitId)!;
}

describe('mathEngine — evaluate()', () => {
  it('evaluates basic arithmetic', () => {
    const result = evaluate('2 + 3');
    expect(result.error).toBeUndefined();
    expect(result.value).toBe('5');
  });

  it('evaluates multiplication', () => {
    const result = evaluate('6 * 7');
    expect(result.value).toBe('42');
  });

  it('evaluates division', () => {
    const result = evaluate('10 / 4');
    expect(Number(result.value)).toBeCloseTo(2.5);
  });

  it('handles division by zero gracefully', () => {
    const result = evaluate('1 / 0');
    expect(result.value === 'Infinity' || result.error !== undefined || result.value === 'Error').toBe(true);
  });

  it('evaluates nested expressions with parentheses', () => {
    const result = evaluate('(2 + 3) * (4 - 1)');
    expect(result.value).toBe('15');
  });

  it('evaluates square root via sqrt()', () => {
    const result = evaluate('sqrt(16)');
    expect(Number(result.value)).toBeCloseTo(4);
  });

  it('evaluates power expressions', () => {
    const result = evaluate('2 ^ 10');
    expect(result.value).toBe('1024');
  });

  it('evaluates sin in degree mode', () => {
    const result = evaluate('sin(90 deg)');
    expect(Number(result.value)).toBeCloseTo(1);
  });

  it('returns error for invalid expressions', () => {
    const result = evaluate('2 ++ 3');
    // Either has an error field or returns 'Error' value
    expect(result.error !== undefined || result.value === 'Error').toBe(true);
  });

  it('evaluates modulo', () => {
    const result = evaluate('17 mod 5');
    expect(result.value).toBe('2');
  });

  it('evaluates log base 10', () => {
    const result = evaluate('log10(100)');
    expect(Number(result.value)).toBeCloseTo(2);
  });

  it('evaluates natural log', () => {
    const result = evaluate('log(e)');
    expect(Number(result.value)).toBeCloseTo(1);
  });
});

describe('mathEngine — solveQuadratic()', () => {
  it('solves equation with two real roots: x^2 - 5x + 6 = 0 → roots 3 and 2', () => {
    const result = solveQuadratic(1, -5, 6);
    expect(result.discriminant).toBeCloseTo(1);
    const reals = result.roots.map((r) => r.real).sort((a, b) => a - b);
    expect(reals[0]).toBeCloseTo(2);
    expect(reals[1]).toBeCloseTo(3);
  });

  it('solves equation with one root (discriminant = 0): x^2 - 2x + 1 = 0 → root 1', () => {
    const result = solveQuadratic(1, -2, 1);
    expect(result.discriminant).toBeCloseTo(0);
    expect(result.roots[0].real).toBeCloseTo(1);
  });

  it('handles complex roots: x^2 + 1 = 0', () => {
    const result = solveQuadratic(1, 0, 1);
    expect(result.discriminant).toBeLessThan(0);
    expect(Math.abs(result.roots[0].imaginary)).toBeCloseTo(1);
  });

  it('calculates vertex correctly for x^2 - 4x + 3', () => {
    const result = solveQuadratic(1, -4, 3);
    expect(result.vertex.x).toBeCloseTo(2);
    expect(result.vertex.y).toBeCloseTo(-1);
  });
});

describe('mathEngine — computeStatistics()', () => {
  const dataset = [2, 4, 4, 4, 5, 5, 7, 9];

  it('computes mean correctly', () => {
    const stats = computeStatistics(dataset);
    expect(stats.mean).toBeCloseTo(5);
  });

  it('computes median correctly', () => {
    const stats = computeStatistics(dataset);
    expect(stats.median).toBeCloseTo(4.5);
  });

  it('computes standard deviation correctly', () => {
    const stats = computeStatistics(dataset);
    // Population stdev = 2
    expect(stats.stdDev).toBeCloseTo(2, 0);
  });

  it('computes min and max correctly', () => {
    const stats = computeStatistics(dataset);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
  });

  it('computes count correctly', () => {
    const stats = computeStatistics(dataset);
    expect(stats.count).toBe(8);
  });

  it('computes range correctly', () => {
    const stats = computeStatistics(dataset);
    expect(stats.range).toBe(7);
  });

  it('handles single-element dataset', () => {
    const stats = computeStatistics([42]);
    expect(stats.mean).toBe(42);
    expect(stats.stdDev).toBe(0);
  });
});

describe('mathEngine — matrixOp()', () => {
  it('adds two 2x2 matrices', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];
    const result = matrixOp(A, B, 'add');
    expect(result.error).toBeUndefined();
    const arr = result.result as number[][];
    expect(arr[0][0]).toBe(6);
    expect(arr[1][1]).toBe(12);
  });

  it('multiplies two 2x2 matrices', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[2, 0], [1, 2]];
    const result = matrixOp(A, B, 'multiply');
    const arr = result.result as number[][];
    expect(arr[0][0]).toBe(4);  // 1*2 + 2*1
    expect(arr[0][1]).toBe(4);  // 1*0 + 2*2
    expect(arr[1][0]).toBe(10); // 3*2 + 4*1
  });

  it('transposes a matrix', () => {
    const A = [[1, 2, 3], [4, 5, 6]];
    const result = matrixOp(A, null, 'transpose');
    const arr = result.result as number[][];
    expect(arr[0][0]).toBe(1);
    expect(arr[0][1]).toBe(4);
    expect(arr[2][0]).toBe(3);
    expect(arr[2][1]).toBe(6);
  });

  it('computes determinant of 2x2 matrix', () => {
    const A = [[4, 7], [2, 6]];
    const result = matrixOp(A, null, 'determinant');
    expect(result.result as number).toBeCloseTo(10); // 4*6 - 7*2
  });

  it('returns error for non-square determinant', () => {
    const A = [[1, 2, 3], [4, 5, 6]];
    const result = matrixOp(A, null, 'determinant');
    expect(result.error).toBeDefined();
  });
});

describe('convertUnit()', () => {
  it('converts metres to feet', () => {
    const result = convertUnit(1, findUnit('Length', 'm'), findUnit('Length', 'ft'));
    expect(result).toBeCloseTo(3.28084, 2);
  });

  it('converts Celsius to Fahrenheit', () => {
    const result = convertUnit(100, findUnit('Temperature', 'C'), findUnit('Temperature', 'F'));
    expect(result).toBeCloseTo(212);
  });

  it('converts Celsius to Kelvin', () => {
    const result = convertUnit(0, findUnit('Temperature', 'C'), findUnit('Temperature', 'K'));
    expect(result).toBeCloseTo(273.15);
  });

  it('converts kilograms to pounds', () => {
    const result = convertUnit(1, findUnit('Mass', 'kg'), findUnit('Mass', 'lb'));
    expect(result).toBeCloseTo(2.20462, 2);
  });

  it('converts kilometres to miles', () => {
    const result = convertUnit(1, findUnit('Length', 'km'), findUnit('Length', 'mi'));
    expect(result).toBeCloseTo(0.621371, 3);
  });

  it('handles same-unit conversion (identity)', () => {
    const result = convertUnit(42, findUnit('Length', 'm'), findUnit('Length', 'm'));
    expect(result).toBeCloseTo(42);
  });
});
