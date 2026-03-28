import React, { useState, useCallback } from 'react';
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
import { matrixOp } from '@/utils/mathEngine';
import type { MatrixOp } from '@/types';

type MatrixId = 'A' | 'B' | 'C';
const MAX_SIZE = 5;

type MatrixData = number[][];

function emptyMatrix(r: number, c: number): MatrixData {
  return Array(r).fill(null).map(() => Array(c).fill(0));
}

function parseMatrix(cells: string[][], rows: number, cols: number): MatrixData | null {
  const m: MatrixData = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const v = parseFloat(cells[r]?.[c] ?? '');
      if (isNaN(v)) return null;
      row.push(v);
    }
    m.push(row);
  }
  return m;
}

const OPS: { label: string; op: MatrixOp; twoMatrix: boolean }[] = [
  { label: 'A + B', op: 'add', twoMatrix: true },
  { label: 'A − B', op: 'subtract', twoMatrix: true },
  { label: 'A × B', op: 'multiply', twoMatrix: true },
  { label: 'kA', op: 'scalarMultiply', twoMatrix: false },
  { label: 'Aᵀ', op: 'transpose', twoMatrix: false },
  { label: 'det(A)', op: 'determinant', twoMatrix: false },
  { label: 'A⁻¹', op: 'inverse', twoMatrix: false },
  { label: 'RREF(A)', op: 'rref', twoMatrix: false },
  { label: 'trace(A)', op: 'trace', twoMatrix: false },
  { label: 'rank(A)', op: 'rank', twoMatrix: false },
  { label: 'eigenvalues(A)', op: 'eigenvalues', twoMatrix: false },
];

function MatrixGrid({
  id,
  rows,
  cols,
  cells,
  onCellChange,
  colors,
}: {
  id: MatrixId;
  rows: number;
  cols: number;
  cells: string[][];
  onCellChange: (r: number, c: number, val: string) => void;
  colors: Record<string, string>;
}) {
  return (
    <View>
      <Text style={[gridStyles.matLabel, { color: colors.accentPrimary }]}>[{id}]</Text>
      {Array(rows).fill(null).map((_, r) => (
        <View key={r} style={gridStyles.matRow}>
          {Array(cols).fill(null).map((_, c) => (
            <TextInput
              key={c}
              value={cells[r]?.[c] ?? ''}
              onChangeText={(v) => onCellChange(r, c, v)}
              keyboardType="decimal-pad"
              style={[gridStyles.cell, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgSurface }]}
              accessibilityLabel={`Matrix ${id} row ${r + 1} column ${c + 1}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  matLabel: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  matRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  cell: { width: 52, height: 40, borderWidth: 1, borderRadius: 8, textAlign: 'center', fontSize: 14 },
});

// ──────────────────────────────────────────────────────────────
//  Result renderer
// ──────────────────────────────────────────────────────────────
function ResultDisplay({ result, colors }: { result: unknown; colors: Record<string, string> }) {
  if (result === null || result === undefined) return null;
  if (typeof result === 'number' || typeof result === 'string') {
    return (
      <View style={[resStyles.scalar, { backgroundColor: colors.bgSurface }]}>
        <Text style={[resStyles.scalarLabel, { color: colors.textSecondary }]}>Result</Text>
        <Text style={[resStyles.scalarValue, { color: colors.accentPrimary }]}>{String(result)}</Text>
      </View>
    );
  }
  if (Array.isArray(result) && Array.isArray(result[0])) {
    const mat = result as number[][];
    return (
      <View style={[resStyles.matContainer, { backgroundColor: colors.bgSurface }]}>
        <Text style={[resStyles.scalarLabel, { color: colors.textSecondary }]}>Result Matrix</Text>
        {mat.map((row, r) => (
          <View key={r} style={resStyles.matRow}>
            {row.map((v, c) => (
              <Text key={c} style={[resStyles.matCell, { color: colors.textPrimary }]}>{typeof v === 'number' ? v.toFixed(4) : String(v)}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  }
  if (Array.isArray(result)) {
    return (
      <View style={[resStyles.scalar, { backgroundColor: colors.bgSurface }]}>
        <Text style={[resStyles.scalarLabel, { color: colors.textSecondary }]}>Result</Text>
        <Text style={[resStyles.scalarValue, { color: colors.accentPrimary }]}>{(result as number[]).map((v) => typeof v === 'number' ? v.toFixed(4) : v).join(', ')}</Text>
      </View>
    );
  }
  return null;
}

const resStyles = StyleSheet.create({
  scalar: { borderRadius: 16, padding: 16, marginTop: 16 },
  scalarLabel: { fontSize: 12, marginBottom: 4 },
  scalarValue: { fontSize: 28, fontWeight: '700' },
  matContainer: { borderRadius: 16, padding: 16, marginTop: 16 },
  matRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  matCell: { fontSize: 14, width: 72, fontFamily: 'monospace' },
});

// ──────────────────────────────────────────────────────────────
//  Main Screen
// ──────────────────────────────────────────────────────────────
export function MatrixCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();

  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [cellsA, setCellsA] = useState<string[][]>([['1', '0'], ['0', '1']]);
  const [cellsB, setCellsB] = useState<string[][]>([['1', '0'], ['0', '1']]);
  const [scalar, setScalar] = useState('2');
  const [selectedOp, setSelectedOp] = useState<typeof OPS[number]>(OPS[0]);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');

  const updateCellA = (r: number, c: number, val: string) => {
    setCellsA((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[r]) next[r] = [];
      next[r][c] = val;
      return next;
    });
  };

  const updateCellB = (r: number, c: number, val: string) => {
    setCellsB((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[r]) next[r] = [];
      next[r][c] = val;
      return next;
    });
  };

  const resizeMatrix = (id: 'A' | 'B', dim: 'rows' | 'cols', val: number) => {
    const clipped = Math.max(1, Math.min(MAX_SIZE, val));
    if (id === 'A') {
      if (dim === 'rows') setRowsA(clipped);
      else setColsA(clipped);
    } else {
      if (dim === 'rows') setRowsB(clipped);
      else setColsB(clipped);
    }
  };

  const compute = () => {
    setError('');
    setResult(null);
    const A = parseMatrix(cellsA, rowsA, colsA);
    if (!A) { setError('Matrix A has invalid values.'); return; }
    const B = selectedOp.twoMatrix ? parseMatrix(cellsB, rowsB, colsB) : undefined;
    if (selectedOp.twoMatrix && !B) { setError('Matrix B has invalid values.'); return; }
    const k = selectedOp.op === 'scalarMultiply' ? parseFloat(scalar) : undefined;
    if (selectedOp.op === 'scalarMultiply' && isNaN(k!)) { setError('Invalid scalar.'); return; }

    try {
      const res = matrixOp(A, B ?? null, selectedOp.op, k);
      if (res.error) { setError(res.error); return; }
      setResult(res.result);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Matrix Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Matrix A */}
        <View style={[styles.matrixCard, { backgroundColor: colors.bgSurface }]}>
          <View style={styles.sizeRow}>
            <Text style={[styles.sizeLabel, { color: colors.textSecondary }]}>Matrix A</Text>
            {(['rows', 'cols'] as const).map((dim) => (
              <View key={dim} style={styles.dimControl}>
                <Pressable onPress={() => resizeMatrix('A', dim, (dim === 'rows' ? rowsA : colsA) - 1)} style={[styles.dimBtn, { backgroundColor: colors.bgMuted }]} accessibilityRole="button" accessibilityLabel={`Decrease ${dim} of A`}>
                  <Text style={[styles.dimBtnLabel, { color: colors.textPrimary }]}>−</Text>
                </Pressable>
                <Text style={[styles.dimVal, { color: colors.textPrimary }]}>{dim === 'rows' ? rowsA : colsA}</Text>
                <Pressable onPress={() => resizeMatrix('A', dim, (dim === 'rows' ? rowsA : colsA) + 1)} style={[styles.dimBtn, { backgroundColor: colors.bgMuted }]} accessibilityRole="button" accessibilityLabel={`Increase ${dim} of A`}>
                  <Text style={[styles.dimBtnLabel, { color: colors.textPrimary }]}>+</Text>
                </Pressable>
                <Text style={[styles.dimLabel, { color: colors.textSecondary }]}>{dim === 'rows' ? 'R' : 'C'}</Text>
              </View>
            ))}
          </View>
          <MatrixGrid id="A" rows={rowsA} cols={colsA} cells={cellsA} onCellChange={updateCellA} colors={colors as Record<string, string>} />
        </View>

        {/* Operation selector */}
        <View>
          <Text style={[styles.opSectionTitle, { color: colors.textSecondary }]}>Operation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.opRow}>
              {OPS.map((op) => (
                <Pressable key={op.op} onPress={() => setSelectedOp(op)} style={[styles.opBtn, { backgroundColor: selectedOp.op === op.op ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={op.label} accessibilityState={{ selected: selectedOp.op === op.op }}>
                  <Text style={[styles.opLabel, { color: selectedOp.op === op.op ? '#FFF' : colors.textSecondary }]}>{op.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Scalar */}
        {selectedOp.op === 'scalarMultiply' && (
          <View style={styles.scalarRow}>
            <Text style={[styles.sizeLabel, { color: colors.textSecondary }]}>Scalar (k)</Text>
            <TextInput value={scalar} onChangeText={setScalar} keyboardType="decimal-pad" style={[styles.scalarInput, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Scalar value" />
          </View>
        )}

        {/* Matrix B */}
        {selectedOp.twoMatrix && (
          <View style={[styles.matrixCard, { backgroundColor: colors.bgSurface }]}>
            <View style={styles.sizeRow}>
              <Text style={[styles.sizeLabel, { color: colors.textSecondary }]}>Matrix B</Text>
              {(['rows', 'cols'] as const).map((dim) => (
                <View key={dim} style={styles.dimControl}>
                  <Pressable onPress={() => resizeMatrix('B', dim, (dim === 'rows' ? rowsB : colsB) - 1)} style={[styles.dimBtn, { backgroundColor: colors.bgMuted }]} accessibilityRole="button" accessibilityLabel={`Decrease ${dim} of B`}>
                    <Text style={[styles.dimBtnLabel, { color: colors.textPrimary }]}>−</Text>
                  </Pressable>
                  <Text style={[styles.dimVal, { color: colors.textPrimary }]}>{dim === 'rows' ? rowsB : colsB}</Text>
                  <Pressable onPress={() => resizeMatrix('B', dim, (dim === 'rows' ? rowsB : colsB) + 1)} style={[styles.dimBtn, { backgroundColor: colors.bgMuted }]} accessibilityRole="button" accessibilityLabel={`Increase ${dim} of B`}>
                    <Text style={[styles.dimBtnLabel, { color: colors.textPrimary }]}>+</Text>
                  </Pressable>
                  <Text style={[styles.dimLabel, { color: colors.textSecondary }]}>{dim === 'rows' ? 'R' : 'C'}</Text>
                </View>
              ))}
            </View>
            <MatrixGrid id="B" rows={rowsB} cols={colsB} cells={cellsB} onCellChange={updateCellB} colors={colors as Record<string, string>} />
          </View>
        )}

        <Pressable onPress={compute} style={[styles.calcBtn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Compute result">
          <Text style={styles.calcBtnLabel}>Compute</Text>
        </Pressable>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <ResultDisplay result={result} colors={colors as Record<string, string>} />
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
  content: { padding: 16, gap: 16 },
  matrixCard: { borderRadius: 20, padding: 16, gap: 12 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  sizeLabel: { fontSize: 15, fontWeight: '700', flex: 1 },
  dimControl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dimBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dimBtnLabel: { fontSize: 18, fontWeight: '300' },
  dimVal: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  dimLabel: { fontSize: 12 },
  opSectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  opRow: { flexDirection: 'row', gap: 8 },
  opBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  opLabel: { fontSize: 13, fontWeight: '600' },
  scalarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scalarInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, fontSize: 18 },
  calcBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  calcBtnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  errorText: { color: '#FF5A5A', fontSize: 13 },
});
