import { create, all } from 'mathjs';
import type {
  AngleMode,
  EvalResult,
  QuadraticResult,
  SystemResult,
  StatResult,
  RegressionResult,
  MatrixResult,
  MatrixOp,
} from '@/types';

// Configure mathjs with high precision
const math = create(all, { number: 'BigNumber', precision: 20 });

// ──── EVALUATE ────

function preprocessExpression(expr: string): string {
  let processed = expr;
  // Replace display symbols with math operators
  processed = processed.replace(/×/g, '*');
  processed = processed.replace(/÷/g, '/');
  processed = processed.replace(/−/g, '-');
  // Implicit multiplication: 2π → 2*pi, 3( → 3*(
  processed = processed.replace(/(\d)(pi|e|phi|sqrt2)\b/gi, '$1*$2');
  processed = processed.replace(/(\d)\(/g, '$1*(');
  processed = processed.replace(/\)(\d)/g, ')*$1');
  processed = processed.replace(/\)\(/g, ')*(');
  // Replace constants
  processed = processed.replace(/π/g, 'pi');
  processed = processed.replace(/φ/g, '(1+sqrt(5))/2');
  processed = processed.replace(/√2/g, 'sqrt(2)');
  return processed;
}

function wrapTrigForAngle(expr: string, angleMode: AngleMode): string {
  if (angleMode === 'rad') return expr;
  // If expression already has explicit angle units (deg/rad/grad), let mathjs handle it natively
  if (/\b(deg|rad|grad)\b/.test(expr)) return expr;
  const trigFns = ['sin', 'cos', 'tan'];
  let result = expr;
  for (const fn of trigFns) {
    // Wrap sin(x) → sin(deg(x)) for degrees or sin(grad(x)) for gradians
    const regex = new RegExp(`\\b${fn}\\(`, 'g');
    const factor = angleMode === 'deg' ? 'pi/180*' : 'pi/200*';
    result = result.replace(regex, `${fn}(${factor}`);
  }
  return result;
}

export function evaluate(expression: string, angleMode: AngleMode = 'deg'): EvalResult {
  try {
    let processed = preprocessExpression(expression);
    processed = wrapTrigForAngle(processed, angleMode);
    const result = math.evaluate(processed);
    const value = math.format(result, { notation: 'auto', precision: 14 });
    const numeric = typeof result === 'number' ? result : Number(math.number(result));
    return { value, numeric: isNaN(numeric) ? undefined : numeric };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid expression';
    return { value: '', error: msg };
  }
}

// ──── EQUATION SOLVERS ────

export function solveLinear(a: number, b: number): number | null {
  if (a === 0) return null;
  return -b / a;
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  const discriminant = b * b - 4 * a * c;
  const vertex = { x: -b / (2 * a), y: c - (b * b) / (4 * a) };

  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    return {
      discriminant,
      roots: [
        { real: (-b + sqrtD) / (2 * a), imaginary: 0 },
        { real: (-b - sqrtD) / (2 * a), imaginary: 0 },
      ],
      vertex,
    };
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    return {
      discriminant,
      roots: [
        { real: realPart, imaginary: imagPart },
        { real: realPart, imaginary: -imagPart },
      ],
      vertex,
    };
  }
}

export function solveCubic(
  a: number,
  b: number,
  c: number,
  d: number
): number[] {
  // Numerical approach using Newton's method with deflation
  const roots: number[] = [];
  const f = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const fp = (x: number) => 3 * a * x * x + 2 * b * x + c;

  // Find first root via Newton's method
  let x = 0;
  for (let i = 0; i < 100; i++) {
    const fx = f(x);
    const fpx = fp(x);
    if (Math.abs(fpx) < 1e-15) { x += 0.1; continue; }
    const xNew = x - fx / fpx;
    if (Math.abs(xNew - x) < 1e-12) break;
    x = xNew;
  }
  roots.push(x);

  // Deflate to quadratic: divide by (x - root1)
  const b2 = b + a * x;
  const c2 = c + b2 * x;
  const disc = b2 * b2 - 4 * a * c2;
  if (disc >= 0) {
    roots.push((-b2 + Math.sqrt(disc)) / (2 * a));
    roots.push((-b2 - Math.sqrt(disc)) / (2 * a));
  }
  return roots;
}

export function solveSystem2x2(coeffs: number[][]): SystemResult {
  // [a1, b1, c1], [a2, b2, c2] → a1*x + b1*y = c1
  const [[a1, b1, c1], [a2, b2, c2]] = coeffs;
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-15) {
    return { solution: [], hasSolution: false, error: 'No unique solution (det=0)' };
  }
  return {
    solution: [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det],
    hasSolution: true,
  };
}

export function solveSystem3x3(coeffs: number[][]): SystemResult {
  // Gaussian elimination
  const m = coeffs.map((r) => [...r]);
  const n = 3;
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[maxRow][col])) maxRow = row;
    }
    [m[col], m[maxRow]] = [m[maxRow], m[col]];
    if (Math.abs(m[col][col]) < 1e-15) {
      return { solution: [], hasSolution: false, error: 'No unique solution' };
    }
    for (let row = col + 1; row < n; row++) {
      const factor = m[row][col] / m[col][col];
      for (let j = col; j <= n; j++) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }
  // Back substitution
  const solution = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = m[i][n];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= m[i][j] * solution[j];
    }
    solution[i] /= m[i][i];
  }
  return { solution, hasSolution: true };
}

// ──── STATISTICS ────

export function computeStatistics(data: number[]): StatResult {
  if (data.length === 0) {
    return {
      count: 0, sum: 0, min: 0, max: 0, range: 0,
      mean: 0, median: 0, mode: [], variance: 0, stdDev: 0,
      populationVariance: 0, populationStdDev: 0,
      skewness: 0, kurtosis: 0, q1: 0, q2: 0, q3: 0, iqr: 0, outliers: [],
    };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  const sum = data.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const min = sorted[0];
  const max = sorted[n - 1];

  const median = n % 2 === 1
    ? sorted[Math.floor(n / 2)]
    : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  // Mode
  const freq: Record<number, number> = {};
  let maxFreq = 0;
  for (const v of data) {
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > maxFreq) maxFreq = freq[v];
  }
  const mode = maxFreq > 1
    ? Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v))
    : [];

  // Variance (sample)
  const variance = n > 1
    ? data.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)
    : 0;
  const stdDev = Math.sqrt(variance);

  const populationVariance = data.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const populationStdDev = Math.sqrt(populationVariance);

  // Quartiles
  const q1 = percentile(sorted, 25);
  const q2 = median;
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;

  // Outliers
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = data.filter((v) => v < lowerFence || v > upperFence);

  // Skewness
  const m3 = data.reduce((s, v) => s + ((v - mean) / stdDev) ** 3, 0) / n;
  const skewness = stdDev > 0 ? m3 : 0;

  // Kurtosis (excess)
  const m4 = data.reduce((s, v) => s + ((v - mean) / stdDev) ** 4, 0) / n;
  const kurtosis = stdDev > 0 ? m4 - 3 : 0;

  return {
    count: n, sum, min, max, range: max - min,
    mean, median, mode, variance, stdDev,
    populationVariance, populationStdDev,
    skewness, kurtosis, q1, q2, q3, iqr, outliers,
  };
}

function percentile(sorted: number[], p: number): number {
  const k = ((p / 100) * (sorted.length - 1));
  const f = Math.floor(k);
  const c = Math.ceil(k);
  if (f === c) return sorted[f];
  return sorted[f] + (sorted[c] - sorted[f]) * (k - f);
}

// ──── REGRESSION ────

export function computeRegression(
  points: Array<[number, number]>,
  degree: number = 1
): RegressionResult {
  const n = points.length;
  if (n === 0) {
    return { coefficients: [], rSquared: 0, equation: '', points: [] };
  }

  // Build Vandermonde matrix and solve via normal equations
  const X: number[][] = points.map(([x]) => {
    const row: number[] = [];
    for (let d = 0; d <= degree; d++) row.push(x ** d);
    return row;
  });
  const y = points.map(([, yi]) => yi);

  // X^T * X
  const cols = degree + 1;
  const XtX: number[][] = Array.from({ length: cols }, () => Array(cols).fill(0));
  const Xty: number[] = Array(cols).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < cols; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < cols; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }

  // Solve via Gaussian elimination
  const augmented = XtX.map((row, i) => [...row, Xty[i]]);
  for (let col = 0; col < cols; col++) {
    let maxRow = col;
    for (let row = col + 1; row < cols; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) maxRow = row;
    }
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];
    if (Math.abs(augmented[col][col]) < 1e-15) continue;
    for (let row = col + 1; row < cols; row++) {
      const factor = augmented[row][col] / augmented[col][col];
      for (let j = col; j <= cols; j++) augmented[row][j] -= factor * augmented[col][j];
    }
  }
  const coefficients: number[] = Array(cols).fill(0);
  for (let i = cols - 1; i >= 0; i--) {
    coefficients[i] = augmented[i][cols];
    for (let j = i + 1; j < cols; j++) coefficients[i] -= augmented[i][j] * coefficients[j];
    coefficients[i] /= augmented[i][i];
  }

  // R²
  const yMean = y.reduce((s, v) => s + v, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    let yPred = 0;
    for (let d = 0; d <= degree; d++) yPred += coefficients[d] * (points[i][0] ** d);
    ssRes += (y[i] - yPred) ** 2;
    ssTot += (y[i] - yMean) ** 2;
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // Equation string
  let equation = '';
  for (let d = degree; d >= 0; d--) {
    const c = coefficients[d];
    if (d === degree) {
      equation += `${c.toFixed(4)}`;
      if (d > 0) equation += `x${d > 1 ? `^${d}` : ''}`;
    } else {
      equation += ` ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(4)}`;
      if (d > 0) equation += `x${d > 1 ? `^${d}` : ''}`;
    }
  }

  return { coefficients, rSquared, equation, points };
}

// ──── MATRIX OPERATIONS ────

export function matrixOp(
  A: number[][],
  B: number[][] | null,
  op: MatrixOp,
  scalar?: number
): MatrixResult {
  try {
    switch (op) {
      case 'add':
        return { result: math.add(A, B!) as number[][] };
      case 'subtract':
        return { result: math.subtract(A, B!) as number[][] };
      case 'multiply':
        return { result: math.multiply(A, B!) as number[][] };
      case 'scalarMultiply':
        return { result: math.multiply(scalar ?? 1, A) as number[][] };
      case 'transpose':
        return { result: math.transpose(A) as number[][] };
      case 'determinant':
        return { result: Number(math.det(A)) };
      case 'inverse':
        return { result: math.inv(A) as number[][] };
      case 'rref': {
        const m = A.map((r) => [...r]);
        const rows = m.length;
        const cols = m[0].length;
        let lead = 0;
        for (let r = 0; r < rows; r++) {
          if (lead >= cols) break;
          let i = r;
          while (Math.abs(m[i][lead]) < 1e-12) {
            i++;
            if (i === rows) { i = r; lead++; if (lead === cols) return { result: m }; }
          }
          [m[i], m[r]] = [m[r], m[i]];
          const lv = m[r][lead];
          m[r] = m[r].map((v) => v / lv);
          for (let j = 0; j < rows; j++) {
            if (j !== r) {
              const factor = m[j][lead];
              m[j] = m[j].map((v, k) => v - factor * m[r][k]);
            }
          }
          lead++;
        }
        return { result: m };
      }
      case 'trace': {
        let trace = 0;
        for (let i = 0; i < Math.min(A.length, A[0].length); i++) trace += A[i][i];
        return { result: trace };
      }
      case 'rank': {
        // Use RREF to count non-zero rows
        const rrefResult = matrixOp(A, null, 'rref');
        if (typeof rrefResult.result === 'number') return rrefResult;
        const rrefMatrix = rrefResult.result as number[][];
        let rank = 0;
        for (const row of rrefMatrix) {
          if (row.some((v) => Math.abs(v) > 1e-12)) rank++;
        }
        return { result: rank };
      }
      case 'eigenvalues': {
        const eigs = math.eigs(A);
        const values = (eigs.values as unknown as Array<number | math.Complex>).map((v) =>
          typeof v === 'number' ? [v, 0] : [(v as math.Complex).re, (v as math.Complex).im]
        );
        return { result: values };
      }
      default:
        return { result: [], error: 'Unknown operation' };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Matrix operation error';
    return { result: [], error: msg };
  }
}

// ──── CALCULUS ────

export function computeIntegral(
  expr: string,
  a: number,
  b: number,
  steps: number = 1000
): number {
  // Simpson's rule
  const h = (b - a) / steps;
  let sum = 0;
  const f = (x: number): number => {
    const result = math.evaluate(preprocessExpression(expr), { x });
    return typeof result === 'number' ? result : Number(math.number(result));
  };

  sum += f(a) + f(b);
  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (h / 3) * sum;
}

export function computeDerivativeAt(expr: string, x: number): number {
  const h = 1e-8;
  const f = (xv: number): number => {
    const result = math.evaluate(preprocessExpression(expr), { x: xv });
    return typeof result === 'number' ? result : Number(math.number(result));
  };
  return (f(x + h) - f(x - h)) / (2 * h);
}

// ──── FORMATTING ────

export function formatResult(
  value: number | string,
  precision: number = 10,
  useThousands: boolean = true,
  format: 'comma-dot' | 'dot-comma' = 'comma-dot'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  if (!isFinite(num)) return num > 0 ? '∞' : '-∞';

  // Check for scientific notation threshold (>12 digits)
  if (Math.abs(num) >= 1e12) {
    return num.toExponential(precision > 6 ? 6 : precision);
  }

  let formatted: string;
  // Determine if we need decimal places
  if (Number.isInteger(num)) {
    formatted = num.toString();
  } else {
    formatted = parseFloat(num.toFixed(precision)).toString();
  }

  if (useThousands) {
    const [intPart, decPart] = formatted.split('.');
    const sep = format === 'comma-dot' ? ',' : '.';
    const decSep = format === 'comma-dot' ? '.' : ',';
    const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    formatted = decPart ? `${withSep}${decSep}${decPart}` : withSep;
  }

  return formatted;
}

// ──── POLYNOMIAL SOLVER (Newton's method) ────

export function solvePolynomial(coefficients: number[]): number[] {
  // coefficients[0] = highest degree coefficient
  const degree = coefficients.length - 1;
  if (degree <= 0) return [];

  const f = (x: number) => coefficients.reduce((sum, c, i) => sum + c * x ** (degree - i), 0);
  const fp = (x: number) =>
    coefficients.slice(0, -1).reduce((sum, c, i) => sum + c * (degree - i) * x ** (degree - i - 1), 0);

  const roots: number[] = [];
  const tried = new Set<string>();

  for (let start = -10; start <= 10; start += 0.5) {
    let x = start;
    for (let i = 0; i < 200; i++) {
      const fx = f(x);
      const fpx = fp(x);
      if (Math.abs(fpx) < 1e-15) break;
      const xNew = x - fx / fpx;
      if (Math.abs(xNew - x) < 1e-10) {
        const key = xNew.toFixed(8);
        if (!tried.has(key) && Math.abs(f(xNew)) < 1e-6) {
          tried.add(key);
          roots.push(parseFloat(xNew.toFixed(10)));
        }
        break;
      }
      x = xNew;
    }
    if (roots.length >= degree) break;
  }

  return roots;
}
