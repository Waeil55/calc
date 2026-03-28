// All shared TypeScript types and interfaces for CalcPro Enterprise

export type CalcModule =
  | 'basic'
  | 'scientific'
  | 'graphing'
  | 'financial'
  | 'unit'
  | 'currency'
  | 'programmer'
  | 'statistics'
  | 'matrix'
  | 'equation'
  | 'datetime'
  | 'health';

export type AngleMode = 'deg' | 'rad' | 'grad';
export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type HapticLevel = 'off' | 'light' | 'medium' | 'strong';
export type AutoSave = 'always' | 'ask' | 'never';
export type NumberBase = 'DEC' | 'HEX' | 'OCT' | 'BIN';
export type BitLength = 8 | 16 | 32 | 64;

export type MatrixOp =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'scalarMultiply'
  | 'transpose'
  | 'determinant'
  | 'inverse'
  | 'rref'
  | 'trace'
  | 'rank'
  | 'eigenvalues';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  module: CalcModule;
  label?: string;
  expression?: string;
  result: string;
  resultNumeric?: number;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  unit?: string;
  note?: string;
  tags?: string[];
  isFavorited: boolean;
  isDeleted: boolean;
  groupId?: string;
}

export interface HistoryFilter {
  module?: CalcModule;
  dateFrom?: number;
  dateTo?: number;
  isFavorited?: boolean;
  hasNote?: boolean;
  searchQuery?: string;
}

export interface EvalResult {
  value: string;
  numeric?: number;
  error?: string;
}

export interface QuadraticResult {
  discriminant: number;
  roots: Array<{ real: number; imaginary: number }>;
  vertex: { x: number; y: number };
}

export interface SystemResult {
  solution: number[];
  hasSolution: boolean;
  error?: string;
}

export interface StatResult {
  count: number;
  sum: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  populationVariance: number;
  populationStdDev: number;
  skewness: number;
  kurtosis: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  outliers: number[];
}

export interface RegressionResult {
  coefficients: number[];
  rSquared: number;
  equation: string;
  points: Array<[number, number]>;
}

export interface MatrixResult {
  result: number[][] | number;
  error?: string;
}

export interface ConversionCategory {
  name: string;
  icon: string;
  units: ConversionUnit[];
}

export interface ConversionUnit {
  id: string;
  name: string;
  symbol: string;
  factor: number; // to base unit
  offset?: number; // for temperature
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number; // relative to base
  flag?: string;
}

export type ButtonVariant = 'digit' | 'operator' | 'function' | 'equals' | 'clear';

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface GraphViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface LoanInputs {
  principal: number;
  annualRate: number;
  termMonths: number;
  extraPayment: number;
  startDate: string;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface InvestmentInputs {
  principal: number;
  annualRate: number;
  compounding: 'daily' | 'monthly' | 'quarterly' | 'annually';
  durationYears: number;
  monthlyContribution: number;
}
