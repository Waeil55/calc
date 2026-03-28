import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import {
  solveLinear,
  solveQuadratic,
  solveCubic,
  solveSystem2x2,
  solveSystem3x3,
  solvePolynomial,
  computeIntegral,
  computeDerivativeAt,
} from '@/utils/mathEngine';
import type { QuadraticResult, SystemResult } from '@/types';

type EqMode =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'system2x2'
  | 'system3x3'
  | 'polynomial'
  | 'integral'
  | 'derivative';

const MODES: { id: EqMode; label: string; desc: string }[] = [
  { id: 'linear', label: 'Linear', desc: 'ax + b = 0' },
  { id: 'quadratic', label: 'Quadratic', desc: 'ax² + bx + c = 0' },
  { id: 'cubic', label: 'Cubic', desc: 'ax³ + bx² + cx + d = 0' },
  { id: 'system2x2', label: '2×2 System', desc: 'a₁x + b₁y = c₁\na₂x + b₂y = c₂' },
  { id: 'system3x3', label: '3×3 System', desc: '3 equations, 3 unknowns' },
  { id: 'polynomial', label: 'Polynomial', desc: 'Up to degree 6' },
  { id: 'integral', label: 'Definite Integral', desc: '∫ₐᵇ f(x) dx' },
  { id: 'derivative', label: 'Derivative at x', desc: "f'(x₀) numerical" },
];

function Field({ label, value, onChange, colors }: { label: string; value: string; onChange: (v: string) => void; colors: Record<string, string> }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textDisabled}
        style={[fieldStyles.input, { color: colors.textPrimary, borderColor: colors.border }]}
        accessibilityLabel={label}
      />
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14, flex: 1 },
  input: { borderWidth: 1, borderRadius: 10, padding: 8, width: 110, fontSize: 16, textAlign: 'right' },
});

function StepLine({ text, colors }: { text: string; colors: Record<string, string> }) {
  return (
    <View style={[stepStyles.line, { borderLeftColor: colors.accentPrimary }]}>
      <Text style={[stepStyles.text, { color: colors.textPrimary }]}>{text}</Text>
    </View>
  );
}
const stepStyles = StyleSheet.create({
  line: { borderLeftWidth: 3, paddingLeft: 12, marginVertical: 4 },
  text: { fontSize: 14, lineHeight: 20 },
});

function ResultBox({ children, colors }: { children: React.ReactNode; colors: Record<string, string> }) {
  return <View style={[rbStyles.box, { backgroundColor: colors.bgSurface }]}>{children}</View>;
}
const rbStyles = StyleSheet.create({
  box: { borderRadius: 16, padding: 16, gap: 6 },
});

// ──────────────────────────────────────────────────────────────
//  Mode sub-forms
// ──────────────────────────────────────────────────────────────
function LinearForm({ colors }: { colors: Record<string, string> }) {
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const solve = () => {
    const av = parseFloat(a), bv = parseFloat(b);
    if (isNaN(av) || av === 0) { setResult('a must be non-zero'); return; }
    const x = solveLinear(av, bv);
    setResult(`x = ${x}`);
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>ax + b = 0</Text>
      <Field label="a" value={a} onChange={setA} colors={colors} />
      <Field label="b" value={b} onChange={setB} colors={colors} />
      <SolveBtn onPress={solve} colors={colors} />
      {result && <ResultBox colors={colors}><StepLine text={result} colors={colors} /></ResultBox>}
    </View>
  );
}

function QuadraticForm({ colors }: { colors: Record<string, string> }) {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [result, setResult] = useState<QuadraticResult | null>(null);
  const solve = () => {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c);
    if (isNaN(av) || av === 0) return;
    setResult(solveQuadratic(av, bv, cv));
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>ax² + bx + c = 0</Text>
      <Field label="a" value={a} onChange={setA} colors={colors} />
      <Field label="b" value={b} onChange={setB} colors={colors} />
      <Field label="c" value={c} onChange={setC} colors={colors} />
      <SolveBtn onPress={solve} colors={colors} />
      {result && (
        <ResultBox colors={colors}>
          <StepLine text={`Discriminant Δ = ${result.discriminant.toFixed(4)}`} colors={colors} />
          {result.roots.filter((r) => r.imaginary === 0).map((r, i) => (
            <StepLine key={i} text={`x${i + 1} = ${r.real}`} colors={colors} />
          ))}
          {result.roots.filter((r) => r.imaginary !== 0).map((r, i) => (
            <StepLine key={i} text={`Complex root: ${r.real.toFixed(4)} ${r.imaginary >= 0 ? '+' : ''}${r.imaginary.toFixed(4)}i`} colors={colors} />
          ))}
          {result.vertex && <StepLine text={`Vertex: (${result.vertex.x.toFixed(4)}, ${result.vertex.y.toFixed(4)})`} colors={colors} />}
        </ResultBox>
      )}
    </View>
  );
}

function CubicForm({ colors }: { colors: Record<string, string> }) {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState(''); const [d, setD] = useState('');
  const [result, setResult] = useState<number[] | null>(null);
  const solve = () => {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c), dv = parseFloat(d);
    if (isNaN(av) || av === 0) return;
    setResult(solveCubic(av, bv, cv, dv));
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>ax³ + bx² + cx + d = 0</Text>
      <Field label="a" value={a} onChange={setA} colors={colors} />
      <Field label="b" value={b} onChange={setB} colors={colors} />
      <Field label="c" value={c} onChange={setC} colors={colors} />
      <Field label="d" value={d} onChange={setD} colors={colors} />
      <SolveBtn onPress={solve} colors={colors} />
      {result && (
        <ResultBox colors={colors}>
          {result.map((r, i) => <StepLine key={i} text={`x${i + 1} = ${r.toFixed(6)}`} colors={colors} />)}
        </ResultBox>
      )}
    </View>
  );
}

function System2Form({ colors }: { colors: Record<string, string> }) {
  const [a1, setA1] = useState(''); const [b1, setB1] = useState(''); const [c1, setC1] = useState('');
  const [a2, setA2] = useState(''); const [b2, setB2] = useState(''); const [c2, setC2] = useState('');
  const [result, setResult] = useState<SystemResult | null>(null);
  const solve = () => {
    const coeffs = [
      [parseFloat(a1), parseFloat(b1), parseFloat(c1)],
      [parseFloat(a2), parseFloat(b2), parseFloat(c2)],
    ];
    if (coeffs.some((row) => row.some(isNaN))) return;
    setResult(solveSystem2x2(coeffs as [[number, number, number], [number, number, number]]));
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>a₁x + b₁y = c₁  /  a₂x + b₂y = c₂</Text>
      {[{ label: 'Eq 1: a₁', val: a1, set: setA1 }, { label: 'b₁', val: b1, set: setB1 }, { label: 'c₁', val: c1, set: setC1 },
        { label: 'Eq 2: a₂', val: a2, set: setA2 }, { label: 'b₂', val: b2, set: setB2 }, { label: 'c₂', val: c2, set: setC2 }]
        .map(({ label, val, set }) => <Field key={label} label={label} value={val} onChange={set} colors={colors} />)}
      <SolveBtn onPress={solve} colors={colors} />
      {result && (
        <ResultBox colors={colors}>
          {result.hasSolution ? (
            <>
              <StepLine text={`x = ${result.solution?.[0].toFixed(6)}`} colors={colors} />
              <StepLine text={`y = ${result.solution?.[1].toFixed(6)}`} colors={colors} />
            </>
          ) : (
            <StepLine text="No unique solution (inconsistent or infinite)" colors={colors} />
          )}
        </ResultBox>
      )}
    </View>
  );
}

function System3Form({ colors }: { colors: Record<string, string> }) {
  const fields = ['a1','b1','c1','d1','a2','b2','c2','d2','a3','b3','c3','d3'];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SystemResult | null>(null);
  const set = (k: string) => (v: string) => setVals((prev) => ({ ...prev, [k]: v }));
  const solve = () => {
    const g = (k: string) => parseFloat(vals[k] ?? '0') || 0;
    const coeffs: [[number,number,number,number],[number,number,number,number],[number,number,number,number]] = [
      [g('a1'), g('b1'), g('c1'), g('d1')],
      [g('a2'), g('b2'), g('c2'), g('d2')],
      [g('a3'), g('b3'), g('c3'), g('d3')],
    ];
    setResult(solveSystem3x3(coeffs));
  };
  const labels = [
    ['a₁','b₁','c₁','d₁'],
    ['a₂','b₂','c₂','d₂'],
    ['a₃','b₃','c₃','d₃'],
  ];
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>a₁x + b₁y + c₁z = d₁ (3 equations)</Text>
      {labels.map((row, eq) => row.map((l, col) => (
        <Field key={`${eq}-${col}`} label={l} value={vals[fields[eq * 4 + col]] ?? ''} onChange={set(fields[eq * 4 + col])} colors={colors} />
      )))}
      <SolveBtn onPress={solve} colors={colors} />
      {result && (
        <ResultBox colors={colors}>
          {result.hasSolution && result.solution
            ? ['x','y','z'].map((v, i) => <StepLine key={v} text={`${v} = ${result.solution![i].toFixed(6)}`} colors={colors} />)
            : <StepLine text="No unique solution" colors={colors} />}
        </ResultBox>
      )}
    </View>
  );
}

function PolynomialForm({ colors }: { colors: Record<string, string> }) {
  const [degree, setDegree] = useState('2');
  const [coeffStr, setCoeffStr] = useState('');
  const [result, setResult] = useState<number[] | null>(null);
  const solve = () => {
    const coeffs = coeffStr.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (coeffs.length < 2) return;
    setResult(solvePolynomial(coeffs));
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>Enter coefficients separated by commas (highest degree first)</Text>
      <TextInput
        value={coeffStr}
        onChangeText={setCoeffStr}
        placeholder="e.g. 1, 0, -4 for x²-4"
        placeholderTextColor={colors.textDisabled}
        style={[styles.textField, { color: colors.textPrimary, borderColor: colors.border }]}
        accessibilityLabel="Polynomial coefficients"
      />
      <SolveBtn onPress={solve} colors={colors} />
      {result && (
        <ResultBox colors={colors}>
          {result.length === 0
            ? <StepLine text="No real roots found" colors={colors} />
            : result.map((r, i) => <StepLine key={i} text={`x${i + 1} ≈ ${r.toFixed(6)}`} colors={colors} />)}
        </ResultBox>
      )}
    </View>
  );
}

function IntegralForm({ colors }: { colors: Record<string, string> }) {
  const [expr, setExpr] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const solve = () => {
    const av = parseFloat(a), bv = parseFloat(b);
    if (!expr || isNaN(av) || isNaN(bv)) return;
    const res = computeIntegral(expr, av, bv);
    setResult(`∫ₐᵇ = ${res}`);
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>∫ₐᵇ f(x) dx  (Simpson's Rule, n=1000)</Text>
      <TextInput value={expr} onChangeText={setExpr} placeholder="f(x), e.g. x^2 + sin(x)" placeholderTextColor={colors.textDisabled} style={[styles.textField, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Function expression" />
      <Field label="a (lower bound)" value={a} onChange={setA} colors={colors} />
      <Field label="b (upper bound)" value={b} onChange={setB} colors={colors} />
      <SolveBtn onPress={solve} colors={colors} />
      {result && <ResultBox colors={colors}><StepLine text={result} colors={colors} /></ResultBox>}
    </View>
  );
}

function DerivativeForm({ colors }: { colors: Record<string, string> }) {
  const [expr, setExpr] = useState('');
  const [x0, setX0] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const solve = () => {
    const xv = parseFloat(x0);
    if (!expr || isNaN(xv)) return;
    const res = computeDerivativeAt(expr, xv);
    setResult(`f'(${xv}) ≈ ${res}`);
  };
  return (
    <View style={styles.formSection}>
      <Text style={[styles.formDesc, { color: colors.textSecondary }]}>f'(x₀) via central difference</Text>
      <TextInput value={expr} onChangeText={setExpr} placeholder="f(x), e.g. x^3" placeholderTextColor={colors.textDisabled} style={[styles.textField, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Function expression" />
      <Field label="x₀" value={x0} onChange={setX0} colors={colors} />
      <SolveBtn onPress={solve} colors={colors} />
      {result && <ResultBox colors={colors}><StepLine text={result} colors={colors} /></ResultBox>}
    </View>
  );
}

function SolveBtn({ onPress, colors }: { onPress: () => void; colors: Record<string, string> }) {
  return (
    <Pressable onPress={onPress} style={[styles.solveBtn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Solve">
      <Text style={styles.solveBtnLabel}>Solve</Text>
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────
//  Main Screen
// ──────────────────────────────────────────────────────────────
export function EquationSolverScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<EqMode>('linear');

  const currentMode = MODES.find((m) => m.id === mode)!;

  const renderForm = () => {
    const c = colors as Record<string, string>;
    switch (mode) {
      case 'linear': return <LinearForm colors={c} />;
      case 'quadratic': return <QuadraticForm colors={c} />;
      case 'cubic': return <CubicForm colors={c} />;
      case 'system2x2': return <System2Form colors={c} />;
      case 'system3x3': return <System3Form colors={c} />;
      case 'polynomial': return <PolynomialForm colors={c} />;
      case 'integral': return <IntegralForm colors={c} />;
      case 'derivative': return <DerivativeForm colors={c} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Equation Solver</Text>
      </View>

      {/* Mode picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll} contentContainerStyle={styles.modeContent}>
        {MODES.map((m) => (
          <Pressable key={m.id} onPress={() => setMode(m.id)} style={[styles.modeBtn, { backgroundColor: mode === m.id ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={m.label} accessibilityState={{ selected: mode === m.id }}>
            <Text style={[styles.modeBtnLabel, { color: mode === m.id ? '#FFF' : colors.textSecondary }]}>{m.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {renderForm()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  modeScroll: { maxHeight: 52 },
  modeContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  modeBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  modeBtnLabel: { fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },
  formSection: { gap: 8 },
  formDesc: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  solveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  solveBtnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  textField: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
});
